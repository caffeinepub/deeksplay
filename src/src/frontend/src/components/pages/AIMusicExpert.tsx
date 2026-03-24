import { Bot, Loader2, Music, Send, Sparkles, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { usePlayer } from "../../context/PlayerContext";
import type { Song } from "../../types/music";
import { SongRow } from "../SongRow";

const YT_API_KEY = "AIzaSyAK_oUtuutw46grbpCUx484TiXQEXtvOUc";

let msgCounter = 0;
function newId() {
  return String(++msgCounter);
}

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  songs?: Song[];
}

const MOOD_QUERIES: Record<string, string> = {
  sad: "sad emotional songs hindi",
  dukhi: "sad emotional songs hindi",
  happy: "happy party songs bollywood 2025",
  khush: "happy party songs bollywood 2025",
  party: "party songs bollywood punjabi 2025",
  chill: "chill lo-fi beats relax",
  relax: "chill lo-fi beats relax",
  romantic: "romantic love songs hindi 2025",
  pyaar: "romantic love songs hindi 2025",
  punjabi: "Punjabi hits trending 2025",
  workout: "workout gym motivation songs",
  gym: "workout gym motivation songs",
  focus: "focus study concentration music",
  study: "focus study concentration music",
  desi: "desi beats bhangra punjabi songs",
  bhangra: "desi beats bhangra punjabi songs",
};

function getMoodQuery(input: string): string | null {
  const lower = input.toLowerCase();
  for (const [key, query] of Object.entries(MOOD_QUERIES)) {
    if (lower.includes(key)) return query;
  }
  return null;
}

function getAIResponse(input: string): { text: string; searchQuery?: string } {
  const lower = input.toLowerCase();

  if (
    lower.includes("recommend") ||
    lower.includes("suggest") ||
    lower.includes("batao") ||
    lower.includes("sunao") ||
    lower.includes("sunna")
  ) {
    const mood = getMoodQuery(input);
    if (mood) {
      return {
        text: `Perfect choice! Tumhare liye ${mood.split(" ").slice(0, 3).join(" ")} type ke songs la raha hoon... 🎵`,
        searchQuery: mood,
      };
    }
  }

  const moodQuery = getMoodQuery(input);
  if (moodQuery) {
    return {
      text: "Samajh gaya! Yeh songs perfect rahenge -- enjoy karo! 🎶",
      searchQuery: moodQuery,
    };
  }

  if (lower.includes("punjabi"))
    return {
      text: "Oye hoye! Punjabi music best hai bhai! Yeh dekho --",
      searchQuery: "Punjabi trending 2025",
    };
  if (lower.includes("bollywood"))
    return {
      text: "Bollywood ke latest hits aa rahe hain! 🎬",
      searchQuery: "Bollywood hits 2025",
    };
  if (lower.includes("arijit") || lower.includes("arjit"))
    return {
      text: "Arijit Singh ki awaaz sun ke dil pighal jaata hai! Yeh rahi unki hits --",
      searchQuery: "Arijit Singh best songs",
    };
  if (lower.includes("ap dhillon") || lower.includes("dhillon"))
    return {
      text: "AP Dhillon is fire bhai! 🔥",
      searchQuery: "AP Dhillon songs 2025",
    };
  if (lower.includes("diljit"))
    return {
      text: "Diljit Dosanjh ka swag alag hi hai! 🔥",
      searchQuery: "Diljit Dosanjh songs 2025",
    };
  if (lower.includes("imran khan"))
    return {
      text: "Imran Khan classic! Sun --",
      searchQuery: "Imran Khan Amplifier Satisfya",
    };
  if (lower.includes("trending"))
    return {
      text: "Abhi jo gana sab sun rahe hain, yeh raha --",
      searchQuery: "trending songs India 2025",
    };
  if (
    lower.includes("old") ||
    lower.includes("purana") ||
    lower.includes("90s") ||
    lower.includes("retro")
  ) {
    return {
      text: "Purane zamaane ki baat hi alag thi! Nostalgia time 🎵",
      searchQuery: "90s Bollywood classic hits",
    };
  }
  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("helo") ||
    lower.includes("namaste")
  ) {
    return {
      text: "Hello bhai! Main Deeksplay ka AI Music Expert hoon 🎵 Apna mood batao ya koi artist/genre pucho -- main tumhare liye best songs suggest karoonga!",
    };
  }
  if (
    lower.includes("kaun") ||
    lower.includes("kya ho") ||
    lower.includes("who are you")
  ) {
    return {
      text: "Main Deeksplay ka AI Music Expert hoon! 🤖🎵 Tumhara music guide. Mood batao, genre batao, ya koi artist ka naam lo -- main best songs recommend karoonga aur directly play bhi ho jayenge!",
    };
  }
  if (
    lower.includes("shukriya") ||
    lower.includes("thanks") ||
    lower.includes("thank you") ||
    lower.includes("dhanyawad")
  ) {
    return {
      text: "Koi baat nahi bhai! Music enjoy karo 🎶 Koi aur request ho toh batao!",
    };
  }

  return {
    text: `"${input.trim().split(" ").slice(0, 4).join(" ")}" ke baare mein yeh songs mujhe best lagte hain --`,
    searchQuery: input.trim(),
  };
}

async function fetchSongsForQuery(query: string): Promise<Song[]> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=5&key=${YT_API_KEY}&q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    if (!data.items) return [];
    return data.items.map(
      (item: any): Song => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
        videoId: item.id.videoId,
        duration: "",
      }),
    );
  } catch {
    return [];
  }
}

const SUGGESTIONS = [
  "Mujhe sad songs sunao",
  "Party ke liye songs chahiye",
  "Punjabi hits batao",
  "Chill karna chahta hoon",
  "Arijit Singh ke songs",
  "Romantic songs suggest karo",
  "Gym workout songs",
  "Trending songs India",
];

interface AIMusicExpertProps {
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

export function AIMusicExpert({
  favorites,
  onToggleFavorite,
  onAddToPlaylist,
}: AIMusicExpertProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: newId(),
      role: "ai",
      text: "Namaste! Main Deeksplay ka AI Music Expert hoon 🎵\n\nApna mood batao ya koi artist/genre pucho -- main tumhare liye best songs suggest karoonga!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const favoriteIds = new Set(favorites.map((f) => f.id));

  // Player context used for potential future enhancements
  usePlayer();

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: newId(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const { text: aiText, searchQuery } = getAIResponse(text);
    let songs: Song[] = [];
    if (searchQuery) {
      songs = await fetchSongsForQuery(searchQuery);
    }

    const aiMsg: Message = { id: newId(), role: "ai", text: aiText, songs };
    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(42,52,65,0.6)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #8A5CFF, #FF4FD8)",
            boxShadow: "0 0 20px rgba(138,92,255,0.4)",
          }}
        >
          <Bot size={20} color="white" />
        </div>
        <div>
          <h2 className="font-bold" style={{ color: "#E9EEF6" }}>
            AI Music Expert
          </h2>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#23E6E2" }}
            />
            <span className="text-xs" style={{ color: "#23E6E2" }}>
              Online -- Powered by Deeksplay AI
            </span>
          </div>
        </div>
        <Sparkles size={16} className="ml-auto" style={{ color: "#FF4FD8" }} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: "linear-gradient(135deg, #8A5CFF, #FF4FD8)",
                  }}
                >
                  <Bot size={16} color="white" />
                </div>
              )}
              <div
                className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}
              >
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                  style={{
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #23E6E2, #8A5CFF)"
                        : "rgba(20,26,34,0.95)",
                    border:
                      msg.role === "ai"
                        ? "1px solid rgba(42,52,65,0.8)"
                        : "none",
                    color: msg.role === "user" ? "#0B0F14" : "#E9EEF6",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    fontWeight: msg.role === "user" ? "600" : "400",
                  }}
                >
                  {msg.text}
                </div>
                {msg.songs && msg.songs.length > 0 && (
                  <div
                    className="w-full rounded-xl overflow-hidden"
                    style={{
                      border: "1px solid rgba(42,52,65,0.8)",
                      background: "rgba(15,20,27,0.9)",
                    }}
                  >
                    <div
                      className="px-3 py-2 flex items-center gap-2"
                      style={{ borderBottom: "1px solid rgba(42,52,65,0.5)" }}
                    >
                      <Music size={12} style={{ color: "#8A5CFF" }} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#9AA6B2" }}
                      >
                        Recommended Songs
                      </span>
                    </div>
                    <div>
                      {msg.songs.map((song, si) => (
                        <SongRow
                          key={song.id}
                          song={song}
                          index={si}
                          queue={msg.songs!}
                          isFavorite={favoriteIds.has(song.id)}
                          onToggleFavorite={onToggleFavorite}
                          onAddToPlaylist={onAddToPlaylist}
                          ocidPrefix="ai"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: "rgba(35,230,226,0.2)",
                    border: "1px solid rgba(35,230,226,0.4)",
                  }}
                >
                  <User size={16} style={{ color: "#23E6E2" }} />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #8A5CFF, #FF4FD8)",
                }}
              >
                <Bot size={16} color="white" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{
                  background: "rgba(20,26,34,0.95)",
                  border: "1px solid rgba(42,52,65,0.8)",
                }}
              >
                <Loader2
                  size={16}
                  className="animate-spin"
                  style={{ color: "#8A5CFF" }}
                />
                <span className="text-sm" style={{ color: "#9AA6B2" }}>
                  Soch raha hoon...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-full text-xs transition-all hover:scale-105"
              style={{
                background: "rgba(138,92,255,0.1)",
                border: "1px solid rgba(138,92,255,0.4)",
                color: "#8A5CFF",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(42,52,65,0.6)" }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "rgba(20,26,34,0.9)",
            border: "1px solid rgba(42,52,65,0.8)",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Mood batao ya koi artist/genre pucho..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#E9EEF6" }}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #8A5CFF, #FF4FD8)" }}
          >
            <Send size={14} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
