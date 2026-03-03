"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, Plus, Trash2, ToggleLeft, ToggleRight, Pencil, X, Save, Calendar, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import type { Poll } from "@/types/database";

export default function AdminPollsPage() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [scheduledDate, setScheduledDate] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editQuestion, setEditQuestion] = useState("");
    const [editOptions, setEditOptions] = useState<string[]>([]);
    const [editScheduledDate, setEditScheduledDate] = useState("");

    const fetchPolls = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from("polls")

            .select("*")
            .order("scheduled_for", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false });
        if (data) setPolls(data);
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    const addOption = () => setOptions([...options, ""]);
    const removeOption = (index: number) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleCreatePoll = async () => {
        setError(null);
        if (!question.trim()) {
            setError("La question est obligatoire.");
            return;
        }
        const validOptions = options.filter((o) => o.trim());
        if (validOptions.length < 2) {
            setError("Il faut au moins 2 options.");
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { error: insertError } = await supabase.from("polls").insert({
            question: question.trim(),
            options: validOptions.map((o) => o.trim()),
            scheduled_for: scheduledDate || null,
            created_by: user?.id,
        });

        if (insertError) {
            setError(insertError.message);
        } else {
            setQuestion("");

            setOptions(["", ""]);
            setScheduledDate("");
            fetchPolls();
        }
        setLoading(false);
    };

    const togglePollActive = async (pollId: string, currentState: boolean) => {
        const supabase = createClient();
        await supabase.from("polls").update({ is_active: !currentState }).eq("id", pollId);
        setPolls((prev) =>
            prev.map((p) => (p.id === pollId ? { ...p, is_active: !currentState } : p))
        );
    };

    const handleDelete = async (pollId: string) => {
        if (!confirm("Supprimer ce sondage ?")) return;
        const supabase = createClient();
        await supabase.from("polls").delete().eq("id", pollId);
        setPolls((prev) => prev.filter((p) => p.id !== pollId));
    };

    const startEdit = (poll: Poll) => {
        setEditId(poll.id);
        setEditQuestion(poll.question);
        setEditOptions(Array.isArray(poll.options) ? [...poll.options] : []);
        setEditScheduledDate(poll.scheduled_for || "");
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditQuestion("");
        setEditOptions([]);
        setEditScheduledDate("");
    };

    const saveEdit = async () => {
        if (!editQuestion.trim()) return;
        const validOptions = editOptions.filter((o) => o.trim());
        if (validOptions.length < 2) return;

        const supabase = createClient();
        await supabase
            .from("polls")
            .update({
                question: editQuestion.trim(),
                options: validOptions.map((o) => o.trim()),
                scheduled_for: editScheduledDate || null
            })
            .eq("id", editId);

        setPolls((prev) =>
            prev.map((p) =>
                p.id === editId
                    ? {
                        ...p,
                        question: editQuestion.trim(),
                        options: validOptions.map((o) => o.trim()),
                        scheduled_for: editScheduledDate || null
                    }
                    : p
            )
        );
        cancelEdit();
    };

    const handleExport = async (poll: Poll) => {
        const supabase = createClient();
        // Fetch votes
        const { data: votes } = await supabase
            .from("poll_votes")
            .select("option_index, created_at")
            .eq("poll_id", poll.id);

        if (!votes) return;

        // Aggregate results
        const options = Array.isArray(poll.options) ? poll.options : [];
        const results = options.map((opt, i) => ({
            Option: opt,
            Votes: votes.filter(v => v.option_index === i).length,
            Percentage: votes.length > 0
                ? ((votes.filter(v => v.option_index === i).length / votes.length) * 100).toFixed(1) + "%"
                : "0%"
        }));

        // Create workbook
        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.json_to_sheet(results);

        // Add summary row
        XLSX.utils.sheet_add_aoa(wsSummary, [["Total Votes", votes.length]], { origin: -1 });

        XLSX.utils.book_append_sheet(wb, wsSummary, "Résultats");

        // Save file
        XLSX.writeFile(wb, `Sondage_${poll.id.slice(0, 8)}.xlsx`);
    };

    return (
        <div>
            <h1 className="text-3xl font-black text-fizou-white flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-fizou-red" />
                Sondages
            </h1>
            <p className="text-fizou-gray mb-8">Créez et gérez vos sondages</p>

            {/* Create Poll Form */}
            <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold text-fizou-white mb-4">Nouveau sondage</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Votre question..."
                        className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red"
                    />

                    {options.map((opt, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...options];
                                    newOpts[i] = e.target.value;
                                    setOptions(newOpts);
                                }}
                                placeholder={`Option ${i + 1}`}
                                className="flex-1 rounded-lg border border-white/10 bg-fizou-dark px-4 py-2.5 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red"
                            />
                            {options.length > 2 && (
                                <button
                                    onClick={() => removeOption(i)}
                                    className="p-2 text-red-400 hover:text-red-300"
                                    aria-label="Supprimer l'option"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}

                    <div className="flex gap-3">
                        <button
                            onClick={addOption}
                            className="flex items-center gap-1 text-sm text-fizou-gray hover:text-fizou-white transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Ajouter une option
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-fizou-gray" />
                        <input
                            type="date"
                            className="rounded-lg border border-white/10 bg-fizou-dark px-3 py-2 text-fizou-white text-sm focus:outline-none focus:ring-2 focus:ring-fizou-red"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                        />
                        <span className="text-xs text-fizou-gray">Date de publication (optionnel)</span>
                    </div>

                    <button
                        onClick={handleCreatePoll}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-fizou-red px-5 py-2.5 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Plus className="h-5 w-5" />
                                Créer le sondage
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Polls List */}
            <div className="space-y-4">
                {polls.map((poll) => (
                    <div key={poll.id} className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        {editId === poll.id ? (
                            /* Edit mode */
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={editQuestion}
                                    onChange={(e) => setEditQuestion(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-2.5 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                />
                                {editOptions.map((opt, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...editOptions];
                                                newOpts[i] = e.target.value;
                                                setEditOptions(newOpts);
                                            }}
                                            className="flex-1 rounded-lg border border-white/10 bg-fizou-dark px-4 py-2 text-fizou-white text-sm focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                        />
                                        {editOptions.length > 2 && (
                                            <button
                                                onClick={() => setEditOptions(editOptions.filter((_, idx) => idx !== i))}
                                                className="p-1 text-red-400"
                                                aria-label="Supprimer"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => setEditOptions([...editOptions, ""])}
                                    className="text-xs text-fizou-gray hover:text-fizou-white"
                                >
                                    + Option
                                </button>
                                <div className="flex items-center gap-2 mt-2">
                                    <Calendar className="h-4 w-4 text-fizou-gray" />
                                    <input
                                        type="date"
                                        className="rounded-lg border border-white/10 bg-fizou-dark px-3 py-2 text-fizou-white text-sm focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                        value={editScheduledDate}
                                        onChange={(e) => setEditScheduledDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={saveEdit}
                                        className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-white text-sm font-bold hover:bg-green-700 transition-all"
                                    >
                                        <Save className="h-4 w-4" /> Sauvegarder
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="px-4 py-2 text-fizou-gray text-sm hover:text-fizou-white"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* View mode */
                            <>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-fizou-white">{poll.question}</h3>
                                        <p className="text-xs text-fizou-gray mt-1">
                                            {new Date(poll.created_at).toLocaleDateString("fr-FR")}
                                            {poll.scheduled_for && (
                                                <span className="ml-2 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/20">
                                                    Planifié : {new Date(poll.scheduled_for).toLocaleDateString("fr-FR")}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => startEdit(poll)}
                                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                            aria-label="Modifier"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => togglePollActive(poll.id, poll.is_active)}
                                            className={`p-2 rounded-lg transition-colors ${poll.is_active
                                                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                : "bg-fizou-dark text-fizou-gray hover:bg-white/5"
                                                }`}
                                            aria-label={poll.is_active ? "Désactiver" : "Activer"}
                                        >
                                            {poll.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(poll.id)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                            aria-label="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleExport(poll)}
                                        className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors ml-2"
                                        title="Exporter les résultats (Excel)"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(poll.options) &&
                                        poll.options.map((opt: string, i: number) => (
                                            <span
                                                key={i}
                                                className="inline-block bg-fizou-dark border border-white/10 text-fizou-gray text-xs px-3 py-1.5 rounded-full"
                                            >
                                                {opt}
                                            </span>
                                        ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {polls.length === 0 && (
                    <div className="text-center py-12">
                        <BarChart3 className="h-12 w-12 text-fizou-gray/20 mx-auto mb-4" />
                        <p className="text-fizou-gray">Aucun sondage pour le moment</p>
                    </div>
                )}
            </div>
        </div >
    );
}
