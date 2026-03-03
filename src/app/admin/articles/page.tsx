"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, FileText, Eye, EyeOff, Star, Pencil, Trash2, Lock } from "lucide-react";

interface Article {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    is_featured: boolean;
    is_exclusive: boolean;
    created_at: string;
    category: { name: string } | null;
    author: { display_name: string } | null;
}

export default function AdminArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchArticles = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("articles")
            .select("*, category:categories(name), author:authors(display_name)")
            .order("created_at", { ascending: false });
        setArticles((data as Article[]) || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Supprimer l'article "${title}" ?`)) return;
        const supabase = createClient();
        await supabase.from("articles").delete().eq("id", id);
        setArticles((prev) => prev.filter((a) => a.id !== id));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 border-2 border-fizou-red/30 border-t-fizou-red rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-fizou-white flex items-center gap-3">
                        <FileText className="h-8 w-8 text-fizou-red" />
                        Articles
                    </h1>
                    <p className="text-fizou-gray mt-1">
                        Gérez vos articles et publications
                    </p>
                </div>
                <Link
                    href="/admin/articles/new"
                    className="flex items-center gap-2 rounded-lg bg-fizou-red px-5 py-2.5 text-white font-bold hover:bg-red-600 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Nouvel article
                </Link>
            </div>

            <div className="bg-fizou-dark-alt border border-white/10 rounded-xl overflow-hidden">
                {articles.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="h-12 w-12 text-fizou-gray/30 mx-auto mb-4" />
                        <p className="text-fizou-gray text-lg mb-2">Aucun article pour le moment</p>
                        <p className="text-fizou-gray/50 text-sm mb-6">Créez votre premier article pour commencer</p>
                        <Link
                            href="/admin/articles/new"
                            className="inline-flex items-center gap-2 rounded-lg bg-fizou-red px-5 py-2.5 text-white font-bold hover:bg-red-600 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Créer un article
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Titre</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Catégorie</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr key={article.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {article.is_featured && <Star className="h-4 w-4 text-yellow-400" />}
                                            {article.is_exclusive && <Lock className="h-3.5 w-3.5 text-purple-400" />}
                                            <span className="text-fizou-white font-medium">{article.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block bg-fizou-red/10 text-fizou-red text-xs font-bold px-2 py-1 rounded">
                                            {article.category?.name || "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {article.is_published ? (
                                            <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                                                <Eye className="h-3 w-3" /> Publié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-fizou-gray text-xs font-medium">
                                                <EyeOff className="h-3 w-3" /> Brouillon
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-fizou-gray">
                                        {new Date(article.created_at).toLocaleDateString("fr-FR")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/articles/${article.id}/edit`}
                                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                aria-label="Modifier"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(article.id, article.title)}
                                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                aria-label="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
