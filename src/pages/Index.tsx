import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LearnFasterSection from "@/components/LearnFasterSection";
import LearnFormatsSection from "@/components/LearnFormatsSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main>
      <HeroSection />
      <FeaturesSection />
      <LearnFasterSection />
      <LearnFormatsSection />
    </main>
    <Footer />
  </div>
);

export default Index;
