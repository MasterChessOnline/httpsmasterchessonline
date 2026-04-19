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
import { Separator } from "@/components/ui/separator";
import {
  User, Palette, Volume2, Globe, Bell, Shield, Gamepad2,
  LogOut, Check, ChevronRight, Settings2, Brain, Target as TargetIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import RankBadge from "@/components/RankBadge";
import { BOARD_THEMES, PIECE_STYLES, applyBoardTheme, applyPieceStyle } from "@/lib/board-themes";
import BoardThemeCard from "@/components/settings/BoardThemeCard";
import PieceStyleCard from "@/components/settings/PieceStyleCard";
import LiveBoardPreview from "@/components/settings/LiveBoardPreview";

type SettingsSection = "account" | "profile" | "gameplay" | "training" | "improvement" | "appearance" | "audio" | "language" | "notifications" | "privacy";

const SECTIONS: { key: SettingsSection; label: string; icon: typeof User }[] = [
  { key: "account", label: "Account", icon: Shield },
  { key: "profile", label: "Profile", icon: User },
  { key: "gameplay", label: "Gameplay", icon: Gamepad2 },
  { key: "training", label: "Training", icon: Brain },
  { key: "improvement", label: "Improvement", icon: TargetIcon },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "audio", label: "Audio", icon: Volume2 },
  { key: "language", label: "Language", icon: Globe },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "privacy", label: "Privacy & Security", icon: Shield },
];

const BOARD_THEMES = [
  { key: "classic", label: "Classic Wood", light: "hsl(33,40%,60%)", dark: "hsl(25,35%,30%)" },
  { key: "dark", label: "Dark Modern", light: "hsl(220,10%,50%)", dark: "hsl(220,15%,25%)" },
  { key: "light", label: "Light Minimal", light: "hsl(40,20%,90%)", dark: "hsl(40,15%,70%)" },
  { key: "green", label: "Green Tournament", light: "hsl(120,25%,75%)", dark: "hsl(145,32%,38%)" },
  { key: "blue", label: "Blue Neon", light: "hsl(210,40%,70%)", dark: "hsl(210,45%,35%)" },
  { key: "marble", label: "Marble", light: "hsl(0,0%,88%)", dark: "hsl(0,0%,58%)" },
  { key: "glass", label: "Glass Effect", light: "hsl(200,30%,80%)", dark: "hsl(200,25%,45%)" },
  { key: "gold", label: "Black & Gold", light: "hsl(43,60%,55%)", dark: "hsl(0,0%,12%)" },
  { key: "cyber", label: "Cyber Neon", light: "hsl(280,40%,65%)", dark: "hsl(280,50%,20%)" },
  { key: "cartoon", label: "Cartoon Style", light: "hsl(50,80%,75%)", dark: "hsl(30,60%,45%)" },
];

const PIECE_STYLES = [
  "Staunton Classic", "Flat Modern", "Wooden Carved", "Neon Glow", "Minimal Outline",
  "Metallic Silver", "Golden Royal", "Pixel Style", "3D Realistic", "Fantasy Themed"
];

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sr", label: "Srpski", flag: "🇷🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const ANIMATION_MODES = [
  { key: "instant", label: "Instant", desc: "No animation" },
  { key: "smooth", label: "Smooth", desc: "Default speed" },
  { key: "cinematic", label: "Cinematic", desc: "Slow motion" },
];

function getSettings() {
  try { return JSON.parse(localStorage.getItem("chess-settings") || "{}"); }
  catch { return {}; }
}
function saveSetting(key: string, value: any) {
  const s = getSettings(); s[key] = value;
  localStorage.setItem("chess-settings", JSON.stringify(s));
}

const Settings = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<SettingsSection>("profile");

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saving, setSaving] = useState(false);

  const settings = getSettings();
  const [premoves, setPremoves] = useState(settings.premoves ?? true);
  const [autoQueen, setAutoQueen] = useState(settings.autoQueen ?? true);
  const [moveConfirm, setMoveConfirm] = useState(settings.moveConfirm ?? false);
  const [flipBoard, setFlipBoard] = useState(settings.flipBoard ?? false);
  const [preMoveEnabled, setPreMoveEnabled] = useState(settings.preMoveEnabled ?? true);
  const [boardTheme, setBoardTheme] = useState(settings.boardTheme ?? "classic");
  const [pieceStyle, setPieceStyle] = useState(settings.pieceStyle ?? "Staunton Classic");
  const [moveSound, setMoveSound] = useState(settings.moveSound ?? true);
  const [captureSound, setCaptureSound] = useState(settings.captureSound ?? true);
  const [checkSound, setCheckSound] = useState(settings.checkSound ?? true);
  const [notifSound, setNotifSound] = useState(settings.notifSound ?? true);
  const [volume, setVolume] = useState(settings.volume ?? 80);
  const [language, setLanguage] = useState(settings.language ?? "en");
  const [animMode, setAnimMode] = useState(settings.animMode ?? "smooth");
  const [notifMatch, setNotifMatch] = useState(settings.notifMatch ?? true);
  const [notifGame, setNotifGame] = useState(settings.notifGame ?? true);
  const [notifFriend, setNotifFriend] = useState(settings.notifFriend ?? true);
  const [profilePublic, setProfilePublic] = useState(settings.profilePublic ?? true);
  const [historyPublic, setHistoryPublic] = useState(settings.historyPublic ?? true);
  const [friendRequests, setFriendRequests] = useState(settings.friendRequests ?? true);
  const [highlightMoves, setHighlightMoves] = useState(settings.highlightMoves ?? true);
  // Training settings
  const [coachStyle, setCoachStyle] = useState<"simple" | "detailed">(settings.coachStyle ?? "detailed");
  const [analysisDepth, setAnalysisDepth] = useState<"fast" | "deep">(settings.analysisDepth ?? "fast");
  const [autoAnalyze, setAutoAnalyze] = useState(settings.autoAnalyze ?? true);
  // Improvement settings
  const [focusArea, setFocusArea] = useState<"openings" | "tactics" | "endgames" | "balanced">(settings.focusArea ?? "balanced");
  const [weaknessTracking, setWeaknessTracking] = useState(settings.weaknessTracking ?? true);
  const [dailyGoalGames, setDailyGoalGames] = useState<number>(settings.dailyGoalGames ?? 3);
  const [dailyGoalTrainings, setDailyGoalTrainings] = useState<number>(settings.dailyGoalTrainings ?? 2);
  // Notifications additions
  const [notifTilt, setNotifTilt] = useState(settings.notifTilt ?? true);
  const [notifDaily, setNotifDaily] = useState(settings.notifDaily ?? true);
  const [notifGameReminder, setNotifGameReminder] = useState(settings.notifGameReminder ?? true);
  // Default time control
  const [defaultTimeControl, setDefaultTimeControl] = useState<"bullet" | "blitz" | "rapid">(settings.defaultTimeControl ?? "blitz");

  useEffect(() => { if (profile) setDisplayName(profile.display_name || ""); }, [profile]);

  const toggle = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value); saveSetting(key, value); toast.success("Setting updated");
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ display_name: displayName.trim() || "Player" }).eq("user_id", user.id);
    await refreshProfile();
    setSaving(false);
    toast.success("Profile updated");
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  if (!user) { navigate("/login"); return null; }

  const renderSection = () => {
    switch (section) {
      case "account":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Account</h3><p className="text-sm text-muted-foreground">Manage your account.</p></div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm text-foreground font-medium mt-1">{user.email}</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="flex items-center gap-2 mt-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-sm text-foreground">Active</span></div>
              </div>
              <Separator />
              <Button variant="destructive" onClick={handleSignOut} className="gap-2"><LogOut className="w-4 h-4" /> Sign Out</Button>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Profile</h3><p className="text-sm text-muted-foreground">Customize how others see you.</p></div>
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
              <div>
                <Label htmlFor="displayName" className="text-xs text-muted-foreground">Display Name</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={50} className="flex-1" />
                  <Button onClick={saveProfile} disabled={saving} size="sm" className="gap-1"><Check className="w-3 h-3" /> {saving ? "…" : "Save"}</Button>
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
        );

      case "gameplay":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Gameplay</h3><p className="text-sm text-muted-foreground">Customize your gameplay.</p></div>
            <div className="space-y-3">
              {[
                { label: "Auto-Queen", desc: "Always promote to queen", value: autoQueen, key: "autoQueen", setter: setAutoQueen },
                { label: "Move Confirmation", desc: "Confirm before each move", value: moveConfirm, key: "moveConfirm", setter: setMoveConfirm },
                { label: "Flip Board", desc: "Flip board after each move", value: flipBoard, key: "flipBoard", setter: setFlipBoard },
                { label: "Pre-move", desc: "Queue moves before your turn", value: preMoveEnabled, key: "preMoveEnabled", setter: setPreMoveEnabled },
                { label: "Highlight Moves", desc: "Show legal move indicators", value: highlightMoves, key: "highlightMoves", setter: setHighlightMoves },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={item.value} onCheckedChange={v => toggle(item.key, v, item.setter)} />
                </div>
              ))}
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Appearance</h3><p className="text-sm text-muted-foreground">Board and piece visuals.</p></div>
            <div className="space-y-4">
              {/* Board Themes - 10 */}
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Board Theme ({BOARD_THEMES.length})</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {BOARD_THEMES.map(t => (
                    <button key={t.key} onClick={() => { setBoardTheme(t.key); saveSetting("boardTheme", t.key); toast.success(`Board: ${t.label}`); }}
                      className={`rounded-lg p-2 border transition-all ${boardTheme === t.key ? "border-primary ring-2 ring-primary/30" : "border-border/50 hover:border-primary/30"}`}>
                      <div className="grid grid-cols-4 gap-0 rounded overflow-hidden mb-1">
                        {Array.from({ length: 16 }).map((_, i) => {
                          const isLight = (Math.floor(i / 4) + i % 4) % 2 === 0;
                          return <div key={i} className="aspect-square" style={{ backgroundColor: isLight ? t.light : t.dark }} />;
                        })}
                      </div>
                      <p className="text-[9px] text-foreground font-medium text-center truncate">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Piece Styles - 10 */}
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Piece Style ({PIECE_STYLES.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {PIECE_STYLES.map(ps => (
                    <button key={ps} onClick={() => { setPieceStyle(ps); saveSetting("pieceStyle", ps); toast.success(`Pieces: ${ps}`); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${pieceStyle === ps ? "border-primary bg-primary/15 text-primary" : "border-border/50 text-muted-foreground hover:border-primary/30"}`}>
                      {ps}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Audio</h3><p className="text-sm text-muted-foreground">Sound settings.</p></div>
            <div className="space-y-3">
              {[
                { label: "Move Sounds", desc: "Sound on piece move", value: moveSound, key: "moveSound", setter: setMoveSound },
                { label: "Capture Sounds", desc: "Sound on capture", value: captureSound, key: "captureSound", setter: setCaptureSound },
                { label: "Check Alert", desc: "Sound on check", value: checkSound, key: "checkSound", setter: setCheckSound },
                { label: "Notifications", desc: "Notification sounds", value: notifSound, key: "notifSound", setter: setNotifSound },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={item.value} onCheckedChange={v => toggle(item.key, v, item.setter)} />
                </div>
              ))}
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div><p className="text-sm font-medium text-foreground">Volume</p></div>
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
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Language</h3><p className="text-sm text-muted-foreground">Choose your language.</p></div>
            <div className="space-y-2">
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); saveSetting("language", lang.code); toast.success(`Language: ${lang.label}`); }}
                  className={`w-full flex items-center justify-between rounded-xl border p-4 transition-all ${language === lang.code ? "border-primary bg-primary/5" : "border-border/50 bg-card/60 hover:border-primary/30"}`}>
                  <div className="flex items-center gap-3"><span className="text-xl">{lang.flag}</span><span className="text-sm font-medium text-foreground">{lang.label}</span></div>
                  {language === lang.code && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        );

      case "training":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Training</h3><p className="text-sm text-muted-foreground">How the AI Coach explains things and how deep your analysis goes.</p></div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">AI Coach Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "simple", label: "Simple", desc: "Short, plain-English tips" },
                    { key: "detailed", label: "Detailed", desc: "Full 6-section breakdown" },
                  ] as const).map(o => (
                    <button key={o.key} onClick={() => { setCoachStyle(o.key); saveSetting("coachStyle", o.key); toast.success(`Coach: ${o.label}`); }}
                      className={`rounded-lg p-3 text-left transition-all border ${coachStyle === o.key ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/30"}`}>
                      <p className="text-sm font-medium text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Analysis Depth</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "fast", label: "Fast", desc: "Quick scan, key moments" },
                    { key: "deep", label: "Deep", desc: "Move-by-move review" },
                  ] as const).map(o => (
                    <button key={o.key} onClick={() => { setAnalysisDepth(o.key); saveSetting("analysisDepth", o.key); toast.success(`Depth: ${o.label}`); }}
                      className={`rounded-lg p-3 text-left transition-all border ${analysisDepth === o.key ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/30"}`}>
                      <p className="text-sm font-medium text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                <div><p className="text-sm font-medium text-foreground">Auto-analysis after game</p><p className="text-xs text-muted-foreground">Run a coach review when each game finishes</p></div>
                <Switch checked={autoAnalyze} onCheckedChange={v => toggle("autoAnalyze", v, setAutoAnalyze)} />
              </div>
            </div>
          </div>
        );

      case "improvement":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Improvement</h3><p className="text-sm text-muted-foreground">What MasterChess should focus on for your training plan.</p></div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Focus Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: "openings", label: "Openings", desc: "Repertoire & opening trainer" },
                    { key: "tactics", label: "Tactics", desc: "Find-the-best-move drills" },
                    { key: "endgames", label: "Endgames", desc: "Convert winning positions" },
                    { key: "balanced", label: "Balanced", desc: "Mix of everything" },
                  ] as const).map(o => (
                    <button key={o.key} onClick={() => { setFocusArea(o.key); saveSetting("focusArea", o.key); toast.success(`Focus: ${o.label}`); }}
                      className={`rounded-lg p-3 text-left transition-all border ${focusArea === o.key ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/30"}`}>
                      <p className="text-sm font-medium text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                <div><p className="text-sm font-medium text-foreground">Weakness tracking</p><p className="text-xs text-muted-foreground">Surface your most-lost openings and patterns in /stats</p></div>
                <Switch checked={weaknessTracking} onCheckedChange={v => toggle("weaknessTracking", v, setWeaknessTracking)} />
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Daily goals</Label>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Games per day</span>
                      <span className="text-xs text-muted-foreground font-mono">{dailyGoalGames}</span>
                    </div>
                    <Slider value={[dailyGoalGames]} onValueChange={([v]) => { setDailyGoalGames(v); saveSetting("dailyGoalGames", v); }} min={1} max={10} step={1} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Training sessions per day</span>
                      <span className="text-xs text-muted-foreground font-mono">{dailyGoalTrainings}</span>
                    </div>
                    <Slider value={[dailyGoalTrainings]} onValueChange={([v]) => { setDailyGoalTrainings(v); saveSetting("dailyGoalTrainings", v); }} min={1} max={10} step={1} />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 p-4">
                <Label className="text-xs text-muted-foreground mb-3 block">Default time control</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: "bullet", label: "Bullet", desc: "1+0 / 2+1" },
                    { key: "blitz", label: "Blitz", desc: "3+0 / 5+0" },
                    { key: "rapid", label: "Rapid", desc: "10+0 / 15+10" },
                  ] as const).map(o => (
                    <button key={o.key} onClick={() => { setDefaultTimeControl(o.key); saveSetting("defaultTimeControl", o.key); toast.success(`Default: ${o.label}`); }}
                      className={`rounded-lg p-3 text-left transition-all border ${defaultTimeControl === o.key ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/30"}`}>
                      <p className="text-sm font-medium text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Notifications</h3></div>
            <div className="space-y-3">
              {[
                { label: "Match Found", desc: "When a match is found", value: notifMatch, key: "notifMatch", setter: setNotifMatch },
                { label: "Game Start", desc: "When a game begins", value: notifGame, key: "notifGame", setter: setNotifGame },
                { label: "Friend Activity", desc: "Friend requests and activity", value: notifFriend, key: "notifFriend", setter: setNotifFriend },
                { label: "Game reminders", desc: "Remind you when a scheduled game starts", value: notifGameReminder, key: "notifGameReminder", setter: setNotifGameReminder },
                { label: "Daily challenge alerts", desc: "Notify when today's challenge resets", value: notifDaily, key: "notifDaily", setter: setNotifDaily },
                { label: "Tilt warnings", desc: "Warn me when I'm losing badly so I can take a break", value: notifTilt, key: "notifTilt", setter: setNotifTilt },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={item.value} onCheckedChange={v => toggle(item.key, v, item.setter)} />
                </div>
              ))}
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div><h3 className="text-lg font-display font-bold text-foreground mb-1">Privacy & Security</h3></div>
            <div className="space-y-3">
              {[
                { label: "Public Profile", desc: "Allow anyone to view your profile", value: profilePublic, key: "profilePublic", setter: setProfilePublic },
                { label: "Match History Visible", desc: "Show game history publicly", value: historyPublic, key: "historyPublic", setter: setHistoryPublic },
                { label: "Friend Requests", desc: "Allow friend requests", value: friendRequests, key: "friendRequests", setter: setFriendRequests },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/60 p-4">
                  <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={item.value} onCheckedChange={v => toggle(item.key, v, item.setter)} />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            {/* Desktop Sidebar */}
            <nav className="hidden md:flex flex-col w-56 shrink-0 space-y-1">
              {SECTIONS.map(s => (
                <button key={s.key} onClick={() => setSection(s.key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${section === s.key ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"}`}>
                  <s.icon className="w-4 h-4 shrink-0" />{s.label}
                  {section === s.key && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              ))}
            </nav>

            {/* Mobile section selector */}
            <div className="md:hidden w-full mb-4">
              <div className="flex flex-wrap gap-1.5">
                {SECTIONS.map(s => (
                  <button key={s.key} onClick={() => setSection(s.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${section === s.key ? "bg-primary/15 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border/40"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div key={section} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
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
