import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppWrapper from "./AppWrapper";
import { AuthProvider } from "./contexts/AuthContext";
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AppWrapper />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);