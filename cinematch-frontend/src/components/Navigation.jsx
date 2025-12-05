import { Film, Search, Brain, Sparkles, MessageSquare, LogOut } from "lucide-react";
import NavLink from "../components/NavLink.jsx";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";


export default function Navigation() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await signOut();
        navigate("/login");
    }

    const navItems = [
        { path: "/", Icon: Film, label: "Home" },
        { path: "/search", Icon: Search, label: "Search" },
        { path: "/quiz", Icon: Brain, label: "Quiz" },
        { path: "/actor-match", Icon: Sparkles, label: "Actor Match" },
        { path: "/reviews", Icon: MessageSquare, label: "Reviews" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="w-full px-4">
                <div className="relative flex items-center h-16 justify-center">

                    {/* LEFT — Logo */}
                    <div className="absolute left-0 flex items-center gap-2">
                        <NavLink to="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <Film className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        CineMatch
                    </span>
                        </NavLink>
                    </div>

                    {/* CENTER — Nav links */}
                    <div className="flex items-center gap-1">
                        {navItems.map(({ path, Icon, label }) => (
                            <NavLink
                                key={path}
                                to={path}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden md:inline">{label}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* DEJIA / LOGOUT BUTTON  */}
                    <div className="absolute right-0 flex items-center">
                        <button
                            onClick={() => navigate("/favorites")}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 mr-2"
                        >
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="hidden sm:inline">Favorites</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
}