import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChessLoadingScreen from "@/components/ChessLoadingScreen";
import CursorGlow from "@/components/CursorGlow";
import DepthLayers from "@/components/DepthLayers";
import MobileBottomNav from "@/components/MobileBottomNav";
import Index from "./pages/Index";
import DailyChallenge from "./pages/DailyChallenge";
import Dashboard from "./pages/Dashboard";
import Play from "./pages/Play";
import PlayOnline from "./pages/PlayOnline";
import Learn from "./pages/Learn";
import LearnArticle from "./pages/LearnArticle";
import Blog from "./pages/Blog";
import Tournaments from "./pages/Tournaments";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import ProfileRedirect from "./pages/ProfileRedirect";
import PublicPlayer from "./pages/PublicPlayer";
import Friends from "./pages/Friends";
import ComingSoon from "./pages/ComingSoon";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FairPlay from "./pages/FairPlay";
import Referrals from "./pages/Referrals";
import Press from "./pages/Press";
import Streamers from "./pages/Streamers";
import EmbedRating from "./pages/EmbedRating";
import Topics from "./pages/Topics";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import TournamentLobby from "./pages/TournamentLobby";
import TournamentSync from "./pages/TournamentSync";
import StoryMode from "./pages/StoryMode";
import OpeningTrainer from "./pages/OpeningTrainer";
import OpeningExplorer from "./pages/OpeningExplorer";
import OpeningLanding from "./pages/OpeningLanding";
import MasterGameView from "./pages/MasterGameView";
import GameHistory from "./pages/GameHistory";
import Analysis from "./pages/Analysis";
import RatingCalculator from "./pages/RatingCalculator";
import ChessTools from "./pages/ChessTools";
import PieceValues from "./pages/PieceValues";
import SkillTree from "./pages/SkillTree";
import Challenge from "./pages/Challenge";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Clubs from "./pages/Clubs";
import ClubDetail from "./pages/ClubDetail";
import GameReview from "./pages/GameReview";
import Spectate from "./pages/Spectate";
import GuessTheMove from "./pages/GuessTheMove";
import PlayLikeGM from "./pages/PlayLikeGM";
import Community from "./pages/Community";
import StreamHub from "./pages/StreamHub";
import Coach from "./pages/Coach";
import DailyPlan from "./pages/DailyPlan";
import Repertoire from "./pages/Repertoire";
import Training from "./pages/Training";
import ChessCard from "./pages/ChessCard";
import BotProfile from "./pages/BotProfile";
import AdminEmailStatus from "./pages/AdminEmailStatus";
import SeoStatus from "./pages/SeoStatus";
import AdminFullStats from "./pages/AdminFullStats";
import EmbedBoard from "./pages/EmbedBoard";
import Guides from "./pages/Guides";
import Guide from "./pages/Guide";
import Glossary from "./pages/Glossary";
import GlossaryTerm from "./pages/GlossaryTerm";
import ShareStreak from "./pages/ShareStreak";
import Tools from "./pages/Tools";
import ToolDetail from "./pages/ToolDetail";
import CheckmatePatterns from "./pages/CheckmatePatterns";
import CheckmatePatternDetail from "./pages/CheckmatePatternDetail";
import EloLanding from "./pages/EloLanding";
import EloDetail from "./pages/EloDetail";
import FamousGames from "./pages/FamousGames";
import FamousGameDetail from "./pages/FamousGameDetail";
import Grandmasters from "./pages/Grandmasters";
import GrandmasterDetail from "./pages/GrandmasterDetail";
import AntiTiltWatcher from "@/components/AntiTiltWatcher";
import TitleUnlockGate from "@/components/TitleUnlockGate";
import WelcomeIntroPopup from "@/components/WelcomeIntroPopup";
import GameInviteListener from "@/components/GameInviteListener";
import Analytics from "@/components/Analytics";
import InstallPrompt from "@/components/InstallPrompt";
import SmartNotifier from "@/components/SmartNotifier";
import Titles from "./pages/Titles";
import Missions from "./pages/Missions";
import ReferralTracker from "@/hooks/useReferralTracker";
const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
    <Analytics />
    <ReferralTracker />
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.995 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
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
          <Route path="/tournament-sync" element={<TournamentSync />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
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
            <SmartNotifier />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
