// src/pages/Quiz.jsx
import { useNavigate } from "react-router-dom";
import { Brain, Trophy } from "lucide-react";

export default function Quiz() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full space-y-6 text-center">

                <h1 className="text-3xl font-bold">Choose Quiz Mode</h1>
                <p className="text-muted-foreground">
                    Play casually or compete in ranked mode
                </p>

                {/* Buttons */}
                <div className="grid gap-4 mt-8">

                    {/* Normal Quiz */}
                    <button
                        onClick={() => navigate("/quiz/normal")}
                        className="
              flex items-center justify-center gap-3
              w-full py-4 rounded-xl
              bg-primary text-white
              hover:opacity-90 transition
              text-lg font-semibold
            "
                    >
                        <Brain className="w-6 h-6" />
                        Normal Quiz
                    </button>

                    {/* Ranked Quiz */}
                    <button
                        onClick={() => navigate("/quiz/ranked")}
                        className="
              flex items-center justify-center gap-3
              w-full py-4 rounded-xl
              bg-yellow-500 text-black
              hover:bg-yellow-400 transition
              text-lg font-semibold
            "
                    >
                        <Trophy className="w-6 h-6" />
                        Ranked Quiz
                    </button>

                </div>
            </div>
        </div>
    );
}
