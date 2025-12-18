import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../lib/supabase";
import {
    Heart, MessageCircle, Send, Bookmark, MoreHorizontal,
    PlusCircle, Clapperboard, Plus, X, Camera,
    Image as ImageIcon, Loader2, RefreshCcw, Check
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

const STORIES = [
    { id: 'me', username: 'Your Story', img: '', isUser: true },
    { id: 1, username: 'story1', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
    { id: 2, username: 'story2', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
    { id: 3, username: 'story3', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 4, username: 'story4', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
    { id: 5, username: 'story5', img: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150' },
];

export default function MediaPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false); //Tracks if camera is open
    const [newCaption, setNewCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [facingMode, setFacingMode] = useState('environment'); //user = selfie, environment = back camera
    const [movieTitle, setMovieTitle] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [tmdbId, setTmdbId] = useState(null);
    const [tmdbType, setTmdbType] = useState(null);
    const [cameraMode, setCameraMode] = useState('photo');
    const [isRecording, setIsRecording] = useState(false);
    const API_BASE = "http://localhost:8080/api/tmdb";

    // Refs
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    // Cleanup camera when component unmounts or modal closes
    useEffect(() => {
        return () => stopCamera();
    }, []);

    async function fetchPosts() {
        try {
            const { data, error } = await supabase
                .from('media_posts')
                .select(`*, profiles ( username,avatar_url )`)

                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                const formattedData = data.map(post => ({
                    ...post,
                    username: post.profiles?.username || 'Unknown',
                    liked: false,
                    user_img: post.profiles.avatar_url || 'https://via.placeholder.com/150'
                }));
                setPosts(formattedData);
            }
        } catch (error) {
            console.error("Error fetching posts:", error.message);
        } finally {
            setLoading(false);
        }
    }

    // --- Camera LOGIC ---
    const startCamera = async (mode = 'environment') => {

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }


        await new Promise(resolve => setTimeout(resolve, 200));

        setIsCameraActive(true);
        setFacingMode(mode);

        try {

            // Updated constraints to include Audio
            const constraints = {
                video: { facingMode: mode === 'environment' ? { exact: mode } : mode },
                audio: true
            };

            let stream;


            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (err) {
                console.log("Audio mode failed, trying video only...", err);
                // Fallback: Try again without audio
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: mode }
                });
            }

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            if (err.name !== 'NotAllowedError' && err.name !== 'NotFoundError') {
                alert("Could not start camera. Please check permissions.");
            }
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
        setIsRecording(false);
    };

    const switchCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        startCamera(newMode);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');

            // Mirror image when using selfie camera
            if (facingMode === 'user') {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                stopCamera();
            }, 'image/jpeg');
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;

        chunksRef.current = [];
        // Use vp9 or default codecs
        const options = MediaRecorder.isTypeSupported('video/webm; codecs=vp9')
            ? { mimeType: 'video/webm; codecs=vp9' }
            : { mimeType: 'video/webm' };

        try {
            const recorder = new MediaRecorder(streamRef.current, options);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const file = new File([blob], "camera-video.webm", { type: 'video/webm' });
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                stopCamera();
            };

            recorder.start();
            setIsRecording(true);
            mediaRecorderRef.current = recorder;
        } catch (err) {
            console.error("Failed to start MediaRecorder", err);
            alert("Video recording not supported on this device.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleShutter = () => {
        if (cameraMode === 'photo') {
            capturePhoto();
        } else {
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        }
    };

    // --- STANDARD FILE PICKER ---
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- UPLOAD LOGIC ---
    async function handleCreatePost(e) {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please select a photo or video first.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('media')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('media')
                .getPublicUrl(fileName);

            const { error: dbError } = await supabase
                .from('media_posts')
                .insert({
                    user_id: user.id,
                    media_url: publicUrl,
                    caption: newCaption,
                    username: "temp",
                    media_type: selectedFile.type.startsWith('video') ? 'video' : 'image',
                    movie_title: movieTitle,
                    tmdb_id: tmdbId,
                    tmdb_type: tmdbType
                });

            if (dbError) throw dbError;

            setIsCreateOpen(false);
            setNewCaption("");
            setSelectedFile(null);
            setPreviewUrl(null);
            fetchPosts();

        } catch (error) {
            console.error("Error creating post:", error.message);
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    // --- UI HELPERS ---
    const formatTimeAgo = (dateString) => { /* ... existing helper ... */
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now - past) / 1000);
        if (diffInSeconds < 60) return `${diffInSeconds}s`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d`;
    };

    const toggleLike = (postId) => { /* ... existing helper ... */
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    liked: !post.liked,
                    likes_count: post.liked ? (post.likes_count || 0) - 1 : (post.likes_count || 0) + 1
                };
            }
            return post;
        }));
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            // Only search if user typed at least 3 chars
            if (movieTitle.length > 2 && showSuggestions) {
                try {

                    const response = await fetch(`${API_BASE}/search/movies?q=${encodeURIComponent(movieTitle)}`);
                    const data = await response.json();


                    if (data.results) {
                        setSuggestions(data.results.slice(0, 5)); // Limit to top 5
                    }
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSuggestions([]);
            }
        }, 500); // Wait 500ms after typing stops

        return () => clearTimeout(delayDebounceFn);
    }, [movieTitle, showSuggestions]);

    return (
        <div className="min-h-screen bg-background text-foreground pt-20 relative">
            <main className="container max-w-xl mx-auto px-0 md:px-4 py-6">

                {/* --- STORIES --- */}
                <section className="mb-8 px-4 md:px-0">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {STORIES.map((story) => (
                            <div key={story.id} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
                                <div className={`p-[3px] rounded-full ${story.isUser ? '' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'}`}>
                                    <div className="p-[2px] bg-background rounded-full relative">
                                        <img src={story.img} alt={story.username} className="w-16 h-16 rounded-full object-cover group-hover:scale-95 transition-transform duration-200" />
                                        {story.isUser && (
                                            <div onClick={() => setIsCreateOpen(true)} className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-0.5 border-2 border-background cursor-pointer hover:bg-blue-600">
                                                <PlusCircle size={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground truncate w-full text-center">{story.username}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- FEED --- */}
                <section className="flex flex-col gap-6">
                    {loading && <div className="text-center py-10 text-muted-foreground">Loading posts...</div>}

                    {!loading && posts.map((post) => (
                        <article key={post.id} className="bg-background md:border border-white/10 md:rounded-xl overflow-hidden mb-4">
                            {/* --- HEADER --- */}
                            <div className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <img
                                        src={post.user_img}
                                        alt={post.username}
                                        className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                                    />

                                    {/* Text Container  */}
                                    <div className="flex flex-col">
                                        {/* 1. Username */}
                                        <span className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer leading-tight">
                                            {post.username}
                                        </span>

                                        {/* Movie Title */}
                                        {post.movie_title && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const type = post.tmdb_type === 'series' ? 'series' : 'movie';
                                                    navigate(`/${type}/${post.tmdb_id}`);
                                                }}
                                                className="text-xs text-blue-400 hover:text-blue-300 hover:underline text-left font-medium"
                                            >
                                                {post.movie_title}
                                            </button>
                                        )}

                                    </div>
                                </div>
                                <MoreHorizontal className="w-5 h-5 text-muted-foreground cursor-pointer" />
                            </div>

                            <div className="relative w-full bg-muted/20">
                                {post.media_type === 'video' ? (
                                    <video src={post.media_url} controls className="w-full h-auto object-cover" />
                                ) : (
                                    <img src={post.media_url} alt="Post content" className="w-full h-auto object-cover" />
                                )}
                            </div>

                            <div className="p-3">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex gap-4">
                                        <button onClick={() => toggleLike(post.id)}>
                                            <Heart className={`w-7 h-7 transition-colors ${post.liked ? 'fill-red-500 text-red-500' : 'text-foreground hover:text-muted-foreground'}`} />
                                        </button>
                                        <MessageCircle className="w-7 h-7 cursor-pointer hover:text-muted-foreground" />

                                    </div>

                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-sm">{(post.likes_count || 0).toLocaleString()} likes</p>
                                    <div className="text-sm">
                                        <span className="font-semibold mr-2">{post.username}</span>
                                        <span className="text-gray-300">{post.caption}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide pt-1">{formatTimeAgo(post.created_at)} AGO</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            </main>

            {/* --- FAB --- */}
            <button
                onClick={() => setIsCreateOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-500 transition-all z-40 hover:scale-110 active:scale-95"
            >
                <Plus className="w-8 h-8" />
            </button>

            {/* --- MODAL --- */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">

                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="font-semibold text-lg">{isCameraActive ? 'New Post' : 'Create new post'}</h2>
                            <button
                                onClick={() => {
                                    stopCamera();
                                    setIsCreateOpen(false);
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                                className="text-gray-400 hover:text-white p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Hidden Inputs/Canvas */}
                            <input
                                type="file" accept="image/*,video/*"
                                ref={fileInputRef} onChange={handleFileChange}
                                className="hidden"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* --- CAMERA VIEW --- */}
                            {isCameraActive ? (
                                <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted={true}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-4">

                                        {/* 1. Mode Switcher (Photo/Video) */}
                                        <div className="flex bg-black/50 rounded-full p-1 backdrop-blur-sm">
                                            <button
                                                onClick={() => setCameraMode('photo')}
                                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${cameraMode === 'photo' ? 'bg-white text-black' : 'text-gray-300'}`}
                                            >
                                                Photo
                                            </button>
                                            <button
                                                onClick={() => setCameraMode('video')}
                                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${cameraMode === 'video' ? 'bg-white text-black' : 'text-gray-300'}`}
                                            >
                                                Video
                                            </button>
                                        </div>

                                        <div className="flex w-full justify-between items-center px-4">
                                            {/* Close Button */}
                                            <button
                                                onClick={stopCamera}
                                                className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/20"
                                            >
                                                <X size={20} />
                                            </button>

                                            {/* 2. Capture Button (Photo/Video) */}
                                            <button
                                                onClick={handleShutter}
                                                className={`rounded-full transition-all duration-300 flex items-center justify-center border-4 
                                                    ${cameraMode === 'video'
                                                    ? (isRecording ? 'w-16 h-16 border-gray-300 bg-red-500' : 'w-16 h-16 border-gray-300 bg-red-600')
                                                    : 'w-16 h-16 border-gray-300 bg-white'
                                                }`}
                                            >
                                                {/* Inner indicator for video recording state */}
                                                {cameraMode === 'video' && isRecording && (
                                                    <div className="w-6 h-6 bg-white rounded-sm" />
                                                )}
                                                {/* Visual indicator for photo */}
                                                {cameraMode === 'photo' && (
                                                    <div className="w-14 h-14 bg-gray-200 rounded-full border-2 border-white/50" />
                                                )}
                                            </button>

                                            {/* Flip Camera */}
                                            <button
                                                onClick={switchCamera}
                                                className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/20"
                                            >
                                                <RefreshCcw size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* --- STANDARD VIEW --- */
                                <>
                                    {!previewUrl ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={startCamera}
                                                className="flex flex-col items-center justify-center gap-2 h-32 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                                            >
                                                <Camera className="w-8 h-8 text-blue-400" />
                                                <span className="text-sm font-medium">Camera</span>
                                            </button>

                                            <button
                                                onClick={() => fileInputRef.current.click()}
                                                className="flex flex-col items-center justify-center gap-2 h-32 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                                            >
                                                <ImageIcon className="w-8 h-8 text-purple-400" />
                                                <span className="text-sm font-medium">Gallery</span>
                                            </button>
                                        </div>
                                    ) : (
                                        /* PREVIEW AREA */
                                        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden border border-white/10">
                                            {selectedFile?.type.startsWith('video') ? (
                                                <video src={previewUrl} className="w-full h-full object-contain" controls />
                                            ) : (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                            )}

                                            <button
                                                onClick={() => {
                                                    setPreviewUrl(null);
                                                    setSelectedFile(null);
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-3">

                                        {/* Autocomplete Movie Input */}
                                        <div className="space-y-1 relative">
                                            <label className="text-xs font-medium text-gray-400">Watching (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Inception, Breaking Bad..."
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                                                    value={movieTitle}
                                                    onChange={(e) => {
                                                        setMovieTitle(e.target.value);
                                                        setShowSuggestions(true); // Re-open dropdown when typing
                                                    }}
                                                    onFocus={() => setShowSuggestions(true)} // Open when clicked
                                                />

                                                {/* Dropdown List */}
                                                {showSuggestions && suggestions.length > 0 && (
                                                    <ul className="absolute z-50 w-full bg-[#1a1a1a] border border-white/10 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                                                        {suggestions.map((movie) => (
                                                            <li
                                                                key={movie.id}
                                                                onClick={() => {

                                                                    setMovieTitle(movie.title || movie.name);
                                                                    setSuggestions([]);
                                                                    setShowSuggestions(false);
                                                                    setTmdbId(movie.id); //save tmdb id for later
                                                                    setTmdbType(movie.title ? 'movie' : 'series');
                                                                }}
                                                                className="flex items-center gap-3 p-2 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                                            >
                                                                {/* Movie Poster Thumbnail */}
                                                                {movie.poster_path ? (
                                                                    <img
                                                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                                        alt={movie.title}
                                                                        className="w-8 h-12 object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-12 bg-gray-700 rounded flex items-center justify-center">
                                                                        <Clapperboard size={12} className="text-gray-400"/>
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-col">
                                                                    <span className="text-sm text-white font-medium">
                                                                        {movie.title || movie.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">
                                                                        {movie.release_date ? movie.release_date.split('-')[0] : 'Unknown'}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/* Caption Input */}
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">Caption</label>
                                            <textarea
                                                placeholder="Write a caption..."
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm h-20 resize-none focus:outline-none focus:border-blue-500 transition-colors text-white"
                                                value={newCaption}
                                                onChange={(e) => setNewCaption(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreatePost}
                                        disabled={isSubmitting || !selectedFile}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin w-5 h-5" /> Posting...
                                            </>
                                        ) : (
                                            'Share Post'
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}