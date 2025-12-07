import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
    "relative w-full rounded-md border p-4 shadow-md flex gap-3 items-start",
    {
        variants: {
            variant: {
                default: "bg-card border-border text-foreground",
                destructive: "bg-red-900/40 border-red-500 text-red-200",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export function Toast({ title, description, variant = "default" }) {
    return (
        <div className={cn(toastVariants({ variant }))}>
            <div className="flex-1">
                <div className="font-semibold">{title}</div>
                {description && (
                    <div className="text-sm opacity-90">{description}</div>
                )}
            </div>
        </div>
    );
}