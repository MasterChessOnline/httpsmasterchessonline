// Programmatic SEO city list. Each city becomes a /play-from/{slug} landing page
// targeting "play chess online from {city}" long-tail queries.
// Curated mix: Balkans (priority — primary audience), EU capitals, and a few global hubs.

export type SeoCity = {
  slug: string;
  city: string;
  country: string;
  countryCode: string;
  region: "Balkans" | "Europe" | "Americas" | "Asia" | "Oceania" | "Africa";
  flag: string;
  tagline: string;
};

export const SEO_CITIES: SeoCity[] = [
  // Balkans (highest priority for our audience)
  { slug: "belgrade", city: "Belgrade", country: "Serbia", countryCode: "RS", region: "Balkans", flag: "🇷🇸", tagline: "Home of grandmaster traditions and weekend blitz parks" },
  { slug: "novi-sad", city: "Novi Sad", country: "Serbia", countryCode: "RS", region: "Balkans", flag: "🇷🇸", tagline: "Vojvodina's chess hub with a growing online scene" },
  { slug: "nis", city: "Niš", country: "Serbia", countryCode: "RS", region: "Balkans", flag: "🇷🇸", tagline: "Southern Serbia's classical chess stronghold" },
  { slug: "zagreb", city: "Zagreb", country: "Croatia", countryCode: "HR", region: "Balkans", flag: "🇭🇷", tagline: "Croatia's capital with deep tournament heritage" },
  { slug: "split", city: "Split", country: "Croatia", countryCode: "HR", region: "Balkans", flag: "🇭🇷", tagline: "Coastal blitz and coffee-shop matches" },
  { slug: "sarajevo", city: "Sarajevo", country: "Bosnia & Herzegovina", countryCode: "BA", region: "Balkans", flag: "🇧🇦", tagline: "Where Soviet, Yugoslav, and modern chess meet" },
  { slug: "banja-luka", city: "Banja Luka", country: "Bosnia & Herzegovina", countryCode: "BA", region: "Balkans", flag: "🇧🇦", tagline: "Steady tournament city with active clubs" },
  { slug: "podgorica", city: "Podgorica", country: "Montenegro", countryCode: "ME", region: "Balkans", flag: "🇲🇪", tagline: "Small capital, big chess passion" },
  { slug: "skopje", city: "Skopje", country: "North Macedonia", countryCode: "MK", region: "Balkans", flag: "🇲🇰", tagline: "Macedonian chess culture meets online play" },
  { slug: "pristina", city: "Pristina", country: "Kosovo", countryCode: "XK", region: "Balkans", flag: "🇽🇰", tagline: "Fast-growing scene among young players" },
  { slug: "tirana", city: "Tirana", country: "Albania", countryCode: "AL", region: "Balkans", flag: "🇦🇱", tagline: "Albanian chess on the rise" },
  { slug: "ljubljana", city: "Ljubljana", country: "Slovenia", countryCode: "SI", region: "Balkans", flag: "🇸🇮", tagline: "Slovenia's quiet but skilled chess capital" },
  { slug: "sofia", city: "Sofia", country: "Bulgaria", countryCode: "BG", region: "Balkans", flag: "🇧🇬", tagline: "Bulgarian school of chess and Topalov's legacy" },
  { slug: "bucharest", city: "Bucharest", country: "Romania", countryCode: "RO", region: "Europe", flag: "🇷🇴", tagline: "Eastern European chess capital with strong clubs" },
  { slug: "athens", city: "Athens", country: "Greece", countryCode: "GR", region: "Europe", flag: "🇬🇷", tagline: "Mediterranean chess scene with ancient roots" },

  // European capitals
  { slug: "vienna", city: "Vienna", country: "Austria", countryCode: "AT", region: "Europe", flag: "🇦🇹", tagline: "Coffee-house chess capital since the 1800s" },
  { slug: "berlin", city: "Berlin", country: "Germany", countryCode: "DE", region: "Europe", flag: "🇩🇪", tagline: "Europe's busiest weekend tournament city" },
  { slug: "munich", city: "Munich", country: "Germany", countryCode: "DE", region: "Europe", flag: "🇩🇪", tagline: "Bavarian chess clubs with a long pedigree" },
  { slug: "paris", city: "Paris", country: "France", countryCode: "FR", region: "Europe", flag: "🇫🇷", tagline: "Birthplace of café chess and the Café de la Régence" },
  { slug: "london", city: "London", country: "United Kingdom", countryCode: "GB", region: "Europe", flag: "🇬🇧", tagline: "Home of Simpson's-in-the-Strand and the London System" },
  { slug: "madrid", city: "Madrid", country: "Spain", countryCode: "ES", region: "Europe", flag: "🇪🇸", tagline: "Spanish chess with a tactical streak" },
  { slug: "barcelona", city: "Barcelona", country: "Spain", countryCode: "ES", region: "Europe", flag: "🇪🇸", tagline: "Catalan chess clubs and rapid-play culture" },
  { slug: "rome", city: "Rome", country: "Italy", countryCode: "IT", region: "Europe", flag: "🇮🇹", tagline: "Italian chess from Greco to today" },
  { slug: "milan", city: "Milan", country: "Italy", countryCode: "IT", region: "Europe", flag: "🇮🇹", tagline: "Northern Italy's tournament backbone" },
  { slug: "amsterdam", city: "Amsterdam", country: "Netherlands", countryCode: "NL", region: "Europe", flag: "🇳🇱", tagline: "Hometown of Tata Steel-style positional chess" },
  { slug: "prague", city: "Prague", country: "Czechia", countryCode: "CZ", region: "Europe", flag: "🇨🇿", tagline: "Czech chess school in the heart of Europe" },
  { slug: "warsaw", city: "Warsaw", country: "Poland", countryCode: "PL", region: "Europe", flag: "🇵🇱", tagline: "Polish chess scene with Olympiad pedigree" },
  { slug: "budapest", city: "Budapest", country: "Hungary", countryCode: "HU", region: "Europe", flag: "🇭🇺", tagline: "Land of the Polgár sisters and aggressive play" },
  { slug: "istanbul", city: "Istanbul", country: "Türkiye", countryCode: "TR", region: "Europe", flag: "🇹🇷", tagline: "Where Europe and Asia trade kings and pawns" },
  { slug: "moscow", city: "Moscow", country: "Russia", countryCode: "RU", region: "Europe", flag: "🇷🇺", tagline: "Spiritual capital of competitive chess" },

  // Global hubs
  { slug: "new-york", city: "New York", country: "United States", countryCode: "US", region: "Americas", flag: "🇺🇸", tagline: "Washington Square Park to online rapid in one click" },
  { slug: "los-angeles", city: "Los Angeles", country: "United States", countryCode: "US", region: "Americas", flag: "🇺🇸", tagline: "West Coast chess culture, sunny and tactical" },
  { slug: "chicago", city: "Chicago", country: "United States", countryCode: "US", region: "Americas", flag: "🇺🇸", tagline: "Midwest tournament hub with deep clubs" },
  { slug: "toronto", city: "Toronto", country: "Canada", countryCode: "CA", region: "Americas", flag: "🇨🇦", tagline: "Canada's most active chess city" },
  { slug: "buenos-aires", city: "Buenos Aires", country: "Argentina", countryCode: "AR", region: "Americas", flag: "🇦🇷", tagline: "Capablanca-era heritage, modern online energy" },
  { slug: "sao-paulo", city: "São Paulo", country: "Brazil", countryCode: "BR", region: "Americas", flag: "🇧🇷", tagline: "Brazilian chess capital with massive youth scene" },
  { slug: "mexico-city", city: "Mexico City", country: "Mexico", countryCode: "MX", region: "Americas", flag: "🇲🇽", tagline: "Latin America's largest chess community" },
  { slug: "delhi", city: "Delhi", country: "India", countryCode: "IN", region: "Asia", flag: "🇮🇳", tagline: "Home of the next generation of GMs" },
  { slug: "mumbai", city: "Mumbai", country: "India", countryCode: "IN", region: "Asia", flag: "🇮🇳", tagline: "India's coastal chess powerhouse" },
  { slug: "tokyo", city: "Tokyo", country: "Japan", countryCode: "JP", region: "Asia", flag: "🇯🇵", tagline: "Quiet, precise chess in a shogi-loving city" },
  { slug: "sydney", city: "Sydney", country: "Australia", countryCode: "AU", region: "Oceania", flag: "🇦🇺", tagline: "Australia's chess scene on the Pacific" },
];

export function findCityBySlug(slug: string): SeoCity | undefined {
  return SEO_CITIES.find((c) => c.slug === slug);
}
