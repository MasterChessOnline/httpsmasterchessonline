import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChessLoadingScreen from "@/components/ChessLoadingScreen";
import CursorGlow from "@/components/CursorGlow";
import DepthLayers from "@/components/DepthLayers";
import MobileBottomNav from "@/components/MobileBottomNav";
// Critical / eager routes — needed for first paint & primary CTAs
import Index from "./pages/Index";
import Play from "./pages/Play";
import PlayOnline from "./pages/PlayOnline";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes — split into separate chunks to shrink initial bundle
const DailyChallenge = lazy(() => import("./pages/DailyChallenge"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Learn = lazy(() => import("./pages/Learn"));
const LearnArticle = lazy(() => import("./pages/LearnArticle"));
const Lessons = lazy(() => import("./pages/Lessons"));
const Blog = lazy(() => import("./pages/Blog"));
const Tournaments = lazy(() => import("./pages/Tournaments"));
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
const Press = lazy(() => import("./pages/Press"));
const Streamers = lazy(() => import("./pages/Streamers"));
const EmbedRating = lazy(() => import("./pages/EmbedRating"));
const Topics = lazy(() => import("./pages/Topics"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const TournamentLobby = lazy(() => import("./pages/TournamentLobby"));
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
const CheckmatePatterns = lazy(() => import("./pages/CheckmatePatterns"));
const CheckmatePatternDetail = lazy(() => import("./pages/CheckmatePatternDetail"));
const EloLanding = lazy(() => import("./pages/EloLanding"));
const EloDetail = lazy(() => import("./pages/EloDetail"));
const FamousGames = lazy(() => import("./pages/FamousGames"));
const FamousGameDetail = lazy(() => import("./pages/FamousGameDetail"));
const Grandmasters = lazy(() => import("./pages/Grandmasters"));
const GrandmasterDetail = lazy(() => import("./pages/GrandmasterDetail"));
const Titles = lazy(() => import("./pages/Titles"));
const Missions = lazy(() => import("./pages/Missions"));
const Pitch = lazy(() => import("./pages/Pitch"));
const TeamBattles = lazy(() => import("./pages/TeamBattles"));

// Eager components (used in every page chrome)
import AntiTiltWatcher from "@/components/AntiTiltWatcher";
import TitleUnlockGate from "@/components/TitleUnlockGate";
import GameInviteListener from "@/components/GameInviteListener";
import Analytics from "@/components/Analytics";
import AppLaunchSplash from "@/components/AppLaunchSplash";
import ReferralTracker from "@/hooks/useReferralTracker";

// Non-critical overlays — lazy-loaded so they don't block first paint.
const WelcomeIntroPopup = lazy(() => import("@/components/WelcomeIntroPopup"));
const InstallPrompt = lazy(() => import("@/components/InstallPrompt"));
const NotificationPrompt = lazy(() => import("@/components/NotificationPrompt"));
const IOSInstallOverlay = lazy(() => import("@/components/IOSInstallOverlay"));
const DailyReminderNotifier = lazy(() => import("@/components/DailyReminderNotifier"));
const SmartNotifier = lazy(() => import("@/components/SmartNotifier"));
const AppBadgeSync = lazy(() => import("@/components/AppBadgeSync"));
const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  // Skip route transition animation on phones — it causes layout thrash and
  // janky scroll on low-end devices. Desktop still gets the smooth fade.
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 768px)").matches;
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lite = isMobile || reduceMotion;

  const routes = (
    <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/pitch" element={<Pitch />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/play" element={<Play />} />
          <Route path="/play/online" element={<PlayOnline />} />
          <Route path="/play/titles" element={<Titles />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:slug" element={<LearnArticle />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<LearnArticle />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentLobby />} />
          
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
          <Route path="/bot/:botId" element={<BotProfile />} />
          <Route path="/admin/email-status" element={<AdminEmailStatus />} />
          <Route path="/admin/seo-status" element={<SeoStatus />} />
          <Route path="/admin/full-stats" element={<AdminFullStats />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/fair-play" element={<FairPlay />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/press" element={<Press />} />
          <Route path="/streamers" element={<Streamers />} />
          <Route path="/embed/rating/:username" element={<EmbedRating />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
          <Route path="/famous-games" element={<FamousGames />} />
          <Route path="/famous-games/:slug" element={<FamousGameDetail />} />
          <Route path="/players" element={<Grandmasters />} />
          <Route path="/players/:slug" element={<GrandmasterDetail />} />
          <Route path="/team-battles" element={<TeamBattles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
  );

  return (
    <>
      <Analytics />
      <ReferralTracker />
      {lite ? (
        routes
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.995 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {routes}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <AppLaunchSplash />
        <DepthLayers />
        <CursorGlow />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<ChessLoadingScreen />}>
            <div className="pb-16 md:pb-0">
              <AnimatedRoutes />
            </div>
            <AntiTiltWatcher />
            <TitleUnlockGate />
            <WelcomeIntroPopup />
            <GameInviteListener />
            <MobileBottomNav />
            <InstallPrompt />
            <NotificationPrompt />
            <IOSInstallOverlay />
            <DailyReminderNotifier />
            <SmartNotifier />
            <AppBadgeSync />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
