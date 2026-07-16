import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  Globe,
  Mail,
  MapPin,
  Share2,
  Users,
  Trophy,
  Sparkles,
  Newspaper,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import ClubEditModal from "@/components/club/ClubEditModal";

type Club = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  banner_color: string;
  tag: string | null;
  city: string | null;
  logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  founded_year: number | null;
  history: string | null;
  verified: boolean;
  partner_type: string | null;
  owner_id: string;
  member_count: number;
  avg_rating: number;
  total_wins: number;
  weekly_wins: number;
};

type Member = {
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { username: string | null; avatar_url: string | null; rating: number | null } | null;
};

type ClubEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  location: string | null;
  starts_at: string;
};

type ClubNews = {
  id: string;
  title: string;
  body: string;
  published_at: string;
};

type ClubPhoto = {
  id: string;
  image_url: string;
  caption: string | null;
};

export default function PublicClub() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [news, setNews] = useState<ClubNews[]>([]);
  const [photos, setPhotos] = useState<ClubPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isOwner = !!user && !!club && user.id === club.owner_id;

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!slug) return;
      setLoading(true);
      const { data: c, error } = await supabase
        .from("clubs")
        .select("*")
        .ilike("slug", slug)
        .maybeSingle();
      if (!alive) return;
      if (error || !c) {
        setLoading(false);
        return;
      }
      setClub(c as Club);

      const [{ data: m }, { data: ev }, { data: nw }, { data: ph }] = await Promise.all([
        supabase
          .from("club_members")
          .select("user_id, role, joined_at")
          .eq("club_id", c.id)
          .order("joined_at", { ascending: false })
          .limit(24),
        supabase
          .from("club_events")
          .select("id, title, description, event_type, location, starts_at")
          .eq("club_id", c.id)
          .gte("starts_at", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString())
          .order("starts_at", { ascending: true })
          .limit(10),
        supabase
          .from("club_news")
          .select("id, title, body, published_at")
          .eq("club_id", c.id)
          .order("published_at", { ascending: false })
          .limit(6),
        supabase
          .from("club_gallery")
          .select("id, image_url, caption")
          .eq("club_id", c.id)
          .order("created_at", { ascending: false })
          .limit(12),
      ]);

      const memberList = (m ?? []) as Member[];
      if (memberList.length > 0) {
        const ids = memberList.map((x) => x.user_id);
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, rating")
          .in("id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
        memberList.forEach((mm) => {
          mm.profile = map.get(mm.user_id) ?? null;
        });
      }
      if (!alive) return;
      setMembers(memberList);
      setEvents((ev ?? []) as ClubEvent[]);
      setNews((nw ?? []) as ClubNews[]);
      setPhotos((ph ?? []) as ClubPhoto[]);

      if (user) {
        const { data: mine } = await supabase
          .from("club_members")
          .select("id")
          .eq("club_id", c.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setIsMember(!!mine);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [slug, user]);

  useEffect(() => {
    if (!club) return;
    const title = `${club.name} — Šahovski klub | MasterChess`;
    document.title = title;
    const desc =
      club.description?.slice(0, 155) ||
      `Zvanična stranica šahovskog kluba ${club.name} na MasterChess-u.`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", desc);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", title);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `/club/${club.slug}`);

    // JSON-LD SportsClub
    const ldId = "club-json-ld";
    document.getElementById(ldId)?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = ldId;
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SportsClub",
      name: club.name,
      description: club.description,
      logo: club.logo_url || undefined,
      url: `https://masterchess.live/club/${club.slug}`,
      address: club.city ? { "@type": "PostalAddress", addressLocality: club.city } : undefined,
      email: club.contact_email || undefined,
      sameAs: club.website_url ? [club.website_url] : undefined,
      foundingDate: club.founded_year ? String(club.founded_year) : undefined,
    });
    document.head.appendChild(script);
    return () => document.getElementById(ldId)?.remove();
  }, [club]);

  const share = async () => {
    const url = `${window.location.origin}/club/${club?.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: club?.name, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link kopiran");
    }
  };

  const join = async () => {
    if (!user) {
      navigate(`/login?next=/club/${slug}`);
      return;
    }
    if (!club) return;
    setJoining(true);
    const { error } = await supabase
      .from("club_members")
      .insert({ club_id: club.id, user_id: user.id, role: "member" });
    setJoining(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setIsMember(true);
    toast.success(`Dobrodošao/la u ${club.name}!`);
  };

  const bannerStyle = useMemo(
    () => ({
      backgroundImage: club
        ? `radial-gradient(ellipse at 20% 20%, ${club.banner_color}55, transparent 60%),
           radial-gradient(ellipse at 80% 80%, ${club.banner_color}33, transparent 60%),
           linear-gradient(135deg, #0a0a0a, #171717)`
        : undefined,
    }),
    [club],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400">
        Učitavanje…
      </div>
    );
  }
  if (!club) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-neutral-300">
        <div className="text-2xl">Klub nije pronađen</div>
        <Link to="/clubs" className="text-amber-400 underline">
          Nazad na sve klubove
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900" style={bannerStyle}>
        <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col md:flex-row gap-8 items-center md:items-end">
          <div className="w-32 h-32 rounded-3xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-center text-6xl shrink-0 overflow-hidden">
            {club.logo_url ? (
              <img src={club.logo_url} alt={`${club.name} logo`} className="w-full h-full object-cover" />
            ) : (
              <span>{club.icon}</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{club.name}</h1>
              {club.verified && <VerifiedBadge size={26} />}
              {club.tag && (
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 font-mono">
                  [{club.tag}]
                </Badge>
              )}
            </div>
            <div className="mt-2 flex items-center gap-3 justify-center md:justify-start text-sm text-neutral-400 flex-wrap">
              {club.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {club.city}
                </span>
              )}
              {club.founded_year && <span>· Osnovan {club.founded_year}</span>}
              {club.partner_type && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  {club.partner_type}
                </Badge>
              )}
            </div>
            {club.description && (
              <p className="mt-4 max-w-2xl text-neutral-300">{club.description}</p>
            )}
            <div className="mt-6 flex gap-2 flex-wrap justify-center md:justify-start">
              {!isMember && (
                <Button onClick={join} disabled={joining} className="bg-amber-500 hover:bg-amber-400 text-black">
                  <Users size={16} className="mr-2" /> Pridruži se klubu
                </Button>
              )}
              {isMember && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 py-2 px-3">
                  ✓ Član kluba
                </Badge>
              )}
              <Button variant="outline" onClick={share}>
                <Share2 size={16} className="mr-2" /> Podeli
              </Button>
              {isOwner && (
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil size={16} className="mr-2" /> Uredi klub
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Članova", value: club.member_count, icon: Users },
          { label: "Prosečan rejting", value: club.avg_rating, icon: Sparkles },
          { label: "Ukupno pobeda", value: club.total_wins, icon: Trophy },
          { label: "Ove nedelje", value: club.weekly_wins, icon: Calendar },
        ].map((s) => (
          <Card key={s.label} className="p-4 bg-neutral-950 border-neutral-900">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <s.icon size={14} /> {s.label}
            </div>
            <div className="mt-2 text-2xl font-bold">{s.value.toLocaleString("sr-RS")}</div>
          </Card>
        ))}
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16 grid md:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="md:col-span-2 space-y-6">
          {club.history && (
            <Card className="p-6 bg-neutral-950 border-neutral-900">
              <h2 className="text-xl font-bold mb-3">Istorija</h2>
              <p className="text-neutral-300 whitespace-pre-line">{club.history}</p>
            </Card>
          )}

          {/* News */}
          <Card className="p-6 bg-neutral-950 border-neutral-900">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Newspaper size={18} /> Vesti kluba
            </h2>
            {news.length === 0 ? (
              <p className="text-neutral-500 text-sm">Nema objava još.</p>
            ) : (
              <ul className="space-y-4">
                {news.map((n) => (
                  <li key={n.id} className="border-l-2 border-amber-500/40 pl-4">
                    <div className="text-xs text-neutral-500">
                      {new Date(n.published_at).toLocaleDateString("sr-RS")}
                    </div>
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-sm text-neutral-300 whitespace-pre-line">{n.body}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Events */}
          <Card className="p-6 bg-neutral-950 border-neutral-900">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} /> Nadolazeći događaji
            </h2>
            {events.length === 0 ? (
              <p className="text-neutral-500 text-sm">Nema zakazanih događaja.</p>
            ) : (
              <ul className="space-y-3">
                {events.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800"
                  >
                    <div className="w-14 shrink-0 text-center">
                      <div className="text-xs text-neutral-400 uppercase">
                        {new Date(e.starts_at).toLocaleDateString("sr-RS", { month: "short" })}
                      </div>
                      <div className="text-2xl font-bold text-amber-400">
                        {new Date(e.starts_at).getDate()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{e.title}</div>
                      <div className="text-xs text-neutral-400">
                        {new Date(e.starts_at).toLocaleTimeString("sr-RS", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {e.location && ` · ${e.location}`}
                      </div>
                      {e.description && (
                        <div className="text-sm text-neutral-300 mt-1">{e.description}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Gallery */}
          {photos.length > 0 && (
            <Card className="p-6 bg-neutral-950 border-neutral-900">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ImageIcon size={18} /> Galerija
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <a
                    key={p.id}
                    href={p.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded overflow-hidden bg-neutral-900 hover:opacity-80"
                  >
                    <img
                      src={p.image_url}
                      alt={p.caption ?? ""}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right col */}
        <aside className="space-y-6">
          {/* Contact */}
          <Card className="p-6 bg-neutral-950 border-neutral-900">
            <h3 className="font-semibold mb-3">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              {club.contact_email && (
                <li className="flex items-center gap-2 text-neutral-300">
                  <Mail size={14} className="text-amber-400" />
                  <a href={`mailto:${club.contact_email}`} className="hover:underline">
                    {club.contact_email}
                  </a>
                </li>
              )}
              {club.website_url && (
                <li className="flex items-center gap-2 text-neutral-300">
                  <Globe size={14} className="text-amber-400" />
                  <a
                    href={club.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline break-all"
                  >
                    {club.website_url.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              )}
              {!club.contact_email && !club.website_url && (
                <li className="text-neutral-500 text-xs">Nema kontakt informacija.</li>
              )}
            </ul>
          </Card>

          {/* Members */}
          <Card className="p-6 bg-neutral-950 border-neutral-900">
            <h3 className="font-semibold mb-3">Članovi ({club.member_count})</h3>
            <div className="grid grid-cols-4 gap-2">
              {members.slice(0, 16).map((m) => (
                <Link
                  key={m.user_id}
                  to={m.profile?.username ? `/u/${m.profile.username}` : "#"}
                  className="flex flex-col items-center gap-1 text-center"
                  title={m.profile?.username ?? ""}
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden">
                    {m.profile?.avatar_url ? (
                      <img src={m.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500">
                        ♟
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate w-full">
                    {m.profile?.username ?? "—"}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {isOwner && club && (
        <ClubEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          club={club}
          onSaved={(updated) => setClub({ ...club, ...updated })}
        />
      )}
    </div>
  );
}
