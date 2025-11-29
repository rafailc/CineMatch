import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import Navigation from "./components/Navigation";
import SearchPage from "./pages/SearchPage";


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

            </Routes>
        </>
    );
}