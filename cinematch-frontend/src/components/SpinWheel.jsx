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
 */import { useEffect, useMemo, useRef, useState } from "react";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

function degToRad(deg) {
    return (deg * Math.PI) / 180;
}

function getWinnerIndex(finalDeg, n) {
    if (n <= 0) return -1;
    const slice = 360 / n;
    const normalized = ((360 - (finalDeg % 360)) + 360) % 360;
    return Math.floor(normalized / slice);
}

function wedgeClipPath(startDeg, endDeg) {
    const a1 = degToRad(startDeg - 90);
    const a2 = degToRad(endDeg - 90);

    const x1 = 50 + 50 * Math.cos(a1);
    const y1 = 50 + 50 * Math.sin(a1);
    const x2 = 50 + 50 * Math.cos(a2);
    const y2 = 50 + 50 * Math.sin(a2);

    return `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`;
}

export default function SpinWheel({
                                      open,
                                      onClose,
                                      items = [],
                                      onPick,
                                      title = "Wheel of Fortune",
                                      maxItems = 12,
                                      goLabel = "Go",
                                  }) {
    const data = useMemo(() => (items || []).slice(0, maxItems), [items, maxItems]);
    const n = data.length;

    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [winner, setWinner] = useState(null);

    const wheelRef = useRef(null);
    const slice = useMemo(() => (n > 0 ? 360 / n : 360), [n]);

    useEffect(() => {
        if (!open) {
            setSpinning(false);
            setWinner(null);
            setRotation(0);
        }
    }, [open]);

    const spin = () => {
        if (spinning || n === 0) return;

        setWinner(null);
        setSpinning(true);

        const extraSpins = 6 + Math.floor(Math.random() * 5);
        const randomOffset = Math.random() * 360;
        const target = rotation + extraSpins * 360 + randomOffset;

        setRotation(target);

        const onEnd = () => {
            const idx = getWinnerIndex(target, n);
            const picked = idx >= 0 ? data[idx] : null;
            setWinner(picked);
            setSpinning(false);
        };

        if (wheelRef.current) {
            const el = wheelRef.current;
            const handler = () => {
                el.removeEventListener("transitionend", handler);
                onEnd();
            };
            el.addEventListener("transitionend", handler);
        } else {
            setTimeout(onEnd, 4200);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-3xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="font-bold text-xl">{title}</div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
                    >
                        Close
                    </button>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Wheel */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-[320px] h-[320px] md:w-[360px] md:h-[360px]">
                            <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 z-30">
                                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[22px] border-b-white drop-shadow" />
                            </div>

                            <div
                                ref={wheelRef}
                                className="absolute inset-0 rounded-full overflow-hidden border border-white/10 shadow-xl"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: spinning
                                        ? "transform 4.2s cubic-bezier(0.12, 0.8, 0.18, 1)"
                                        : "none",
                                    background: "rgba(255,255,255,0.04)",
                                }}
                            >
                                {data.map((x, i) => {
                                    const start = i * slice;
                                    const end = (i + 1) * slice;
                                    const poster = x.poster_path ? `${TMDB_IMG}${x.poster_path}` : null;

                                    return (
                                        <div
                                            key={x.id ?? i}
                                            className="absolute inset-0"
                                            style={{
                                                clipPath: wedgeClipPath(start, end),
                                                backgroundImage: poster ? `url(${poster})` : "none",
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                filter: "brightness(0.9) contrast(1.05)",
                                            }}
                                            title={x.title || x.name}
                                        >
                                            <div
                                                className="absolute inset-0"
                                                style={{
                                                    background:
                                                        "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.05))",
                                                }}
                                            />
                                        </div>
                                    );
                                })}

                                <div className="absolute left-1/2 top-1/2 w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 border border-white/10 shadow-lg" />
                            </div>
                        </div>

                        <button
                            onClick={spin}
                            disabled={spinning || n === 0}
                            className={`mt-5 px-6 py-2 rounded-lg font-bold border
                ${
                                spinning || n === 0
                                    ? "bg-white/5 text-white/40 border-white/10 cursor-not-allowed"
                                    : "bg-primary text-white border-primary hover:bg-primary/80"
                            }`}
                        >
                            {spinning ? "Spinning…" : "SPIN"}
                        </button>

                        {winner && (
                            <div className="mt-4 text-center">
                                <div className="text-sm text-muted-foreground">Winner</div>
                                <div className="text-lg font-bold">{winner.title || winner.name}</div>

                                <div className="mt-3 flex gap-2 justify-center">
                                    <button
                                        onClick={() => onPick?.(winner)}
                                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
                                    >
                                        {goLabel}
                                    </button>
                                    <button
                                        onClick={spin}
                                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10"
                                    >
                                        Spin again
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List */}
                    <div className="bg-card border border-border rounded-xl p-4">
                        <div className="font-semibold mb-3">Items in the wheel</div>

                        {n === 0 ? (
                            <div className="text-muted-foreground">No items available.</div>
                        ) : (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                                {data.map((x) => (
                                    <div key={x.id} className="flex items-center justify-between gap-3 text-sm">
                                        <div className="truncate">{x.title || x.name}</div>
                                        <div className="text-muted-foreground">
                                            {(x.release_date || x.first_air_date)
                                                ? String(x.release_date || x.first_air_date).slice(0, 4)
                                                : ""}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-3">
                            Tip: it uses up to {maxItems} items.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}