import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, BrainCircuit, Layers, FileDown, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import FileUploadZone from "@/components/workspace/FileUploadZone";
import ProcessingResult from "@/components/workspace/ProcessingResult";
import { fileToBase64, extractText, isImageFile, isPdfFile } from "@/lib/fileProcessor";
import { convertToPdf } from "@/lib/pdfConverter";

const Workspace = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [converting, setConverting] = useState(false);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setCurrentAction("");
    toast.success(`File "${f.name}" uploaded successfully!`);
  }, []);

  const processFile = async (action: "summarize" | "quiz" | "flashcards") => {
    if (!file) return;
    setIsProcessing(true);
    setCurrentAction(action);
    setResult(null);

    try {
      let fileData: string;
      let fileType = file.type;

      if (isImageFile(file) || isPdfFile(file)) {
        fileData = await fileToBase64(file);
      } else {
        const text = await extractText(file);
        if (!text.trim()) {
          toast.error("Could not extract text from this file.");
          setIsProcessing(false);
          return;
        }
        fileData = text;
        fileType = "text/plain";
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            fileData,
            fileType,
            fileName: file.name,
            action,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Processing failed");
      }

      const data = await resp.json();
      setResult(data.result);
    } catch (e: any) {
      toast.error(e.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvertPdf = async () => {
    if (!file) return;
    setConverting(true);
    try {
      const blob = await convertToPdf(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/, "") + ".pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded!");
    } catch (e: any) {
      toast.error(e.message || "Conversion failed.");
    } finally {
      setConverting(false);
    }
  };

  const canConvert = file && !isPdfFile(file);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">MentorMind AI Workspace</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Upload Zone */}
        <FileUploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />

        {/* File info + actions */}
        {file && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm animate-fade-in-up">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB · {file.type || "unknown"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFile(null); setResult(null); }}
                className="text-muted-foreground hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => processFile("summarize")}
                disabled={isProcessing}
                className="gap-2 rounded-lg"
              >
                <FileText className="h-4 w-4" /> Summarize
              </Button>
              <Button
                onClick={() => processFile("quiz")}
                disabled={isProcessing}
                variant="secondary"
                className="gap-2 rounded-lg"
              >
                <BrainCircuit className="h-4 w-4" /> Generate Quiz
              </Button>
              <Button
                onClick={() => processFile("flashcards")}
                disabled={isProcessing}
                variant="secondary"
                className="gap-2 rounded-lg"
              >
                <Layers className="h-4 w-4" /> Create Flashcards
              </Button>
              {canConvert && (
                <Button
                  onClick={handleConvertPdf}
                  disabled={converting}
                  variant="outline"
                  className="gap-2 rounded-lg"
                >
                  <FileDown className="h-4 w-4" />
                  {converting ? "Converting..." : "Convert to PDF"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Result */}
        <ProcessingResult result={result} isProcessing={isProcessing} action={currentAction} />
      </main>
    </div>
  );
};

export default Workspace;
