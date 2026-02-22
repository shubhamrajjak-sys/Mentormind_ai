import { useState } from "react";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOJI_LIST = [
  "😀","😂","🤣","😍","🥰","😎","🤔","😮","🤩","😴",
  "👍","👏","🙌","💪","🎉","🔥","❤️","💯","✅","⭐",
  "📚","✏️","📝","💡","🎓","🧠","📖","🔬","🧪","💻",
  "👋","🤝","🙏","✌️","🤞","👀","💬","📌","🎯","🚀",
];

interface Props {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

const EmojiPicker = ({ onSelect, disabled }: Props) => {
  const [open, setOpen] = useState(false);

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
        <Smile className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-12 right-0 z-50 w-72 rounded-xl border border-border bg-card shadow-xl p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  onClick={() => { onSelect(e); setOpen(false); }}
                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent text-lg transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPicker;
