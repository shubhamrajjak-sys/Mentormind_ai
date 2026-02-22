import { useState, useRef } from "react";
import { Plus, Image, Video, FileText, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE = 10 * 1024 * 1024;

const MENU_ITEMS = [
  { icon: Image, label: "Upload Photo", accept: ".jpg,.jpeg,.png,.webp", color: "text-blue-500" },
  { icon: Video, label: "Upload Video", accept: ".mp4,.mov", color: "text-purple-500" },
  { icon: FileText, label: "Upload Document", accept: ".pdf,.docx,.txt", color: "text-orange-500" },
  { icon: File, label: "Upload Any File", accept: "*", color: "text-muted-foreground" },
];

interface Props {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const ChatAttachmentMenu = ({ onFileSelect, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentAccept, setCurrentAccept] = useState("*");

  const handleClick = (accept: string) => {
    setCurrentAccept(accept);
    setTimeout(() => inputRef.current?.click(), 0);
    setOpen(false);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert("File size exceeds 10 MB limit. Please choose a smaller file.");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center transition-all",
          "hover:bg-accent text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {open ? <X className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-12 left-0 z-50 w-52 rounded-xl border border-border bg-card shadow-xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleClick(item.accept)}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <item.icon className={cn("h-4 w-4", item.color)} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={currentAccept}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default ChatAttachmentMenu;
