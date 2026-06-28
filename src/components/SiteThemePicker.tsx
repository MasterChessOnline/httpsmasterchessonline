// Site-theme switcher — shows the 5 top themes as inline swatches so users can
// recolor the whole site in one click. A "More" popover reveals the rest.
import { useEffect, useState } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SITE_THEMES, applySiteTheme, getActiveSiteTheme, onSiteThemeChange } from "@/lib/site-themes";

export default function SiteThemePicker({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<string>(getActiveSiteTheme());
  useEffect(() => onSiteThemeChange(() => setActive(getActiveSiteTheme())), []);

  const inline = SITE_THEMES.slice(0, 5);
  const overflow = SITE_THEMES.slice(5);

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Site color theme">
      <Palette className="hidden md:block h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
      <div className="flex items-center gap-1">
        {inline.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => applySiteTheme(t.key)}
              aria-label={`Use ${t.label} theme`}
              aria-pressed={isActive}
              title={t.label}
              className={`relative h-6 w-6 rounded-full border transition-all shrink-0 ${
                isActive
                  ? "border-primary ring-2 ring-primary/40 scale-110"
                  : "border-border hover:scale-105 hover:border-foreground/40"
              }`}
              style={{ background: t.swatch }}
            >
              {isActive && (
                <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-background drop-shadow" strokeWidth={3} />
              )}
            </button>
          );
        })}
      </div>
      {overflow.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="More themes">
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              More themes
            </div>
            {overflow.map((t) => {
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => applySiteTheme(t.key)}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted/40 ${
                    isActive ? "bg-muted/30" : ""
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-border shrink-0"
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
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
