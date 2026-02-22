import { User, Layers, FileText, HelpCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  { icon: User, title: "Personal AI Tutor", desc: "Instant personalized help whenever you need it." },
  { icon: Layers, title: "Smart Flashcard Creator", desc: "Transform any content into effective flashcards." },
  { icon: FileText, title: "Comprehensive Notes Assistant", desc: "Organize content into clear, structured notes." },
  { icon: HelpCircle, title: "Adaptive Quiz Builder", desc: "AI-generated practice questions that adapt to you." },
];

const FeaturesSection = () => {
  const ref = useScrollAnimation();

  return (
    <section className="py-20 bg-secondary/50">
      <div ref={ref} className="container mx-auto px-6 opacity-0 animate-fade-in-up">
        <p className="text-center text-sm font-semibold text-primary uppercase tracking-wide">
          Experience the future of education
        </p>
        <h2 className="mt-3 text-center text-3xl md:text-4xl font-bold text-foreground">
          AI-Powered Learning
        </h2>
        <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
          AI learning tools will help you learn faster, remember longer, and understand better.
        </p>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
