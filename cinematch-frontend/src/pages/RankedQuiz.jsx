import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function RankedQuiz() {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const startTimeRef = useRef(null);
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;

        loadQuiz();
    }, []);

    async function loadQuiz() {
        try {
            const res = await fetch("http://localhost:8080/api/quiz/ranked");
            const data = await res.json();
            setQuestions(data);
            startTimeRef.current = Date.now();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function selectAnswer(i) {
        setAnswers(prev => ({ ...prev, [current]: i }));
    }

    async function submitQuiz() {
        if (submitting) return;
        setSubmitting(true);

        try {
            const timeTakenSeconds = Math.floor(
                (Date.now() - startTimeRef.current) / 1000
            );

            let correct = 0;
            let wrong = 0;

            questions.forEach((q, i) => {
                if (answers[i] === q.correctAnswerIndex) correct++;
                else wrong++;
            });

            const scoreRes = await fetch(
                "http://localhost:8080/api/quiz/ranked/score",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ correct, wrong, timeTakenSeconds })
                }
            );

            const score = await scoreRes.json();

            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from("ranked_quiz_attempts").insert({
                user_id: user.id,
                username: user.user_metadata.name,
                total_questions: questions.length,
                correct_answers: correct,
                wrong_answers: wrong,
                time_taken_seconds: timeTakenSeconds,
                score
            });


            setResult({
                correct,
                wrong,
                score,
                timeTakenSeconds
            });

            setShowResult(true);
        } finally {
            setSubmitting(false);
        }
    }


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!questions.length) {
        return <div className="min-h-screen flex items-center justify-center">Failed to load quiz.</div>;
    }

    const q = questions[current];
    if (showResult && result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="bg-card p-8 rounded-xl w-full max-w-md text-center">
                    <h2 className="text-3xl font-bold mb-6">🏆 Quiz Result</h2>

                    <div className="space-y-3 text-lg">
                        <p>✅ Correct Answers: <b>{result.correct}</b></p>
                        <p>❌ Wrong Answers: <b>{result.wrong}</b></p>
                        <p>⏱ Time Taken: <b>{result.timeTakenSeconds}s</b></p>
                        <p className="text-2xl font-bold mt-4">
                            Score: {result.score}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/quiz/ranked")}
                        className="mt-8 w-full py-3 bg-primary text-white rounded-lg"
                    >
                        Back to Ranked home page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-full max-w-2xl bg-card p-6 rounded-xl">
                <p className="mb-2 text-sm">Question {current + 1}/{questions.length}</p>
                <h2 className="text-xl font-bold mb-4">{q.questionText}</h2>

                {q.options.map((o, i) => (
                    <button
                        key={i}
                        onClick={() => selectAnswer(i)}
                        className={`block w-full text-left p-3 mb-2 rounded-lg border
                            ${answers[current] === i ? "bg-primary text-white" : ""}
                        `}
                    >
                        {o}
                    </button>
                ))}

                <div className="flex justify-between mt-6">

                    {current < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrent(c => c + 1)}
                            className="px-4 py-2 bg-primary text-white rounded-lg"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={submitQuiz}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg"
                        >
                            Submit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
