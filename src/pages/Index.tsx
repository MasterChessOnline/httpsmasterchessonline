import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import YouTubeSection from "@/components/YouTubeSection";
import PremiumHighlightsSection from "@/components/PremiumHighlightsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ChessboardPreview from "@/components/ChessboardPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <YouTubeSection />
      <PremiumHighlightsSection />
      <TestimonialsSection />
      <ChessboardPreview />
      <Footer />
    </div>
  );
};

export default Index;
