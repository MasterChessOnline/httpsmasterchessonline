import { findCountry, COUNTRIES } from "@/lib/countries";

// Convert a flag emoji back to ISO 2-letter code (regional indicator letters → ASCII)
function emojiToCode(emoji?: string | null): string | null {
  if (!emoji) return null;
  const codepoints = Array.from(emoji).map((c) => c.codePointAt(0) || 0);
  const letters = codepoints
    .filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)
    .map((cp) => String.fromCharCode(cp - 0x1f1e6 + 65));
  if (letters.length === 2) return letters.join("");
  return null;
}

function resolveCode(country?: string | null, country_flag?: string | null): string | null {
  if (country) {
    // exact code
    if (country.length === 2) return country.toUpperCase();
    // try by name
    const found = COUNTRIES.find(
      (c) => c.name.toLowerCase() === country.toLowerCase() || c.code.toLowerCase() === country.toLowerCase()
    );
    if (found) return found.code;
    const f = findCountry(country);
    if (f) return f.code;
  }
  return emojiToCode(country_flag);
}

interface Props {
  country?: string | null;
  country_flag?: string | null;
  className?: string;
  size?: number; // height in px
}

export function CountryFlag({ country, country_flag, className = "", size = 14 }: Props) {
  const code = resolveCode(country, country_flag);
  if (!code) return null;
  const lower = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/${lower}.svg`}
      alt={code}
      title={code}
      style={{ height: size, width: Math.round(size * 1.5) }}
      className={`inline-block mr-1.5 rounded-sm shadow-sm border border-border/40 object-cover align-middle ${className}`}
      loading="lazy"
    />
  );
}

export default CountryFlag;
