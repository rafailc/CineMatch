import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );

    if (!user) return <Navigate to="/login" replace />;

    return children;
}