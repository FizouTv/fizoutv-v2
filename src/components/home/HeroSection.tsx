import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Clock, Lock } from "lucide-react";
import DailyPoll from "./DailyPoll";
import { timeAgo } from "@/lib/utils/timeAgo";

interface Article {
    id: string;
    title: string;
    slug: string;
    chapo: string | null;
    cover_image_url: string | null;
    is_exclusive: boolean;
    published_at: string;
    category: { name: string; slug: string } | null;
}

export default async function HeroSection() {
    const supabase = await createClient();

    // Fetch the 3 latest published articles (featured first, then by date)
    const { data: articles } = await supabase
        .from("articles")
        .select("id, title, slug, chapo, cover_image_url, is_exclusive, published_at, category:categories(name, slug)")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(1);

    const mainArticle = articles?.[0] as Article | undefined;

    // Fallback if no articles yet
    if (!mainArticle) {
        return (
            <section className="container mx-auto px-4" aria-label="À la une">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-fizou-dark-alt border border-white/5 h-80 md:h-[440px] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-fizou-gray text-lg mb-2">Aucun article publié pour le moment</p>
                            <p className="text-fizou-gray/50 text-sm">Les derniers articles apparaîtront ici.</p>
                        </div>
                    </div>
                    <div className="h-full">
                        <DailyPoll />
                    </div>
                </div>
            </section>
        );
    }



    return (
        <section className="container mx-auto px-4" aria-label="À la une">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Featured */}
                <Link href={`/article/${mainArticle.slug}`} className="lg:col-span-2 group">
                    <div className="relative h-80 md:h-[440px] rounded-2xl overflow-hidden shadow-2xl">
                        {mainArticle.cover_image_url ? (
                            <Image
                                src={mainArticle.cover_image_url}
                                alt={mainArticle.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 800px"
                                priority
                            />
                        ) : (
                            <div className="absolute inset-0 bg-fizou-dark-alt" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div className="absolute bottom-0 p-6 md:p-8 w-full">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-fizou-red text-white text-[10px] font-bold px-3 py-1 rounded-full animate-pulse">
                                    ● À LA UNE
                                </span>
                                {mainArticle.category && (
                                    <span className="bg-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                                        {mainArticle.category.name}
                                    </span>
                                )}
                                {mainArticle.is_exclusive && (
                                    <span className="flex items-center gap-1 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-1 rounded-full">
                                        <Lock className="h-2.5 w-2.5" /> EXCLUSIF
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3 group-hover:text-fizou-red transition-colors">
                                {mainArticle.title}
                            </h1>
                            {mainArticle.chapo && (
                                <p className="text-fizou-gray/80 text-sm md:text-base line-clamp-2 max-w-2xl mb-3">
                                    {mainArticle.chapo}
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-[10px] text-fizou-gray font-medium">
                                <Clock className="h-3 w-3" />
                                {timeAgo(mainArticle.published_at)}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Daily Poll */}
                <div className="h-full">
                    <DailyPoll />
                </div>
            </div>
        </section>
    );
}
