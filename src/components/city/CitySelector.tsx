/**
 * CitySelector
 *
 * Searchable dropdown za odabir grada (city_key) — koristi se na Signup-u
 * i u Settings/Profile za naknadno menjanje. Persistuje u `profiles.city_key`.
 */
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface City { key: string; name: string; country_name: string; flag: string; region: string; }

interface Props {
  value?: string | null;
  onChange: (key: string | null, city?: City) => void;
  placeholder?: string;
}

export default function CitySelector({ value, onChange, placeholder = "Select your city" }: Props) {
  const [cities, setCities] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("cities").select("key,name,country_name,flag,region").order("name")
      .then(({ data }) => setCities((data as City[]) ?? []));
  }, []);

  const selected = cities.find((c) => c.key === value);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return cities;
    return cities.filter(
      (c) => c.name.toLowerCase().includes(s) || c.country_name.toLowerCase().includes(s),
    );
  }, [cities, q]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-sm hover:border-primary/40 transition-colors"
      >
        {selected ? (
          <>
            <span className="text-lg">{selected.flag}</span>
            <span className="font-medium">{selected.name}</span>
            <span className="text-xs text-muted-foreground">· {selected.country_name}</span>
          </>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className="ml-auto w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-border/60 bg-popover shadow-xl">
          <div className="sticky top-0 bg-popover border-b border-border/40 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search city or country…"
                className="h-8 pl-7 text-xs"
                autoFocus
              />
            </div>
          </div>
          {filtered.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => { onChange(c.key, c); setOpen(false); setQ(""); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/40 text-left"
            >
              <span className="text-base">{c.flag}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-[11px] text-muted-foreground">{c.country_name}</span>
              {c.key === value && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground p-3 text-center">No matches.</p>
          )}
        </div>
      )}
    </div>
  );
}
