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
            return;
        }

        const data = await res.json();

        console.log(" TMDB Test Successful!");
        console.log("------------DATA------------");
        console.log(data);

        console.log("------ PROTES 5 TAINIES ------");
        data.results.slice(0, 5).forEach((movie, i) => {
            console.log(`${i + 1}. ${movie.title} (Rating: ${movie.vote_average})`);
        });
    } catch (err) {
        console.error(" TMDB Test Failed:", err);
    }
}