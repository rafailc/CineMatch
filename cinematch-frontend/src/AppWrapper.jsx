import { useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import App from "./App";

export default function AppWrapper() {
    const location = useLocation();

    const hideNav = location.pathname === "/login";

    return (
        <>
            {!hideNav && <Navigation />}
            <App />
        </>
    );
}