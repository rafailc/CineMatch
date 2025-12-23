import React, { useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { X, Camera, Upload, Loader2, Check } from "lucide-react";

// 10 Movie-Themed Presets
const AVATAR_PRESETS = [
    "https://plus.unsplash.com/premium_photo-1723867528308-539f3936c339?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Film Reel
    "https://plus.unsplash.com/premium_photo-1676049461949-185dcea09d77?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Popcorn
    "https://plus.unsplash.com/premium_photo-1682125771198-f7cbed7cb868?q=80&w=2660&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Clapperboard
    "https://images.unsplash.com/photo-1621939938486-7a21d605c2d9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RGlyZWN0b3IlMjBDaGFpcnxlbnwwfHwwfHx8MA%3D%3D", // Director Chair
    "https://images.unsplash.com/photo-1604257206125-c0d204cb1493?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8M0QlMjBHbGFzc2VzfGVufDB8fDB8fHww",  // 3D Glasses
    "https://images.unsplash.com/photo-1648538836903-aa4e9ea103ac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8T3NjYXJ8ZW58MHx8MHx8fDA%3D",  // Oscar
    "https://plus.unsplash.com/premium_photo-1677354136477-6c9f75f65038?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TWFza3xlbnwwfHwwfHx8MA%3D%3D", // Hero Mask
    "https://plus.unsplash.com/premium_photo-1733266836449-b99737759127?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8QWxpZW4lMkZTY2lGaXxlbnwwfHwwfHx8MA%3D%3D", // Alien/SciFi
    "https://plus.unsplash.com/premium_photo-1719818038803-e970c3e1e368?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Q293Ym95fGVufDB8fDB8fHww", // Cowboy
    "https://plus.unsplash.com/premium_photo-1694199668273-4e8a4a501737?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8SG9ycm9yfGVufDB8fDB8fHww"  // Horror Mask
];

export default function EditProfileModal({ open, onClose, user, onUpdate }) {
    if (!open) return null;

    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || "");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Handle Custom File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `avatars/${user.id}_${Date.now()}.${fileExt}`;

            // Upload to Supabase 'media' bucket
            const { error: uploadError } = await supabase.storage
                .from('media')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(fileName);

            setSelectedAvatar(publicUrl);
        } catch (error) {
            alert("Error uploading image: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    // Save Changes to Database
    const handleSave = async () => {
        setUploading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    avatar_url: selectedAvatar
                })
                .eq('id', user.id);

            if (error) throw error;

            onUpdate(); // Trigger refresh in parent
            onClose();
        } catch (error) {
            console.error(error);
            alert("Error updating profile");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="font-semibold text-lg text-white">Edit Avatar</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">


                    {/* Current Avatar Preview */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-24 h-24 rounded-full border-2 border-blue-500 overflow-hidden bg-white/5">
                            {selectedAvatar ? (
                                <img src={selectedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">No Img</div>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">Current Avatar</p>
                    </div>

                    {/* Custom Upload Button */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300">Upload Custom Image</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*"
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="w-full py-3 border border-dashed border-white/20 rounded-xl hover:bg-white/5 flex items-center justify-center gap-2 text-gray-300 transition"
                        >
                            <Upload size={18} />
                            {uploading ? "Uploading..." : "Click to Upload Photo"}
                        </button>
                    </div>

                    {/* Choose Preset */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-300">Or Choose a Movie Avatar</label>
                        <div className="grid grid-cols-5 gap-3">
                            {AVATAR_PRESETS.map((src, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedAvatar(src)}
                                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedAvatar === src ? 'border-blue-500 scale-105' : 'border-transparent hover:border-white/30'}`}
                                >
                                    <img src={src} alt={`Preset ${index}`} className="w-full h-full object-cover bg-white/10" />
                                    {selectedAvatar === src && (
                                        <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                            <Check size={16} className="text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/20">
                    <button
                        onClick={handleSave}
                        disabled={uploading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {uploading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}