import { StickyNote, BookOpen, Video, Globe } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const formats = [
  { icon: StickyNote, title: "Enhance Your Notes", desc: "Upload your notes and let AI organize, summarize, and expand them." },
  { icon: BookOpen, title: "Simplify Research Papers", desc: "Break down complex papers into digestible key points." },
  { icon: Video, title: "Learn From Any Video", desc: "Extract insights and create study materials from video content." },
  { icon: Globe, title: "Navigate Web Knowledge", desc: "Turn web articles and resources into structured learning material." },
];

const LearnFormatsSection = () => {
  const ref = useScrollAnimation();

  return (
    <section className="py-20 bg-secondary/50">
      <div ref={ref} className="container mx-auto px-6 opacity-0 animate-fade-in-up">
        <span className="inline-block bg-accent text-primary text-xs font-semibold px-3 py-1 rounded-full">
          Upload all kinds of learning materials
        </span>
        <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
          Learn From Any Format
        </h2>

        <div className="mt-12 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-8">
            {formats.map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-accent flex-shrink-0 flex items-center justify-center">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Illustrative laptop graphic */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-72 h-52 md:w-96 md:h-64">
              <div className="absolute inset-0 bg-accent rounded-2xl" />
              <div className="absolute inset-4 bg-card rounded-xl shadow-sm flex items-center justify-center">
                <div className="flex gap-3">
                  <div className="w-16 h-20 bg-primary/10 rounded-lg" />
                  <div className="w-16 h-20 bg-primary/20 rounded-lg" />
                  <div className="w-16 h-20 bg-primary/15 rounded-lg" />
                </div>
              </div>
              <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="absolute -bottom-3 -left-3 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LearnFormatsSection;
