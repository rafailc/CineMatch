const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

export async function testTmdb() {
    try {
        console.log(" Testing TMDB trending fetch...");

        const res = await fetch(
            `${TMDB_BASE}/trending/movie/day?api_key=${API_KEY}`
        );

        if (!res.ok) {
            console.error(" TMDB returned an error:", res.status);
            return null;
        }

        const data = await res.json();
        return data.results;
    } catch (err) {
        console.error(" TMDB Test Failed:", err);
        return null;
    }
}