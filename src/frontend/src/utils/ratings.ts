export type Rating = "like" | "dislike" | null;

const LS_KEY = "deeksplay_ratings";

function loadRatings(): Record<string, Rating> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRatings(data: Record<string, Rating>): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

export function getRating(songId: string): Rating {
  return loadRatings()[songId] ?? null;
}

export function setRating(songId: string, rating: Rating): void {
  const data = loadRatings();
  if (rating === null) {
    delete data[songId];
  } else {
    data[songId] = rating;
  }
  saveRatings(data);
}

export function getAllLikedSongIds(): string[] {
  const data = loadRatings();
  return Object.entries(data)
    .filter(([, v]) => v === "like")
    .map(([k]) => k);
}
