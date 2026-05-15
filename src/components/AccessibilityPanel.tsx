import { useEffect, useState } from "react";
import { Eye, Type, ZoomIn, MoonStar, EyeOff, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { readA11y, writeA11y, type A11ySettings } from "@/lib/accessibility";

const ROWS: Array<{ key: keyof A11ySettings; label: string; desc: string; icon: React.ElementType }> = [
  { key: "largePieces",     label: "Large pieces",        desc: "+15% piece scale on the board",       icon: ZoomIn },
  { key: "colorBlindBoard", label: "Color-blind board",   desc: "Deuteranopia-safe square palette",    icon: Palette },
  { key: "dyslexiaFont",    label: "Dyslexia-friendly font", desc: "Switch to OpenDyslexic body font", icon: Type },
  { key: "reduceMotion",    label: "Reduced motion",      desc: "Disable decorative animations",       icon: MoonStar },
  { key: "focusMode",       label: "Focus mode",          desc: "Hide chat & decorative pulses in-game", icon: Eye },
  { key: "blindfold",       label: "Blindfold mode",      desc: "Hide pieces — practice with notation only", icon: EyeOff },
];

/**
 * Accessibility & comfort panel — drop into Settings.
 */
export default function AccessibilityPanel() {
  const [s, setS] = useState<A11ySettings>(readA11y());

  useEffect(() => {
    const onChange = () => setS(readA11y());
    window.addEventListener("masterchess:a11y-change", onChange);
    return () => window.removeEventListener("masterchess:a11y-change", onChange);
  }, []);

  const toggle = (k: keyof A11ySettings) => {
    const next = { ...s, [k]: !s[k] };
    setS(next);
    writeA11y(next);
  };

  return (
    <div className="space-y-2">
      <div className="mb-3">
        <h3 className="font-display text-lg font-bold">Accessibility & comfort</h3>
        <p className="text-xs text-muted-foreground">Sitnice koje mnogo znače — sve persistuje lokalno.</p>
      </div>
      {ROWS.map(({ key, label, desc, icon: Icon }) => (
        <label
          key={key}
          className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 p-3 cursor-pointer hover:border-primary/30 transition-colors"
        >
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-xs text-muted-foreground">{desc}</div>
          </div>
          <Switch checked={s[key]} onCheckedChange={() => toggle(key)} />
        </label>
      ))}
    </div>
  );
}
