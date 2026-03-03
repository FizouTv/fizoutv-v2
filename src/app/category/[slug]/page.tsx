import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, Lock, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch category
    const { data: category } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!category) notFound();

    // Fetch articles in category
    const { data: articles } = await supabase
        .from("articles")
        .select("*, author:authors(display_name)")
        .eq("category_id", category.id)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    const featuredArticle = articles?.[0];
    const restArticles = articles?.slice(1) || [];

    return (
        <main className="min-h-screen bg-fizou-dark">
            <Header />

            <div className="container mx-auto px-4 py-10">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-fizou-gray mb-6" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-fizou-white transition-colors">Accueil</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-fizou-white">{category.name}</span>
                </nav>

                {/* Category Header */}
                <div className="border-l-8 border-fizou-red pl-5 mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-fizou-white uppercase tracking-tight">
                        {category.name}
                    </h1>
                    <p className="text-fizou-gray mt-2">
                        {articles?.length || 0} article{(articles?.length || 0) > 1 ? "s" : ""} publié{(articles?.length || 0) > 1 ? "s" : ""}
                    </p>
                </div>

                {!articles || articles.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="h-16 w-16 text-fizou-gray/20 mx-auto mb-4" />
                        <p className="text-fizou-gray text-lg">Aucun article dans cette rubrique pour le moment.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Article (first one) */}
                        {featuredArticle && (
                            <Link href={`/article/${featuredArticle.slug}`} className="block group mb-12">
                                <div className="relative aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl">
                                    {featuredArticle.cover_image_url ? (
                                        <Image
                                            src={featuredArticle.cover_image_url}
                                            alt={featuredArticle.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, 1200px"
                                            priority
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-fizou-dark-alt" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                                    <div className="absolute bottom-0 p-6 md:p-10 w-full">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-fizou-red text-white text-xs font-bold px-3 py-1 rounded-full">
                                                DERNIER ARTICLE
                                            </span>
                                            {featuredArticle.is_exclusive && (
                                                <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full">
                                                    <Lock className="h-3 w-3" /> EXCLUSIF
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3 group-hover:text-fizou-red transition-colors">
                                            {featuredArticle.title}
                                        </h2>
                                        {featuredArticle.chapo && (
                                            <p className="text-fizou-gray/80 text-sm md:text-base line-clamp-2 max-w-3xl mb-3">
                                                {featuredArticle.chapo}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-fizou-gray">
                                            <span>{featuredArticle.author?.display_name || "Rédaction"}</span>
                                            <span>•</span>
                                            <time dateTime={featuredArticle.published_at}>
                                                {new Date(featuredArticle.published_at).toLocaleDateString("fr-FR", {
                                                    day: "numeric", month: "long", year: "numeric",
                                                })}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Rest of articles */}
                        {restArticles.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {restArticles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={`/article/${article.slug}`}
                                        className="group bg-fizou-dark-alt border border-white/5 rounded-xl overflow-hidden hover:border-fizou-red/30 transition-all hover:shadow-lg hover:shadow-fizou-red/5"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-video overflow-hidden">
                                            {article.cover_image_url ? (
                                                <Image
                                                    src={article.cover_image_url}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                    sizes="(max-width: 768px) 100vw, 400px"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-fizou-dark flex items-center justify-center">
                                                    <FileText className="h-10 w-10 text-fizou-gray/20" />
                                                </div>
                                            )}
                                            {article.is_exclusive && (
                                                <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    <Lock className="h-2.5 w-2.5" /> EXCLUSIF
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-fizou-white leading-snug mb-2 group-hover:text-fizou-red transition-colors line-clamp-2">
                                                {article.title}
                                            </h3>
                                            {article.chapo && (
                                                <p className="text-fizou-gray text-sm line-clamp-2 mb-3">
                                                    {article.chapo}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-fizou-gray/60">
                                                <time dateTime={article.published_at}>
                                                    {new Date(article.published_at).toLocaleDateString("fr-FR", {
                                                        day: "numeric", month: "short",
                                                    })}
                                                </time>
                                                <span>•</span>
                                                <span>{article.author?.display_name || "Rédaction"}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </main>
    );
}
