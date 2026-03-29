import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User, Palette, Volume2, Globe, Bell, Shield, Gamepad2,
  LogOut, Check, ChevronRight, Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import RankBadge from "@/components/RankBadge";

type SettingsSection = "account" | "profile" | "gameplay" | "appearance" | "audio" | "language" | "notifications" | "privacy";

const SECTIONS: { key: SettingsSection; label: string; icon: typeof User }[] = [
  { key: "account", label: "Account", icon: Shield },
  { key: "profile", label: "Profile", icon: User },
  { key: "gameplay", label: "Gameplay", icon: Gamepad2 },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "audio", label: "Audio", icon: Volume2 },
  { key: "language", label: "Language", icon: Globe },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "privacy", label: "Privacy & Security", icon: Shield },
];

const BOARD_THEMES = [
  { key: "classic", label: "Classic", light: "hsl(33, 40%, 60%)", dark: "hsl(25, 35%, 30%)" },
  { key: "blue", label: "Blue", light: "hsl(210, 40%, 70%)", dark: "hsl(210, 45%, 35%)" },
  { key: "green", label: "Green", light: "hsl(120, 25%, 65%)", dark: "hsl(120, 30%, 30%)" },
  { key: "wood", label: "Wood", light: "hsl(35, 50%, 65%)", dark: "hsl(25, 45%, 28%)" },
  { key: "purple", label: "Purple", light: "hsl(270, 30%, 70%)", dark: "hsl(270, 35%, 30%)" },
  { key: "grey", label: "Grey", light: "hsl(0, 0%, 75%)", dark: "hsl(0, 0%, 45%)" },
];

const PIECE_STYLES = ["Classic", "Modern", "Neo", "Alpha", "Merida"];
const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sr", label: "Srpski", flag: "🇷🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem("chess-settings") || "{}");
  } catch { return {}; }
}

function saveSetting(key: string, value: any) {
  const s = getSettings();
  s[key] = value;
  localStorage.setItem("chess-settings", JSON.stringify(s));
}

const Settings = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<SettingsSection>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Profile
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);

  // Settings from localStorage
  const settings = getSettings();
  const [premoves, setPremoves] = useState(settings.premoves ?? true);
  const [autoQueen, setAutoQueen] = useState(settings.autoQueen ?? true);
  const [moveConfirm, setMoveConfirm] = useState(settings.moveConfirm ?? false);
  const [boardTheme, setBoardTheme] = useState(settings.boardTheme ?? "classic");
  const [pieceStyle, setPieceStyle] = useState(settings.pieceStyle ?? "Classic");
  const [moveSound, setMoveSound] = useState(settings.moveSound ?? true);
  const [notifSound, setNotifSound] = useState(settings.notifSound ?? true);
  const [volume, setVolume] = useState(settings.volume ?? 80);
  const [language, setLanguage] = useState(settings.language ?? "en");
  const [animSpeed, setAnimSpeed] = useState(settings.animSpeed ?? 50);
  const [notifMatch, setNotifMatch] = useState(settings.notifMatch ?? true);
  const [notifGame, setNotifGame] = useState(settings.notifGame ?? true);
  const [notifFriend, setNotifFriend] = useState(settings.notifFriend ?? true);
  const [profilePublic, setProfilePublic] = useState(settings.profilePublic ?? true);
  const [historyPublic, setHistoryPublic] = useState(settings.historyPublic ?? true);
  const [friendRequests, setFriendRequests] = useState(settings.friendRequests ?? true);
  const [pieceAnim, setPieceAnim] = useState(settings.pieceAnim ?? true);
  const [captureAnim, setCaptureAnim] = useState(settings.captureAnim ?? true);
  const [highlightEffects, setHighlightEffects] = useState(settings.highlightEffects ?? true);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name || "");
  }, [profile]);

  // Auto-save helper
  const toggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    saveSetting(key, value);
    toast.success("Setting updated");
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ display_name: displayName.trim() || "Player" }).eq("user_id", user.id);
    await refreshProfile();
    setSaving(false);
    toast.success("Profile updated");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const renderSection = () => {
    switch (section) {
      case "account":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">Account</h3>
              <p className="text-sm text-muted-foreground">Manage your account security and sessions.</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm text-foreground font-medium mt-1">{user.email}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground">Account Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-foreground">Active</span>
                </div>
              </div>
              <Separator />
              <Button variant="destructive" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">Profile</h3>
              <p className="text-sm text-muted-foreground">Customize how others see you.</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
                <div>
                  <Label htmlFor="displayName" className="text-xs text-muted-foreground">Display Name</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={50} className="flex-1" />
                    <Button onClick={saveProfile} disabled={saving} size="sm" className="gap-1">
                      <Check className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rating</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl font-mono font-bold text-primary">{profile?.rating || 400}</span>
                    <RankBadge rating={profile?.rating || 400} showProgress />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "gameplay":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">Gameplay</h3>
              <p className="text-sm text-muted-foreground">Customize your gameplay experience.</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Premoves", desc: "Queue moves before your turn", value: premoves, key: "premoves", setter: setPremoves },
                { label: "Auto-Queen", desc: "Always promote to queen", value: autoQueen, key: "autoQueen", setter: setAutoQueen },
                { label: "Move Confirmation", desc: "Confirm before each move", value: moveConfirm, key: "moveConfirm", setter: setMoveConfirm },
                { label: "Piece Animation", desc: "Animate piece movement", value: pieceAnim, key: "pieceAnim", setter: setPieceAnim },
                { label: "Capture Effects", desc: "Visual effects on captures", value: captureAnim, key: "captureAnim", setter: setCaptureAnim },
                { label: "Highlight Effects", desc: "Show move and check highlights", value: highlightEffects, key: "highlightEffects", setter: setHighlightEffects },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={v => toggle(item.key, v, item.setter)} />
                </div>
              ))}
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Animation Speed</p>
                    <p className="text-xs text-muted-foreground">How fast pieces move</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{animSpeed}%</span>
                </div>
                <Slider value={[animSpeed]} onValueChange={([v]) => { setAnimSpeed(v); saveSetting("animSpeed", v); }} min={0} max={100} step={10} />
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">Appearance</h3>
              <p className="text-sm text-muted-foreground">Customize board and piece visuals.</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Board Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BOARD_THEMES.map(t => (
                    <button
                      key={t.key}
                      onClick={() => { setBoardTheme(t.key); saveSetting("boardTheme", t.key); toast.success(`Board: ${t.label}`); }}
                      className={`rounded-lg p-2 border transition-all ${boardTheme === t.key ? "border-primary ring-2 ring-primary/30" : "border-border/50 hover:border-primary/30"}`}
                    >
                      <div className="grid grid-cols-4 gap-0 rounded overflow-hidden mb-1.5">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const row = Math.floor(i / 4);
                          const col = i % 4;
                          const isLight = (row + col) % 2 === 0;
                          return <div key={i} className="aspect-square" style={{ backgroundColor: isLight ? t.light : t.dark }} />;
                        })}
                      </div>
                      <p className="text-[10px] text-foreground font-medium text-center">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Piece Style</Label>
                <div className="flex flex-wrap gap-2">
                  {PIECE_STYLES.map(ps => (
                    <button
                      key={ps}
                      onClick={() => { setPieceStyle(ps); saveSetting("pieceStyle", ps); toast.success(`Pieces: ${ps}`); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${pieceStyle === ps ? "border-primary bg-primary/15 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
              </div>
              {/* Live preview */}
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Preview</Label>
                <div className="w-32 mx-auto">
                  {(() => {
                    const theme = BOARD_THEMES.find(t => t.key === boardTheme) || BOARD_THEMES[0];
                    return (
                      <div className="grid grid-cols-4 gap-0 rounded-lg overflow-hidden border border-border/30">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const row = Math.floor(i / 4);
                          const col = i % 4;
                          const isLight = (row + col) % 2 === 0;
                          const pieces: Record<number, string> = { 0: "♜", 1: "♞", 2: "♝", 3: "♛", 4: "♟", 5: "♟", 6: "♟", 7: "♟", 8: "♙", 9: "♙", 10: "♙", 11: "♙", 12: "♖", 13: "♘", 14: "♗", 15: "♕" };
                          return (
                            <div key={i} className="aspect-square flex items-center justify-center text-base" style={{ backgroundColor: isLight ? theme.light : theme.dark }}>
                              {pieces[i] || ""}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">Audio</h3>
              <p className="text-sm text-muted-foreground">Control sound settings.</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Move Sounds", desc: "Play sound on moves", value: moveSound, key: "moveSound", setter: setMoveSound },
                { label: "Notification Sounds", desc: "Play sound on notifications", value: notifSound, key: "notifSound", setter: setNotifSound },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={v => toggle(item.key, v, item.setter)} />
                </div>
              ))}
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Volume</p>
                    <p className="text-xs text-muted-foreground">Master volume level</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{volume}%</span>
                </div>
                <Slider value={[volume]} onValueChange={([v]) => { setVolume(v); saveSetting("volume", v); }} min={0} max={100} step={5} />
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">Language</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred language.</p>
            </div>
            <div className="space-y-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); saveSetting("language", lang.code); toast.success(`Language: ${lang.label}`); }}
                  className={`w-full flex items-center justify-between rounded-xl border p-4 transition-all ${language === lang.code ? "border-primary bg-primary/5" : "border-border/50 bg-card/60 hover:border-primary/30"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-medium text-foreground">{lang.label}</span>
                  </div>
                  {language === lang.code && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">Notifications</h3>
              <p className="text-sm text-muted-foreground">Control what notifications you receive.</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Match Found", desc: "When a match is found", value: notifMatch, key: "notifMatch", setter: setNotifMatch },
                { label: "Game Start", desc: "When a game begins", value: notifGame, key: "notifGame", setter: setNotifGame },
                { label: "Friend Activity", desc: "Friend requests and activity", value: notifFriend, key: "notifFriend", setter: setNotifFriend },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={v => toggle(item.key, v, item.setter)} />
                </div>
              ))}
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">Privacy & Security</h3>
              <p className="text-sm text-muted-foreground">Control your privacy settings.</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Public Profile", desc: "Allow anyone to view your profile", value: profilePublic, key: "profilePublic", setter: setProfilePublic },
                { label: "Match History Visible", desc: "Show your game history publicly", value: historyPublic, key: "historyPublic", setter: setHistoryPublic },
                { label: "Friend Requests", desc: "Allow others to send friend requests", value: friendRequests, key: "friendRequests", setter: setFriendRequests },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={item.value} onCheckedChange={v => toggle(item.key, v, item.setter)} />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="w-5 h-5 text-primary" />
              <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
            </div>
            <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
          </div>

          <div className="flex gap-6">
            {/* Sidebar */}
            <nav className="hidden md:flex flex-col w-56 shrink-0 space-y-1">
              {SECTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSection(s.key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    section === s.key
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <s.icon className="w-4 h-4 shrink-0" />
                  {s.label}
                  {section === s.key && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              ))}
            </nav>

            {/* Mobile section selector */}
            <div className="md:hidden w-full mb-4">
              <div className="flex flex-wrap gap-1.5">
                {SECTIONS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSection(s.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      section === s.key
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-card text-muted-foreground border border-border/40"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={section}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Settings;
