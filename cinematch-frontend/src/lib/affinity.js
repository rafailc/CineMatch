import { supabase } from "@/lib/supabase";

const GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
];

const GENRE_ID_TO_NAME = Object.fromEntries(GENRES.map(g => [g.id, g.name]));

/**
 * Fair split:
 * each favorite = 1 vote total
 * if it has k genres => each genre gets 1/k
 */
function analyzePreferredGenresFromFavoritesRows(favoritesRows) {
    const genreScores = {};
    let totalVotes = 0;

    for (const item of favoritesRows || []) {
        if (!Array.isArray(item.genres)) continue;

        const uniqueGenres = [...new Set(item.genres)].filter(Boolean);
        const k = uniqueGenres.length;
        if (k === 0) continue;

        const add = 1 / k;

        for (const genre of uniqueGenres) {
            genreScores[genre] = (genreScores[genre] || 0) + add;
        }

        totalVotes += 1;
    }

    return Object.entries(genreScores)
        .map(([genre, score]) => ({
            genre,
            percentage: totalVotes > 0 ? Math.round((score / totalVotes) * 100) : 0,
        }))
        .filter(x => x.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Dynamic alpha:
 * with few favorites, trust explicit prefs more
 * alpha = nFav/(nFav+k)
 */
function mergePreferences(favoriteAffinity, explicitGenreIds, favoritesCount = 0) {
    const scores = new Map();

    const k = 10;
    const alpha = favoritesCount / (favoritesCount + k); // 0..1

    // favorites side
    for (const g of favoriteAffinity || []) {
        scores.set(g.genre, (scores.get(g.genre) || 0) + alpha * g.percentage);
    }

    // explicit side
    const explicitNames = (explicitGenreIds || [])
        .map(id => GENRE_ID_TO_NAME[id])
        .filter(Boolean);

    if (explicitNames.length > 0) {
        const per = 100 / explicitNames.length;
        for (const name of explicitNames) {
            scores.set(name, (scores.get(name) || 0) + (1 - alpha) * per);
        }
    }

    const total = [...scores.values()].reduce((a, b) => a + b, 0);

    return [...scores.entries()]
        .map(([genre, score]) => ({
            genre,
            percentage: total > 0 ? Math.round((score / total) * 100) : 0,
        }))
        .filter(x => x.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage);
}

export async function recomputeAndStoreGenreAffinity(userId) {
    const { data: prefRow, error: prefErr } = await supabase
        .from("user_preferences")
        .select("genres")
        .eq("user_id", userId)
        .maybeSingle();

    if (prefErr) throw prefErr;

    const selected = prefRow?.genres || [];

    const { data: favRows, error: favErr } = await supabase
        .from("user_favorites")
        .select("genres")
        .eq("user_id", userId);

    if (favErr) throw favErr;

    const favoriteAffinity = analyzePreferredGenresFromFavoritesRows(favRows);
    const combinedAffinity = mergePreferences(favoriteAffinity, selected, favRows.length);

    const { error: upsertErr } = await supabase
        .from("user_preferences")
        .upsert({ user_id: userId, genre_affinity: combinedAffinity }, { onConflict: "user_id" });

    if (upsertErr) throw upsertErr;

    return combinedAffinity;
}
