import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {useNavigate} from "react-router-dom";

export default function EditProfileModal({ open, onClose, user }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);


    async function saveChanges() {
        console.log("CLICKED SAVE");

        setLoading(true);

        try {
            // --------------------------------------
            // VALIDATION CHECKS
            // --------------------------------------
            console.log("Checking validation…");
            console.log("email:", email);
            console.log("confirmEmail:", confirmEmail);
            console.log("password:", password);
            console.log("confirmPassword:", confirmPassword);

            // --------------------------------------
// EMAIL VALIDATION — ONLY IF USER ENTERED A NEW EMAIL
// --------------------------------------
            if (email.trim() !== "" || confirmEmail.trim() !== "") {
                // User typed something → full email confirmation required
                if (!email || !confirmEmail) {
                    toast.error("Please fill in both email fields.");
                    setLoading(false);
                    return;
                }

                if (email !== confirmEmail) {
                    toast.error("Emails do not match.");
                    setLoading(false);
                    return;
                }
            }

            if (password && !confirmPassword) {
                toast.error("Please confirm your new password.");
                setLoading(false);
                return;
            }

            if (password && password !== confirmPassword) {
                toast.error("Passwords do not match.");
                setLoading(false);
                return;
            }

            // --------------------------------------
            // UPDATE USERNAME
            // --------------------------------------
            console.log("Updating username…");

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ username: username })
                .eq('id', user.id);

            if (profileError) {
                console.error(profileError);
                toast.error("Failed to update username.");
                setLoading(false);
                return;
            }

            await supabase.auth.updateUser({
                data: {name: username}
            });

            // --------------------------------------
            // UPDATE EMAIL
            // --------------------------------------
            if (email.trim() !== "" && email.trim() !== user.email) {
                console.log("Updating email…");

                const { error: emailError } = await supabase.auth.updateUser(
                    { email },
                    { emailRedirectTo: "http://localhost:5173/profile" }
                );

                if (emailError) {
                    console.error(emailError);
                    toast.error(emailError.message);
                    setLoading(false);
                    return;
                }

                toast.info("A confirmation email has been sent to your new address.");
            }


            // --------------------------------------
            // UPDATE PASSWORD
            // --------------------------------------
            if (password) {
                console.log("Updating password…");

                const { error: passError } = await supabase.auth.updateUser({ password });

                if (passError) {
                    console.error(passError);
                    toast.error(passError.message);
                    setLoading(false);
                    return;
                }
            }

            // --------------------------------------
            // SUCCESS
            // --------------------------------------
            toast.success("Profile updated successfully!");
            console.log("Profile updated!");

            // Close modal
            onClose();

            // Refresh ONLY the Profile page
            setTimeout(() => {
                navigate(`/profile?updated=${Date.now()}`, { replace: true });
            }, 300);



        } catch (err) {
            console.error("Unexpected error:", err);
            toast.error("Unexpected error occurred.");
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-background border border-border rounded-xl">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">

                    {/* USERNAME */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <input
                            className="w-full p-2 rounded-md bg-card border border-border"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* EMAIL */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Email</label>
                        <input
                            type="email"
                            className="w-full p-2 rounded-md bg-card border border-border"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label className="text-sm font-medium">Confirm New Email</label>
                        <input
                            type="email"
                            className="w-full p-2 rounded-md bg-card border border-border"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <input
                            type="password"
                            placeholder="Leave empty to keep your current password"
                            className="w-full p-2 rounded-md bg-card border border-border"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <label className="text-sm font-medium">Confirm New Password</label>
                        <input
                            type="password"
                            className="w-full p-2 rounded-md bg-card border border-border"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={saveChanges}
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/80 transition"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full mt-2 bg-white/10 text-white py-2 rounded-md border border-white/20 hover:bg-white/20 transition"
                    >
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}