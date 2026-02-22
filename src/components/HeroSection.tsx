import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const HeroSection = () => {
  const ref = useScrollAnimation();

  return (
    <section className="py-20 md:py-28 bg-background">
      <div ref={ref} className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12 animate-fade-in-up">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            Mentormind AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
            AI learning assistant for students and professionals. Learn faster, remember longer, and understand better.
          </p>
          <div className="mt-8 flex gap-4 justify-center md:justify-start">
            <Link to="/chat">
              <Button size="lg" className="rounded-xl px-8 hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                Get Started
              </Button>
            </Link>
            <Link to="/signin">
              <Button size="lg" variant="secondary" className="rounded-xl px-8 hover:scale-105 transition-transform">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src={heroIllustration}
            alt="Student studying with AI-powered tools including globe, books, and science icons"
            className="w-full max-w-md lg:max-w-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
