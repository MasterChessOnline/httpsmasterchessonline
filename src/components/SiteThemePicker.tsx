// Compact site-theme switcher — recolors the whole site instantly.
// Lives in the navbar (desktop) and Settings page if needed.
import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SITE_THEMES, applySiteTheme, getActiveSiteTheme, onSiteThemeChange } from "@/lib/site-themes";

export default function SiteThemePicker({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<string>(getActiveSiteTheme());

  useEffect(() => onSiteThemeChange(() => setActive(getActiveSiteTheme())), []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={compact ? "h-9 w-9 text-muted-foreground hover:text-foreground" : "h-9 px-3 text-muted-foreground hover:text-foreground"}
          aria-label="Change site theme"
          title="Change site color theme"
        >
          <Palette className="h-4 w-4" />
          {!compact && <span className="ml-1.5 text-sm">Theme</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Site theme
        </div>
        <div className="grid grid-cols-1 gap-0.5">
          {SITE_THEMES.map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => applySiteTheme(t.key)}
                className={`flex items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                  isActive ? "bg-muted/30" : ""
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full border border-border shadow-inner shrink-0"
                  style={{ background: t.swatch }}
                  aria-hidden
                />
                <span className="flex-1 min-w-0">
                  <span className="block font-medium leading-tight">{t.label}</span>
                  <span className="block text-[11px] text-muted-foreground leading-tight truncate">
                    {t.description}
                  </span>
                </span>
                {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
