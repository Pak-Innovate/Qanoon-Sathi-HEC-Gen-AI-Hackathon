import React, { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { apiCall } from "../services/apiClient";
import {
  Mic,
  Camera,
  FileText,
  Send,
  X,
  Copy,
  Check,
  Trash2,
  Pin,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import SourceModal from "./SourceModal";
import MediaUploadWidget from "./MediaUploadWidget";

interface Result {
  answer: string;
  sources: Array<{ source: string; section: string }>;
  llmUsed?: string;
}

interface HistoryItem {
  id: number;
  query: string;
  answer: string;
  resLang: string;
  pinned?: boolean;
}

interface SearchPageProps {
  t: any;
  lang: string;
  initialCategory: string;
  userName?: string;
  token?: string | null;
}

const SearchPage: React.FC<SearchPageProps> = ({
  t,
  lang,
  initialCategory,
  userName,
  token,
}) => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [detectedCategory, setDetectedCategory] = useState(
    initialCategory || "",
  );
  const [lastResultLang, setLastResultLang] = useState<string | null>(null);
  const [sources, setSources] = useState<
    Array<{ source: string; section: string }>
  >([]);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    data: string;
    name: string;
    type: string;
  } | null>(null);

  const [selectedSource, setSelectedSource] = useState<{
    source: string;
    section: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 1,
      query:
        lang === "ur"
          ? "بنیادی انسانی حقوق کیا ہیں؟"
          : "What are basic fundamental rights?",
      answer:
        lang === "ur"
          ? "آئین پاکستان کے تحت ہر شہری کو زندگی، آزادی اور برابری کا حق حاصل ہے۔"
          : "Under the Constitution of Pakistan, every citizen is entitled to life, liberty, and equality.",
      resLang: lang,
    },
  ]);

  const [showHistory, setShowHistory] = useState(false);

  const containsUrdu = (text: string) => /[\u0600-\u06FF]/.test(text);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile({
          data: (reader.result as string).split(",")[1],
          name: file.name,
          type: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    multiple: false,
  } as any);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mp3",
        });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          await handleMultimodalProcess(base64, "audio/mp3");
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMultimodalProcess = async (
    base64Data: string,
    mimeType: string,
  ) => {
    setIsLoading(true);
    setStatusMessage(
      mimeType.includes("audio")
        ? "Transcribing legal query..."
        : "Analyzing document OCR...",
    );

    try {
      const response = await apiCall("/api/preprocess/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileData: base64Data, mimeType }),
      });

      const { extracted } = await response.json();
      if (extracted) {
        setQuery(extracted);
        await handleSearch(extracted);
      }
    } catch (err) {
      console.error("Media processing failed:", err);
      setAnswer("Failed to process your file. Please try text input.");
    } finally {
      setIsLoading(false);
      setStatusMessage("");
      setUploadedFile(null);
    }
  };

  const handleSearch = async (customQuery: string | null = null) => {
    const rawQuery = typeof customQuery === "string" ? customQuery : query;
    if (!rawQuery.trim()) return;

    setIsLoading(true);
    setAnswer("");
    setSources([]);
    setStatusMessage("Authenticating & processing...");

    try {
      const isUrduInput = containsUrdu(rawQuery);
      const targetLang = isUrduInput ? "ur" : lang;
      setLastResultLang(targetLang);

      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await apiCall("/api/query", {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: rawQuery,
          category: detectedCategory,
          lang: targetLang,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Server processed poorly");

      setAnswer(data.answer);
      setSources(data.sources || []);
      setHistory((prev) => [
        {
          id: Date.now(),
          query: rawQuery,
          answer: data.answer,
          resLang: targetLang,
        },
        ...prev,
      ]);
    } catch (error: any) {
      console.error("Search failed:", error);
      setAnswer(`System Error: ${error.message || "Processing failed."}`);
    } finally {
      setIsLoading(false);
      setStatusMessage("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const deleteHistoryItem = (id: number) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  const togglePin = (id: number) => {
    setHistory(
      history
        .map((item) =>
          item.id === id ? { ...item, pinned: !item.pinned } : item,
        )
        .sort((a, b) => {
          if (a.pinned === b.pinned) return b.id - a.id;
          return a.pinned ? -1 : 1;
        }),
    );
  };

  const loadHistoryQuery = (item: HistoryItem) => {
    setQuery(item.query);
    setAnswer(item.answer);
    setLastResultLang(item.resLang);
    setShowHistory(false);
  };

  const handleSourceClick = (s: { source: string; section: string }) => {
    setSelectedSource(s);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 font-law">
      {/* Previous Queries History */}
      {history.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[10px] font-black uppercase tracking-widest text-[#065016] hover:text-[#065016]/70 transition-colors mb-4 flex items-center gap-2"
          >
            <span>
              📚 {lang === "ur" ? "پچھلے سوالات" : "Previous Queries"}
            </span>
            <span className="bg-[#065016]/20 text-[#065016] px-2 py-1 rounded-full text-[8px]">
              {history.length}
            </span>
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mb-8 max-h-60 overflow-y-auto"
              >
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 bg-white/60 border border-[#065016]/20 rounded-2xl hover:border-[#065016]/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <button
                        onClick={() => loadHistoryQuery(item)}
                        className="flex-1 text-left"
                      >
                        <p
                          className={`text-sm font-semibold text-[#065016] hover:text-[#065016]/70 transition-colors line-clamp-2 ${item.resLang === "ur" ? "text-right font-urdu" : ""}`}
                        >
                          {item.query}
                        </p>
                        <p
                          className={`text-[10px] text-[#065016]/60 mt-1 line-clamp-1 ${item.resLang === "ur" ? "text-right" : ""}`}
                        >
                          {item.answer?.slice(0, 60)}...
                        </p>
                      </button>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => togglePin(item.id)}
                          title={item.pinned ? "Unpin" : "Pin"}
                          className={`p-2 rounded-lg transition-colors ${item.pinned ? "bg-[#065016]/20 text-[#065016]" : "bg-[#065016]/5 text-[#065016]/40 hover:bg-[#065016]/10 hover:text-[#065016]"}`}
                        >
                          <Pin size={16} />
                        </button>
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          title="Delete"
                          className="p-2 bg-red-50 text-red-500/40 hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Search Header Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/80 backdrop-blur p-6 border border-[#065016]/20 rounded-[2rem] flex flex-col items-center text-center cursor-pointer group shadow-sm hover:shadow-md transition-all"
          onClick={isRecording ? stopRecording : startRecording}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isRecording ? "bg-red-500 animate-pulse" : "bg-[#065016]/10 group-hover:bg-[#065016]/20"}`}
          >
            <Mic
              size={20}
              className={isRecording ? "text-white" : "text-[#065016]"}
            />
          </div>
          <h4 className="text-[10px] font-black tracking-widest text-[#065016]/60 uppercase">
            Voice Input
          </h4>
          <p className="text-[10px] text-[#065016] mt-2 font-bold">
            {isRecording ? "Listening..." : "Tap to record query"}
          </p>
        </motion.div>

        <div
          {...getRootProps()}
          className="md:col-span-2 bg-white/80 backdrop-blur p-6 border-2 border-dashed border-[#065016]/20 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group hover:border-[#065016]/50 transition-all shadow-sm"
        >
          <input {...getInputProps()} />
          <Camera
            size={24}
            className="text-[#065016]/40 mb-2 group-hover:text-[#065016]"
          />
          <h4 className="text-[10px] font-black tracking-widest text-[#065016]/60 uppercase">
            Image / Document OCR
          </h4>
          <p className="text-[10px] text-[#065016] mt-1 font-bold">
            Drop legal papers or photos here
          </p>
        </div>
      </div>

      {/* Enhanced Media Upload Widget - Audio, Images, PDFs */}
      <div className="mb-10">
        <MediaUploadWidget
          onTextExtracted={async (text, mediaType, language) => {
            setQuery(text);
            await handleSearch(text);
          }}
          onError={(error) => {
            setStatusMessage(`Error: ${error}`);
            setTimeout(() => setStatusMessage(""), 3000);
          }}
          disabled={isLoading}
        />
      </div>

      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8 p-6 bg-[#065016]/5 border border-[#065016]/30 rounded-[2rem] flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FileText size={20} className="text-[#065016]" />
              </div>
              <div>
                <span className="text-sm font-black text-[#065016]">
                  {uploadedFile.name}
                </span>
                <p className="text-[10px] text-[#065016] font-bold uppercase tracking-widest">
                  Ready for analysis
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleMultimodalProcess(uploadedFile.data, uploadedFile.type)
                }
                className="px-6 py-2 bg-[#065016] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#065016]/90 transition-all"
              >
                Start AI OCR
              </button>
              <button
                onClick={() => setUploadedFile(null)}
                className="p-2 text-[#065016]/30 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Search Input */}
      <div className="relative group mb-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#065016]/20 to-[#065016]/20 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
        <div className="relative flex items-center bg-white border border-[#065016]/20 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 group-focus-within:border-[#065016]/50">
          <div className="pl-10 text-[#065016]/30 font-black text-[10px] uppercase tracking-widest select-none">
            Ask_Sathi
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Type your legal query..."
            className={`flex-1 bg-transparent py-10 px-8 text-2xl outline-none text-[#065016] ${containsUrdu(query) ? "text-right font-urdu text-4xl" : "font-serif italic"}`}
          />
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="mr-4 w-16 h-16 bg-[#065016] text-white rounded-full flex items-center justify-center hover:bg-[#065016]/90 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
              />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 justify-center mb-10"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#065016] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#065016] rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-[#065016] rounded-full animate-bounce delay-200"></div>
            </div>
            <span className="text-[10px] text-[#065016] font-black uppercase tracking-[0.4em]">
              {statusMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Board */}
      <div className="min-h-[400px]">
        {answer && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-16 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(6,80,22,0.1)] border border-[#065016]/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#065016]/5 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#065016]/2 rounded-tr-full"></div>

            <div className="absolute top-6 right-6 z-20 flex gap-2">
              <button
                onClick={handleCopy}
                className="p-3 bg-[#FDFBF7] border border-[#065016]/20 rounded-2xl text-[#065016] hover:bg-[#065016] hover:text-white transition-all shadow-sm flex items-center gap-2 group"
                title="Copy answer"
              >
                {isCopied ? <Check size={18} /> : <Copy size={18} />}
                <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:inline">
                  {isCopied ? "Copied" : "Copy"}
                </span>
              </button>
            </div>

            <div
              className={`relative z-10 leading-[1.8] text-[#065016] ${lastResultLang === "ur" ? "text-right font-urdu text-3xl" : "text-xl font-serif italic text-left"}`}
            >
              <div className="markdown-body">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-[#065016]/5 flex flex-wrap gap-3 relative z-10">
              {sources.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSourceClick(s)}
                  className="px-5 py-2 bg-[#FDFBF7] text-[10px] font-black text-[#065016] border border-[#065016]/20 rounded-full uppercase tracking-widest shadow-sm hover:border-[#065016] hover:bg-[#065016]/5 transition-all cursor-pointer"
                >
                  &gt; source::{s.source.toLowerCase().replace(/ /g, "_")}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <SourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source={selectedSource}
        lang={lang}
      />
    </div>
  );
};

export default SearchPage;
