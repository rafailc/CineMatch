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
 */"use client"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Dialog({ ...props }) {
    return <DialogPrimitive.Root {...props} />
}

export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal

export const DialogOverlay = ({ className, ...props }) => (
    <DialogPrimitive.Overlay
        className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-sm z-50",
            className
        )}
        {...props}
    />
)

export const DialogContent = ({ className, children, ...props }) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            className={cn(
                "fixed z-50 grid gap-4 p-6 bg-background border border-border rounded-xl shadow-xl",
                "top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2",
                "w-full max-w-lg animate-in fade-in-90",
                className
            )}
            {...props}
        >
            {children}

            <DialogPrimitive.Close className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition">
                <X size={20} />
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
)

export const DialogHeader = ({ className, ...props }) => (
    <div className={cn("flex flex-col space-y-1.5", className)} {...props} />
)

export const DialogTitle = ({ className, ...props }) => (
    <DialogPrimitive.Title
        className={cn("text-lg font-semibold", className)}
        {...props}
    />
)

export const DialogDescription = ({ className, ...props }) => (
    <DialogPrimitive.Description
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
)