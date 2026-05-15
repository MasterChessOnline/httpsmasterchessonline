// Lightweight i18n — English / Serbian / Russian / Spanish.
// Strings here cover homepage hero + nav + global CTAs. Pages stay in English by default
// and progressively adopt t() calls. Crawlers see English (SSR-safe), users get translated UI.
export type Lang = "en" | "sr" | "ru" | "es";

export const LANG_NAMES: Record<Lang, { native: string; flag: string; label: string }> = {
  en: { native: "English", flag: "🇬🇧", label: "EN" },
  sr: { native: "Srpski", flag: "🇷🇸", label: "SR" },
  ru: { native: "Русский", flag: "🇷🇺", label: "RU" },
  es: { native: "Español", flag: "🇪🇸", label: "ES" },
};

type Dict = Record<string, string>;

const en: Dict = {
  "hero.tagline": "Battle. Climb. Conquer.",
  "hero.playOnline": "Play Online",
  "hero.vsBots": "vs Bots",
  "hero.signupCta": "Get Ready to Battle",
  "hero.joinFree": "Join Free",
  "hero.login": "Log In",
  "section.dailyChallenge": "Daily Challenge",
  "section.quickMatch": "Quick Match",
  "section.performance": "Your Performance",
  "nav.play": "Play",
  "nav.learn": "Learn",
  "nav.tournaments": "Tournaments",
  "nav.community": "Community",
  "nav.leaderboard": "Leaderboard",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "common.training": "Training",
  "common.analysis": "Analysis",
  "common.compete": "Compete",
  "common.openings": "Openings",
  "common.lessons": "Lessons",
};

const sr: Dict = {
  "hero.tagline": "Bori se. Penji se. Osvoji.",
  "hero.playOnline": "Igraj Online",
  "hero.vsBots": "Protiv Botova",
  "hero.signupCta": "Spremi se za bitku",
  "hero.joinFree": "Pridruži se",
  "hero.login": "Prijava",
  "section.dailyChallenge": "Dnevni Izazov",
  "section.quickMatch": "Brza Partija",
  "section.performance": "Tvoji rezultati",
  "nav.play": "Igraj",
  "nav.learn": "Uči",
  "nav.tournaments": "Turniri",
  "nav.community": "Zajednica",
  "nav.leaderboard": "Rang lista",
  "nav.profile": "Profil",
  "nav.settings": "Podešavanja",
  "common.training": "Trening",
  "common.analysis": "Analiza",
  "common.compete": "Takmiči se",
  "common.openings": "Otvaranja",
  "common.lessons": "Lekcije",
};

const ru: Dict = {
  "hero.tagline": "Сражайся. Поднимайся. Побеждай.",
  "hero.playOnline": "Играть Онлайн",
  "hero.vsBots": "Против Ботов",
  "hero.signupCta": "Готовься к битве",
  "hero.joinFree": "Регистрация",
  "hero.login": "Войти",
  "section.dailyChallenge": "Дневной Вызов",
  "section.quickMatch": "Быстрая Партия",
  "section.performance": "Твои результаты",
  "nav.play": "Играть",
  "nav.learn": "Учиться",
  "nav.tournaments": "Турниры",
  "nav.community": "Сообщество",
  "nav.leaderboard": "Рейтинг",
  "nav.profile": "Профиль",
  "nav.settings": "Настройки",
  "common.training": "Тренировка",
  "common.analysis": "Анализ",
  "common.compete": "Соревнуйся",
  "common.openings": "Дебюты",
  "common.lessons": "Уроки",
};

const es: Dict = {
  "hero.tagline": "Lucha. Sube. Conquista.",
  "hero.playOnline": "Jugar Online",
  "hero.vsBots": "vs Bots",
  "hero.signupCta": "Prepárate para la batalla",
  "hero.joinFree": "Regístrate",
  "hero.login": "Iniciar sesión",
  "section.dailyChallenge": "Reto Diario",
  "section.quickMatch": "Partida Rápida",
  "section.performance": "Tu rendimiento",
  "nav.play": "Jugar",
  "nav.learn": "Aprender",
  "nav.tournaments": "Torneos",
  "nav.community": "Comunidad",
  "nav.leaderboard": "Clasificación",
  "nav.profile": "Perfil",
  "nav.settings": "Ajustes",
  "common.training": "Entrenamiento",
  "common.analysis": "Análisis",
  "common.compete": "Competir",
  "common.openings": "Aperturas",
  "common.lessons": "Lecciones",
};

export const DICTS: Record<Lang, Dict> = { en, sr, ru, es };
