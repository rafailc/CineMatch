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
 */import * as React from "react";
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