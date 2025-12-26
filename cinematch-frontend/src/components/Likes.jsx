import { Heart } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useState } from "react";

export default function Likes({ postId, initialLiked, initialCount, onChange }) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount || 0);

    async function toggleLike() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let newCount = count;

        if (liked) {
            await supabase.from("media_likes").delete()
                .eq("post_id", postId)
                .eq("user_id", user.id);
            newCount--;
        } else {
            await supabase.from("media_likes").insert({
                post_id: postId,
                user_id: user.id
            });
            newCount++;
        }

        setLiked(!liked);
        setCount(newCount);
        onChange?.(newCount, !liked);
    }

    return (
        <button onClick={toggleLike} className="flex items-center gap-1">
            <Heart className={`w-7 h-7 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
            <span className="text-sm">{count}</span>
        </button>
    );
}