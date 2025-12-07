import * as React from "react";
import { Toast } from "./toast";

const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = React.useState([]);

    const toast = ({ title, description, variant }) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, title, description, variant }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
                {toasts.map((t) => (
                    <Toast key={t.id} {...t} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}