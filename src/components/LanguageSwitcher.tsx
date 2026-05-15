import { useI18n } from "@/i18n/I18nProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { Lang } from "@/i18n/translations";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, langs } = useI18n();
  const current = langs[lang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Change language"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/30 hover:border-primary/40 text-xs font-bold uppercase tracking-wide transition-all"
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>{compact ? current.label : `${current.flag} ${current.label}`}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {(Object.keys(langs) as Lang[]).map(code => {
          const meta = langs[code];
          return (
            <DropdownMenuItem key={code} onClick={() => setLang(code)} className="cursor-pointer">
              <span className="mr-2">{meta.flag}</span>
              <span className="flex-1">{meta.native}</span>
              {code === lang && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
