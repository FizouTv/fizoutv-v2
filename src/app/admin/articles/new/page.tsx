"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
    Save,
    Send,
    ArrowLeft,
    Star,
    Lock,
    ImageIcon,
    UserPen,
    Plus,
    X,
} from "lucide-react";
import type { Category, Author } from "@/types/database";
import type { JSONContent } from "@tiptap/react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
    () => import("@/components/admin/RichTextEditor"),
    {
        ssr: false,
        loading: () => (
            <div className="bg-fizou-dark border border-white/10 rounded-xl overflow-hidden">
                <div className="h-12 bg-fizou-dark-alt border-b border-white/10 animate-pulse" />
                <div className="p-6 min-h-[400px] flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-fizou-red/30 border-t-fizou-red rounded-full animate-spin" />
                </div>
            </div>
        ),
    }
);

export default function NewArticlePage() {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [chapo, setChapo] = useState("");
    const [content, setContent] = useState<JSONContent | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [authorId, setAuthorId] = useState("");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isExclusive, setIsExclusive] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Author creation modal
    const [showNewAuthor, setShowNewAuthor] = useState(false);
    const [newAuthorName, setNewAuthorName] = useState("");
    const [newAuthorEmail, setNewAuthorEmail] = useState("");
    const [creatingAuthor, setCreatingAuthor] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // Fetch categories
            const { data: cats } = await supabase
                .from("categories")
                .select("*")
                .order("name");
            if (cats) setCategories(cats);

            // Fetch authors for author selection
            const { data: authorsList } = await supabase
                .from("authors")
                .select("*")
                .order("display_name");
            if (authorsList) setAuthors(authorsList);

            // Default author to current user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) setAuthorId(user.id);
        };
        fetchData();
    }, []);

    // Auto-generate slug from title
    useEffect(() => {
        const generatedSlug = title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .substring(0, 80);
        setSlug(generatedSlug);
    }, [title]);

    const handleCreateAuthor = async () => {
        if (!newAuthorName.trim()) return;
        setCreatingAuthor(true);

        const supabase = createClient();

        const { error: insertError } = await supabase.from("authors").insert({
            display_name: newAuthorName.trim(),
        });

        if (insertError) {
            setError(`Erreur: ${insertError.message}`);
            setCreatingAuthor(false);
            return;
        }

        // Refresh authors list
        const { data: authorsList } = await supabase
            .from("authors")
            .select("*")
            .order("display_name");
        if (authorsList) {
            setAuthors(authorsList);
            // Select the newly created author (last one with this name)
            const newAuthor = authorsList.find(
                (a) => a.display_name === newAuthorName.trim()
            );
            if (newAuthor) setAuthorId(newAuthor.id);
        }
        setNewAuthorName("");
        setNewAuthorEmail("");
        setShowNewAuthor(false);
        setCreatingAuthor(false);
    };

    const handleSubmit = async (publish: boolean) => {
        setError(null);

        if (!title.trim()) {
            setError("Le titre est obligatoire.");
            return;
        }
        if (!categoryId) {
            setError("Veuillez sélectionner une catégorie.");
            return;
        }
        if (!authorId) {
            setError("Veuillez sélectionner un auteur.");
            return;
        }

        setLoading(true);

        const supabase = createClient();

        const articleData = {
            title: title.trim(),
            slug,
            chapo: chapo.trim() || null,
            content: content || null,
            cover_image_url: coverImageUrl.trim() || null,
            category_id: categoryId,
            author_id: authorId,
            is_featured: isFeatured,
            is_exclusive: isExclusive,
            is_published: publish,
            published_at: publish ? new Date().toISOString() : null,
        };

        const { error: insertError } = await supabase
            .from("articles")
            .insert(articleData);

        if (insertError) {
            setError(insertError.message);
            setLoading(false);
            return;
        }

        router.push("/admin/articles");
        router.refresh();
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg bg-fizou-dark-alt border border-white/10 text-fizou-gray hover:text-fizou-white transition-colors"
                    aria-label="Retour"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-fizou-white">
                        Nouvel article
                    </h1>
                    <p className="text-fizou-gray mt-1">
                        Rédigez et publiez un article sur FizouTV
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-6">
                    {error}
                </div>
            )}

            {/* Main Layout: Sidebar Left + Content Right */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* ══════════════ LEFT SIDEBAR ══════════════ */}
                <div className="w-full lg:w-80 shrink-0 space-y-4 order-2 lg:order-1">
                    {/* Author */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-5">
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-2">
                            <UserPen className="inline h-4 w-4 mr-1" />
                            Auteur *
                        </label>
                        <select
                            value={authorId}
                            onChange={(e) => setAuthorId(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-2.5 text-fizou-white text-sm focus:outline-none focus:ring-2 focus:ring-fizou-red"
                        >
                            <option value="">Sélectionner...</option>
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>
                                    {author.display_name || "Sans nom"}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setShowNewAuthor(!showNewAuthor)}
                            className="mt-2 flex items-center gap-1.5 text-xs text-fizou-red hover:text-red-400 transition-colors font-medium"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Créer un auteur
                        </button>

                        {/* New Author Form */}
                        {showNewAuthor && (
                            <div className="mt-3 p-3 bg-fizou-dark rounded-lg border border-white/10 space-y-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-fizou-gray uppercase">
                                        Nouvel auteur
                                    </span>
                                    <button
                                        onClick={() => setShowNewAuthor(false)}
                                        className="text-fizou-gray hover:text-fizou-white"
                                        aria-label="Fermer"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={newAuthorName}
                                    onChange={(e) =>
                                        setNewAuthorName(e.target.value)
                                    }
                                    placeholder="Nom de l'auteur"
                                    className="w-full rounded-md border border-white/10 bg-fizou-dark-alt px-3 py-2 text-sm text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-1 focus:ring-fizou-red"
                                />
                                <button
                                    onClick={handleCreateAuthor}
                                    disabled={
                                        !newAuthorName.trim() || creatingAuthor
                                    }
                                    className="w-full flex items-center justify-center gap-1.5 rounded-md bg-fizou-red px-3 py-2 text-xs text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                    {creatingAuthor ? (
                                        <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="h-3.5 w-3.5" />
                                            Ajouter
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-5">
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-2">
                            Catégorie *
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-2.5 text-fizou-white text-sm focus:outline-none focus:ring-2 focus:ring-fizou-red"
                        >
                            <option value="">Sélectionner...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Options */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-5 space-y-3">
                        <p className="text-sm font-bold text-fizou-gray uppercase tracking-wider mb-1">
                            Options
                        </p>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) =>
                                    setIsFeatured(e.target.checked)
                                }
                                className="h-4 w-4 rounded bg-fizou-dark border-white/20 text-fizou-red focus:ring-fizou-red"
                            />
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-fizou-white font-medium">
                                À la Une
                            </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isExclusive}
                                onChange={(e) =>
                                    setIsExclusive(e.target.checked)
                                }
                                className="h-4 w-4 rounded bg-fizou-dark border-white/20 text-fizou-red focus:ring-fizou-red"
                            />
                            <Lock className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-fizou-white font-medium">
                                Contenu exclusif
                            </span>
                        </label>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-5">
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-2">
                            <ImageIcon className="inline h-4 w-4 mr-1" />
                            Image de couverture
                        </label>
                        <input
                            type="url"
                            value={coverImageUrl}
                            onChange={(e) => setCoverImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded-lg border border-white/10 bg-fizou-dark px-3 py-2.5 text-sm text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red"
                        />
                        {coverImageUrl && (
                            <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={coverImageUrl}
                                    alt="Preview"
                                    className="w-full h-36 object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons — Sidebar */}
                    <div className="space-y-2">
                        <button
                            onClick={() => handleSubmit(true)}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-fizou-red px-6 py-3 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    Publier
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-fizou-dark-alt px-6 py-3 text-fizou-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                        >
                            <Save className="h-5 w-5" />
                            Brouillon
                        </button>
                    </div>
                </div>

                {/* ══════════════ RIGHT CONTENT ══════════════ */}
                <div className="flex-1 min-w-0 space-y-6 order-1 lg:order-2">
                    {/* Title */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-2">
                            Titre *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Un titre accrocheur..."
                            className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-xl font-bold text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red"
                        />
                        <p className="text-xs text-fizou-gray mt-2">
                            Slug :{" "}
                            <span className="text-fizou-white font-mono">
                                {slug || "—"}
                            </span>
                        </p>
                    </div>

                    {/* Chapô */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-2">
                            Chapô
                        </label>
                        <textarea
                            value={chapo}
                            onChange={(e) => setChapo(e.target.value)}
                            placeholder="Un court résumé de l'article (visible en aperçu)..."
                            rows={3}
                            className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red resize-none"
                        />
                    </div>

                    {/* Rich Text Editor */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-3">
                            Contenu de l&apos;article
                        </label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
