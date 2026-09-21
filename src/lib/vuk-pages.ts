// Long-tail SEO cluster for the verified MasterChess coach Vuk Georgijev.
// Facts here are the only confirmed ones — never invent titles or tournament medals.
export const VUK = {
  name: "Vuk Georgijev",
  username: "Vuk Georgijev",
  handle: "vuk-georgijev",
  birth: "2007-12-28",
  birthText: "December 28, 2007",
  city: "Belgrade",
  country: "Serbia",
  club: "ŠK Tadić",
  instagram: "vuk_georgijev",
  role: "MasterChess Verified player & official coach",
  issuer: "Dragan Brakus",
  photo: "/og-image.jpg",
  profilePath: "/u/vuk-georgijev",
} as const;

export interface VukPage {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
}

const bioCore = `${VUK.name} is a chess player from ${VUK.city}, ${VUK.country}, born on ${VUK.birthText}. He plays for ${VUK.club} and is a verified player and official coach on MasterChess, a recognition issued by ${VUK.issuer}.`;

function page(
  slug: string,
  h1: string,
  title: string,
  description: string,
  intro: string,
  sections: { heading: string; body: string }[],
  faq: { q: string; a: string }[],
): VukPage {
  return { slug, h1, title, description, intro, sections, faq };
}

const commonFaq = [
  { q: `Who is ${VUK.name}?`, a: bioCore },
  { q: `Where can I find the official ${VUK.name} profile?`, a: `His official profile is on MasterChess at masterchess.live${VUK.profilePath}.` },
  { q: `What is ${VUK.name}'s Instagram?`, a: `@${VUK.instagram}` },
];

export const VUK_PAGES: VukPage[] = [
  page(
    "bio",
    `${VUK.name} — Biography`,
    `${VUK.name} Bio — Chess Player from Belgrade | MasterChess`,
    `Official biography of ${VUK.name}, chess player from ${VUK.city}, ${VUK.country}, born ${VUK.birthText}, member of ${VUK.club} and verified MasterChess coach.`,
    bioCore,
    [
      { heading: "Early years", body: `Born on ${VUK.birthText} in ${VUK.city}, ${VUK.country}, Vuk grew up in one of Europe's strongest chess cultures, where club play and school tournaments are part of everyday life.` },
      { heading: "Club chess", body: `He plays for ${VUK.club}, training in the classic Serbian club tradition: long games, endgame technique and preparation without engine hand-holding.` },
      { heading: "MasterChess recognition", body: `On MasterChess he holds the Verified badge and an official Coach recognition issued by ${VUK.issuer}. The badge means the identity behind the account is confirmed by the platform.` },
    ],
    commonFaq,
  ),
  page(
    "chess",
    `${VUK.name} Chess`,
    `${VUK.name} Chess — Profile, Games & Rating | MasterChess`,
    `${VUK.name} chess profile: games, rating progress and coaching on MasterChess. Serbian player from ${VUK.city}, member of ${VUK.club}.`,
    `${VUK.name} plays chess online on MasterChess, where his live rating, game history and coaching recognition are public.`,
    [
      { heading: "How he plays", body: "Human games only — no engine bars, no hints. MasterChess deliberately blocks engine assistance during live play, so every result is a real human decision." },
      { heading: "Where to follow the games", body: `Open his MasterChess profile to see rating charts per time control (bullet, blitz, rapid, classical) and the most recent games with full move lists.` },
      { heading: "Play him yourself", body: "Anyone with a free MasterChess account can challenge verified players directly from the lobby." },
    ],
    commonFaq,
  ),
  page(
    "coach",
    `${VUK.name} — Chess Coach`,
    `${VUK.name} Chess Coach — Official MasterChess Coach`,
    `${VUK.name} is an official MasterChess coach, recognition issued by ${VUK.issuer}. Coaching profile, method and contact.`,
    `${VUK.name} carries the official Coach recognition on MasterChess, issued by ${VUK.issuer}.`,
    [
      { heading: "Coaching focus", body: "Converting winning positions: endgame technique, king activity, pawn races and the practical decisions that decide club games." },
      { heading: "Method", body: "Play, then review by hand. No engine evaluation bars during training games — first you commit to a plan, then you check it." },
      { heading: "Who it fits", body: "Club players roughly 1000–1800 who lose games they had already won." },
    ],
    commonFaq,
  ),
  page(
    "profile",
    `${VUK.name} — Official Profile`,
    `${VUK.name} Official Profile | MasterChess Verified`,
    `The official verified profile of ${VUK.name} on MasterChess: badges, rating, games and Instagram.`,
    `This is the official landing page for the verified MasterChess profile of ${VUK.name}.`,
    [
      { heading: "Verified badge", body: "The MasterChess Verified badge confirms this account belongs to the real person and is not a fan or copycat account." },
      { heading: "Badges on the account", body: `Verified, Coach (issued by ${VUK.issuer}) and Premium.` },
      { heading: "Links", body: `Profile: masterchess.live${VUK.profilePath} · Instagram: @${VUK.instagram}` },
    ],
    commonFaq,
  ),
  page(
    "rating",
    `${VUK.name} — Chess Rating`,
    `${VUK.name} Chess Rating & Progress | MasterChess`,
    `Live chess rating of ${VUK.name} on MasterChess across bullet, blitz, rapid and classical, with peak rating and game count.`,
    `${VUK.name}'s MasterChess rating updates after every rated game and is public on his profile.`,
    [
      { heading: "Four separate ratings", body: "MasterChess keeps bullet, blitz, rapid and classical ratings apart, so a fast-chess spike never hides slow-chess form." },
      { heading: "Peak rating", body: "The profile shows both current and peak rating, plus wins, losses and draws." },
      { heading: "Honest numbers", body: "MasterChess publishes real counts only — no inflated ratings and no bot-filled games." },
    ],
    commonFaq,
  ),
  page(
    "belgrade",
    `${VUK.name} — Chess in Belgrade`,
    `${VUK.name} — Chess Player from Belgrade, Serbia | MasterChess`,
    `${VUK.name}, chess player from Belgrade, Serbia, member of ${VUK.club} and verified MasterChess coach.`,
    `${VUK.name} is a Belgrade-based chess player and MasterChess coach.`,
    [
      { heading: "Belgrade chess scene", body: "Belgrade has one of the densest club networks in south-east Europe, with regular league rounds and youth tournaments through the season." },
      { heading: "His club", body: `${VUK.club} is where he trains and plays league chess.` },
      { heading: "Play online from Belgrade", body: "MasterChess works in the browser with no install, so club players can train endgames between rounds." },
    ],
    commonFaq,
  ),
  page(
    "instagram",
    `${VUK.name} — Instagram`,
    `${VUK.name} Instagram @${VUK.instagram} | MasterChess`,
    `Official Instagram of ${VUK.name}: @${VUK.instagram}. Linked from his verified MasterChess profile.`,
    `The official Instagram account of ${VUK.name} is @${VUK.instagram}, linked directly from his verified MasterChess profile.`,
    [
      { heading: "Why the link matters", body: "The Instagram handle is attached to the verified MasterChess account, which makes it easy to tell the real profile from fakes." },
      { heading: "What he posts", body: "Chess content: games, club life and training positions." },
    ],
    commonFaq,
  ),
  page(
    "age",
    `${VUK.name} — Age & Birth Date`,
    `${VUK.name} Age — Born ${VUK.birthText} | MasterChess`,
    `${VUK.name} was born on ${VUK.birthText} in ${VUK.city}, ${VUK.country}. Verified MasterChess player and coach.`,
    `${VUK.name} was born on ${VUK.birthText} in ${VUK.city}, ${VUK.country}.`,
    [
      { heading: "Birth date", body: `${VUK.birthText}, ${VUK.city}, ${VUK.country}.` },
      { heading: "Confirmed facts only", body: "MasterChess publishes only data confirmed with the player himself." },
    ],
    commonFaq,
  ),
  page(
    "club",
    `${VUK.name} — ${VUK.club}`,
    `${VUK.name} — ${VUK.club} Chess Club | MasterChess`,
    `${VUK.name} plays for ${VUK.club} in ${VUK.city}, ${VUK.country}, and coaches on MasterChess.`,
    `${VUK.name} represents ${VUK.club}.`,
    [
      { heading: "Club play", body: `${VUK.club} is a Belgrade chess club where Vuk trains and plays competitive games.` },
      { heading: "Clubs on MasterChess", body: "MasterChess has its own clan/club system with tags, quests and club leaderboards." },
    ],
    commonFaq,
  ),
  page(
    "games",
    `${VUK.name} — Games`,
    `${VUK.name} Chess Games & Move Lists | MasterChess`,
    `Browse ${VUK.name}'s chess games on MasterChess with full move lists and manual review.`,
    `Every rated game ${VUK.name} plays on MasterChess is stored with its full move list.`,
    [
      { heading: "Manual review", body: "Games are replayed move by move, with Clutch Moments highlighted — no engine evaluation bar." },
      { heading: "Share a game", body: "Any game can be shared as a link with a board preview." },
    ],
    commonFaq,
  ),
  page(
    "verified",
    `${VUK.name} — MasterChess Verified`,
    `${VUK.name} Verified Player | MasterChess`,
    `${VUK.name} holds the MasterChess Verified badge, confirming the identity behind the account.`,
    `${VUK.name} is a MasterChess Verified player.`,
    [
      { heading: "What Verified means", body: "The platform confirmed the person behind the account. Verified profiles are featured on the MasterChess home page." },
      { heading: "How to spot fakes", body: `Only masterchess.live${VUK.profilePath} and Instagram @${VUK.instagram} are official.` },
    ],
    commonFaq,
  ),
  page(
    "serbia",
    `${VUK.name} — Serbian Chess Player`,
    `${VUK.name} — Serbian Chess Player & Coach | MasterChess`,
    `${VUK.name} is a chess player from ${VUK.country}, verified MasterChess coach and ${VUK.club} member.`,
    `${VUK.name} is a Serbian chess player and MasterChess coach.`,
    [
      { heading: "Serbian chess tradition", body: "Serbia's club system produces players raised on long classical games and hard endgame work." },
      { heading: "Serbian players on MasterChess", body: "MasterChess hosts free online tournaments open to players from Serbia and the wider Balkans." },
    ],
    commonFaq,
  ),
  page(
    "endgames",
    `${VUK.name} — Endgame Training`,
    `${VUK.name} Endgame Training & Drills | MasterChess`,
    `How ${VUK.name} trains endgames on MasterChess: 8 free drills, no account and no ads.`,
    `${VUK.name} coaches the part of the game most club players lose: the endgame.`,
    [
      { heading: "The drills", body: "Eight core endgames — from king and pawn to Lucena and Philidor — playable free, with the engine defending against you." },
      { heading: "Why endgames first", body: "Most club games are decided after the queens come off, when the winning side rushes and throws the point away." },
      { heading: "Train now", body: "Open /endgames — no signup needed." },
    ],
    commonFaq,
  ),
  page(
    "vs",
    `Play against ${VUK.name}`,
    `Play Chess Against ${VUK.name} | MasterChess`,
    `Challenge ${VUK.name} to a real human chess game on MasterChess — no engine help on either side.`,
    `You can challenge ${VUK.name} to a human game on MasterChess.`,
    [
      { heading: "How to challenge", body: "Create a free account, open the lobby and send a direct challenge, or wait for him in the daily Prime Time at 20:00." },
      { heading: "Fair play", body: "No engine bars, no hints, no ghost players — human games only." },
    ],
    commonFaq,
  ),
  page(
    "achievements",
    `${VUK.name} — Recognitions`,
    `${VUK.name} Achievements & Recognitions | MasterChess`,
    `Official MasterChess recognitions held by ${VUK.name}: Verified, Coach (issued by ${VUK.issuer}) and Premium.`,
    `${VUK.name} holds three official MasterChess recognitions.`,
    [
      { heading: "Coach", body: `Official MasterChess Coach recognition, issued by ${VUK.issuer}.` },
      { heading: "Verified", body: "Identity confirmed by the platform." },
      { heading: "Premium", body: "Lifetime premium player." },
      { heading: "No invented medals", body: "MasterChess lists only recognitions it issued itself or facts confirmed by the player." },
    ],
    commonFaq,
  ),
  page(
    "lessons",
    `${VUK.name} — Chess Lessons`,
    `${VUK.name} Chess Lessons — Learn Endgames | MasterChess`,
    `Chess lessons with MasterChess coach ${VUK.name}: endgame conversion, planning and honest game review.`,
    `Lessons with ${VUK.name} focus on turning good positions into wins.`,
    [
      { heading: "Lesson structure", body: "Play a training game, mark the moments you were unsure, review them by hand, then drill the matching endgame." },
      { heading: "Level", body: "Club players who already know the rules and want results, roughly 1000–1800." },
    ],
    commonFaq,
  ),
  page(
    "stats",
    `${VUK.name} — Statistics`,
    `${VUK.name} Chess Statistics — Wins, Streaks, Colors | MasterChess`,
    `Chess statistics for ${VUK.name}: win rate, colour split, streaks and rating tiers on MasterChess.`,
    `MasterChess tracks detailed statistics for every player, including ${VUK.name}.`,
    [
      { heading: "What is tracked", body: "Win rate by colour, longest winning streak, rating tier and games per time control." },
      { heading: "Real data only", body: "MasterChess never publishes simulated activity or fake engagement." },
    ],
    commonFaq,
  ),
  page(
    "news",
    `${VUK.name} — News`,
    `${VUK.name} News & Updates | MasterChess`,
    `Latest MasterChess news about ${VUK.name}: verification, coach recognition and profile updates.`,
    `News and updates about ${VUK.name} on MasterChess.`,
    [
      { heading: "Verified and featured", body: "His profile was verified and featured on the MasterChess home page." },
      { heading: "Coach recognition", body: `He received the official MasterChess Coach recognition from ${VUK.issuer}.` },
    ],
    commonFaq,
  ),
  page(
    "contact",
    `${VUK.name} — Contact`,
    `Contact ${VUK.name} — Coaching & Games | MasterChess`,
    `How to reach ${VUK.name}: verified MasterChess profile and Instagram @${VUK.instagram}.`,
    `The safest way to reach ${VUK.name} is through his verified MasterChess profile.`,
    [
      { heading: "Official channels", body: `MasterChess profile masterchess.live${VUK.profilePath} and Instagram @${VUK.instagram}.` },
      { heading: "Coaching requests", body: "Send a message from the profile page after creating a free account." },
    ],
    commonFaq,
  ),
  page(
    "faq",
    `${VUK.name} — FAQ`,
    `${VUK.name} FAQ — Age, Club, Rating, Instagram | MasterChess`,
    `Frequently asked questions about ${VUK.name}: age, birth date, club, rating, coaching and Instagram.`,
    `The most common questions about ${VUK.name}, answered with confirmed facts only.`,
    [
      { heading: "Identity", body: bioCore },
      { heading: "Everything else", body: "See the questions below." },
    ],
    [
      ...commonFaq,
      { q: `How old is ${VUK.name}?`, a: `He was born on ${VUK.birthText}.` },
      { q: `Which club does ${VUK.name} play for?`, a: VUK.club },
      { q: `Is ${VUK.name} a chess coach?`, a: `Yes — he holds the official MasterChess Coach recognition issued by ${VUK.issuer}.` },
    ],
  ),
];

export function getVukPage(slug: string) {
  return VUK_PAGES.find((p) => p.slug === slug);
}
