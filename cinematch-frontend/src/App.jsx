import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import Navigation from "./components/Navigation";
import { testTmdb } from "./lib/test_tmdb.js";
import { useEffect } from "react";

export default function App() {
    const location = useLocation();

    const hideNavbarRoutes = ["/login"];
    const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

    useEffect(() => {
        testTmdb();
    }, []);

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

            </Routes>
        </>
    );
}