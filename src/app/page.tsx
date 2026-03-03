import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import LatestNews from "@/components/home/LatestNews";
import { createClient } from "@/lib/supabase/server";
import NewsletterSection from "@/components/home/NewsletterSection";
import { timeAgo } from "@/lib/utils/timeAgo";
import Image from "next/image";
import Link from "next/link";
import { FileText, Lock, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  // Fetch all categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch latest published article per category
  const { data: latestArticles } = await supabase
    .from("articles")
    .select("id, title, slug, chapo, cover_image_url, is_exclusive, published_at, category_id, category:categories(name, slug)")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  // Group: last article per category
  const articleByCategory = new Map<string, typeof latestArticles extends (infer T)[] | null ? T : never>();
  if (latestArticles) {
    for (const article of latestArticles) {
      if (article.category_id && !articleByCategory.has(article.category_id)) {
        articleByCategory.set(article.category_id, article);
      }
    }
  }

  // Fallback images for categories with no articles
  const fallbackImages: Record<string, string> = {
    "politique": "https://images.unsplash.com/photo-1541872703-74c5e443d1fe?q=80&w=600",
    "economie": "https://images.unsplash.com/photo-1611974765270-ca6e1128adc5?q=80&w=600",
    "international": "https://images.unsplash.com/photo-1529101091760-61df6be21f24?q=80&w=600",
    "societe": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600",
    "immigration": "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?q=80&w=600",
    "police-justice": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600",
    "sport": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600",
    "histoire": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=600",
    "investigation": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600",
  };



  return (
    <main className="min-h-screen">
      <Header />

      <div className="py-4">
        <HeroSection />

        <LatestNews />

        {/* Category Sections */}
        <div className="container mx-auto px-4 py-12 border-t border-fizou-dark-alt mt-8">
          <h2 className="text-2xl md:text-3xl font-black text-fizou-white mb-8 border-l-8 border-fizou-red pl-4">
            TOUTES NOS RUBRIQUES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories?.map((cat) => {
              const latestArticle = articleByCategory.get(cat.id);
              const bgImage = latestArticle?.cover_image_url || fallbackImages[cat.slug] || "";

              return (
                <div key={cat.id} className="group">
                  <div className="flex items-center justify-between mb-4 border-l-4 border-fizou-red pl-3">
                    <h2 className="text-xl font-black text-fizou-white uppercase tracking-tight">{cat.name}</h2>
                    <Link href={`/category/${cat.slug}`} className="text-xs font-bold text-fizou-red hover:underline">
                      VOIR TOUT
                    </Link>
                  </div>
                  <Link href={latestArticle ? `/article/${latestArticle.slug}` : `/category/${cat.slug}`}>
                    <div className="relative h-64 rounded-xl overflow-hidden transition-all group-hover:scale-[1.02] shadow-lg">
                      {bgImage ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url(${bgImage})` }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-fizou-dark-alt flex items-center justify-center">
                          <FileText className="h-12 w-12 text-fizou-gray/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                      <div className="absolute bottom-0 p-5 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block bg-fizou-red text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            À LA UNE
                          </span>
                          {latestArticle?.is_exclusive && (
                            <span className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold">
                              <Lock className="h-2.5 w-2.5" /> EXCLUSIF
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white leading-tight mb-2 group-hover:text-fizou-red transition-colors line-clamp-2">
                          {latestArticle?.title || `Dernier article dans la rubrique ${cat.name}...`}
                        </h3>
                        {latestArticle?.chapo && (
                          <p className="text-xs text-fizou-gray/80 line-clamp-2 mb-2">
                            {latestArticle.chapo}
                          </p>
                        )}
                        <p className="text-[10px] text-fizou-gray font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {latestArticle ? timeAgo(latestArticle.published_at) : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <NewsletterSection />
      <Footer />
    </main>
  );
}

