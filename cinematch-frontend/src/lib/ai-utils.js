export function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;

    let dot = 0;
    let na = 0;
    let nb = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }

    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom ? (dot / denom + 1) / 2 : 0; // 0–1
}
