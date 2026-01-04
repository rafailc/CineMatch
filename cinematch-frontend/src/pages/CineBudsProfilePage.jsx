import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CineBudsProfilePage() {
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState([]);
    const fileRef = useRef(null);

    useEffect(() => {
        loadPhotos();
    }, []);

    async function getMe() {
        const { data: auth, error } = await supabase.auth.getUser();
        if (error) throw error;
        return auth?.user ?? null;
    }

    async function loadPhotos() {
        setLoading(true);
        try {
            const me = await getMe();
            if (!me) {
                toast.error("You must be logged in.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("profile_photos")
                .select("id, url, sort_order, created_at")
                .eq("user_id", me.id)
                .order("sort_order", { ascending: true })
                .order("created_at", { ascending: true });

            if (error) throw error;

            setPhotos(data || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load photos");
        } finally {
            setLoading(false);
        }
    }

    async function upload(e) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        try {
            const me = await getMe();
            if (!me) {
                toast.error("You must be logged in.");
                return;
            }

            const baseOrder = photos.length
                ? Math.max(...photos.map((p) => p.sort_order ?? 0)) + 1
                : 0;

            let successCount = 0;

            for (let idx = 0; idx < files.length; idx++) {
                const file = files[idx];

                const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
                const safeId =
                    (crypto?.randomUUID && crypto.randomUUID()) ||
                    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

                const path = `${me.id}/${safeId}.${ext}`;

                const { error: upErr } = await supabase.storage
                    .from("profile-photos")
                    .upload(path, file, {
                        upsert: false,
                        contentType: file.type,
                    });

                if (upErr) {
                    console.error("UPLOAD ERROR:", upErr);
                    toast.error(`Upload failed (${file.name}): ${upErr.message}`);
                    continue;
                }

                const { data: pub } = supabase.storage
                    .from("profile-photos")
                    .getPublicUrl(path);

                const url = pub?.publicUrl;
                if (!url) {
                    toast.error(`Upload ok but URL missing (${file.name})`);
                    continue;
                }

                const { error: dbErr } = await supabase.from("profile_photos").insert({
                    user_id: me.id,
                    url,
                    sort_order: baseOrder + idx,
                });

                if (dbErr) {
                    console.error("DB ERROR:", dbErr);
                    toast.error(`DB insert failed (${file.name}): ${dbErr.message}`);
                    continue;
                }

                successCount++;
            }

            if (successCount > 0) {
                toast.success(
                    `Uploaded ${successCount} photo${successCount > 1 ? "s" : ""}!`
                );
                await loadPhotos();
            }
        } catch (err) {
            console.error("UPLOAD CRASH:", err);
            toast.error(`Upload crashed: ${err?.message || "unknown error"}`);
        } finally {
            e.target.value = "";
        }
    }

    async function removePhoto(photoId, url) {
        const ok = confirm("Delete this photo?");
        if (!ok) return;

        try {
            const marker = "/profile-photos/";
            const i = url.indexOf(marker);
            if (i !== -1) {
                const path = url.slice(i + marker.length);
                await supabase.storage.from("profile-photos").remove([path]);
            }
        } catch (e) {
            console.warn("Storage delete failed:", e);
        }

        const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);
        if (error) {
            console.error(error);
            toast.error("Failed to delete photo");
            return;
        }

        toast.success("Photo deleted");
        await loadPhotos();
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground pt-24 px-6">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 px-6 pb-20">
            <h1 className="text-3xl font-bold mb-6">Tinder Profile</h1>

            <div className="max-w-2xl">
                {/* Reliable open-file button */}
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-block px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/80"
                >
                    Upload Photos
                </button>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={upload}
                    style={{ display: "none" }}
                />

                <p className="text-sm text-muted-foreground mt-2">
                    Tip: use Ctrl (Windows) / ⌘ (Mac) or Shift to select multiple photos.
                </p>

                {photos.length === 0 ? (
                    <div className="mt-6 text-muted-foreground">No photos yet.</div>
                ) : (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {photos.map((p) => (
                            <div
                                key={p.id}
                                className="rounded-xl overflow-hidden border border-border bg-card"
                            >
                                <img src={p.url} alt="profile" className="w-full h-48 object-cover" />
                                <button
                                    onClick={() => removePhoto(p.id, p.url)}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 transition text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
