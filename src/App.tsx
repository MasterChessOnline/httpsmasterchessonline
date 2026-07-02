import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RouteLoader from "@/components/RouteLoader";
import SiteRatingJsonLd from "@/components/SiteRatingJsonLd";
import CursorGlow from "@/components/CursorGlow";
import DepthLayers from "@/components/DepthLayers";
import MobileBottomNav from "@/components/MobileBottomNav";
import BrakusRibbon from "@/components/BrakusRibbon";
import EntrySplash from "@/components/EntrySplash";
// Critical / eager route — original Home entry, no replacement shell.
import Index from "./pages/IndexFull";
import NotFound from "./pages/NotFound";
const Play = lazy(() => import("./pages/Play"));
const PlayOnline = lazy(() => import("./pages/PlayOnline"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PlayGuest = lazy(() => import("./pages/PlayGuest"));
const IgLanding = lazy(() => import("./pages/IgLanding"));
const IgBonus = lazy(() => import("./pages/IgBonus"));
const StyleQuiz = lazy(() => import("./pages/StyleQuiz"));
const BeatMe = lazy(() => import("./pages/BeatMe"));
const BeatNikola = lazy(() => import("./pages/BeatNikola"));

// Lazy-loaded routes — split into separate chunks to shrink initial bundle
const DailyChallenge = lazy(() => import("./pages/DailyChallenge"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnArticle = lazy(() => import("./pages/LearnArticle"));
const Lessons = lazy(() => import("./pages/Lessons"));
const Blog = lazy(() => import("./pages/Blog"));
const Tournaments = lazy(() => import("./pages/Tournaments"));
const TournamentsWall = lazy(() => import("./pages/TournamentsWall"));
const WorldTournaments = lazy(() => import("./pages/WorldTournaments"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileRedirect = lazy(() => import("./pages/ProfileRedirect"));
const PublicPlayer = lazy(() => import("./pages/PublicPlayer"));
const Friends = lazy(() => import("./pages/Friends"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const FairPlay = lazy(() => import("./pages/FairPlay"));
const Referrals = lazy(() => import("./pages/Referrals"));
const BattlePass = lazy(() => import("./pages/BattlePass"));
const SeasonHub = lazy(() => import("./pages/SeasonHub"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Brag = lazy(() => import("./pages/Brag"));
const DailyKingPage = lazy(() => import("./pages/DailyKing"));
const RateMasterChess = lazy(() => import("./pages/RateMasterChess"));
const MapsRedirect = lazy(() => import("./pages/MapsRedirect"));
const ReviewRedirect = lazy(() => import("./pages/ReviewRedirect"));
const BattleRoyale = lazy(() => import("./pages/BattleRoyale"));
const Press = lazy(() => import("./pages/Press"));
const Streamers = lazy(() => import("./pages/Streamers"));
const EmbedRating = lazy(() => import("./pages/EmbedRating"));
const Topics = lazy(() => import("./pages/Topics"));
const SahOnline = lazy(() => import("./pages/SahOnline"));
const UtmBuilder = lazy(() => import("./pages/UtmBuilder"));
const LocationPage = lazy(() => import("./pages/Location"));
const Promo = lazy(() => import("./pages/Promo"));
const Supporter = lazy(() => import("./pages/Supporter"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const PressKit = lazy(() => import("./pages/PressKit"));
const BuiltByAKid = lazy(() => import("./pages/BuiltByAKid"));
const NoAdsChess = lazy(() => import("./pages/NoAdsChess"));
const SeoLandings = lazy(() =>
  import("./pages/seo-landings").then((m) => ({ default: m.PlayChessWithFriendsFree })),
);
const BestFreeChessSite2026 = lazy(() =>
  import("./pages/seo-landings").then((m) => ({ default: m.BestFreeChessSite2026 })),
);
const ChessOpeningTrainerFree = lazy(() =>
  import("./pages/seo-landings").then((m) => ({ default: m.ChessOpeningTrainerFree })),
);
const DailyChessPuzzleRedirect = lazy(() =>
  import("./pages/seo-landings").then((m) => ({ default: m.DailyChessPuzzleRedirect })),
);
const ChessRatingExplained = lazy(() =>
  import("./pages/seo-landings").then((m) => ({ default: m.ChessRatingExplained })),
);
const LearnChessIn7Days = lazy(() =>
  import("./pages/seo-landings").then((m) => ({ default: m.LearnChessIn7Days })),
);
const Changelog = lazy(() =>
  import("./pages/seo-landings").then((m) => ({ default: m.Changelog })),
);
const ChessInCity = lazy(() => import("./pages/ChessInCity"));
const NearMe = lazy(() => import("./pages/NearMe"));
const PlayerHeatmap = lazy(() => import("./pages/PlayerHeatmap"));
const ChessMap = lazy(() => import("./pages/ChessMap"));
const AlternativeToMajorChessSites = lazy(() =>
  import("./pages/seo-landings").then((m) => ({ default: m.AlternativeToMajorChessSites })),
);
const Viral = lazy(() => import("./pages/Viral"));
const Connections = lazy(() => import("./pages/Connections"));
const CommunityMap = lazy(() => import("./pages/CommunityMap"));
const AdminSeoConsole = lazy(() => import("./pages/AdminSeoConsole"));
const AdminGbpPosts = lazy(() => import("./pages/AdminGbpPosts"));
const AdminGsc = lazy(() => import("./pages/AdminGsc"));
const AdminMapsSetup = lazy(() => import("./pages/AdminMapsSetup"));
const AdminChessResults = lazy(() => import("@/pages/AdminChessResults"));
const PwaInstallBanner = lazy(() => import("./components/PwaInstallBanner"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const TournamentLobby = lazy(() => import("./pages/TournamentLobby"));
const TournamentRegister = lazy(() => import("./pages/TournamentRegister"));
const DraganBrakusRedirect = lazy(() => import("./pages/DraganBrakusRedirect"));
const DraganBrakusCup = lazy(() => import("./pages/DraganBrakusCup"));
const DraganBrakusLive = lazy(() => import("./pages/DraganBrakusLive"));
const DraganBrakusPress = lazy(() => import("./pages/DraganBrakusPress"));
const DraganBrakusRules = lazy(() => import("./pages/DraganBrakusRules"));
const DraganBrakusHallOfFame = lazy(() => import("./pages/DraganBrakusHallOfFame"));
const DraganBrakusOverlay = lazy(() => import("./pages/DraganBrakusOverlay"));
const AdminTournament = lazy(() => import("./pages/AdminTournament"));
const DraganBrakusRegister = lazy(() => import("./pages/DraganBrakusRegister"));
const InviteRedirect = lazy(() => import("./pages/InviteRedirect"));
const WhyMasterChess = lazy(() => import("./pages/WhyMasterChess"));
const AffiliateRedirect = lazy(() => import("./pages/AffiliateRedirect"));

const StoryMode = lazy(() => import("./pages/StoryMode"));
const OpeningTrainer = lazy(() => import("./pages/OpeningTrainer"));
const OpeningExplorer = lazy(() => import("./pages/OpeningExplorer"));
const OpeningLanding = lazy(() => import("./pages/OpeningLanding"));
const MasterGameView = lazy(() => import("./pages/MasterGameView"));
const GameHistory = lazy(() => import("./pages/GameHistory"));
const Analysis = lazy(() => import("./pages/Analysis"));
const RatingCalculator = lazy(() => import("./pages/RatingCalculator"));
const ChessTools = lazy(() => import("./pages/ChessTools"));
const PieceValues = lazy(() => import("./pages/PieceValues"));
const SkillTree = lazy(() => import("./pages/SkillTree"));
const Challenge = lazy(() => import("./pages/Challenge"));
const Stats = lazy(() => import("./pages/Stats"));
const Settings = lazy(() => import("./pages/Settings"));
const Chat = lazy(() => import("./pages/Chat"));
const Clubs = lazy(() => import("./pages/Clubs"));
const ClubDetail = lazy(() => import("./pages/ClubDetail"));
const GameReview = lazy(() => import("./pages/GameReview"));
const Spectate = lazy(() => import("./pages/Spectate"));
const GuessTheMove = lazy(() => import("./pages/GuessTheMove"));
const PlayLikeGM = lazy(() => import("./pages/PlayLikeGM"));
const Community = lazy(() => import("./pages/Community"));
const StreamHub = lazy(() => import("./pages/StreamHub"));
const Coach = lazy(() => import("./pages/Coach"));
const DailyPlan = lazy(() => import("./pages/DailyPlan"));
const Repertoire = lazy(() => import("./pages/Repertoire"));
const Training = lazy(() => import("./pages/Training"));
const ChessCard = lazy(() => import("./pages/ChessCard"));
const BotProfile = lazy(() => import("./pages/BotProfile"));
const AdminEmailStatus = lazy(() => import("./pages/AdminEmailStatus"));
const SeoStatus = lazy(() => import("./pages/SeoStatus"));
const AdminFullStats = lazy(() => import("./pages/AdminFullStats"));
const EmbedBoard = lazy(() => import("./pages/EmbedBoard"));
const Guides = lazy(() => import("./pages/Guides"));
const Guide = lazy(() => import("./pages/Guide"));
const Glossary = lazy(() => import("./pages/Glossary"));
const GlossaryTerm = lazy(() => import("./pages/GlossaryTerm"));
const ShareStreak = lazy(() => import("./pages/ShareStreak"));
const Tools = lazy(() => import("./pages/Tools"));
const ToolDetail = lazy(() => import("./pages/ToolDetail"));
const Chests = lazy(() => import("./pages/Chests"));
const CheckmatePatterns = lazy(() => import("./pages/CheckmatePatterns"));
const CheckmatePatternDetail = lazy(() => import("./pages/CheckmatePatternDetail"));
const EloLanding = lazy(() => import("./pages/EloLanding"));
const EloDetail = lazy(() => import("./pages/EloDetail"));
const ChessForIndex = lazy(() => import("./pages/ChessForIndex"));
const ChessForAge = lazy(() => import("./pages/ChessForAge"));
const FamousGames = lazy(() => import("./pages/FamousGames"));
const FamousGameDetail = lazy(() => import("./pages/FamousGameDetail"));
const Grandmasters = lazy(() => import("./pages/Grandmasters"));
const GrandmasterDetail = lazy(() => import("./pages/GrandmasterDetail"));
const Titles = lazy(() => import("./pages/Titles"));
const Missions = lazy(() => import("./pages/Missions"));
const Pitch = lazy(() => import("./pages/Pitch"));
const TeamBattles = lazy(() => import("./pages/TeamBattles"));
const DevOnlineSim = lazy(() => import("./pages/DevOnlineSim"));
const ChallengeLink = lazy(() => import("./pages/ChallengeLink"));
const Puzzles = lazy(() => import("./pages/Puzzles"));
const PuzzlePage = lazy(() => import("./pages/PuzzlePage"));
const Confessions = lazy(() => import("./pages/Confessions"));
const Rival = lazy(() => import("./pages/Rival"));
const BeatBotLanding = lazy(() => import("./pages/BeatBotLanding"));
const PlayFromCity = lazy(() => import("./pages/PlayFromCity"));
const SeoLandingRoute = lazy(() => import("./pages/SeoLandingRoute"));
const StreamerOverlay = lazy(() => import("./pages/StreamerOverlay"));
const News = lazy(() => import("./pages/News"));
const NewsItem = lazy(() => import("./pages/NewsItem"));
const NewsSubmit = lazy(() => import("./pages/NewsSubmit"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const NikolaSakotic = lazy(() => import("./pages/NikolaSakotic"));


// Eager components (used in every page chrome)
import AntiTiltWatcher from "@/components/AntiTiltWatcher";
import FloatingShareButton from "@/components/FloatingShareButton";
import StreakFlexController from "@/components/StreakFlexController";
import TitleUnlockGate from "@/components/TitleUnlockGate";
import GameInviteListener from "@/components/GameInviteListener";
import Analytics from "@/components/Analytics";
import OfflineBanner from "@/components/OfflineBanner";
import ReferralTracker from "@/hooks/useReferralTracker";
import DonationMilestoneBodyAttr from "@/components/DonationMilestoneBodyAttr";


// Non-critical overlays — lazy-loaded so they don't block first paint.
const NotificationPrompt = lazy(() => import("@/components/NotificationPrompt"));
const DailyReminderNotifier = lazy(() => import("@/components/DailyReminderNotifier"));
const SmartNotifier = lazy(() => import("@/components/SmartNotifier"));
const AppBadgeSync = lazy(() => import("@/components/AppBadgeSync"));
const RewardFXLayer = lazy(() => import("@/components/RewardFXLayer"));
const MatchResultLayer = lazy(() => import("@/components/MatchResultLayer"));
const WelcomeBonusModal = lazy(() => import("@/components/WelcomeBonusModal"));
const ExitIntentModal = lazy(() => import("@/components/ExitIntentModal"));
const OnboardingWizard = lazy(() => import("@/components/OnboardingWizard"));
const WeeklyRecapModal = lazy(() => import("@/components/WeeklyRecapModal"));
const Shop = lazy(() => import("./pages/Shop"));
const SpinWheel = lazy(() => import("./pages/SpinWheel"));
const HallOfFame = lazy(() => import("./pages/HallOfFame"));
const Beta = lazy(() => import("./pages/Beta"));
const Ranked = lazy(() => import("./pages/Ranked"));
const ShareMoment = lazy(() => import("./pages/ShareMoment"));
const queryClient = new QueryClient();

function entryLog(label: string, payload?: unknown) {
  try {
    console.info(`[MasterChess Entry] ${label}`, payload ?? "");
  } catch {
    // Debug logging must never affect startup.
  }
}

function RootDeferredOverlays() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [ready, setReady] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setReady(true);
      return;
    }
    const start = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback?.(idle);
    }
    const timer = globalThis.setTimeout(start, 900);
    return () => globalThis.clearTimeout(timer);
  }, [isHome]);

  if (!ready) return null;

  return (
    <>
      <Suspense fallback={null}><NotificationPrompt /></Suspense>
      <Suspense fallback={null}><DailyReminderNotifier /></Suspense>
      <Suspense fallback={null}><SmartNotifier /></Suspense>
      <Suspense fallback={null}><AppBadgeSync /></Suspense>
      <Suspense fallback={null}><RewardFXLayer /></Suspense>
      <Suspense fallback={null}><MatchResultLayer /></Suspense>
      {!isHome && <Suspense fallback={null}><WelcomeBonusModal /></Suspense>}
      {!isHome && <Suspense fallback={null}><ExitIntentModal /></Suspense>}
      {!isHome && <Suspense fallback={null}><OnboardingWizard /></Suspense>}
      {!isHome && <Suspense fallback={null}><WeeklyRecapModal /></Suspense>}
      <Suspense fallback={null}><PwaInstallBanner /></Suspense>
    </>
  );
}

function EntryDeferredChrome() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [ready, setReady] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setReady(true);
      return;
    }
    const start = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback?.(idle);
    }
    const timer = globalThis.setTimeout(start, 700);
    return () => globalThis.clearTimeout(timer);
  }, [isHome]);

  if (!ready) return null;

  return (
    <>
      <DepthLayers />
      <CursorGlow />
      <AntiTiltWatcher />
      <TitleUnlockGate />
      <GameInviteListener />
      <BrakusRibbon />
      <StreakFlexController />
      <FloatingShareButton />
    </>
  );
}

function useRouteZone() {
  const location = useLocation();
  if (typeof document === "undefined") return;
  const p = location.pathname;
  let zone = "";
  if (p.startsWith("/play") || p === "/" || p.startsWith("/bot") || p.startsWith("/beat")) zone = "play";
  else if (p.startsWith("/learn") || p.startsWith("/lessons") || p.startsWith("/openings") || p.startsWith("/coach") || p.startsWith("/training") || p.startsWith("/puzzle") || p.startsWith("/daily-puzzle") || p.startsWith("/guides") || p.startsWith("/glossary")) zone = "learn";
  else if (p.startsWith("/tournament") || p.startsWith("/dragan-brakus") || p.startsWith("/leaderboard") || p.startsWith("/battle-royale") || p.startsWith("/team-battles")) zone = "tourney";
  else if (p.startsWith("/community") || p.startsWith("/clubs") || p.startsWith("/friends") || p.startsWith("/live") || p.startsWith("/profile") || p.startsWith("/u/")) zone = "community";
  else if (p.startsWith("/news") || p.startsWith("/blog") || p.startsWith("/press")) zone = "news";
  if (zone) document.documentElement.setAttribute("data-zone", zone);
  else document.documentElement.removeAttribute("data-zone");
}

function AnimatedRoutes() {
  const location = useLocation();
  useRouteZone();

  useEffect(() => {
    entryLog("ROUTE_CHECK", { path: location.pathname || "/" });
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/") entryLog("HOME_RENDER");
  }, [location.pathname]);

  // Skip route transition animation on phones — it causes layout thrash and
  // janky scroll on low-end devices. Desktop still gets the smooth fade.
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Home is eager + critical: never wrap it in framer's fade. A stalled
  // mount animation was leaving the page stuck at opacity:0 ("colored
  // background only" bug). Lite skips the wrapper entirely.
  const isHome = location.pathname === "/";
  const lite = isMobile || reduceMotion || isHome;

  const routes = (
    <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/homepage" element={<Index />} />
          <Route path="/pitch" element={<Pitch />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/play" element={<Play />} />
          <Route path="/play/online" element={<PlayOnline />} />
          <Route path="/play/titles" element={<Titles />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:slug" element={<LearnArticle />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<LearnArticle />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/submit" element={<NewsSubmit />} />
          <Route path="/news/:slug" element={<NewsItem />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/wall" element={<TournamentsWall />} />
          <Route path="/tournaments/:id" element={<TournamentLobby />} />
          <Route path="/tournaments/:id/register" element={<TournamentRegister />} />
          <Route path="/dragan-brakus" element={<DraganBrakusCup />} />
          <Route path="/dragan-brakus/lobby" element={<DraganBrakusRedirect />} />
          <Route path="/dragan-brakus/live" element={<DraganBrakusLive />} />
          <Route path="/dragan-brakus/press" element={<DraganBrakusPress />} />
          <Route path="/dragan-brakus/register" element={<DraganBrakusRegister />} />
          <Route path="/dragan-brakus/rules" element={<DraganBrakusRules />} />
          <Route path="/dragan-brakus/hall-of-fame" element={<DraganBrakusHallOfFame />} />
          <Route path="/dragan-brakus/overlay" element={<DraganBrakusOverlay />} />
          <Route path="/admin/tournaments/:id" element={<AdminTournament />} />
          <Route path="/why-masterchess" element={<WhyMasterChess />} />
          <Route path="/r/:code" element={<AffiliateRedirect />} />
          <Route path="/i/:code" element={<InviteRedirect />} />

          <Route path="/world-tournaments" element={<WorldTournaments />} />

          
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<ProfileRedirect />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/u/:username" element={<PublicPlayer />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/missions" element={<Missions />} />
          
          <Route path="/story" element={<StoryMode />} />
          <Route path="/openings" element={<OpeningTrainer />} />
          <Route path="/openings/:slug" element={<OpeningLanding />} />
          <Route path="/opening-explorer" element={<OpeningExplorer />} />
          <Route path="/master-game/:id" element={<MasterGameView />} />
          <Route path="/history" element={<GameHistory />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/rating-calculator" element={<RatingCalculator />} />
          <Route path="/legacy-tools" element={<ChessTools />} />
          <Route path="/piece-values" element={<PieceValues />} />
          <Route path="/skill-tree" element={<SkillTree />} />
          <Route path="/challenge" element={<Challenge />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/game-review" element={<GameReview />} />
          <Route path="/spectate" element={<Spectate />} />
          <Route path="/guess-the-move" element={<GuessTheMove />} />
          <Route path="/play-like-gm" element={<PlayLikeGM />} />
          <Route path="/community" element={<Community />} />
          <Route path="/live" element={<StreamHub />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/daily-plan" element={<DailyPlan />} />
          <Route path="/repertoire" element={<Repertoire />} />
          <Route path="/training" element={<Training />} />
          <Route path="/chess-card" element={<ChessCard />} />
          <Route path="/daily-mate" element={<Navigate to="/daily-puzzle" replace />} />
          <Route path="/daily-puzzle" element={<DailyChallenge />} />
          <Route path="/puzzle/:slug" element={<PuzzlePage />} />
          <Route path="/confessions" element={<Confessions />} />
          <Route path="/rival/:a/:b" element={<Rival />} />
          <Route path="/bot/:botId" element={<BotProfile />} />
          <Route path="/admin/email-status" element={<AdminEmailStatus />} />
          <Route path="/admin/seo-status" element={<SeoStatus />} />
          <Route path="/admin/full-stats" element={<AdminFullStats />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/fair-play" element={<FairPlay />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/battle-pass" element={<BattlePass />} />
          <Route path="/season" element={<SeasonHub />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/brag/:username" element={<Brag />} />
          <Route path="/daily-king" element={<DailyKingPage />} />
          <Route path="/rate-masterchess" element={<RateMasterChess />} />
          <Route path="/maps" element={<MapsRedirect />} />
          <Route path="/review" element={<ReviewRedirect />} />
          <Route path="/battle-royale" element={<BattleRoyale />} />
          <Route path="/press" element={<Press />} />
          <Route path="/streamers" element={<Streamers />} />
          <Route path="/embed/rating/:username" element={<EmbedRating />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/sah-online" element={<SahOnline />} />
          <Route path="/utm" element={<UtmBuilder />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/promo" element={<Promo />} />
          <Route path="/supporter" element={<Supporter />} />
          <Route path="/support" element={<Navigate to="/supporter" replace />} />
          <Route path="/donate" element={<Navigate to="/supporter" replace />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-canceled" element={<PaymentCanceled />} />
          <Route path="/press-kit" element={<PressKit />} />
          <Route path="/built-by-a-kid" element={<BuiltByAKid />} />
          <Route path="/no-ads-chess" element={<NoAdsChess />} />
          <Route path="/play-chess-with-friends-free" element={<SeoLandings />} />
          <Route path="/best-free-chess-site-2026" element={<BestFreeChessSite2026 />} />
          <Route path="/chess-opening-trainer-free" element={<ChessOpeningTrainerFree />} />
          <Route path="/daily-chess-puzzle" element={<DailyChessPuzzleRedirect />} />
          <Route path="/chess-rating-explained" element={<ChessRatingExplained />} />
          <Route path="/learn-chess-in-7-days" element={<LearnChessIn7Days />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/alternative-to-major-chess-sites" element={<AlternativeToMajorChessSites />} />

          <Route path="/viral" element={<Viral />} />
          <Route path="/resources" element={<Navigate to="/" replace />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/play-guest" element={<PlayGuest />} />
          <Route path="/ig" element={<IgLanding />} />
          <Route path="/ig-bonus" element={<IgBonus />} />
          <Route path="/start" element={<IgLanding />} />
          <Route path="/quiz" element={<StyleQuiz />} />
          <Route path="/beat-me" element={<BeatMe />} />
          <Route path="/beat-me/:handle" element={<BeatMe />} />
          <Route path="/beat-nikola" element={<BeatNikola />} />
          <Route path="/embed/board/:gameId" element={<EmbedBoard />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/guide/:slug" element={<Guide />} />
          <Route path="/learn/glossary" element={<Glossary />} />
          <Route path="/learn/glossary/:slug" element={<GlossaryTerm />} />
          <Route path="/share/streak/:n" element={<ShareStreak />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:slug" element={<ToolDetail />} />
          <Route path="/learn/checkmate-patterns" element={<CheckmatePatterns />} />
          <Route path="/learn/checkmate-patterns/:slug" element={<CheckmatePatternDetail />} />
          <Route path="/elo" element={<EloLanding />} />
          <Route path="/elo/:rating" element={<EloDetail />} />
          <Route path="/chess-for" element={<ChessForIndex />} />
          <Route path="/chess-for/:slug" element={<ChessForAge />} />
          <Route path="/famous-games" element={<FamousGames />} />
          <Route path="/famous-games/:slug" element={<FamousGameDetail />} />
          <Route path="/players" element={<Grandmasters />} />
          <Route path="/players/:slug" element={<GrandmasterDetail />} />
          <Route path="/team-battles" element={<TeamBattles />} />
          <Route path="/dev/online-sim" element={<DevOnlineSim />} />
          <Route path="/chests" element={<Chests />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/spin" element={<SpinWheel />} />
          <Route path="/vs/:code" element={<ChallengeLink />} />
          <Route path="/puzzles" element={<Puzzles />} />
          <Route path="/beat/:botId" element={<BeatBotLanding />} />
          <Route path="/nikola-sakotic" element={<NikolaSakotic />} />
          <Route path="/nikola-sakotić" element={<NikolaSakotic />} />
          <Route path="/nikola" element={<NikolaSakotic />} />
          <Route path="/authors/nikola-sakotic" element={<NikolaSakotic />} />
          <Route path="/founder" element={<NikolaSakotic />} />
          <Route path="/play-from/:city" element={<PlayFromCity />} />
          <Route path="/overlay/:username" element={<StreamerOverlay />} />
          {/* SEO long-tail landings (EN + SR), all served by SeoLandingRoute via path lookup */}
          <Route path="/chess-for-kids" element={<SeoLandingRoute />} />
          <Route path="/chess-for-beginners" element={<SeoLandingRoute />} />
          <Route path="/chess-no-signup" element={<SeoLandingRoute />} />
          <Route path="/chess-no-ads" element={<SeoLandingRoute />} />
          <Route path="/play-chess-vs-friend" element={<SeoLandingRoute />} />
          <Route path="/free-online-chess" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-online" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-protiv-prijatelja" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-bez-registracije" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-protiv-kompjutera" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-za-pocetnike" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-pravila" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-otvaranja" element={<SeoLandingRoute />} />
          <Route path="/sr/sahovski-rejting" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-protiv-kompjutera-besplatno" element={<SeoLandingRoute />} />
          <Route path="/sr/sahovske-zagonetke" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-turniri-online" element={<SeoLandingRoute />} />
          <Route path="/sr/kako-igrati-sah" element={<SeoLandingRoute />} />
          <Route path="/sr/sahovska-tabla" element={<SeoLandingRoute />} />
          <Route path="/sr/sahovske-figure" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-za-decu" element={<SeoLandingRoute />} />
          <Route path="/sr/najbolje-sahovsko-otvaranje" element={<SeoLandingRoute />} />
          <Route path="/sr/kraljev-gambit" element={<SeoLandingRoute />} />
          <Route path="/sr/sicilijanska-odbrana" element={<SeoLandingRoute />} />
          <Route path="/sr/sahovska-strategija" element={<SeoLandingRoute />} />
          <Route path="/sr/sah-mat-u-3-poteza" element={<SeoLandingRoute />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/beta" element={<Beta />} />
          <Route path="/ranked" element={<Ranked />} />
          <Route path="/share/:gameId/:ply" element={<ShareMoment />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/community/map" element={<CommunityMap />} />
          <Route path="/admin/seo-console" element={<AdminSeoConsole />} />
          <Route path="/admin/gbp-posts" element={<AdminGbpPosts />} />
          <Route path="/admin/gsc" element={<AdminGsc />} />
          <Route path="/admin/maps-setup" element={<AdminMapsSetup />} />
          <Route path="/admin/chess-results" element={<AdminChessResults />} />
          <Route path="/chess/:slug" element={<ChessInCity />} />
          <Route path="/near-me" element={<NearMe />} />
          <Route path="/players/world" element={<PlayerHeatmap />} />
          <Route path="/chess-map" element={<ChessMap />} />
          <Route path="*" element={<NotFound />} />

        </Routes>
  );

  const renderedRoutes = lite ? (
    routes
  ) : (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.995 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ opacity: 1 }}
      >
        {routes}
      </motion.div>
    </AnimatePresence>
  );

  const routeContent = (
    <Suspense fallback={<RouteLoader />}>{renderedRoutes}</Suspense>
  );

  return (
    <>
      <Analytics />
      <ReferralTracker />
      <DonationMilestoneBodyAttr />
      {routeContent}
    </>
  );
}

const App = () => {
  useEffect(() => {
    entryLog("APP_INIT_START");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <OfflineBanner />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SiteRatingJsonLd />
            <div className="pb-16 md:pb-0">
              <AnimatedRoutes />
            </div>
            <EntryDeferredChrome />
            <MobileBottomNav />
            <RootDeferredOverlays />
            <EntrySplash />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
