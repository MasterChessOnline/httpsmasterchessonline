import { type Difficulty } from "./chess-ai";

export interface OnlineBotProfile {
  id: string;
  displayName: string;
  username: string;
  rating: number;
  country: string;
  countryFlag: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  difficulty: Difficulty;
  avatarInitials: string;
  isOnline: boolean;
  lastSeen: string;
}

// Helper to derive difficulty from rating
function diffFor(rating: number): Difficulty {
  if (rating < 1100) return "beginner";
  if (rating < 1500) return "intermediate";
  return "advanced";
}

// Helper to build realistic stats based on rating
function statsFor(rating: number, played: number) {
  // Higher rated players win more
  const winRate = Math.min(0.72, 0.32 + (rating - 800) / 4000);
  const drawRate = Math.min(0.18, 0.05 + (rating - 800) / 12000);
  const won = Math.round(played * winRate);
  const drawn = Math.round(played * drawRate);
  const lost = played - won - drawn;
  return { gamesWon: won, gamesLost: lost, gamesDrawn: drawn };
}

function bot(
  id: string,
  displayName: string,
  username: string,
  rating: number,
  country: string,
  countryFlag: string,
  gamesPlayed: number,
  initials: string,
): OnlineBotProfile {
  const s = statsFor(rating, gamesPlayed);
  return {
    id,
    displayName,
    username,
    rating,
    country,
    countryFlag,
    gamesPlayed,
    ...s,
    difficulty: diffFor(rating),
    avatarInitials: initials,
    isOnline: true,
    lastSeen: "now",
  };
}

// Massive realistic bot roster across the full rating spectrum (600 → 2800)
export const ONLINE_BOTS: OnlineBotProfile[] = [
  // ===== BEGINNERS (600 - 1099) =====
  bot("bot-tommy-lee", "Tommy Lee", "tommy_l07", 640, "United States", "🇺🇸", 42, "TL"),
  bot("bot-lina-koch", "Lina Koch", "lina_k", 720, "Germany", "🇩🇪", 58, "LK"),
  bot("bot-pablo-ruiz", "Pablo Ruiz", "pablo_r", 780, "Mexico", "🇲🇽", 67, "PR"),
  bot("bot-sara-novak", "Sara Novak", "sara_n", 820, "Slovenia", "🇸🇮", 74, "SN"),
  bot("bot-john-doyle", "John Doyle", "john_d", 870, "United Kingdom", "🇬🇧", 92, "JD"),
  bot("bot-yuki-tanaka", "Yuki Tanaka", "yuki_t_chess", 1100, "Japan", "🇯🇵", 156, "YT"),
  bot("bot-sophie-laurent", "Sophie Laurent", "sophie_l", 980, "France", "🇫🇷", 89, "SL"),
  bot("bot-isabella-rossi", "Isabella Rossi", "bella_chess", 1050, "Italy", "🇮🇹", 120, "IR"),
  bot("bot-ana-popescu", "Ana Popescu", "ana_pop", 1150, "Romania", "🇷🇴", 165, "AP"),
  bot("bot-omar-haddad", "Omar Haddad", "omar_h", 940, "Morocco", "🇲🇦", 88, "OH"),
  bot("bot-lucia-mendez", "Lucia Mendez", "lucia_m", 1020, "Argentina", "🇦🇷", 110, "LM"),
  bot("bot-finn-bauer", "Finn Bauer", "finn_b", 880, "Germany", "🇩🇪", 95, "FB"),

  // ===== INTERMEDIATE LOW (1100 - 1399) =====
  bot("bot-marko-petrovic", "Marko Petrović", "marko_chess", 1280, "Serbia", "🇷🇸", 215, "MP"),
  bot("bot-mei-zhang", "Mei Zhang", "mei_zh", 1200, "China", "🇨🇳", 180, "MZ"),
  bot("bot-stefan-mueller", "Stefan Müller", "stefan_m", 1380, "Austria", "🇦🇹", 295, "SM"),
  bot("bot-nikola-jovanovic", "Nikola Jovanović", "niko_chess64", 1340, "Serbia", "🇷🇸", 278, "NJ"),
  bot("bot-katarina-ilic", "Katarina Ilić", "kata_chess", 1320, "Serbia", "🇷🇸", 248, "KI"),
  bot("bot-emma-andersson", "Emma Andersson", "emma_a", 1260, "Sweden", "🇸🇪", 200, "EA"),
  bot("bot-pieter-vanloo", "Pieter van Loo", "pieter_vl", 1180, "Netherlands", "🇳🇱", 175, "PV"),
  bot("bot-hassan-ali", "Hassan Ali", "hassan_a", 1240, "Egypt", "🇪🇬", 198, "HA"),
  bot("bot-clara-silva", "Clara Silva", "clara_s", 1300, "Portugal", "🇵🇹", 230, "CS"),
  bot("bot-jakub-novak", "Jakub Novák", "jakub_n", 1360, "Czechia", "🇨🇿", 270, "JN"),

  // ===== INTERMEDIATE HIGH (1400 - 1699) =====
  bot("bot-alex-fischer", "Alex Fischer", "alex_fischer92", 1450, "Germany", "🇩🇪", 342, "AF"),
  bot("bot-aisha-khan", "Aisha Khan", "aisha_k", 1420, "Pakistan", "🇵🇰", 310, "AK"),
  bot("bot-james-wilson", "James Wilson", "j_wilson99", 1500, "United States", "🇺🇸", 365, "JW"),
  bot("bot-raj-patel", "Raj Patel", "raj_chess", 1440, "India", "🇮🇳", 330, "RP"),
  bot("bot-liam-obrien", "Liam O'Brien", "liam_ob", 1550, "Ireland", "🇮🇪", 405, "LO"),
  bot("bot-elena-volkov", "Elena Volkov", "elena_v", 1620, "Russia", "🇷🇺", 487, "EV"),
  bot("bot-diego-gomez", "Diego Gómez", "diego_g", 1480, "Colombia", "🇨🇴", 350, "DG"),
  bot("bot-natalia-kowal", "Natalia Kowalski", "natalia_k", 1530, "Poland", "🇵🇱", 380, "NK"),
  bot("bot-bjorn-larsen", "Björn Larsen", "bjorn_l", 1590, "Norway", "🇳🇴", 430, "BL"),
  bot("bot-priya-sharma", "Priya Sharma", "priya_s", 1410, "India", "🇮🇳", 305, "PS"),
  bot("bot-chen-wei", "Chen Wei", "chen_w", 1470, "China", "🇨🇳", 345, "CW"),
  bot("bot-ahmed-saleh", "Ahmed Saleh", "ahmed_s", 1660, "Egypt", "🇪🇬", 510, "AS"),

  // ===== ADVANCED (1700 - 1999) =====
  bot("bot-carlos-martinez", "Carlos Martinez", "carlos_gm", 1750, "Spain", "🇪🇸", 612, "CM"),
  bot("bot-viktor-petrov", "Viktor Petrov", "viktor_p", 1680, "Bulgaria", "🇧🇬", 530, "VP"),
  bot("bot-mohammed-rashid", "Mohammed Al-Rashid", "mo_rashid", 1580, "UAE", "🇦🇪", 420, "MR"),
  bot("bot-david-kim", "David Kim", "david_k_gm", 1900, "South Korea", "🇰🇷", 780, "DK"),
  bot("bot-ivan-sokolov", "Ivan Sokolov", "ivan_sok", 1820, "Russia", "🇷🇺", 690, "IS"),
  bot("bot-marie-dubois", "Marie Dubois", "marie_d", 1770, "France", "🇫🇷", 640, "MD"),
  bot("bot-rohan-mehta", "Rohan Mehta", "rohan_m", 1850, "India", "🇮🇳", 720, "RM"),
  bot("bot-anders-nilsson", "Anders Nilsson", "anders_n", 1730, "Sweden", "🇸🇪", 595, "AN"),
  bot("bot-lukas-weber", "Lukas Weber", "lukas_w", 1950, "Germany", "🇩🇪", 815, "LW"),
  bot("bot-irina-orlova", "Irina Orlova", "irina_o", 1880, "Russia", "🇷🇺", 745, "IO"),
  bot("bot-tom-hoffman", "Tom Hoffman", "tom_h", 1710, "United States", "🇺🇸", 575, "TH"),

  // ===== EXPERT / CM LEVEL (2000 - 2199) =====
  bot("bot-anatoly-rusev", "Anatoly Rusev", "anatoly_r", 2050, "Russia", "🇷🇺", 920, "AR"),
  bot("bot-elias-johansson", "Elias Johansson", "elias_j", 2120, "Sweden", "🇸🇪", 1050, "EJ"),
  bot("bot-vikram-singh", "Vikram Singh", "vikram_s", 2080, "India", "🇮🇳", 980, "VS"),
  bot("bot-leonardo-conti", "Leonardo Conti", "leo_conti", 2030, "Italy", "🇮🇹", 895, "LC"),
  bot("bot-petra-horak", "Petra Horák", "petra_h", 2150, "Czechia", "🇨🇿", 1110, "PH"),
  bot("bot-stefan-novakovic", "Stefan Novaković", "stefan_n", 2010, "Serbia", "🇷🇸", 870, "SN"),
  bot("bot-yusuf-demir", "Yusuf Demir", "yusuf_d", 2090, "Turkey", "🇹🇷", 1000, "YD"),

  // ===== FM / IM LEVEL (2200 - 2399) =====
  bot("bot-grigori-volkov", "Grigori Volkov", "grigori_v", 2240, "Russia", "🇷🇺", 1280, "GV"),
  bot("bot-arjun-iyer", "Arjun Iyer", "arjun_i", 2310, "India", "🇮🇳", 1450, "AI"),
  bot("bot-magnus-nyborg", "Magnus Nyborg", "magnus_n", 2380, "Norway", "🇳🇴", 1620, "MN"),
  bot("bot-laszlo-kovacs", "László Kovács", "laszlo_k", 2270, "Hungary", "🇭🇺", 1340, "LK"),
  bot("bot-mateo-fernandez", "Mateo Fernández", "mateo_f", 2210, "Argentina", "🇦🇷", 1210, "MF"),
  bot("bot-wei-liu", "Wei Liu", "wei_l", 2350, "China", "🇨🇳", 1530, "WL"),
  bot("bot-omar-bensaid", "Omar Bensaid", "omar_b", 2230, "Tunisia", "🇹🇳", 1250, "OB"),

  // ===== GM LEVEL (2400 - 2599) =====
  bot("bot-alexei-tarasov", "Alexei Tarasov", "alexei_t", 2440, "Russia", "🇷🇺", 1780, "AT"),
  bot("bot-sebastian-acosta", "Sebastián Acosta", "seb_acosta", 2480, "Cuba", "🇨🇺", 1880, "SA"),
  bot("bot-rajat-kumar", "Rajat Kumar", "rajat_k", 2510, "India", "🇮🇳", 1960, "RK"),
  bot("bot-henrik-jensen", "Henrik Jensen", "henrik_j", 2420, "Denmark", "🇩🇰", 1720, "HJ"),
  bot("bot-vladimir-popov", "Vladimir Popov", "vlad_p", 2550, "Bulgaria", "🇧🇬", 2050, "VP"),
  bot("bot-jakub-zielinski", "Jakub Zieliński", "jakub_z", 2460, "Poland", "🇵🇱", 1830, "JZ"),

  // ===== SUPER GM / LEGEND LEVEL (2600 - 2800) =====
  bot("bot-niko-andric", "Niko Andrić", "niko_a", 2620, "Serbia", "🇷🇸", 2210, "NA"),
  bot("bot-erik-svensson", "Erik Svensson", "erik_s", 2680, "Sweden", "🇸🇪", 2380, "ES"),
  bot("bot-takeshi-saito", "Takeshi Saito", "takeshi_s", 2720, "Japan", "🇯🇵", 2510, "TS"),
  bot("bot-kostya-ivanov", "Kostya Ivanov", "kostya_i", 2780, "Russia", "🇷🇺", 2680, "KI"),
];
