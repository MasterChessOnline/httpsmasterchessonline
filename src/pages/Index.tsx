import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DailyPuzzle from "@/components/DailyPuzzle";
import ChessboardPreview from "@/components/ChessboardPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DailyPuzzle />
      <ChessboardPreview />
      <Footer />
    </div>
  );
};

export default Index;
