import { Loader2, TrendingUp } from "lucide-react";

export default function Home() {





    return (
        <>
            {/* Navigation removed */}

            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative h-[60vh] overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025')] bg-cover bg-center" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    </div>

                    <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
                        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            CineMatch
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
                            Discover movies, explore talent, and unlock AI-powered cinema insights
                        </p>
                    </div>
                </section>

                {/* Trending Movies */}
                <section className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        <h2 className="text-3xl font-bold text-foreground">Trending Movies</h2>
                    </div>
                </section>

                {/* Trending People */}
                <section className="container mx-auto px-4 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp className="w-6 h-6 text-accent" />
                        <h2 className="text-3xl font-bold text-foreground">
                            Trending Actors & Directors
                        </h2>
                    </div>
                </section>
            </div>
        </>
    );
}
