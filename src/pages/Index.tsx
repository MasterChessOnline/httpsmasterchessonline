import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
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
      <StatsSection />
      <FeaturesSection />
      <WhyChooseUsSection />
      <YouTubeSection />
      <PremiumHighlightsSection />
      <TestimonialsSection />
      <ChessboardPreview />
      <Footer />
    </div>
  );
};

export default Index;
