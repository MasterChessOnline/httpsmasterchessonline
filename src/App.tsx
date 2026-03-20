import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChessLoadingScreen from "@/components/ChessLoadingScreen";
import CursorGlow from "@/components/CursorGlow";
import MobileBottomNav from "@/components/MobileBottomNav";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Play from "./pages/Play";
import PlayOnline from "./pages/PlayOnline";
import Learn from "./pages/Learn";
import Tournaments from "./pages/Tournaments";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import VideoLessons from "./pages/VideoLessons";
import Achievements from "./pages/Achievements";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Lessons from "./pages/Lessons";
import TournamentLobby from "./pages/TournamentLobby";
import StoryMode from "./pages/StoryMode";
import OpeningTrainer from "./pages/OpeningTrainer";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/play" element={<Play />} />
          <Route path="/play/online" element={<PlayOnline />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentLobby />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/video-lessons" element={<VideoLessons />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/story" element={<StoryMode />} />
          <Route path="/openings" element={<OpeningTrainer />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <CursorGlow />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<ChessLoadingScreen />}>
            <div className="pb-16 md:pb-0">
              <AnimatedRoutes />
            </div>
            <MobileBottomNav />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
