"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    Newspaper, Plus, Send, CheckCircle, Clock, Trash2, Eye,
    Calendar, Bold, Italic, List, ListOrdered, Heading1, Heading2,
    Quote, Minus, Loader2, CalendarClock, Undo, Redo,
} from "lucide-react";

interface Newsletter {
    id: string;
    subject: string;
    content: string;
    status: string;
    scheduled_for: string | null;
    sent_at: string | null;
    created_at: string;
}

// TipTap Toolbar Component
function EditorToolbar({ editor }: { editor: any }) {
    if (!editor) return null;

    const btnClass = (active: boolean) =>
        `p-2 rounded-lg transition-colors ${active
            ? "bg-fizou-red text-white"
            : "text-fizou-gray hover:text-fizou-white hover:bg-white/10"
        }`;

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-white/10 pb-3 mb-3">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))} aria-label="Gras">
                <Bold className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))} aria-label="Italique">
                <Italic className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive("heading", { level: 1 }))} aria-label="Titre 1">
                <Heading1 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))} aria-label="Titre 2">
                <Heading2 className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))} aria-label="Liste à puces">
                <List className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))} aria-label="Liste numérotée">
                <ListOrdered className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive("blockquote"))} aria-label="Citation">
                <Quote className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)} aria-label="Ligne horizontale">
                <Minus className="h-4 w-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btnClass(false)} disabled:opacity-30`} aria-label="Annuler">
                <Undo className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btnClass(false)} disabled:opacity-30`} aria-label="Rétablir">
                <Redo className="h-4 w-4" />
            </button>
        </div>
    );
}

export default function AdminNewsletterPage() {
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [subject, setSubject] = useState("");
    const [scheduledFor, setScheduledFor] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState<string | null>(null);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [previewId, setPreviewId] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "prose prose-invert prose-sm max-w-none min-h-[200px] focus:outline-none text-fizou-white/90 px-1",
            },
        },
    });

    const fetchData = useCallback(async () => {
        const supabase = createClient();
        const { data: nl } = await supabase
            .from("newsletters")
            .select("*")
            .order("created_at", { ascending: false });
        if (nl) setNewsletters(nl);

        const { count } = await supabase
            .from("subscribers")
            .select("*", { count: "exact", head: true });
        setSubscriberCount(count || 0);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async (status: "draft" | "scheduled") => {
        setError(null);
        setSuccess(null);

        if (!subject.trim()) {
            setError("L'objet est obligatoire.");
            return;
        }

        const htmlContent = editor?.getHTML() || "";
        if (!htmlContent || htmlContent === "<p></p>") {
            setError("Le contenu est obligatoire.");
            return;
        }

        if (status === "scheduled" && !scheduledFor) {
            setError("Veuillez choisir une date de programmation.");
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { error: insertError } = await supabase.from("newsletters").insert({
            subject: subject.trim(),
            content: htmlContent,
            status,
            scheduled_for: status === "scheduled" ? new Date(scheduledFor).toISOString() : null,
            created_by: user?.id,
        });

        if (insertError) {
            setError(insertError.message);
        } else {
            setSubject("");
            setScheduledFor("");
            editor?.commands.clearContent();
            setSuccess(status === "scheduled"
                ? `Newsletter programmée pour le ${new Date(scheduledFor).toLocaleDateString("fr-FR")}`
                : "Brouillon sauvegardé avec succès !"
            );
            fetchData();
        }
        setLoading(false);
    };

    const handleSend = async (id: string) => {
        if (!confirm(`Envoyer cette newsletter à ${subscriberCount} abonné(s) maintenant ?`)) return;

        setSending(id);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newsletterId: id }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message);
                fetchData();
            } else {
                setError(data.error || "Erreur lors de l'envoi.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        }
        setSending(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette newsletter ?")) return;
        const supabase = createClient();
        await supabase.from("newsletters").delete().eq("id", id);
        setNewsletters((prev) => prev.filter((nl) => nl.id !== id));
    };

    const getStatusBadge = (nl: Newsletter) => {
        if (nl.status === "sent" || nl.sent_at) {
            return (
                <span className="flex items-center gap-1 text-green-400 text-xs font-semibold bg-green-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Envoyée {nl.sent_at && `le ${new Date(nl.sent_at).toLocaleDateString("fr-FR")}`}
                </span>
            );
        }
        if (nl.status === "scheduled") {
            return (
                <span className="flex items-center gap-1 text-blue-400 text-xs font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full">
                    <CalendarClock className="h-3 w-3" />
                    Programmée {nl.scheduled_for && `pour le ${new Date(nl.scheduled_for).toLocaleDateString("fr-FR")}`}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold bg-yellow-500/10 px-2 py-0.5 rounded-full">
                <Clock className="h-3 w-3" />
                Brouillon
            </span>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-black text-fizou-white flex items-center gap-3 mb-2">
                <Newspaper className="h-8 w-8 text-fizou-red" />
                Newsletter
            </h1>
            <p className="text-fizou-gray mb-8">
                Créez et envoyez des newsletters à vos <span className="text-fizou-white font-semibold">{subscriberCount}</span> abonné(s)
            </p>

            {/* Messages */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg p-3 mb-4">
                    {success}
                </div>
            )}

            {/* Create Newsletter */}
            <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold text-fizou-white mb-4">Nouvelle newsletter</h2>

                <div className="space-y-4">
                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-2">
                            Objet
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="L'Édito du Matin - Semaine du..."
                            className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red"
                        />
                    </div>

                    {/* TipTap Editor */}
                    <div>
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-2">
                            Contenu
                        </label>
                        <div className="rounded-lg border border-white/10 bg-fizou-dark p-4">
                            <EditorToolbar editor={editor} />
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                    {/* Schedule Date */}
                    <div>
                        <label className="block text-sm font-bold text-fizou-gray uppercase tracking-wider mb-2">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Date d&apos;envoi (optionnel)
                        </label>
                        <input
                            type="datetime-local"
                            value={scheduledFor}
                            onChange={(e) => setScheduledFor(e.target.value)}
                            className="w-full md:w-auto rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red"
                        />
                        <p className="text-xs text-fizou-gray mt-1">
                            Laissez vide pour sauvegarder en brouillon, ou choisissez une date pour programmer l&apos;envoi automatique.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                            onClick={() => handleCreate("draft")}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg border border-white/10 bg-fizou-dark px-5 py-2.5 text-fizou-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Sauvegarder brouillon
                                </>
                            )}
                        </button>

                        {scheduledFor && (
                            <button
                                onClick={() => handleCreate("scheduled")}
                                disabled={loading}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <CalendarClock className="h-5 w-5" />
                                        Programmer l&apos;envoi
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Newsletters List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-fizou-white mb-2">Historique</h2>
                {newsletters.map((nl) => (
                    <div key={nl.id} className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-fizou-white">{nl.subject}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-fizou-gray">
                                        {new Date(nl.created_at).toLocaleDateString("fr-FR")}
                                    </span>
                                    {getStatusBadge(nl)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPreviewId(previewId === nl.id ? null : nl.id)}
                                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                    aria-label="Prévisualiser"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                                {!nl.sent_at && nl.status !== "sent" && (
                                    <button
                                        onClick={() => handleSend(nl.id)}
                                        disabled={sending === nl.id}
                                        className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-white text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                                        aria-label="Envoyer maintenant"
                                    >
                                        {sending === nl.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Envoyer
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(nl.id)}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                    aria-label="Supprimer"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        {previewId === nl.id && (
                            <div className="mt-4 border border-white/10 rounded-lg p-4 bg-fizou-dark">
                                <p className="text-xs text-fizou-gray uppercase font-bold mb-2">Aperçu :</p>
                                <div
                                    className="prose prose-invert prose-sm max-w-none text-fizou-gray/90"
                                    dangerouslySetInnerHTML={{ __html: nl.content }}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {newsletters.length === 0 && (
                    <div className="text-center py-12">
                        <Newspaper className="h-12 w-12 text-fizou-gray/20 mx-auto mb-4" />
                        <p className="text-fizou-gray">Aucune newsletter pour le moment</p>
                    </div>
                )}
            </div>
        </div>
    );
}
