import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function ChatPage() {
    const { id } = useParams();
    const conversationId = Number(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [meId, setMeId] = useState(null);

    const [otherName, setOtherName] = useState("Chat");
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const bottomRef = useRef(null);

    const canSend = useMemo(() => Boolean(meId && conversationId), [meId, conversationId]);

    // keep scroll at bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    useEffect(() => {
        if (!conversationId) return;

        init();

        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    // avoid duplicates (if we also optimistically appended)
                    setMessages((prev) => {
                        if (prev.some((m) => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    async function init() {
        setLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        const me = auth?.user;
        if (!me) {
            toast.error("You must be logged in.");
            setLoading(false);
            return;
        }
        setMeId(me.id);

        // load conversation
        const { data: conv, error: convErr } = await supabase
            .from("conversations")
            .select("id, user1_id, user2_id")
            .eq("id", conversationId)
            .maybeSingle();

        if (convErr || !conv) {
            console.error(convErr);
            toast.error("Cannot open conversation");
            setLoading(false);
            return;
        }

        const otherId = conv.user1_id === me.id ? conv.user2_id : conv.user1_id;

        // load other user profile for header/name
        const { data: prof, error: profErr } = await supabase
            .from("profiles")
            .select("username, email")
            .eq("id", otherId)
            .maybeSingle();

        if (!profErr && prof) setOtherName(prof.username || prof.email || "Chat");

        await loadMessages();
        setLoading(false);
    }

    async function loadMessages() {
        const { data, error } = await supabase
            .from("messages")
            .select("id, sender_id, body, created_at")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error(error);
            toast.error("Cannot load messages");
            return;
        }

        setMessages(data || []);
    }

    async function sendMessage() {
        const body = text.trim();
        if (!body || !canSend) return;

        setText("");

        // ✅ optimistic UI message (shows instantly)
        const tempId = `temp-${Date.now()}`;
        const optimistic = {
            id: tempId,
            sender_id: meId,
            body,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);

        // ✅ send to DB
        const { data: inserted, error } = await supabase
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: meId,
                body,
            })
            .select("id, sender_id, body, created_at")
            .maybeSingle();

        if (error) {
            console.error(error);
            toast.error("Failed to send");

            // rollback optimistic message
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            return;
        }

        // replace temp with real DB row
        if (inserted?.id) {
            setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? inserted : m))
            );
        } else {
            // fallback: reload messages if no returned row
            await loadMessages();
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 px-6 pb-20">
            <div className="max-w-2xl mx-auto">
                {/* Header with Back button */}
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold truncate">{otherName}</h1>
                </div>

                <div className="border border-border rounded-2xl bg-card p-4">
                    <div className="h-[55vh] overflow-y-auto space-y-3">
                        {loading ? (
                            <div className="text-muted-foreground">Loading...</div>
                        ) : messages.length === 0 ? (
                            <div className="text-muted-foreground">No messages yet.</div>
                        ) : (
                            messages.map((m) => {
                                const isMe = m.sender_id === meId;
                                return (
                                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                        <div className="max-w-[80%]">
                                            <div className="text-xs text-muted-foreground mb-1">
                                                {isMe ? "You" : otherName}
                                            </div>
                                            <div
                                                className={`p-3 rounded-xl border ${
                                                    isMe
                                                        ? "bg-primary text-white border-primary/30"
                                                        : "bg-white/5 border-white/10"
                                                }`}
                                            >
                                                {m.body}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="mt-4 flex gap-2">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-background border border-border"
                            placeholder="Type a message..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 transition"
                            disabled={!canSend}
                        >
                            Send
                        </button>
                    </div>

                    {/* Optional manual refresh */}
                    <button
                        onClick={loadMessages}
                        className="mt-3 text-sm px-3 py-1 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
}
