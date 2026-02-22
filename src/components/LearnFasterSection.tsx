import { Infinity, Lightbulb, BarChart3 } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const items = [
  {
    icon: Infinity,
    title: "Unlimited Learning Potential",
    desc: "Access AI-powered tools that grow with your knowledge and never run out of ways to help you improve.",
  },
  {
    icon: Lightbulb,
    title: "Smart Teaching Methods",
    desc: "Our AI adapts proven teaching strategies like spaced repetition and active recall to your learning style.",
  },
  {
    icon: BarChart3,
    title: "Adapts to Your Expertise",
    desc: "Content difficulty adjusts in real-time based on your performance and understanding.",
  },
];

const LearnFasterSection = () => {
  const ref = useScrollAnimation();

  return (
    <section className="py-20 bg-background">
      <div ref={ref} className="container mx-auto px-6 opacity-0 animate-fade-in-up">
        <p className="text-center text-sm font-semibold text-muted-foreground">
          Mentormind can help you
        </p>
        <h2 className="mt-3 text-center text-3xl md:text-4xl font-bold text-foreground">
          Learn Faster and Better
        </h2>

        <div className="mt-14 grid md:grid-cols-3 gap-10">
          {items.map((item) => (
            <div key={item.title} className="text-center md:text-left">
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto md:mx-0 mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              <a
                href="#"
                className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
              >
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearnFasterSection;
