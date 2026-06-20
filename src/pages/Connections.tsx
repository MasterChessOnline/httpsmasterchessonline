// Link Discord + opt-in to the global community map.
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link as LinkIcon, MapPin, Globe } from "lucide-react";

// Public Discord client id — safe to expose. Replace once the user creates the app.
const DISCORD_CLIENT_ID = (import.meta as any).env?.VITE_DISCORD_CLIENT_ID ?? "";

export default function Connections() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] = useState({ lat: "", lng: "", city: "" });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles")
      .select("discord_user_id, discord_username, discord_avatar, show_on_map, map_lat, map_lng, city")
      .eq("user_id", user.id).maybeSingle();
    setProfile(data);
    setCoords({
      lat: data?.map_lat?.toString() ?? "",
      lng: data?.map_lng?.toString() ?? "",
      city: data?.city ?? "",
    });
  };
  useEffect(() => { load(); }, [user]);

  // Handle Discord OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && user) {
      (async () => {
        setBusy(true);
        const { error } = await supabase.functions.invoke("discord-oauth-callback", {
          body: { code, redirect_uri: `${window.location.origin}/connections` },
        });
        if (error) toast.error("Failed to link Discord");
        else { toast.success("Discord linked!"); await load(); }
        setBusy(false);
        window.history.replaceState({}, "", "/connections");
      })();
    }
  }, [user]);

  const linkDiscord = () => {
    if (!DISCORD_CLIENT_ID) {
      toast.error("Discord client ID not configured yet");
      return;
    }
    const redirect = `${window.location.origin}/connections`;
    const url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&scope=identify`;
    window.location.href = url;
  };

  const unlinkDiscord = async () => {
    setBusy(true);
    await supabase.functions.invoke("discord-oauth-callback", { body: { unlink: true } });
    toast.success("Discord unlinked");
    await load();
    setBusy(false);
  };

  const saveMap = async () => {
    if (!user) return;
    const lat = coords.lat ? parseFloat(coords.lat) : null;
    const lng = coords.lng ? parseFloat(coords.lng) : null;
    if ((lat !== null && (lat < -90 || lat > 90)) || (lng !== null && (lng < -180 || lng > 180))) {
      toast.error("Invalid coordinates"); return;
    }
    setBusy(true);
    const { error } = await supabase.from("profiles")
      .update({ map_lat: lat, map_lng: lng, city: coords.city || null })
      .eq("user_id", user.id);
    if (error) toast.error(error.message); else toast.success("Saved");
    setBusy(false);
  };

  const toggleMap = async (on: boolean) => {
    if (!user) return;
    if (on && (!coords.lat || !coords.lng)) {
      toast.error("Add your coordinates first"); return;
    }
    await supabase.from("profiles").update({ show_on_map: on }).eq("user_id", user.id);
    await load();
  };

  if (!user) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl py-16 text-center">
        <p className="text-muted-foreground">Sign in to manage connections.</p>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Connections — Discord & Community Map | MasterChess</title>
        <meta name="description" content="Link your Discord account and put yourself on the MasterChess global community map." />
        <link rel="canonical" href="https://masterchess.live/connections" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><LinkIcon className="w-7 h-7" /> Connections</h1>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold">Discord</h2>
          </div>
          {profile?.discord_user_id ? (
            <div className="flex items-center gap-4">
              {profile.discord_avatar && <img src={profile.discord_avatar} alt="" className="w-12 h-12 rounded-full" />}
              <div className="flex-1">
                <div className="font-medium">{profile.discord_username}</div>
                <div className="text-xs text-muted-foreground">Linked</div>
              </div>
              <Button variant="outline" onClick={unlinkDiscord} disabled={busy}>Unlink</Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Link your Discord to receive role rewards (Pawn → Grandmaster) based on your in-game progress.</p>
              <Button onClick={linkDiscord} disabled={busy}>Link Discord</Button>
            </>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold">Community Map</h2>
          </div>
          <p className="text-sm text-muted-foreground">Appear on the global community map. Only your approximate coordinates are shown.</p>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Latitude</Label><Input value={coords.lat} onChange={e => setCoords(c => ({ ...c, lat: e.target.value }))} placeholder="44.78" /></div>
            <div><Label>Longitude</Label><Input value={coords.lng} onChange={e => setCoords(c => ({ ...c, lng: e.target.value }))} placeholder="20.45" /></div>
            <div><Label>City</Label><Input value={coords.city} onChange={e => setCoords(c => ({ ...c, city: e.target.value }))} placeholder="Belgrade" /></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Switch checked={!!profile?.show_on_map} onCheckedChange={toggleMap} /><span className="text-sm">Show me on the map</span></div>
            <Button onClick={saveMap} disabled={busy}>Save</Button>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
