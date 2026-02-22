import { Image, FileText, Video, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Props {
  file: File;
  preview?: string;
  progress?: number;
  onRemove?: () => void;
  inChat?: boolean;
}

const FilePreview = ({ file, preview, progress, onRemove, inChat }: Props) => {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  const Icon = isImage ? Image : isVideo ? Video : file.type.includes("pdf") ? FileText : FileIcon;

  return (
    <div className={cn(
      "rounded-xl border border-border bg-accent/30 overflow-hidden",
      inChat ? "max-w-xs" : "max-w-sm"
    )}>
      {isImage && preview && (
        <img src={preview} alt={file.name} className="w-full max-h-48 object-cover" />
      )}
      {isVideo && preview && (
        <video src={preview} className="w-full max-h-48 object-cover" controls />
      )}
      <div className="px-3 py-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {(file.size / 1024).toFixed(0)} KB
          </p>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {typeof progress === "number" && progress < 100 && (
        <div className="px-3 pb-2">
          <Progress value={progress} className="h-1.5" />
        </div>
      )}
    </div>
  );
};

export default FilePreview;
