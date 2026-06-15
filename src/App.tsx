import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChessLoadingScreen from "@/components/ChessLoadingScreen";
import RouteLoader from "@/components/RouteLoader";
import SiteRatingJsonLd from "@/components/SiteRatingJsonLd";
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
import PlayGuest from "./pages/PlayGuest";
import IgLanding from "./pages/IgLanding";
import IgBonus from "./pages/IgBonus";
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
const PressKit = lazy(() => import("./pages/PressKit"));
const Viral = lazy(() => import("./pages/Viral"));
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
const Chests = lazy(() => import("./pages/Chests"));
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


// Eager components (used in every page chrome)
import AntiTiltWatcher from "@/components/AntiTiltWatcher";
import FloatingShareButton from "@/components/FloatingShareButton";
import StreakFlexController from "@/components/StreakFlexController";
import TitleUnlockGate from "@/components/TitleUnlockGate";
import GameInviteListener from "@/components/GameInviteListener";
import Analytics from "@/components/Analytics";
import AppLaunchSplash from "@/components/AppLaunchSplash";
import EntryQuickDashboard from "@/components/EntryQuickDashboard";
import ReferralTracker from "@/hooks/useReferralTracker";
import DonationMilestoneBodyAttr from "@/components/DonationMilestoneBodyAttr";
import TheDoorButton from "@/components/TheDoorButton";

// Non-critical overlays — lazy-loaded so they don't block first paint.
const CinematicIntro = lazy(() => import("@/components/CinematicIntro"));
const WelcomeIntroPopup = lazy(() => import("@/components/WelcomeIntroPopup"));
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
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<LearnArticle />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentLobby />} />
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
          <Route path="/press-kit" element={<PressKit />} />
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
          <Route path="*" element={<NotFound />} />

        </Routes>
  );

  return (
    <>
      <Analytics />
      <ReferralTracker />
      <DonationMilestoneBodyAttr />
      <TheDoorButton />
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
          <SiteRatingJsonLd />
          <Suspense fallback={<RouteLoader />}>
            <div className="pb-16 md:pb-0">
              <AnimatedRoutes />
            </div>
            <AntiTiltWatcher />
            <TitleUnlockGate />
            <WelcomeIntroPopup />
            <CinematicIntro />
            <EntryQuickDashboard />
            <GameInviteListener />
            <MobileBottomNav />
            <NotificationPrompt />
            <DailyReminderNotifier />
            <SmartNotifier />
            <AppBadgeSync />
            <RewardFXLayer />
            <MatchResultLayer />
            <WelcomeBonusModal />
            <ExitIntentModal />
            <OnboardingWizard />
            <WeeklyRecapModal />
            <StreakFlexController />
            <FloatingShareButton />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
