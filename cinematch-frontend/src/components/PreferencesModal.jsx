import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: 36, name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" }
];

export default function PreferencesModal({ open, onClose, user }) {
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        if (open) loadPreferences();
    }, [open]);

    async function loadPreferences() {
        const { data } = await supabase
            .from("user_preferences")
            .select("genres")
            .eq("user_id", user?.id)
            .maybeSingle();

        setSelected(data?.genres || []);
    }

    function toggleGenre(id) {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    }

    async function savePreferences() {
        const { error } = await supabase.from("user_preferences").upsert({
            user_id: user.id,
            genres: selected
        });

        if (error) toast.error("Failed to save preferences");
        else toast.success("Preferences saved!");

        onClose();
    }
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-background border border-border rounded-xl max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle>Select Your Movie Preferences</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    {GENRES.map(genre => (
                        <div
                            key={genre.id}
                            onClick={() => toggleGenre(genre.id)}
                            className={`p-3 rounded-lg cursor-pointer text-center border transition 
                ${selected.includes(genre.id)
                                ? "bg-primary text-white border-primary"
                                : "bg-card border-border hover:bg-card/70"}`}
                        >
                            {genre.name}
                        </div>
                    ))}
                </div>

                <button
                    onClick={savePreferences}
                    className="w-full mt-5 py-2 rounded-md bg-primary text-white hover:bg-primary/80"
                >
                    Save Preferences
                </button>

                <button
                    onClick={onClose}
                    className="w-full mt-2 py-2 rounded-md bg-white/10 text-white border border-white/20 hover:bg-white/20"
                >
                    Cancel
                </button>
            </DialogContent>
        </Dialog>
    );
}