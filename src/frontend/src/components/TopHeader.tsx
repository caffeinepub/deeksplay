import { Bell, Loader2, Search, X } from "lucide-react";
import { useState } from "react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <header
      className="flex items-center gap-2 md:gap-4 px-3 md:px-6 py-2 md:py-4 flex-shrink-0"
      style={{ borderBottom: "1px solid rgba(42,52,65,0.5)" }}
    >
      {/* Brand logo on mobile (sidebar hidden) */}
      <div className="md:hidden flex items-center gap-1.5 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #23E6E2, #8A5CFF, #FF4FD8)",
          }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "6px solid #0B0F14",
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
            }}
          />
        </div>
        <span className="text-sm font-bold gradient-text">Deeksplay</span>
      </div>

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
            placeholder="Search songs, artists…"
            className="w-full pl-9 md:pl-12 pr-9 md:pr-12 py-2 md:py-3 rounded-full text-sm outline-none transition-all"
            style={{
              background: "rgba(20,26,34,0.9)",
              border: "1px solid rgba(42,52,65,0.8)",
              color: "#E9EEF6",
              fontSize: "16px", // prevents iOS zoom
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(35,230,226,0.6)";
              e.currentTarget.style.boxShadow =
                "0 0 15px rgba(35,230,226,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(42,52,65,0.8)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                onSearch("");
              }}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2"
              style={{ color: "#9AA6B2" }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

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

      <div
        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #23E6E2, #8A5CFF)",
          color: "#0B0F14",
        }}
      >
        DK
      </div>
    </header>
  );
}
