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

export async function getTrendingTv(page = 1) {
    console.log("➡ Calling backend: /trending/tv?page=" + page);

    const res = await fetch(`${API_BASE}/trending/tv?page=${page}`);
    console.log("⬅ Backend responded with status:", res.status);

    const data = await res.json();
    console.log(" Data received from backend:", data);

    return data;
}

export async function getTrendingPerson(page = 1) {
    console.log("➡ Calling backend: /trending/person?page=" + page);

    const res = await fetch(`${API_BASE}/trending/person?page=${page}`);
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

export async function searchMovies(query, page = 1) {
    return fetch(`${API_BASE}/search/movies?q=${encodeURIComponent(query)}&page=${page}`)
        .then(res => res.json());
}

export async function searchPerson(query, page = 1) {
    return fetch(`${API_BASE}/search/people?q=${encodeURIComponent(query)}&page=${page}`)
        .then(res => res.json());
}

export async function searchTv(query, page = 1) {
    return fetch(`${API_BASE}/search/tv?q=${encodeURIComponent(query)}&page=${page}`)
        .then(res => res.json());
}

export async function getPersonDetails(id) {
    return fetch(`${API_BASE}/person/${id}`).then(res => res.json());
}

export async function getTvDetails(id) {
    return fetch(`${API_BASE}/series/${id}`).then(res => res.json());
}
/* -----------------------------
   DISCOVER
----------------------------- */

export function discoverMovies(queryString) {
    return fetch(`${API_BASE}/discover/movies${queryString}`)
        .then(res => res.json());
}

export function discoverTV(queryString) {
    return fetch(`${API_BASE}/discover/tv${queryString}`)
        .then(res => res.json());
}
/* -----------------------------
   SCORING
----------------------------- */

export function calculateEngagementScore(movie) {
    const voteWeight = 0.6;
    const popularityWeight = 0.4;

    const normalizedVotes = Math.min(movie.vote_average / 10, 1);
    const normalizedPopularity = Math.min(movie.popularity / 1000, 1);

    return Math.round(
        (normalizedVotes * voteWeight + normalizedPopularity * popularityWeight) * 100
    );
}

export function calculateStarPower(person) {
    const popularityScore = Math.min(person.popularity / 100, 1);
    return Math.round(popularityScore * 100);
}