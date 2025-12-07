import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Upload, Camera, X, Loader2, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getTrendingPerson } from "@/lib/tmdbBackend";
import { cosineSimilarity } from "@/lib/ai-utils";
const { pipeline } = await import("@xenova/transformers");


env.allowLocalModels = false;
env.useBrowserCache = true;

async function loadImageAsBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

let extractorPromise = null;
async function getExtractor() {
    if (!extractorPromise) {
        extractorPromise = pipeline(
            "image-feature-extraction",
            "Xenova/vit-base-patch16-224-in21k",
            {
                device: "wasm",
                revision: "main",
                dtype: "fp32",
                quantized: false,
            }
        );
    }
    return extractorPromise;
}

export default function ActorMatchPage() {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState("");
    const [results, setResults] = useState(null);

    const fileInputRef = useRef(null);
    const { toast } = useToast();

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
            setProgressText("Φόρτωση AI μοντέλου...");
            setProgress(15);
            const extractor = await getExtractor();

            setProgressText("Ανάλυση της φωτογραφίας σου...");
            setProgress(35);
            const userFeatures = await extractor(uploadedImage);
            const userEmbedding = Array.from(userFeatures.data);

            setProgressText("Λήψη δεδομένων ηθοποιών...");
            setProgress(55);
            const trendingData = await getTrendingPerson();
            const people = trendingData.results || [];

            const actors = people
                .filter(
                    (p) =>
                        p.known_for_department === "Acting" &&
                        p.profile_path &&
                        p.popularity > 1
                )
                .slice(0, 20);

            if (actors.length === 0) {
                throw new Error("Δεν βρέθηκαν αρκετοί ηθοποιοί για σύγκριση.");
            }

            setProgressText("Σύγκριση με ηθοποιούς...");
            setProgress(70);

            const actorResults = [];
            const maxActors = Math.min(actors.length, 10);

            for (let i = 0; i < maxActors; i++) {
                const actor = actors[i];
                const actorImageUrl =
                    `https://api.allorigins.win/raw?url=` +
                    encodeURIComponent(`https://image.tmdb.org/t/p/w500${actor.profile_path}`);


                try {
                    const base64ActorImage = await loadImageAsBase64(actorImageUrl);
                    const actorFeatures = await extractor(base64ActorImage);
                    const actorEmbedding = Array.from(actorFeatures.data);

                    if (!actorEmbedding || actorEmbedding.length === 0) {
                        console.warn("⚠ Actor embedding empty:", actor.name);
                        continue;
                    }


                    const similarity = cosineSimilarity(userEmbedding, actorEmbedding);

                    actorResults.push({
                        ...actor,
                        similarity: Math.round(similarity * 100),
                    });
                } catch (err) {
                    console.warn(`Could not process actor ${actor.name}:`, err);
                }

                setProgress(70 + ((i + 1) / maxActors) * 25);
            }

            setProgressText("Ολοκλήρωση αποτελεσμάτων...");
            const topMatches = actorResults
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 5);

            console.log("🔍 FULL actorResults:", actorResults);
            console.log("🔍 TOP MATCHES:", topMatches);
            console.log("🔍 RESULTS LENGTH:", topMatches.length);


            setResults(topMatches);
            setProgress(100);
            setProgressText("");

            toast({
                title: "Η ανάλυση ολοκληρώθηκε!",
                description: "Βρήκαμε τους ηθοποιούς που σου μοιάζουν περισσότερο.",
            });
        } catch (error) {
            console.error("Analysis error:", error);
            toast({
                title: "Αποτυχία ανάλυσης",
                description:
                    error.message ||
                    "Κάτι πήγε στραβά με την ανάλυση. Δοκίμασε ξανά σε λίγο.",
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
                        {!uploadedImage ? (
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
                        ) : (
                            <div className="space-y-4">
                                <div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden">
                                    <img
                                        src={uploadedImage}
                                        alt="Uploaded"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
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
                                                    src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
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
                            Η λειτουργία χρησιμοποιεί ένα Vision Transformer (ViT) AI μοντέλο
                            που τρέχει απευθείας στον browser σου, εξάγοντας χαρακτηριστικά από
                            εικόνες. Έπειτα συγκρίνει αυτά τα χαρακτηριστικά με εικόνες
                            trending ηθοποιών από το CineMatch backend. Η φωτογραφία σου δεν
                            φεύγει ποτέ από τη συσκευή σου.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
