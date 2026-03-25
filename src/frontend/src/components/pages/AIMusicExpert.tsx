import { Bot, Loader2, Music, Send, Sparkles, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { usePlayer } from "../../context/PlayerContext";
import { deductUnits } from "../../hooks/useApiQuota";
import type { Song } from "../../types/music";
import {
  getActiveApiKey,
  isQuotaExhaustedError,
  markCurrentKeyExhausted,
} from "../../utils/ytApiKey";
import { SongRow } from "../SongRow";

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
  workout: "workout gym motivation songs",
  gym: "workout gym motivation songs",
  focus: "focus study concentration music",
  study: "focus study concentration music",
  desi: "desi beats bhangra punjabi songs",
  bhangra: "desi beats bhangra punjabi songs",
};

const ARTIST_QUERIES: Array<{
  keywords: string[];
  query: string;
  reply: string;
}> = [
  {
    keywords: [
      "sidhu moose wala",
      "sidhu moosewala",
      "moose wala",
      "moosewala",
      "sidhu paji",
      "sidhu paaji",
    ],
    query: "Sidhu Moosewala best songs",
    reply:
      "Sidhu Moosewala Punjab da sher tha! Yeh rahi unki best tracks -- sach mein dil se gaane the 🦁🎵",
  },
  {
    keywords: ["ap dhillon", "dhillon"],
    query: "AP Dhillon songs 2025",
    reply: "AP Dhillon is fire bhai! 🔥 Yeh lo unke best tracks --",
  },
  {
    keywords: ["diljit", "diljit dosanjh"],
    query: "Diljit Dosanjh best songs",
    reply: "Diljit Dosanjh da swag alag hi hai! 🔥 Yeh rahi hit list --",
  },
  {
    keywords: ["arijit", "arjit"],
    query: "Arijit Singh best songs",
    reply:
      "Arijit Singh ki awaaz sun ke dil pighal jaata hai! 💖 Yeh rahi unki hits --",
  },
  {
    keywords: ["imran khan"],
    query: "Imran Khan Amplifier Satisfya best songs",
    reply: "Imran Khan classic hai bhai! Yeh rahi unki hits --",
  },
  {
    keywords: ["karan aujla"],
    query: "Karan Aujla best songs 2025",
    reply: "Karan Aujla ke bars fire hain! 🔥 Yeh lo --",
  },
  {
    keywords: ["shubh"],
    query: "Shubh punjabi singer best songs",
    reply: "Shubh ka vibe alag hi level ka hai! 🎵",
  },
  {
    keywords: ["bohemia"],
    query: "Bohemia rapper best punjabi rap songs",
    reply: "Bohemia -- The Punjabi Rapper! OG hai yaar 🎤",
  },
  {
    keywords: ["badshah"],
    query: "Badshah best rap songs hindi",
    reply: "Badshah ke beats hamesha banging hote hain! 🎶",
  },
  {
    keywords: ["divine"],
    query: "Divine rapper Mumbai best songs",
    reply: "DIVINE -- Gully Boy! 🎤 Mere gully mein wala tha yeh!",
  },
  {
    keywords: ["raftaar"],
    query: "Raftaar rapper best songs",
    reply: "Raftaar ka flow khatarnak hai bhai! 🔥",
  },
  {
    keywords: ["yo yo honey singh", "honey singh"],
    query: "Yo Yo Honey Singh best songs",
    reply:
      "Honey Singh ne toh era hi badal diya tha! 🎵 Classic hits yeh rahi --",
  },
];

function getAIResponse(input: string): { text: string; searchQuery?: string } {
  const lower = input.toLowerCase();

  for (const artist of ARTIST_QUERIES) {
    if (artist.keywords.some((kw) => lower.includes(kw))) {
      let query = artist.query;
      if (
        lower.includes("rap") ||
        lower.includes("hip hop") ||
        lower.includes("hiphop")
      ) {
        query = query.replace("best songs", "best rap songs");
      }
      return { text: artist.reply, searchQuery: query };
    }
  }

  const moodQuery = Object.entries(MOOD_QUERIES).find(([key]) =>
    lower.includes(key),
  )?.[1];
  if (moodQuery) {
    return {
      text: "Samajh gaya! Yeh songs perfect rahenge -- enjoy karo! 🎶",
      searchQuery: moodQuery,
    };
  }

  if (lower.includes("punjabi"))
    return {
      text: "Oye hoye! Punjabi music best hai bhai! Yeh dekho --",
      searchQuery: "Punjabi trending hits 2025",
    };
  if (lower.includes("bollywood"))
    return {
      text: "Bollywood ke latest hits aa rahe hain! 🎬",
      searchQuery: "Bollywood hits 2025",
    };
  if (
    lower.includes("rap") ||
    lower.includes("hip hop") ||
    lower.includes("hiphop")
  )
    return {
      text: "Indian rap scene mast hai bhai! Yeh rahi best tracks --",
      searchQuery: "Indian Hindi Punjabi rap hip hop best songs 2025",
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
    text: `Yeh lo -- "${input.trim().slice(0, 30)}" ke liye best songs 🎵`,
    searchQuery: input.trim(),
  };
}

async function fetchSongsForQuery(query: string): Promise<Song[]> {
  try {
    const buildUrl = (key: string) =>
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=6&key=${key}&q=${encodeURIComponent(query)}`;

    const res1 = await fetch(buildUrl(getActiveApiKey()));
    const data1 = await res1.json();

    let data = data1;
    if (isQuotaExhaustedError(data1)) {
      const nextKey = markCurrentKeyExhausted();
      if (!nextKey) return [];
      const res2 = await fetch(buildUrl(getActiveApiKey()));
      const data2 = await res2.json();
      if (isQuotaExhaustedError(data2)) {
        markCurrentKeyExhausted();
        return [];
      }
      data = data2;
    }

    if (!data.items || data.items.length === 0) return [];
    deductUnits(100);
    return data.items
      .filter((item: any) => item.id?.videoId)
      .map(
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
  "Sidhu Moosewala ke best rap songs",
  "Party ke liye songs chahiye",
  "Punjabi hits batao",
  "Chill karna chahta hoon",
  "Arijit Singh ke songs",
  "Romantic songs suggest karo",
  "Karan Aujla best songs",
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

    const finalText =
      searchQuery && songs.length === 0
        ? `${aiText}\n\n⚠️ YouTube API quota khatam ho gayi hai. Kal ~12:30 baje IST reset hogi. Tab tak search kar sakte ho.`
        : aiText;

    const aiMsg: Message = { id: newId(), role: "ai", text: finalText, songs };
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
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
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
                className={`max-w-[80%] ${
                  msg.role === "user" ? "items-end" : "items-start"
                } flex flex-col gap-2`}
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
