import React, { useState, useEffect, useRef } from 'react';
import { X, PlusCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js to use remote models
env.allowLocalModels = false;
env.allowRemoteModels = true;

const ReviewModal = ({ isOpen, onClose, contentId, contentType = 'movie' }) => {
    const [view, setView] = useState('list');
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [sentiment, setSentiment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [modelLoading, setModelLoading] = useState(true);
    const [modelError, setModelError] = useState(null);
    const classifierRef = useRef(null);
    const analysisTimeoutRef = useRef(null);

    // Load the sentiment analysis model once
    useEffect(() => {
        async function loadModel() {
            if (classifierRef.current) return;

            try {
                console.log('Starting to load sentiment model...');
                const sentimentPipeline = await pipeline(
                    'sentiment-analysis',
                    'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
                );
                classifierRef.current = sentimentPipeline;
                setModelLoading(false);
                setModelError(null);
                console.log('✅ Sentiment model loaded successfully!');
            } catch (error) {
                console.error('Error loading sentiment model:', error);
                setModelError(error.message);
                setModelLoading(false);
            }
        }
        loadModel();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setView('list');
            fetchReviews();
        }
    }, [isOpen, contentId, contentType]);

    const fetchReviews = async () => {
        setLoading(true);
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('content_id', contentId)
            .eq('content_type', contentType)
            .order('created_at', { ascending: false });

        if (reviewsError) {
            console.error('Error fetching reviews:', reviewsError);
            setReviews([]);
            setLoading(false);
            return;
        }

        const userIds = [...new Set(reviewsData.map(r => r.user_id))];
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);

        const reviewsWithProfiles = reviewsData.map(review => ({
            ...review,
            profiles: profilesData?.find(p => p.id === review.user_id) || null
        }));

        setReviews(reviewsWithProfiles);
        setLoading(false);
    };

    const handlePublish = async () => {
        if (!reviewText.trim() || !sentiment) return;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in to post a review");
            return;
        }

        let normalizedSentiment = null;
        if (sentiment?.label && sentiment.label !== 'skipped') {
            normalizedSentiment = sentiment.label.toLowerCase().includes('positive') ? 'positive' : 'negative';
        }

        const { error } = await supabase
            .from('reviews')
            .insert([{
                content: reviewText,
                sentiment: normalizedSentiment,
                sentiment_score: sentiment?.score || null,
                content_id: contentId,
                content_type: contentType,
                user_id: user.id
            }]);

        if (!error) {
            await fetchReviews();
            setReviewText("");
            setSentiment(null);
            setView('list');
        } else {
            console.error("Error posting review:", error);
            alert(`Failed to post review: ${error.message}`);
        }
    };

    const detectLanguage = (text) => {
        const hasNonLatin = /[^\u0000-\u024F\u1E00-\u1EFF]/.test(text);
        if (hasNonLatin) return 'non-english';

        if (text.length < 10) return 'english';

        const commonEnglishWords = /\b(the|is|are|was|were|have|has|had|do|does|did|will|would|can|could|should|this|that|these|those|and|but|or|not|very|good|bad|movie|film|show|series|episode)\b/i;
        if (commonEnglishWords.test(text)) return 'english';

        return 'english';
    };

    const analyzeSentiment = async (text) => {
        if (!text.trim()) {
            setSentiment(null);
            return;
        }

        const language = detectLanguage(text);

        if (language !== 'english') {
            setSentiment({ label: 'skipped', score: null });
            return;
        }

        if (!classifierRef.current) return;

        setAnalyzing(true);
        try {
            const result = await classifierRef.current(text);

            if (result && result[0]) {
                const topResult = result[0];
                const labelMap = {
                    'LABEL_1': 'Positive', 'LABEL_0': 'Negative',
                    'POSITIVE': 'Positive', 'NEGATIVE': 'Negative'
                };

                const mappedLabel = labelMap[topResult.label] || topResult.label;

                setSentiment({
                    label: mappedLabel,
                    score: topResult.score
                });
            }
        } catch (error) {
            console.error("Sentiment analysis failed:", error);
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        if (analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current);
        }

        if (reviewText.trim() && !modelLoading && classifierRef.current) {
            analysisTimeoutRef.current = setTimeout(() => {
                analyzeSentiment(reviewText);
            }, 1000);
        } else {
            setSentiment(null);
        }

        return () => {
            if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
        };
    }, [reviewText, modelLoading]);

    const getEmoji = (label) => {
        if (!label || label === 'skipped') return '❌';
        const normalizedLabel = label.toLowerCase();
        if (normalizedLabel.includes('positive')) return '🟢';
        if (normalizedLabel.includes('negative')) return '🔴';
        return '🟡';
    };

    // Dynamic text based on content type
    const contentLabel = contentType === 'series' ? 'series' : 'movie';
    const contentLabelCapitalized = contentLabel.charAt(0).toUpperCase() + contentLabel.slice(1);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl h-[600px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">

                {modelLoading && (
                    <div className="absolute top-0 left-0 right-0 bg-blue-400 bg-opacity-90 p-3 z-50 flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-white text-sm">Loading sentiment model (first time may take 20-30 seconds)...</span>
                    </div>
                )}

                {view === 'list' && (
                    <>
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900 z-10">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                User Reviews <span className="text-sm font-normal text-gray-400">({reviews.length})</span>
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loading ? (
                                <div className="text-center text-gray-500 mt-10">Loading reviews...</div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">No reviews yet. Be the first!</div>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {review.profiles?.avatar_url ? (
                                                    <img
                                                        src={review.profiles.avatar_url}
                                                        alt={review.profiles.username || 'User'}
                                                        className="w-8 h-8 rounded-full object-cover border-2 border-purple-500"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                                        {review.profiles?.username?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <span className="text-gray-300 text-sm font-medium">
                                                    {review.profiles?.username || 'Anonymous'}
                                                </span>
                                            </div>
                                            <span className="text-2xl">{getEmoji(review.sentiment)}</span>
                                        </div>
                                        <p className="text-gray-200 text-sm leading-relaxed">{review.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => setView('create')} className="absolute bottom-6 right-6 bg-purple-600 hover:bg-purple-500 text-white rounded-full p-4 shadow-lg transition-all transform hover:scale-105">
                            <PlusCircle size={28} />
                        </button>
                    </>
                )}

                {view === 'create' && (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-4 p-6 border-b border-gray-800">
                            <button onClick={() => setView('list')} className="text-gray-400 hover:text-white transition-colors">
                                <ArrowLeft size={24} />
                            </button>
                            <h2 className="text-xl font-bold text-white">Write a Review</h2>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <textarea
                                className="w-full h-72 p-4 bg-gray-800 text-white border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500 resize-none text-lg"
                                placeholder={`What did you think about the ${contentLabel}?`}
                                value={reviewText}
                                onChange={(e) => {
                                    setReviewText(e.target.value);
                                    setSentiment(null);
                                }}
                                autoFocus
                            />

                            <div className="mt-4 flex items-center gap-2 h-6">
                                {analyzing ? (
                                    <span className="text-purple-400 text-sm flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-400"></div>
                                        Analyzing tone...
                                    </span>
                                ) : sentiment?.label === 'skipped' ? (
                                    <span className="text-yellow-500 text-sm">Sentiment analysis unavailable (Non-English)</span>
                                ) : null}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
                            <button
                                onClick={() => { setView('list'); setReviewText(""); setSentiment(null); }}
                                className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handlePublish}
                                disabled={!reviewText.trim() || analyzing || !sentiment}
                                className={`px-8 py-3 font-bold rounded-lg transition-colors flex items-center gap-2
                                    ${(!reviewText.trim() || analyzing || !sentiment)
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                    : 'bg-gradient-to-br from-red-700 to-blue-500 hover:from-red-600 hover:to-blue-400 text-white shadow-lg'
                                }`}
                            >
                                {analyzing || (!sentiment && reviewText.trim()) ? 'Please Wait...' : 'Post Review'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewModal;