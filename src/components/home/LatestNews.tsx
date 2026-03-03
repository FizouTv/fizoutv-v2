import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import { timeAgoShort } from "@/lib/utils/timeAgo";

export default async function LatestNews() {
    const supabase = await createClient();

    const { data: articles } = await supabase
        .from("articles")
        .select("id, title, slug, published_at, category:categories(name, slug)")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(10);

    if (!articles || articles.length === 0) return null;



    return (
        <section className="container mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-fizou-white flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fizou-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-fizou-red"></span>
                    </span>
                    DERNIÈRES ACTUS
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {articles.map((article, i) => (
                    <Link key={article.id} href={`/article/${article.slug}`}>
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-fizou-dark-alt/50 border border-white/5 hover:border-fizou-red/30 transition-all group">
                            <span className="text-fizou-red font-black text-lg w-7 text-center flex-shrink-0">
                                {String(i + 1).padStart(2, "0")}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-fizou-white group-hover:text-fizou-red transition-colors line-clamp-1">
                                    {article.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {article.category && !Array.isArray(article.category) && (
                                        <span className="text-[10px] font-bold text-fizou-red uppercase">{(article.category as any).name}</span>
                                    )}
                                    <span className="text-[10px] text-fizou-gray flex items-center gap-0.5">
                                        <Clock className="h-2.5 w-2.5" />
                                        {timeAgoShort(article.published_at)}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-fizou-gray/30 group-hover:text-fizou-red transition-colors flex-shrink-0" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
