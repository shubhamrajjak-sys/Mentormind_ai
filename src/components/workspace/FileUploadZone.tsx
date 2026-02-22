import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED = ".jpg,.jpeg,.png,.pdf,.docx,.txt";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface Props {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUploadZone = ({ onFileSelect, isProcessing }: Props) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (file.size > MAX_SIZE) {
        alert("File size exceeds 10 MB limit.");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const allowed = ["jpg", "jpeg", "png", "pdf", "docx", "txt"];
      if (!allowed.includes(ext)) {
        alert("Unsupported file type. Please upload JPG, PNG, PDF, DOCX, or TXT.");
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    validate(e.dataTransfer.files[0]);
  };

  const icon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png"].includes(ext || "")) return <Image className="h-5 w-5 text-primary" />;
    if (ext === "pdf") return <FileText className="h-5 w-5 text-destructive" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all",
        dragOver
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-accent/30",
        isProcessing && "pointer-events-none opacity-60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => validate(e.target.files?.[0])}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            Drag & drop your file here
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse · JPG, PNG, PDF, DOCX, TXT · Max 10 MB
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          {["JPG", "PNG", "PDF", "DOCX", "TXT"].map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-muted-foreground font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;
