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

function RootSafeOverlays() {
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
...
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

  const routeContent = isHome ? (
    renderedRoutes
  ) : (
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <OfflineBanner />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteRatingJsonLd />
          {/* Home is eager and never sits behind the route loader. Lazy routes keep their own boundary inside AnimatedRoutes. */}
          <div className="pb-16 md:pb-0">
            <AnimatedRoutes />
          </div>
          {/* Deferred chrome: Home paints first, decorative/listener layers attach after idle. */}
          <EntryDeferredChrome />
          <MobileBottomNav />
          {/* Root-safe overlays — no welcome/onboarding modal is allowed to cover the entry homepage. */}
          <RootSafeOverlays />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
