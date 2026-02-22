import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

interface Props {
  result: string | null;
  isProcessing: boolean;
  action: string;
}

const ProcessingResult = ({ result, isProcessing, action }: Props) => {
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">
          {action === "summarize" && "Analyzing and summarizing your file..."}
          {action === "quiz" && "Generating quiz questions..."}
          {action === "flashcards" && "Creating flashcards..."}
          {!["summarize", "quiz", "flashcards"].includes(action) && "Processing..."}
        </p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
        <ReactMarkdown>{result}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ProcessingResult;
