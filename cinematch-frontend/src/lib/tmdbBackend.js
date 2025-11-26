const API_BASE = "http://localhost:8080/api/tmdb";


/* ----------------------------- TRENDING ----------------------------- */

export async function getTrendingMovies(page = 1) {
    console.log("➡ Calling backend: /trending/movies?page=" + page);

    const res = await fetch(`${API_BASE}/trending/movies?page=${page}`);
    console.log("⬅ Backend responded with status:", res.status);

    const data = await res.json();
    console.log(" Data received from backend:", data);

    return data;
}


/* ----------------------------- DETAILS ----------------------------- */

export async function getMovieDetails(id) {
    console.log("➡ Calling backend: /movie/" + id);

    const res = await fetch(`${API_BASE}/movie/${id}`);
    console.log("⬅ Backend responded with status:", res.status);

    const data = await res.json();
    console.log(" Data received from backend:", data);

    return data;
}