import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Search, Clock, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Recherche | FizouTV",
    description: "Recherchez des articles sur FizouTV - L'actualité en continu.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const query = q?.trim() || "";
    let articles: any[] = [];

    if (query) {
        const supabase = await createClient();
        // Escape special PostgREST/SQL characters for ilike
        const escapedQuery = query.replace(/[%_\\]/g, (c) => `\\${c}`);
        const { data } = await supabase
            .from("articles")
            .select("id, title, slug, chapo, cover_image_url, published_at, category:categories(name, slug)")
            .eq("is_published", true)
            .or(`title.ilike.%${escapedQuery}%,chapo.ilike.%${escapedQuery}%`)
            .order("published_at", { ascending: false })
            .limit(20);
        articles = data || [];
    }

    return (
        <main className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-black text-fizou-white mb-6 flex items-center gap-3">
                    <Search className="h-7 w-7 text-fizou-red" />
                    Recherche
                </h1>

                {/* Search Form */}
                <form method="GET" action="/recherche" className="mb-10">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Rechercher un article..."
                            className="flex-1 rounded-xl border border-white/10 bg-fizou-dark-alt px-5 py-3.5 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red text-lg"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="rounded-xl bg-fizou-red px-6 py-3.5 text-white font-bold hover:bg-red-600 transition-colors"
                            aria-label="Rechercher"
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </form>

                {/* Results */}
                {query && (
                    <p className="text-sm text-fizou-gray mb-6">
                        {articles.length} résultat(s) pour <span className="text-fizou-white font-bold">&quot;{query}&quot;</span>
                    </p>
                )}

                <div className="space-y-4">
                    {articles.map((article) => (
                        <Link key={article.id} href={`/article/${article.slug}`}>
                            <div className="flex gap-4 bg-fizou-dark-alt border border-white/10 rounded-xl p-4 hover:border-fizou-red/30 transition-all group">
                                {article.cover_image_url && (
                                    <div
                                        className="w-32 h-24 rounded-lg bg-cover bg-center flex-shrink-0"
                                        style={{ backgroundImage: `url(${article.cover_image_url})` }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    {article.category && (
                                        <span className="text-[10px] font-bold text-fizou-red uppercase">{article.category.name}</span>
                                    )}
                                    <h3 className="text-base font-bold text-fizou-white group-hover:text-fizou-red transition-colors line-clamp-2 mb-1">
                                        {article.title}
                                    </h3>
                                    {article.chapo && (
                                        <p className="text-xs text-fizou-gray line-clamp-2 mb-1">{article.chapo}</p>
                                    )}
                                    <span className="text-[10px] text-fizou-gray flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(article.published_at).toLocaleDateString("fr-FR")}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {query && articles.length === 0 && (
                        <div className="text-center py-16">
                            <FileText className="h-12 w-12 text-fizou-gray/20 mx-auto mb-4" />
                            <p className="text-fizou-gray">Aucun article trouvé pour cette recherche.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
