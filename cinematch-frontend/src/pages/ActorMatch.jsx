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
 */import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Upload, Camera, X, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as faceapi from "@vladmandic/face-api";

// Load face-api models mia fora
let modelsLoaded = false;
async function loadModels() {
    if (modelsLoaded) return;

    const MODEL_URL = "/models";
    if (faceapi.nets.ssdMobilenetv1.params) return;
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);

    modelsLoaded = true;
}

// Efklidiani apostasi metaksi 2 128-dimensional vectors
function euclideanDistance(embedding1, embedding2) {
    let sum = 0;
    for (let i = 0; i < embedding1.length; i++) {
        const diff = embedding1[i] - embedding2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

// Convert distance to similarity percentage (0-100)
function distanceToSimilarity(distance) {
    // Face-api.js Euclidean distances range:
    // 0.0 - 0.4: Same person (excellent match)
    // 0.4 - 0.6: Very similar (good match)
    // 0.6 - 1.0: Some similarity (moderate match)
    // 1.0+: Different people (poor match)

    if (distance < 0.4) {
        return Math.round(100 - (distance / 0.4) * 15);
    } else if (distance < 0.6) {
        return Math.round(85 - ((distance - 0.4) / 0.2) * 15);
    } else if (distance < 1.0) {
        return Math.round(70 - ((distance - 0.6) / 0.4) * 40);
    } else {
        return Math.round(Math.max(0, 30 - ((distance - 1.0) / 0.5) * 30));
    }
}

function cleanPath(path) {
    if (!path) return "";
    return path.startsWith("/") ? path : "/" + path;
}

export default function ActorMatchPage() {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState("");
    const [results, setResults] = useState(null);
    const [isModelReady, setIsModelReady] = useState(false);

    const fileInputRef = useRef(null);
    const imgRef = useRef(null);
    const { toast } = useToast();

    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const initFaceApi = async () => {
            try {
                // 1. Wait for TensorFlow to be ready (Fixes the "backend" error)
                await faceapi.tf.ready();

                // 2. Load the models immediately so they are ready when user clicks
                await loadModels();

                console.log("FaceAPI & TFJS are ready");
                setIsModelReady(true);
            } catch (error) {
                console.error("Initialization Failed:", error);
                toast({
                    title: "Initialization Error",
                    description: "Failed to load AI models. Please refresh.",
                    variant: "destructive"
                });
            }
        };

        initFaceApi();
    }, [toast]);


    // Επιλογή αρχείου
    const handleFileSelect = useCallback(
        (event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                toast({
                    title: "Μη έγκυρο αρχείο",
                    description: "Παρακαλώ ανέβασε μόνο εικόνα (PNG, JPG, WEBP).",
                    variant: "destructive",
                });
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "Πολύ μεγάλη εικόνα",
                    description: "Μέγιστο μέγεθος αρχείου: 10MB.",
                    variant: "destructive",
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
                setResults(null);
            };
            reader.readAsDataURL(file);
        },
        [toast]
    );

    const clearImage = () => {
        setUploadedImage(null);
        setResults(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Open camera
    const openCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" } // Use front camera on mobile
            });
            setStream(mediaStream);
            setShowCamera(true);

            // Wait for video element to be ready
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (error) {
            toast({
                title: "Σφάλμα κάμερας",
                description: "Δεν ήταν δυνατή η πρόσβαση στην κάμερα.",
                variant: "destructive",
            });
        }
    };

// Capture photo from camera
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL("image/jpeg");
        setUploadedImage(imageData);
        setResults(null);

        // Close camera
        closeCamera();
    };

// Close camera and stop stream
    const closeCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const analyzePhoto = async () => {
        if (!uploadedImage) {
            toast({
                title: "Καμία εικόνα",
                description: "Πρώτα ανέβασε μια φωτογραφία.",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setProgressText("Προετοιμασία ανάλυσης...");
        setResults(null);

        try {
            // Step 1: Load face-api models
            setProgressText("Φόρτωση AI μοντέλου...");
            setProgress(10);
            await loadModels();

            // Step 2: Detect face in uploaded image
            setProgressText("Ανάλυση της φωτογραφίας σου...");
            setProgress(30);

            // Wait for image to be loaded in the DOM
            await new Promise((resolve) => {
                if (imgRef.current?.complete) {
                    resolve();
                } else if (imgRef.current) {
                    imgRef.current.onload = resolve;
                } else {
                    resolve();
                }
            });

            const detection = await faceapi
                .detectSingleFace(imgRef.current)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                throw new Error(
                    "Δεν εντοπίστηκε πρόσωπο στην εικόνα. Ανέβασε μια καθαρή φωτογραφία με ορατό πρόσωπο."
                );
            }

            const userEmbedding = Array.from(detection.descriptor);

            // Step 3: Load actor database
            setProgressText("Λήψη λίστας διάσημων ηθοποιών...");
            setProgress(50);

            const response = await fetch("https://pdfpnmhsvendlsgskjdk.supabase.co/storage/v1/object/public/assets/actors_db_face.json");
            if (!response.ok) {
                throw new Error("Αδυναμία φόρτωσης βάσης δεδομένων ηθοποιών.");
            }

            const actors = await response.json();

            if (!actors || actors.length === 0) {
                throw new Error("Η βάση δεδομένων είναι άδεια.");
            }

            // Step 4: Compare with all actors
            setProgressText(`Σύγκριση με ${actors.length} ηθοποιούς...`);
            setProgress(70);

            const scores = actors
                .map((actor) => {
                    if (!actor.embedding || actor.embedding.length !== 128) {
                        return null;
                    }

                    const distance = euclideanDistance(userEmbedding, actor.embedding);
                    const similarity = distanceToSimilarity(distance);

                    return {
                        ...actor,
                        distance: distance,
                        similarity: similarity,
                    };
                })
                .filter(Boolean);

            // Step 5: Sort by distance (lower is better) and get top 5
            scores.sort((a, b) => a.distance - b.distance);
            const topMatches = scores.slice(0, 5);

            setResults(topMatches);
            setProgress(100);
            setProgressText("");

            toast({
                title: "Η ανάλυση ολοκληρώθηκε!",
                description: `Συγκρίναμε το πρόσωπό σου με ${actors.length} διάσημους!`,
            });
        } catch (error) {
            console.error("Analysis error:", error);
            toast({
                title: "Αποτυχία ανάλυσης",
                description: error.message || "Κάτι πήγε στραβά.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-24 pb-12">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary mb-6 shadow-lg shadow-black/40">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                            Which Actor Do You Look Like?
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Ανέβασε μια φωτογραφία και δες σε ποιους διάσημους ηθοποιούς
                            μοιάζεις, με χρήση AI ανάλυσης προσώπου.
                        </p>
                    </div>

                    <Card className="p-6 bg-card border-border mb-8 shadow-md shadow-black/30">
                        {!uploadedImage && !showCamera ? (
                            <div className="space-y-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
                                >
                                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-foreground font-medium mb-2">
                                        Κάνε κλικ για να ανεβάσεις φωτογραφία
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        PNG, JPG ή WEBP (μέχρι 10MB)
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">Ή</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={openCamera}
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    Άνοιγμα Κάμερας
                                </Button>
                            </div>
                        ) : showCamera ? (
                            <div className="space-y-4">
                                <div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-black">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover scale-x-[-1]"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={capturePhoto}
                                        className="flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90"
                                        size="lg"
                                    >
                                        <Camera className="w-5 h-5 mr-2" />
                                        Λήψη Φωτογραφίας
                                    </Button>
                                    <Button
                                        onClick={closeCamera}
                                        variant="outline"
                                        size="lg"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden">
                                    <img
                                        ref={imgRef}
                                        src={uploadedImage}
                                        alt="Uploaded"
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                    />
                                    <button
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                                        disabled={isProcessing}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {isProcessing ? (
                                    <div className="space-y-3">
                                        <Progress value={progress} className="h-2" />
                                        <p className="text-center text-sm text-muted-foreground">
                                            {progressText || "Γίνεται επεξεργασία..."}
                                        </p>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={analyzePhoto}
                                        className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                                        size="lg"
                                    >
                                        <Camera className="w-5 h-5 mr-2" />
                                        Analyze Photo
                                    </Button>
                                )}
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Hidden canvas for photo capture */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Card>

                    {results && results.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground text-center mb-6">
                                Your Celebrity Matches
                            </h2>
                            <div className="grid gap-4">
                                {results.map((actor, index) => (
                                    <Card
                                        key={actor.id}
                                        className="p-4 bg-card border-border flex items-center gap-4 hover:border-accent transition-colors shadow-sm shadow-black/30"
                                    >
                                        <div className="text-2xl font-bold text-accent w-8">
                                            #{index + 1}
                                        </div>
                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                            {actor.profile_path ? (
                                                <img
                                                    // for display we can use TMDB directly (no canvas)
                                                    src={`https://image.tmdb.org/t/p/w185${cleanPath(
                                                        actor.profile_path
                                                    )}`}
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground truncate">
                                                {actor.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {actor.known_for?.[0]?.title ||
                                                    actor.known_for?.[0]?.name ||
                                                    "Actor"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-accent">
                                                {actor.similarity}%
                                            </div>
                                            <p className="text-xs text-muted-foreground">match</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <Card className="p-6 bg-card/50 border-border mt-8">
                        <h3 className="font-semibold text-foreground mb-2">
                            Πώς λειτουργεί;
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Η λειτουργία χρησιμοποιεί face-api.js με τεχνολογία αναγνώρισης προσώπου
                            που τρέχει απευθείας στον browser σου. Συγκρίνει το πρόσωπό σου με μια
                            προ-υπολογισμένη βάση δεδομένων 128-διάστατων embeddings από χιλιάδες
                            διάσημους ηθοποιούς. Η φωτογραφία σου δεν φεύγει ποτέ από τη συσκευή σου.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}