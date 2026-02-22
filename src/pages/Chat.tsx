import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Sparkles, BookOpen, FileText, Lightbulb, Mic, MicOff, Download } from "lucide-react";
import { streamChat, type Msg } from "@/lib/streamChat";
import { fileToBase64, extractText, isImageFile, isPdfFile } from "@/lib/fileProcessor";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ChatAttachmentMenu from "@/components/chat/ChatAttachmentMenu";
import EmojiPicker from "@/components/chat/EmojiPicker";
import FilePreview from "@/components/chat/FilePreview";
import { jsPDF } from "jspdf";

type ChatMessage = Msg & {
  file?: { name: string; type: string; preview?: string; fileObj?: File };
};

const SUGGESTIONS = [
  { icon: BookOpen, label: "Explain quantum physics", prompt: "Explain quantum physics" },
  { icon: FileText, label: "Generate notes on photosynthesis", prompt: "Generate short revision notes on photosynthesis" },
  { icon: Lightbulb, label: "Quiz me on World War II", prompt: "Generate a quiz on World War II" },
  { icon: Sparkles, label: "Create flashcards on JavaScript", prompt: "Create flashcards on JavaScript basics" },
];

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | undefined>();
  const [uploadProgress, setUploadProgress] = useState<number | undefined>();
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Generate file preview URL
  useEffect(() => {
    if (!attachedFile) { setFilePreviewUrl(undefined); return; }
    if (attachedFile.type.startsWith("image/") || attachedFile.type.startsWith("video/")) {
      const url = URL.createObjectURL(attachedFile);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [attachedFile]);

  const processFileWithAI = async (file: File, userText: string): Promise<string> => {
    let fileData: string;
    let fileType = file.type;

    setUploadProgress(30);

    if (isImageFile(file) || isPdfFile(file) || file.type.startsWith("video/")) {
      fileData = await fileToBase64(file);
      setUploadProgress(60);
    } else {
      const text = await extractText(file);
      if (!text.trim()) {
        throw new Error("Could not extract text from this file.");
      }
      fileData = text;
      fileType = "text/plain";
      setUploadProgress(60);
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
          action: "summarize",
          userMessage: userText,
        }),
      }
    );

    setUploadProgress(90);

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Processing failed");
    }

    const data = await resp.json();
    setUploadProgress(100);
    return data.result;
  };

  const send = async (text: string) => {
    if ((!text.trim() && !attachedFile) || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text.trim() || (attachedFile ? `Analyze this file: ${attachedFile.name}` : ""),
      ...(attachedFile && {
        file: {
          name: attachedFile.name,
          type: attachedFile.type,
          preview: filePreviewUrl,
          fileObj: attachedFile,
        },
      }),
    };

    const currentFile = attachedFile;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachedFile(null);
    setFilePreviewUrl(undefined);
    setIsLoading(true);

    if (currentFile) {
      // File processing mode
      try {
        setUploadProgress(10);
        const result = await processFileWithAI(currentFile, text.trim());
        setMessages((prev) => [...prev, { role: "assistant", content: result }]);
      } catch (e: any) {
        toast.error(e.message || "File processing failed");
        setMessages((prev) => [...prev, { role: "assistant", content: `❌ Error: ${e.message || "Could not process the file."}` }]);
      } finally {
        setUploadProgress(undefined);
        setIsLoading(false);
      }
      return;
    }

    // Regular chat streaming
    let assistant = "";
    const upsert = (chunk: string) => {
      assistant += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.file) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistant } : m));
        }
        return [...prev, { role: "assistant", content: assistant }];
      });
    };

    try {
      // Send only text messages for context
      const contextMsgs: Msg[] = messages
        .map((m) => ({ role: m.role, content: m.content }));

      await streamChat({
        messages: [...contextMsgs, { role: "user", content: userMsg.content }],
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          toast.error(msg);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error("Connection error. Please try again.");
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice input failed. Please try again.");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const downloadAsPdf = (content: string, index: number) => {
    const doc = new jsPDF();
    doc.setFontSize(11);
    // Strip markdown for PDF
    const plain = content
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "");
    const lines = doc.splitTextToSize(plain, 180);
    let y = 15;
    for (const line of lines) {
      if (y > 280) { doc.addPage(); y = 15; }
      doc.text(line, 15, y);
      y += 6;
    }
    doc.save(`mentormind-response-${index + 1}.pdf`);
    toast.success("PDF downloaded!");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Mentormind AI</span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full pt-20 gap-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">How can I help you learn?</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                  Ask me anything, upload files, photos, or videos — I'll analyze and help!
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => send(s.prompt)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left text-sm hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <s.icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-foreground">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] space-y-2`}>
                {/* File preview in chat */}
                {m.file && (
                  <div className={m.role === "user" ? "flex justify-end" : ""}>
                    <div className="rounded-xl border border-border bg-accent/30 overflow-hidden max-w-xs">
                      {m.file.preview && m.file.type.startsWith("image/") && (
                        <img src={m.file.preview} alt={m.file.name} className="w-full max-h-48 object-cover" />
                      )}
                      {m.file.preview && m.file.type.startsWith("video/") && (
                        <video src={m.file.preview} className="w-full max-h-48" controls />
                      )}
                      <div className="px-3 py-1.5 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground truncate">{m.file.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>

                {/* Download PDF button for assistant messages */}
                {m.role === "assistant" && m.content.length > 100 && (
                  <button
                    onClick={() => downloadAsPdf(m.content, i)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-1"
                  >
                    <Download className="h-3.5 w-3.5" /> Download as PDF
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                {typeof uploadProgress === "number" ? (
                  <div className="space-y-2 w-48">
                    <p className="text-xs text-muted-foreground">Processing file...</p>
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attached file preview */}
      {attachedFile && (
        <div className="border-t border-border bg-card/50 px-4 py-2">
          <div className="max-w-3xl mx-auto">
            <FilePreview
              file={attachedFile}
              preview={filePreviewUrl}
              onRemove={() => { setAttachedFile(null); setFilePreviewUrl(undefined); }}
            />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-card/80 backdrop-blur-md px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="max-w-3xl mx-auto flex items-end gap-2"
        >
          <ChatAttachmentMenu
            onFileSelect={(f) => setAttachedFile(f)}
            disabled={isLoading}
          />

          <div className="flex-1 relative flex items-center rounded-xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring overflow-hidden">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={attachedFile ? "Add a message about this file..." : "Ask anything..."}
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none"
              disabled={isLoading}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) setAttachedFile(file);
              }}
            />
          </div>

          <EmojiPicker
            onSelect={(emoji) => {
              setInput((prev) => prev + emoji);
              inputRef.current?.focus();
            }}
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={toggleVoice}
            disabled={isLoading}
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${
              isListening
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
          </button>

          <Button
            type="submit"
            size="icon"
            className="rounded-xl h-11 w-11 shrink-0"
            disabled={isLoading || (!input.trim() && !attachedFile)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
