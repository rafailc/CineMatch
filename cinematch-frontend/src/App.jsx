import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import Navigation from "./components/Navigation";
import SearchPage from "./pages/SearchPage";
import MovieDetailsPage from "./pages/MovieDetails";
import PersonDetailsPage from "./pages/PersonDetails";
import TvDetailPage from "./pages/TvDetails";
import AboutUsPage from "./pages/About";
import QuizPage from "@/pages/QuizPage.jsx";
import FavoritesPage from "./pages/FavoritesPage";

export default function App() {
    const location = useLocation();

    const hideNavbarRoutes = ["/login"];
    const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);



    return (
        <>
            {!shouldHideNavbar && <Navigation />}

            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/search"
                    element={
                        <ProtectedRoute>
                            <SearchPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/movie/:id"
                    element={
                        <ProtectedRoute>
                            <MovieDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/series/:id"
                    element={
                        <ProtectedRoute>
                            <TvDetailPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/person/:id"
                    element={
                        <ProtectedRoute>
                            <PersonDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/about"
                    element={
                        <ProtectedRoute>
                            <AboutUsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/quiz"
                    element={
                        <ProtectedRoute>
                            <QuizPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/favorites"
                    element={
                        <ProtectedRoute>
                            <FavoritesPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}