/*
 * CineMatch
 * Copyright (C) 2025 <Make a Wish team>
 * Authors: see AUTHORS.md
 * SPDX-License-Identifier: GPL-3.0-only
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed WITHOUT ANY WARRANTY.
 * See the GNU General Public License for more details.
 *
 * If not, see <https://www.gnu.org/licenses/>.
 */import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import Navigation from "./components/Navigation";
import SearchPage from "./pages/SearchPage";
import MovieDetailsPage from "./pages/MovieDetails";
import PersonDetailsPage from "./pages/PersonDetails";
import TvDetailPage from "./pages/TvDetails";
import AboutUsPage from "./pages/About";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "@/pages/PrifilePage.jsx";
import Quiz from "./pages/Quiz";
import NormalQuiz from "./pages/NormalQuiz";
import RankedQuiz from "./pages/RankedQuiz";
import RankedStart from "./pages/RankedStart";
import ActorMatchPage from "./pages/ActorMatch";
import MediaPage from "@/pages/MediaPage.jsx";
import SuggestPage from "./pages/SuggestPage";

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
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
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

                <Route
                    path="/actor-match"
                    element={
                        <ProtectedRoute>
                            <ActorMatchPage />
                        </ProtectedRoute>
                    }

                />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz/normal" element={<NormalQuiz />} />
                <Route path="/quiz/ranked" element={<RankedStart />} />
                <Route path="/quiz/ranked/play" element={<RankedQuiz />} />

                <Route
                    path="/CineGram"
                    element={
                        <ProtectedRoute>
                            <MediaPage />
                        </ProtectedRoute>
                    }

                />
                <Route
                    path="/suggest"
                    element={
                        <ProtectedRoute>
                            <SuggestPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}
