import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { difficulty = 'medium' } = await req.json();

        const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
        const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

        if (!TMDB_API_KEY) {
            throw new Error('TMDB_API_KEY not configured');
        }

        if (!HF_TOKEN) {
            throw new Error('HUGGING_FACE_ACCESS_TOKEN not configured');
        }

        // Fetch popular movies from TMDb
        const moviesResponse = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );

        if (!moviesResponse.ok) {
            throw new Error('Failed to fetch movies from TMDb');
        }

        const moviesData = await moviesResponse.json();
        const movies = moviesData.results.slice(0, 20);

        // Generate quiz questions based on real movie data
        const questions = generateQuestionsFromMovies(movies, difficulty);

        return new Response(
            JSON.stringify({ questions }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Quiz generation error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
});

function generateQuestionsFromMovies(movies, difficulty) {
    const questions = [];
    const shuffledMovies = [...movies].sort(() => Math.random() - 0.5);

    // Question type generators
    const questionGenerators = [
        generateReleaseYearQuestion,
        generateRatingQuestion,
        generateOverviewQuestion,
        generatePopularityQuestion,
        generateTitleQuestion,
    ];

    for (let i = 0; i < 5; i++) {
        const generator = questionGenerators[i % questionGenerators.length];
        const movie = shuffledMovies[i];
        const otherMovies = shuffledMovies.filter((_, idx) => idx !== i).slice(0, 3);

        const question = generator(movie, otherMovies, difficulty);
        if (question) {
            questions.push(question);
        }
    }

    // Fill with fallback if needed
    while (questions.length < 5) {
        questions.push({
            question: "What is the highest-grossing film of all time (not adjusted for inflation)?",
            options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars: The Force Awakens"],
            correct_answer: "Avatar"
        });
    }

    return questions.slice(0, 5);
}

function generateReleaseYearQuestion(movie, otherMovies, difficulty) {
    const correctYear = new Date(movie.release_date).getFullYear();
    const wrongYears = generateWrongYears(correctYear, difficulty);

    const options = [correctYear.toString(), ...wrongYears].sort(() => Math.random() - 0.5);

    return {
        question: `In what year was "${movie.title}" released?`,
        options,
        correct_answer: correctYear.toString()
    };
}

function generateRatingQuestion(movie, otherMovies, difficulty) {
    const correctRating = Math.round(movie.vote_average * 10) / 10;
    const wrongRatings = generateWrongRatings(correctRating, difficulty);

    const options = [correctRating.toFixed(1), ...wrongRatings].sort(() => Math.random() - 0.5);

    return {
        question: `What is the TMDb rating for "${movie.title}"?`,
        options,
        correct_answer: correctRating.toFixed(1)
    };
}

function generateOverviewQuestion(movie, otherMovies, difficulty) {
    const shortOverview = movie.overview.split('.')[0] + '...';
    const options = [
        movie.title,
        ...otherMovies.slice(0, 3).map(m => m.title)
    ].sort(() => Math.random() - 0.5);

    return {
        question: `Which movie has this plot: "${shortOverview}"`,
        options,
        correct_answer: movie.title
    };
}

function generatePopularityQuestion(movie, otherMovies, difficulty) {
    const allMovies = [movie, ...otherMovies.slice(0, 3)];
    const sortedByPopularity = [...allMovies].sort((a, b) => b.popularity - a.popularity);
    const mostPopular = sortedByPopularity[0];

    const options = allMovies.map(m => m.title).sort(() => Math.random() - 0.5);

    return {
        question: "Which of these movies is currently the most popular on TMDb?",
        options,
        correct_answer: mostPopular.title
    };
}

function generateTitleQuestion(movie, otherMovies, difficulty) {
    const year = new Date(movie.release_date).getFullYear();
    const options = [
        movie.title,
        ...otherMovies.slice(0, 3).map(m => m.title)
    ].sort(() => Math.random() - 0.5);

    return {
        question: `Which of these movies was released in ${year}?`,
        options,
        correct_answer: movie.title
    };
}

function generateWrongYears(correctYear, difficulty) {
    const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 5 : 2;
    const wrongYears = new Set();

    while (wrongYears.size < 3) {
        const offset = Math.floor(Math.random() * range * 2) - range;
        if (offset !== 0) {
            wrongYears.add((correctYear + offset).toString());
        }
    }

    return Array.from(wrongYears);
}

function generateWrongRatings(correctRating, difficulty) {
    const range = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 1 : 0.5;
    const wrongRatings = new Set();

    while (wrongRatings.size < 3) {
        const offset = (Math.random() * range * 2 - range);
        const newRating = Math.max(1, Math.min(10, correctRating + offset));
        if (Math.abs(offset) > 0.1) {
            wrongRatings.add(newRating.toFixed(1));
        }
    }

    return Array.from(wrongRatings);
}