import { Bell, Clock, Loader2, Mic, MicOff, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApiQuota } from "../hooks/useApiQuota";
import { useSearchHistory } from "../hooks/useQueries";

interface TopHeaderProps {
  onSearch: (q: string) => void;
  isSearching: boolean;
  searchQuery: string;
}

export function TopHeader({
  onSearch,
  isSearching,
  searchQuery,
}: TopHeaderProps) {
  const [query, setQuery] = useState(searchQuery);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVerySmall, setIsVerySmall] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: searchHistory = [] } = useSearchHistory();
  const { remainingUnits } = useApiQuota();

  const quotaColor =
    remainingUnits < 2000
      ? "#FF4FD8"
      : remainingUnits < 5000
        ? "#FFB347"
        : "#23E6E2";

  // Detect very small screens (Apple Watch, <220px)
  useEffect(() => {
    const check = () => setIsVerySmall(window.innerWidth < 220);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!searchQuery) setQuery("");
  }, [searchQuery]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowHistory(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
      setShowHistory(false);
    }
  };

  const handleHistorySelect = (q: string) => {
    setQuery(q);
    onSearch(q);
    setShowHistory(false);
  };

  const handleMic = () => {
    const SpeechRecognition =
      // biome-ignore lint/suspicious/noExplicitAny: Web Speech API
      (window as any).SpeechRecognition ||
      // biome-ignore lint/suspicious/noExplicitAny: Web Speech API
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Microphone is not supported on this browser");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    // biome-ignore lint/suspicious/noExplicitAny: Web Speech API
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      onSearch(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice search failed, try again");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <header
      className="flex items-center gap-2 md:gap-4 px-3 md:px-6 py-2 md:py-3 flex-shrink-0"
      style={{ borderBottom: "1px solid rgba(42,52,65,0.5)" }}
    >
      {/* Brand logo on mobile */}
      <div className="md:hidden flex items-center gap-1.5 flex-shrink-0">
        <img
          src="/assets/uploads/untitled8_20251128171756-019d23af-504a-75ed-bdcc-892485ede7b8-3.png"
          alt="Deeksplay logo"
          className="w-7 h-7 rounded-md object-cover"
        />
        {!isVerySmall && (
          <span className="text-sm font-bold gradient-text">Deeksplay</span>
        )}
      </div>

      {/* Search area */}
      <div ref={containerRef} className="flex-1 flex items-center gap-2">
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <div className="relative">
            {isSearching ? (
              <Loader2
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 animate-spin"
                size={16}
                style={{ color: "#23E6E2" }}
              />
            ) : (
              <Search
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: "#9AA6B2" }}
              />
            )}
            <input
              data-ocid="search.input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = query.trim();
                  if (trimmed) {
                    onSearch(trimmed);
                    setShowHistory(false);
                  }
                }
              }}
              placeholder="Search songs, artists…"
              className="w-full pl-9 md:pl-12 pr-16 md:pr-20 py-2.5 md:py-3 rounded-full outline-none transition-all"
              style={{
                background: "rgba(20,26,34,0.9)",
                border: "1px solid rgba(42,52,65,0.8)",
                color: "#E9EEF6",
                fontSize: "clamp(14px, 4vw, 16px)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(35,230,226,0.6)";
                e.currentTarget.style.boxShadow =
                  "0 0 15px rgba(35,230,226,0.15)";
                if (searchHistory.length > 0) setShowHistory(true);
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(42,52,65,0.8)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    onSearch("");
                  }}
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ color: "#9AA6B2" }}
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                data-ocid="search.submit_button"
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "rgba(35,230,226,0.15)",
                  border: "1px solid rgba(35,230,226,0.4)",
                  color: "#23E6E2",
                }}
              >
                <Search size={13} />
              </button>
            </div>
          </div>

          {/* Search history dropdown */}
          {showHistory && searchHistory.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
              style={{
                background: "rgba(14,20,28,0.97)",
                border: "1px solid rgba(42,52,65,0.8)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="px-3 py-2 text-xs font-semibold"
                style={{
                  color: "#9AA6B2",
                  borderBottom: "1px solid rgba(42,52,65,0.4)",
                }}
              >
                Recent Searches
              </div>
              {searchHistory.slice(0, 8).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleHistorySelect(q)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors hover:bg-white/5"
                  style={{ color: "#E9EEF6" }}
                >
                  <Clock
                    size={14}
                    style={{ color: "#9AA6B2", flexShrink: 0 }}
                  />
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Mic button — hidden on very small screens */}
        {!isVerySmall && (
          <button
            type="button"
            data-ocid="search.mic.button"
            onClick={handleMic}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
            style={{
              background: isListening
                ? "rgba(255,79,216,0.2)"
                : "rgba(20,26,34,0.9)",
              border: isListening
                ? "1px solid rgba(255,79,216,0.7)"
                : "1px solid rgba(42,52,65,0.8)",
              color: isListening ? "#FF4FD8" : "#9AA6B2",
              animation: isListening ? "pulse 1s ease-in-out infinite" : "none",
            }}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}
      </div>

      {/* Quota pill */}
      <div
        data-ocid="header.quota.panel"
        className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 cursor-default"
        style={{
          background: `${quotaColor}18`,
          border: `1px solid ${quotaColor}40`,
          color: quotaColor,
        }}
        title={`${remainingUnits.toLocaleString()} API units remaining today`}
      >
        <span>⚡</span>
        <span>{remainingUnits.toLocaleString()}</span>
      </div>

      <button
        type="button"
        data-ocid="header.bell.button"
        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
        style={{
          background: "rgba(20,26,34,0.9)",
          border: "1px solid rgba(42,52,65,0.8)",
          color: "#9AA6B2",
        }}
      >
        <Bell size={16} />
      </button>

      <img
        src="/assets/uploads/untitled8_20251128171756-019d23af-504a-75ed-bdcc-892485ede7b8-3.png"
        alt="Deeksplay"
        className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
      />
    </header>
  );
}
