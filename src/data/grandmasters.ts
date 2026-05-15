export interface Grandmaster {
  slug: string;
  name: string;
  country: string;
  born: number;
  died?: number;
  peakRating: number;
  worldChampionYears?: string;
  style: string;
  bio: string;
  bestGameSlug?: string;
  fact: string;
}

export const GRANDMASTERS: Grandmaster[] = [
  {
    slug: "magnus-carlsen",
    name: "Magnus Carlsen",
    country: "Norway",
    born: 1990,
    peakRating: 2882,
    worldChampionYears: "2013–2023",
    style: "Universal — endgame technique, positional grinding, surprise opening choices.",
    bio: "Norwegian grandmaster who held the world #1 ranking continuously from 2011 onward. Five-time classical world champion before voluntarily relinquishing the title in 2023.",
    bestGameSlug: "carlsen-karjakin-game-10-2016",
    fact: "Has held the highest classical rating ever recorded (2882) since 2014.",
  },
  {
    slug: "garry-kasparov",
    name: "Garry Kasparov",
    country: "Russia",
    born: 1963,
    peakRating: 2851,
    worldChampionYears: "1985–2000",
    style: "Aggressive, deep opening preparation, dynamic piece play.",
    bio: "Considered by many the greatest player of all time. World champion for 15 years and the dominant figure in chess from the mid-80s through the early 2000s.",
    bestGameSlug: "kasparov-topalov-1999-wijk",
    fact: "First player to break the 2800 rating barrier (1990).",
  },
  {
    slug: "bobby-fischer",
    name: "Bobby Fischer",
    country: "USA",
    born: 1943,
    died: 2008,
    peakRating: 2785,
    worldChampionYears: "1972–1975",
    style: "Crystal-clear classical play, perfect technique, devastating opening preparation.",
    bio: "American prodigy who ended Soviet chess dominance by defeating Boris Spassky in 1972. Forfeited his title in 1975 and largely withdrew from competitive play.",
    bestGameSlug: "fischer-spassky-game-6-1972",
    fact: "Won the 1963/64 US Championship 11–0 — the only perfect score in tournament history.",
  },
  {
    slug: "judit-polgar",
    name: "Judit Polgar",
    country: "Hungary",
    born: 1976,
    peakRating: 2735,
    style: "Ultra-aggressive, sharp tactics, fearless attacking chess.",
    bio: "Strongest female player in history. Reached world #8 and is the only woman to defeat a reigning world champion in a classical game.",
    bestGameSlug: "polgar-kasparov-2002-russia-rest",
    fact: "Became a grandmaster at 15 years and 4 months — a record at the time.",
  },
  {
    slug: "mikhail-tal",
    name: "Mikhail Tal",
    country: "Latvia / USSR",
    born: 1936,
    died: 1992,
    peakRating: 2705,
    worldChampionYears: "1960–1961",
    style: "Magician of Riga — wild sacrifices, intuitive attacking complications.",
    bio: "Eighth world champion, famous for unfathomable sacrificial play that even modern engines struggle to refute.",
    bestGameSlug: "tal-larsen-1965-bled",
    fact: "Held a 95-game unbeaten streak from 1973–1974 — a record that stood for decades.",
  },
  {
    slug: "alexander-alekhine",
    name: "Alexander Alekhine",
    country: "Russia / France",
    born: 1892,
    died: 1946,
    peakRating: 2690,
    worldChampionYears: "1927–1935, 1937–1946",
    style: "Combinational, deep calculation, brilliant attacking play.",
    bio: "Fourth world champion. The only champion to die while holding the title.",
    bestGameSlug: "alekhine-bogoljubow-1922-hastings",
    fact: "Could play 32 simultaneous blindfold games at his peak (1933 Chicago record).",
  },
  {
    slug: "viswanathan-anand",
    name: "Viswanathan Anand",
    country: "India",
    born: 1969,
    peakRating: 2817,
    worldChampionYears: "2007–2013",
    style: "Lightning-fast intuition, deep opening preparation, universal style.",
    bio: "First Asian world champion. The 'Tiger of Madras' brought chess into the mainstream in India and inspired a generation including Praggnanandhaa and Gukesh.",
    fact: "Held world titles in classical, rapid, and blindfold disciplines simultaneously.",
  },
  {
    slug: "hikaru-nakamura",
    name: "Hikaru Nakamura",
    country: "USA",
    born: 1987,
    peakRating: 2816,
    style: "Sharp tactics, world-class blitz, opening innovation.",
    bio: "Five-time US champion, world #2 for periods, and the leading face of online chess streaming with millions of followers.",
    fact: "Has held the world #1 blitz rating multiple times and won the FIDE Grand Swiss in 2023.",
  },
  {
    slug: "anatoly-karpov",
    name: "Anatoly Karpov",
    country: "Russia",
    born: 1951,
    peakRating: 2780,
    worldChampionYears: "1975–1985",
    style: "Positional perfection, prophylactic play, strangling endgames.",
    bio: "Twelfth world champion. Defended his title successfully five times before losing to Kasparov.",
    fact: "Won 9 Linares super-tournaments — more than any other player.",
  },
  {
    slug: "jose-raul-capablanca",
    name: "José Raúl Capablanca",
    country: "Cuba",
    born: 1888,
    died: 1942,
    peakRating: 2725,
    worldChampionYears: "1921–1927",
    style: "Effortless positional play, legendary endgame technique.",
    bio: "Third world champion. Lost only 35 serious games in his entire career and was unbeaten from 1916 to 1924.",
    fact: "Once said 'I see only one move ahead — but it is always the correct one.'",
  },
  {
    slug: "ding-liren",
    name: "Ding Liren",
    country: "China",
    born: 1992,
    peakRating: 2816,
    worldChampionYears: "2023–2024",
    style: "Resilient, deep calculator, master of complicated middlegames.",
    bio: "First Chinese male world chess champion. Won the title in a thrilling 2023 match against Ian Nepomniachtchi.",
    fact: "Held a 100-game unbeaten streak from 2017 to 2018.",
  },
  {
    slug: "rameshbabu-praggnanandhaa",
    name: "R. Praggnanandhaa",
    country: "India",
    born: 2005,
    peakRating: 2758,
    style: "Energetic attacking chess, exceptional calculation.",
    bio: "Indian prodigy who became a grandmaster at 12. Reached the FIDE World Cup final in 2023, losing to Carlsen in tiebreaks.",
    fact: "Defeated Magnus Carlsen three times in classical chess before turning 18.",
  },
];

export const getGrandmaster = (slug: string) =>
  GRANDMASTERS.find((g) => g.slug === slug);
