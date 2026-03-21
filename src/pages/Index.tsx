import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import FeaturesSection from "@/components/FeaturesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import YouTubeSection from "@/components/YouTubeSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ChessboardPreview from "@/components/ChessboardPreview";
import CallToActionSection from "@/components/CallToActionSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <ChessboardPreview />
      <WhyChooseUsSection />
      <YouTubeSection />
      <TestimonialsSection />
      <CallToActionSection />
      <Footer />
    </div>
  );
};

export default Index;
