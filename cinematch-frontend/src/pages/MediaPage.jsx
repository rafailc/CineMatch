import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
    Heart,
    MessageCircle,
    Send,
    Bookmark,
    MoreHorizontal,
    PlusCircle,
    Clapperboard,
    Plus,
    X,
    Camera,
    Image as ImageIcon,
    Loader2,
    RefreshCcw,
    Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Comments from "../components/Comments";
import Likes from "../components/Likes";
import Stories from "../components/Stories";
import StoryViewer from "../components/StoryViewer";

export default function MediaPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);

    const [isCameraActive, setIsCameraActive] = useState(false); // shared camera (post + story)
    const [newCaption, setNewCaption] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [facingMode, setFacingMode] = useState("environment"); // user/selfie or environment/back
    const [movieTitle, setMovieTitle] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [tmdbId, setTmdbId] = useState(null);
    const [tmdbType, setTmdbType] = useState(null);
    const [meId, setMeId] = useState(null);
    const [menuPostId, setMenuPostId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [cameraMode, setCameraMode] = useState("photo");
    const [isRecording, setIsRecording] = useState(false);
    const API_BASE = "http://localhost:8080/api/tmdb";

    const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
    const [createMode, setCreateMode] = useState(null);
    const [storiesRefreshKey, setStoriesRefreshKey] = useState(0);

    // story state
    const [storyFile, setStoryFile] = useState(null);
    const [storyPreview, setStoryPreview] = useState(null);
    const [isStorySubmitting, setIsStorySubmitting] = useState(false);
    const [viewerStories, setViewerStories] = useState([]);

    // viewer state
    const [viewerPayload, setViewerPayload] = useState(null);
    const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);

    const [lastMovie, setLastMovie] = useState(null);
// { title, tmdbId, tmdbType }

    // Refs
    const fileInputRef = useRef(null); // post gallery
    const storyInputRef = useRef(null); // story gallery

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    // Cleanup camera when component unmounts
    useEffect(() => {
        return () => stopCamera();
    }, []);

    async function fetchPosts() {
        try {
            const { data: postsData, error } = await supabase
                .from("media_posts")
                .select(`
    id,
    user_id,
    media_url,
    media_type,
    caption,
    likes_count,
    comments_count,
    created_at,
    movie_title,
    tmdb_id,
    tmdb_type,
    profiles ( username, avatar_url ),
    media_likes ( user_id )
  `)
                .order("created_at", { ascending: false });


            if (error) throw error;
            if (postsData) {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                setMeId(user?.id || null);

                const formattedData = postsData.map((post) => ({
                    ...post,
                    comments_count: post.comments_count ?? 0,
                    username: post.profiles?.username || "Unknown",
                    user_img: post.profiles?.avatar_url || "https://via.placeholder.com/150",
                    liked: post.media_likes?.some((like) => like.user_id === user?.id),
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
    const startCamera = async (mode = "environment") => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        await new Promise((resolve) => setTimeout(resolve, 200));

        setIsCameraActive(true);
        setFacingMode(mode);

        try {
            const constraints = {
                video: { facingMode: mode === "environment" ? { exact: mode } : mode },
                audio: true,
            };

            let stream;

            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (err) {
                console.log("Audio mode failed, trying video only...", err);
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: mode },
                });
            }

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            if (err.name !== "NotAllowedError" && err.name !== "NotFoundError") {
                alert("Could not start camera. Please check permissions.");
            }
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
        setIsRecording(false);
    };

    const switchCamera = () => {
        const newMode = facingMode === "user" ? "environment" : "user";
        startCamera(newMode);
    };

    // --- POST CAMERA CAPTURE ---
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");

            // Mirror image when using selfie camera
            if (facingMode === "user") {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], "camera-photo.jpg", {type: "image/jpeg",});setSelectedFile(file);setPreviewUrl(URL.createObjectURL(file));stopCamera();
            }, "image/jpeg");
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;

        chunksRef.current = [];
        const options = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
            ? { mimeType: "video/webm; codecs=vp9" }
            : { mimeType: "video/webm" };

        try {
            const recorder = new MediaRecorder(streamRef.current, options);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "video/webm" });
                const file = new File([blob], "camera-video.webm", {type: "video/webm",});
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
        if (cameraMode === "photo") {
            capturePhoto();
        } else {
            if (isRecording) stopRecording();
            else startRecording();
        }
    };

    // --- STORY CAPTURE (PHOTO ONLY, same look as post) ---
    const captureStoryPhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");

        // Mirror when selfie camera
        if (facingMode === "user") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blob) => {
                const file = new File([blob], "story.jpg", { type: "image/jpeg" });
                setStoryFile(file);
                setStoryPreview(URL.createObjectURL(file));
                stopCamera();
            },
            "image/jpeg"
        );
    };

    const handleStoryFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setStoryFile(file);
        setStoryPreview(URL.createObjectURL(file));
    };

    async function handleDeletePost(post) {
        if (!post) return;

        const ok = window.confirm("Delete this post?");
        if (!ok) return;

        setIsDeleting(true);

        try {
            // 1) delete row from DB
            const { error: delError } = await supabase
                .from("media_posts")
                .delete()
                .eq("id", post.id);

            if (delError) throw delError;

            // 2) remove from UI instantly
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
            setMenuPostId(null);

        } catch (err) {
            alert(err.message);
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleCreateStory() {
        if (!storyFile) {
            alert("Select a photo or video");
            return;
        }

        setIsStorySubmitting(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("Login required");

            const ext = storyFile.name.split(".").pop();
            const fileName = `${user.id}/stories/${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("media")
                .upload(fileName, storyFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("media").getPublicUrl(fileName);

            const { error } = await supabase.from("stories").insert({
                user_id: user.id,
                media_url: data.publicUrl,
            });

            if (error) throw error;

            stopCamera();
            setIsCreateStoryOpen(false);
            setStoryFile(null);
            setStoryPreview(null);
            setStoriesRefreshKey((k) => k + 1);

        } catch (err) {
            alert(err.message);
        } finally {
            setIsStorySubmitting(false);

        }
    }

    // --- STANDARD FILE PICKER (POST) ---
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // --- UPLOAD LOGIC (POST) ---
    async function handleCreatePost(e) {
        e.preventDefault();
        if (!movieTitle.trim() || !tmdbId) {
            alert("Please select a related movie/series from the list.");
            return;
        }

        if (!selectedFile) {
            alert("Please select a photo or video first.");
            return;
        }

        setIsSubmitting(true);

//save last used movie for next time
        const usedMovie = { title: movieTitle, tmdbId, tmdbType };
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in.");

            const fileExt = selectedFile.name.split(".").pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("media")
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("media")
                .getPublicUrl(fileName);

            const { error: dbError } = await supabase.from("media_posts").insert({
                user_id: user.id,
                media_url: urlData.publicUrl,
                caption: newCaption,
                username: "temp",
                media_type: selectedFile.type.startsWith("video") ? "video" : "image",
                movie_title: movieTitle,
                tmdb_id: tmdbId,
                tmdb_type: tmdbType,
            });

            if (dbError) throw dbError;

            //save last used movie for next time
            setLastMovie(usedMovie);

            stopCamera();
            setIsCreatePostOpen(false);
            setNewCaption("");
            setSelectedFile(null);
            setPreviewUrl(null);
            resetMovie();
            fetchPosts();
        } catch (error) {
            console.error("Error creating post:", error.message);
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    // --- UI HELPERS ---

    const resetMovie = () => {
        setMovieTitle("");
        setTmdbId(null);
        setTmdbType(null);
        setSuggestions([]);
        setShowSuggestions(false);
    };


    const formatTimeAgo = (dateString) => {
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

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (movieTitle.length > 2 && showSuggestions) {
                try {
                    const response = await fetch(`${API_BASE}/search/movies?q=${encodeURIComponent(movieTitle)}`);
                    const data = await response.json();

                    if (data.results) setSuggestions(data.results.slice(0, 5));
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [movieTitle, showSuggestions]);

    return (
        <div className="min-h-screen bg-background text-foreground pt-20 relative">
            <main className="container max-w-xl mx-auto px-0 md:px-4 py-6">
                {/* --- STORIES --- */}
                <Stories
                    refreshKey={storiesRefreshKey}
                    onAddStory={() => setIsCreateStoryOpen(true)}
                    onOpenStories={(payload) => {
                        setViewerPayload(payload);
                        setIsStoryViewerOpen(true);
                    }}
                />




                {/* --- FEED --- */}
                <section className="flex flex-col gap-6">
                    {loading && (
                        <div className="text-center py-10 text-muted-foreground">
                            Loading posts...
                        </div>
                    )}

                    {!loading &&
                        posts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-background md:border border-white/10 md:rounded-xl overflow-hidden mb-4"
                            >
                                {/* --- HEADER --- */}
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={post.user_img}
                                            alt={post.username}
                                            className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20"
                                        />
                                        <div className="flex flex-col">
                      <span className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer leading-tight">
                        {post.username}
                      </span>

                                            {post.movie_title && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const type =
                                                            post.tmdb_type === "series" ? "series" : "movie";
                                                        navigate(`/${type}/${post.tmdb_id}`);
                                                    }}
                                                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline text-left font-medium"
                                                >
                                                    {post.movie_title}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        {post.user_id === meId && (
                                            <button
                                                onClick={() => setMenuPostId((id) => (id === post.id ? null : post.id))}
                                                className="p-1 rounded-full hover:bg-white/10"
                                            >
                                                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                                            </button>
                                        )}

                                        {menuPostId === post.id && (
                                            <>
                                                {/* click outside backdrop */}
                                                <button
                                                    onClick={() => setMenuPostId(null)}
                                                    className="fixed inset-0 z-40 cursor-default"
                                                />

                                                {/* dropdown */}
                                                <div className="absolute right-0 top-8 z-50 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                                                    <button
                                                        disabled={isDeleting}
                                                        onClick={() => handleDeletePost(post)}
                                                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 text-red-400 disabled:opacity-50"
                                                    >
                                                        {isDeleting ? "Deleting..." : "Delete"}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                </div>

                                <div className="relative w-full bg-muted/20">
                                    {post.media_type === "video" ? (
                                        <video
                                            src={post.media_url}
                                            controls
                                            className="w-full h-auto object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={post.media_url}
                                            alt="Post content"
                                            className="w-full h-auto object-cover"
                                        />
                                    )}
                                </div>

                                <div className="p-3">
                                    <div className="flex gap-4 items-center">
                                        <Likes
                                            postId={post.id}
                                            initialLiked={post.liked}
                                            initialCount={post.likes_count}
                                            onChange={(newCount, liked) => {
                                                setPosts((prev) =>
                                                    prev.map((p) =>
                                                        p.id === post.id
                                                            ? { ...p, likes_count: newCount, liked }
                                                            : p
                                                    )
                                                );
                                            }}
                                        />

                                        {/* Comment icon + count (always show count like likes) */}
                                        <button
                                            onClick={() => setOpenCommentsPostId(post.id)}
                                            className="flex items-center gap-1"
                                        >
                                            <MessageCircle className="w-7 h-7 text-white" />
                                            <span className="text-sm">{post.comments_count ?? 0}</span>
                                        </button>


                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm">
                                            <span className="font-semibold mr-2">@{post.username}:</span>
                                            <span className="text-gray-300">{post.caption}</span>
                                        </div>

                                        {(post.comments_count ?? 0) > 0 ? (
                                            <p
                                                className="text-sm text-gray-400 cursor-pointer hover:text-gray-300"
                                                onClick={() => setOpenCommentsPostId(post.id)}
                                            >
                                                View all {post.comments_count}{" "}
                                                {post.comments_count === 1 ? "comment" : "comments"}
                                            </p>
                                        ) : (
                                            <p
                                                className="text-sm text-gray-500 cursor-pointer hover:text-gray-300"
                                                onClick={() => setOpenCommentsPostId(post.id)}
                                            >
                                                Be the first to comment
                                            </p>
                                        )}

                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide pt-1">
                                            {formatTimeAgo(post.created_at)} AGO
                                        </p>
                                    </div>
                                </div>

                                <Comments
                                    postId={post.id}
                                    open={openCommentsPostId === post.id}
                                    onClose={() => setOpenCommentsPostId(null)}
                                    onCountChange={(newCount) => {
                                        setPosts((prev) =>
                                            prev.map((p) => (p.id === post.id ? { ...p, comments_count: newCount } : p))
                                        );
                                    }}
                                />



                            </article>
                        ))}
                </section>
            </main>

            {/* --- POST FAB --- */}
            <button
                onClick={() => {
                    setCreateMode("post");
                    resetMovie();
                    setIsCreatePostOpen(true);
                }}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-500 transition-all z-40"
            >
                <Plus className="w-8 h-8" />
            </button>

            {/* --- POST MODAL --- */}
            {isCreatePostOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="font-semibold text-lg">
                                {isCameraActive ? "New Post" : "Create new post"}
                            </h2>
                            <button
                                onClick={() => {
                                    stopCamera();
                                    resetMovie();
                                    setIsCreatePostOpen(false);
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                                className="text-gray-400 hover:text-white p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <input
                                type="file"
                                accept="image/*,video/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <canvas ref={canvasRef} className="hidden" />

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
                                        <div className="flex bg-black/50 rounded-full p-1 backdrop-blur-sm">
                                            <button
                                                onClick={() => setCameraMode("photo")}
                                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                    cameraMode === "photo"
                                                        ? "bg-white text-black"
                                                        : "text-gray-300"
                                                }`}
                                            >
                                                Photo
                                            </button>
                                            <button
                                                onClick={() => setCameraMode("video")}
                                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                    cameraMode === "video"
                                                        ? "bg-white text-black"
                                                        : "text-gray-300"
                                                }`}
                                            >
                                                Video
                                            </button>
                                        </div>

                                        <div className="flex w-full justify-between items-center px-4">
                                            <button
                                                onClick={stopCamera}
                                                className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/20"
                                            >
                                                <X size={20} />
                                            </button>

                                            <button
                                                onClick={handleShutter}
                                                className={`rounded-full transition-all duration-300 flex items-center justify-center border-4 
                          ${
                                                    cameraMode === "video"
                                                        ? isRecording
                                                            ? "w-16 h-16 border-gray-300 bg-red-500"
                                                            : "w-16 h-16 border-gray-300 bg-red-600"
                                                        : "w-16 h-16 border-gray-300 bg-white"
                                                }`}
                                            >
                                                {cameraMode === "video" && isRecording && (
                                                    <div className="w-6 h-6 bg-white rounded-sm" />
                                                )}
                                                {cameraMode === "photo" && (
                                                    <div className="w-14 h-14 bg-gray-200 rounded-full border-2 border-white/50" />
                                                )}
                                            </button>

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
                                <>
                                    {!previewUrl ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => startCamera("environment")}
                                                className="flex flex-col items-center justify-center gap-2 h-32 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                                            >
                                                <Camera className="w-8 h-8 text-blue-400" />
                                                <span className="text-sm font-medium">Camera</span>
                                            </button>

                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex flex-col items-center justify-center gap-2 h-32 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                                            >
                                                <ImageIcon className="w-8 h-8 text-purple-400" />
                                                <span className="text-sm font-medium">Gallery</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden border border-white/10">
                                            {selectedFile?.type.startsWith("video") ? (
                                                <video
                                                    src={previewUrl}
                                                    className="w-full h-full object-contain"
                                                    controls
                                                />
                                            ) : (
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
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
                                        <div className="space-y-1 relative">
                                            <label className="text-xs font-medium text-gray-400">
                                                Related movie:  <span className="text-red-500">*</span>
                                            </label>
                                            {lastMovie && !tmdbId && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMovieTitle(lastMovie.title);
                                                        setTmdbId(lastMovie.tmdbId);
                                                        setTmdbType(lastMovie.tmdbType);
                                                        setShowSuggestions(false);
                                                        setSuggestions([]);
                                                    }}
                                                    className="text-xs text-blue-400 hover:text-blue-300 underline text-left"
                                                >
                                                    Use previous: {lastMovie.title}
                                                </button>
                                            )}

                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Inception, Breaking Bad..."
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors text-white"
                                                    value={movieTitle}
                                                    onChange={(e) => {
                                                        setMovieTitle(e.target.value);
                                                        setShowSuggestions(true);
                                                    }}
                                                    onFocus={() => setShowSuggestions(true)}
                                                />

                                                {showSuggestions && suggestions.length > 0 && (
                                                    <ul className="absolute z-50 w-full bg-[#1a1a1a] border border-white/10 rounded-lg mt-1 shadow-xl max-h-48 overflow-y-auto">
                                                        {suggestions.map((movie) => (
                                                            <li
                                                                key={movie.id}
                                                                onClick={() => {
                                                                    setMovieTitle(movie.title || movie.name);
                                                                    setSuggestions([]);
                                                                    setShowSuggestions(false);
                                                                    setTmdbId(movie.id);
                                                                    setTmdbType(movie.title ? "movie" : "series");
                                                                }}
                                                                className="flex items-center gap-3 p-2 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                                                            >
                                                                {movie.poster_path ? (
                                                                    <img
                                                                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                                        alt={movie.title}
                                                                        className="w-8 h-12 object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <div className="w-8 h-12 bg-gray-700 rounded flex items-center justify-center">
                                                                        <Clapperboard
                                                                            size={12}
                                                                            className="text-gray-400"
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-col">
                                  <span className="text-sm text-white font-medium">
                                    {movie.title || movie.name}
                                  </span>
                                                                    <span className="text-xs text-gray-400">
                                    {movie.release_date
                                        ? movie.release_date.split("-")[0]
                                        : "Unknown"}
                                  </span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">
                                                Caption
                                            </label>
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
                                        disabled={isSubmitting || !selectedFile || !tmdbId}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin w-5 h-5" /> Posting...
                                            </>
                                        ) : (
                                            "Share Post"
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- STORY MODAL (same UI style as post, only story part changed) --- */}
            {isCreateStoryOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                        {/* HEADER */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="font-semibold text-lg">
                                {isCameraActive ? "New Story" : "Create new story"}
                            </h2>
                            <button
                                onClick={() => {
                                    stopCamera();
                                    setIsCreateStoryOpen(false);
                                    setStoryFile(null);
                                    setStoryPreview(null);
                                }}
                                className="text-gray-400 hover:text-white p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Hidden story input + canvas */}
                            <input
                                type="file"
                                accept="image/*,video/*"
                                ref={storyInputRef}
                                onChange={handleStoryFileChange}
                                className="hidden"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* CAMERA VIEW */}
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
                                        {/* Story is photo-only but styled like post */}
                                        <div className="flex bg-black/50 rounded-full p-1 backdrop-blur-sm">
                                            <button className="px-4 py-1.5 rounded-full text-xs font-medium transition-all bg-white text-black">
                                                Photo
                                            </button>
                                        </div>

                                        <div className="flex w-full justify-between items-center px-4">
                                            <button
                                                onClick={stopCamera}
                                                className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/20"
                                            >
                                                <X size={20} />
                                            </button>

                                            <button
                                                onClick={captureStoryPhoto}
                                                className="rounded-full transition-all duration-300 flex items-center justify-center border-4 w-16 h-16 border-gray-300 bg-white"
                                            >
                                                <div className="w-14 h-14 bg-gray-200 rounded-full border-2 border-white/50" />
                                            </button>

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
                                <>
                                    {!storyPreview ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => startCamera("environment")}
                                                className="flex flex-col items-center justify-center gap-2 h-32 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                                            >
                                                <Camera className="w-8 h-8 text-blue-400" />
                                                <span className="text-sm font-medium">Camera</span>
                                            </button>

                                            <button
                                                onClick={() => storyInputRef.current?.click()}
                                                className="flex flex-col items-center justify-center gap-2 h-32 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                                            >
                                                <ImageIcon className="w-8 h-8 text-purple-400" />
                                                <span className="text-sm font-medium">Gallery</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden border border-white/10">
                                            {storyFile?.type?.startsWith("video") ? (
                                                <video
                                                    src={storyPreview}
                                                    className="w-full h-full object-contain"
                                                    controls
                                                />
                                            ) : (
                                                <img
                                                    src={storyPreview}
                                                    alt="Story Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            )}

                                            <button
                                                onClick={() => {
                                                    setStoryPreview(null);
                                                    setStoryFile(null);
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCreateStory}
                                        disabled={isStorySubmitting || !storyFile}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isStorySubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin w-5 h-5" /> Posting...
                                            </>
                                        ) : (
                                            "Share Story"
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isStoryViewerOpen && viewerPayload && (
                <StoryViewer
                    usersStories={viewerPayload.usersStories}
                    startUserIndex={viewerPayload.startUserIndex}
                    startStoryIndex={viewerPayload.startStoryIndex}
                    onClose={() => {
                        setIsStoryViewerOpen(false);
                        setViewerPayload(null);
                    }}
                />
            )}



        </div>
    );
}
