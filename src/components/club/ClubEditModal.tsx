import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  club: any;
  onSaved: (patch: any) => void;
}

export default function ClubEditModal({ open, onOpenChange, club, onSaved }: Props) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: club.name ?? "",
    description: club.description ?? "",
    history: club.history ?? "",
    tag: club.tag ?? "",
    banner_color: club.banner_color ?? "#d4a843",
    logo_url: club.logo_url ?? "",
    website_url: club.website_url ?? "",
    contact_email: club.contact_email ?? "",
    founded_year: club.founded_year ?? "",
    city: club.city ?? "",
  });

  // Quick-add News / Event state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventWhen, setEventWhen] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");

  const saveBasic = async () => {
    setSaving(true);
    const patch: any = {
      name: form.name.trim(),
      description: form.description,
      history: form.history || null,
      tag: form.tag ? form.tag.trim().toUpperCase() : null,
      banner_color: form.banner_color,
      logo_url: form.logo_url || null,
      website_url: form.website_url || null,
      contact_email: form.contact_email || null,
      founded_year: form.founded_year ? Number(form.founded_year) : null,
      city: form.city || null,
    };
    const { error } = await supabase.from("clubs").update(patch).eq("id", club.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    onSaved(patch);
    toast.success("Sačuvano");
  };

  const addNews = async () => {
    if (!newsTitle.trim() || !newsBody.trim()) return;
    const { error } = await supabase.from("club_news").insert({
      club_id: club.id,
      title: newsTitle.trim(),
      body: newsBody.trim(),
      author_id: user?.id,
    });
    if (error) return toast.error(error.message);
    setNewsTitle("");
    setNewsBody("");
    toast.success("Vest objavljena");
  };

  const addEvent = async () => {
    if (!eventTitle.trim() || !eventWhen) return;
    const { error } = await supabase.from("club_events").insert({
      club_id: club.id,
      title: eventTitle.trim(),
      starts_at: new Date(eventWhen).toISOString(),
      location: eventLocation || null,
      created_by: user?.id,
    });
    if (error) return toast.error(error.message);
    setEventTitle("");
    setEventWhen("");
    setEventLocation("");
    toast.success("Događaj dodat");
  };

  const addPhoto = async () => {
    if (!photoUrl.trim()) return;
    const { error } = await supabase.from("club_gallery").insert({
      club_id: club.id,
      image_url: photoUrl.trim(),
      caption: photoCaption || null,
      uploaded_by: user?.id,
    });
    if (error) return toast.error(error.message);
    setPhotoUrl("");
    setPhotoCaption("");
    toast.success("Fotografija dodata");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Uredi klub</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Osnovno</TabsTrigger>
            <TabsTrigger value="news">Vesti</TabsTrigger>
            <TabsTrigger value="events">Događaji</TabsTrigger>
            <TabsTrigger value="gallery">Galerija</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-3 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ime</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Tag (2-5 slova/cifara)</Label>
                <Input
                  value={form.tag}
                  maxLength={5}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Opis</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Istorija</Label>
              <Textarea
                rows={4}
                value={form.history}
                onChange={(e) => setForm({ ...form, history: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Logo URL</Label>
                <Input
                  placeholder="https://…"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                />
              </div>
              <div>
                <Label>Banner boja</Label>
                <Input
                  type="color"
                  value={form.banner_color}
                  onChange={(e) => setForm({ ...form, banner_color: e.target.value })}
                />
              </div>
              <div>
                <Label>Grad</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <Label>Osnovan (godina)</Label>
                <Input
                  type="number"
                  value={form.founded_year}
                  onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                />
              </div>
              <div>
                <Label>Kontakt email</Label>
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveBasic} disabled={saving}>
                {saving ? "Čuvam…" : "Sačuvaj"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="news" className="space-y-3 pt-4">
            <Label>Naslov</Label>
            <Input value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} />
            <Label>Tekst</Label>
            <Textarea rows={4} value={newsBody} onChange={(e) => setNewsBody(e.target.value)} />
            <Button onClick={addNews}>
              <Plus size={14} className="mr-1" /> Objavi vest
            </Button>
          </TabsContent>

          <TabsContent value="events" className="space-y-3 pt-4">
            <Label>Naslov događaja</Label>
            <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
            <Label>Datum i vreme</Label>
            <Input type="datetime-local" value={eventWhen} onChange={(e) => setEventWhen(e.target.value)} />
            <Label>Lokacija (opciono)</Label>
            <Input value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
            <Button onClick={addEvent}>
              <Plus size={14} className="mr-1" /> Dodaj događaj
            </Button>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-3 pt-4">
            <p className="text-xs text-neutral-500">
              Nalepi URL fotografije (npr. sa imgur-a, tvog sajta ili storage-a).
            </p>
            <Label>URL slike</Label>
            <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" />
            <Label>Opis (opciono)</Label>
            <Input value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} />
            <Button onClick={addPhoto}>
              <Plus size={14} className="mr-1" /> Dodaj fotografiju
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
