import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShareButtons from "@/components/home/ShareButtons";
import ArticleContent from "@/components/article/ArticleContent";
import Image from "next/image";
import Link from "next/link";
import { Clock, User, Calendar, Lock, ChevronRight } from "lucide-react";
import { extractTextFromTipTap, calculateReadingTime } from "@/lib/utils/readingTime";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: article } = await supabase
        .from("articles")
        .select("title, chapo, cover_image_url")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!article) return { title: "Article introuvable | FizouTV" };

    return {
        title: `${article.title} | FizouTV`,
        description: article.chapo || article.title,
        openGraph: {
            title: article.title,
            description: article.chapo || article.title,
            images: article.cover_image_url ? [article.cover_image_url] : [],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: article.title,
            description: article.chapo || article.title,
            images: article.cover_image_url ? [article.cover_image_url] : [],
        },
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: article } = await supabase
        .from("articles")
        .select("*, category:categories(name, slug), author:authors(display_name)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (!article) notFound();

    // Check if exclusive content
    const { data: { user } } = await supabase.auth.getUser();
    const isExclusive = article.is_exclusive && !user;

    // Reading time estimation — uses proper text extraction from TipTap JSON
    const contentText = extractTextFromTipTap(article.content);
    const wordCount = contentText.split(/\s+/).filter(Boolean).length;
    const readingTime = calculateReadingTime(contentText);

    // JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        description: article.chapo || "",
        image: article.cover_image_url || "",
        datePublished: article.published_at,
        dateModified: article.updated_at,
        author: {
            "@type": "Person",
            name: article.author?.display_name || "FizouTV",
        },
        publisher: {
            "@type": "Organization",
            name: "FizouTV",
            logo: { "@type": "ImageObject", url: "/logofizoutv.png" },
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="min-h-screen bg-fizou-dark">
                <Header />

                <article className="max-w-4xl mx-auto px-4 py-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-fizou-gray mb-6" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-fizou-white transition-colors">Accueil</Link>
                        <ChevronRight className="h-3 w-3" />
                        {article.category && (
                            <>
                                <Link
                                    href={`/category/${article.category.slug}`}
                                    className="hover:text-fizou-white transition-colors"
                                >
                                    {article.category.name}
                                </Link>
                                <ChevronRight className="h-3 w-3" />
                            </>
                        )}
                        <span className="text-fizou-white truncate max-w-[200px]">{article.title}</span>
                    </nav>

                    {/* Category badge */}
                    {article.category && (
                        <Link href={`/category/${article.category.slug}`}>
                            <span className="inline-block bg-fizou-red text-white text-xs font-bold px-3 py-1 rounded-full mb-4 hover:bg-red-600 transition-colors">
                                {article.category.name}
                            </span>
                        </Link>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-black text-fizou-white leading-tight mb-4">
                        {article.title}
                    </h1>

                    {/* Chapô */}
                    {article.chapo && (
                        <p className="text-lg md:text-xl text-fizou-gray font-medium leading-relaxed mb-6 border-l-4 border-fizou-red pl-4">
                            {article.chapo}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-fizou-gray mb-8 pb-6 border-b border-white/10">
                        <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {article.author?.display_name || "Rédaction FizouTV"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={article.published_at}>
                                {new Date(article.published_at).toLocaleDateString("fr-FR", {
                                    day: "numeric", month: "long", year: "numeric",
                                })}
                            </time>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {readingTime} min de lecture
                        </span>
                        {article.is_exclusive && (
                            <span className="flex items-center gap-1.5 text-yellow-400">
                                <Lock className="h-4 w-4" />
                                Contenu exclusif
                            </span>
                        )}
                        <ShareButtons title={article.title} slug={slug} />
                    </div>

                    {/* Cover Image */}
                    {article.cover_image_url && (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-10">
                            <Image
                                src={article.cover_image_url}
                                alt={article.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 896px"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    {isExclusive ? (
                        <div className="relative">
                            <div className="text-fizou-gray/30 text-lg leading-relaxed line-clamp-3 blur-sm select-none" aria-hidden="true">
                                {contentText.substring(0, 300)}...
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-fizou-dark via-fizou-dark/80 to-transparent">
                                <div className="text-center p-8 bg-fizou-dark-alt/90 border border-white/10 rounded-2xl max-w-md backdrop-blur-md">
                                    <Lock className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
                                    <h3 className="text-xl font-black text-fizou-white mb-2">Contenu exclusif</h3>
                                    <p className="text-fizou-gray text-sm mb-4">
                                        Cet article est réservé aux membres inscrits de FizouTV.
                                    </p>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-2 rounded-lg bg-fizou-red px-6 py-2.5 text-white font-bold hover:bg-red-600 transition-all"
                                    >
                                        S&apos;inscrire gratuitement
                                    </Link>
                                    <p className="text-xs text-fizou-gray mt-3">
                                        Déjà inscrit ?{" "}
                                        <Link href="/login" className="text-fizou-red hover:underline">Se connecter</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ArticleContent content={article.content} />
                    )}
                </article>

                <Footer />
            </main>
        </>
    );
}
