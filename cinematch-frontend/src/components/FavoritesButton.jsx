import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FavoritesButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/favorites")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-card/80 transition"
        >
            <Heart className="w-5 h-5 text-red-500" />
            <span>Favorites</span>
        </button>
    );
}
