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
 */import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function NormalQuiz() {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Move this outside

    // ==============================
    // 1. Fetch PERSONALIZED Quiz
    // ==============================
    useEffect(() => {
        const fetchQuiz = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {

                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:8080/api/quiz/personalized/${user.id}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch quiz");
                }

                const data = await response.json();
                // 🔀 Shuffle questions
                const shuffled = [...data].sort(() => Math.random() - 0.5);
                setQuestions(shuffled);
                setCurrentQuestionIndex(0);
            } catch (error) {
                console.error(error);

            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, []);

    // ==============================
    // 2. Handle Answer Selection
    // ==============================
    const handleAnswerChange = (questionIndex, optionIndex) => {
        setUserAnswers({
            ...userAnswers,
            [questionIndex]: optionIndex,
        });
    };

    // ==============================
    // 3. Submit Quiz
    // ==============================
    const handleSubmit = () => {
        if (Object.keys(userAnswers).length < questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }

        let calculatedScore = 0;

        questions.forEach((q, index) => {
            if (userAnswers[index] === q.correctAnswerIndex) {
                calculatedScore++;
            }
        });

        setScore(calculatedScore);
    };

    // ==============================
    // 4. UI STATES
    // ==============================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading your personalized quiz… 🎬</p>
            </div>
        );
    }
    if (!questions.length) {
        return null;
    }


    const getFeedbackMessage = (score, total) => {
        const percentage = (score / total) * 100;

        if (percentage >= 80) return "Excellent job! 🎉";
        if (percentage >= 50) return "Good job 🙂";
        return "You can do better 💪";
    };

    // ==============================
    // Display result if score is not null
    // ==============================
    if (score !== null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Quiz Result 🎬</h1>

                    <p className="text-2xl font-semibold mb-2">
                        {score} / {questions.length}
                    </p>

                    <p className="text-lg mb-6">
                        {getFeedbackMessage(score, questions.length)}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ==============================
    // 5. QUIZ UI - Single Question UI with navigation
    // ==============================
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">🎬 Personalized Cinema Quiz</h1>

            {/* Progress */}
            <p className="mb-4 text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
            </p>

            {/* Question */}
            <div className="mb-6">
                <h2 className="font-semibold mb-2">{currentQuestion.questionText}</h2>

                {currentQuestion.options.map((option, optIndex) => (
                    <label key={optIndex} className="block mb-1">
                        <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            checked={userAnswers[currentQuestionIndex] === optIndex}
                            onChange={() =>
                                handleAnswerChange(currentQuestionIndex, optIndex)
                            }
                            className="mr-2"
                        />
                        {option}
                    </label>
                ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded ${
                        currentQuestionIndex === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-gray-600 text-white hover:bg-gray-700"
                    }`}
                >
                    Previous
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}