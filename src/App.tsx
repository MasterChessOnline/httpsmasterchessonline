import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
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
import Premium from "./pages/Premium";
import PremiumChat from "./pages/PremiumChat";
import VideoLessons from "./pages/VideoLessons";

import Achievements from "./pages/Achievements";

import NotFound from "./pages/NotFound";
import Donate from "./pages/Donate";
import Contact from "./pages/Contact";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/play" element={<Play />} />
            <Route path="/play/online" element={<PlayOnline />} />
            
            <Route path="/learn" element={<Learn />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/premium/chat" element={<PremiumChat />} />
            <Route path="/premium/lessons" element={<VideoLessons />} />
            
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
