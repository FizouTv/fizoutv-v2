"use client";

import { useState, useTransition } from "react";
import { Mail, Download, Trash2, X, Loader2 } from "lucide-react";
import { deleteSubscriber } from "./actions";

interface Subscriber {
    id: string;
    email: string;
    gdpr_consent: boolean;
    subscribed_at: string;
}

export default function SubscribersTable({
    subscribers: initialSubscribers,
}: {
    subscribers: Subscriber[];
}) {
    const [subscribers, setSubscribers] = useState(initialSubscribers);
    const [deleteTarget, setDeleteTarget] = useState<Subscriber | null>(null);
    const [isPending, startTransition] = useTransition();
    const [actionId, setActionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleDelete(sub: Subscriber) {
        setError(null);
        setDeleteTarget(sub);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setActionId(deleteTarget.id);
        startTransition(async () => {
            const result = await deleteSubscriber(deleteTarget.id);
            if (result.error) {
                setError(result.error);
            } else {
                setSubscribers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
            }
            setDeleteTarget(null);
            setActionId(null);
        });
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-fizou-white flex items-center gap-3">
                        <Mail className="h-8 w-8 text-fizou-red" />
                        Abonnés Newsletter
                    </h1>
                    <p className="text-fizou-gray mt-1">
                        {subscribers.length} abonné{subscribers.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <a
                    href="/api/admin/export/subscribers"
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-fizou-dark-alt px-5 py-2.5 text-fizou-white font-bold hover:bg-white/5 transition-all"
                >
                    <Download className="h-5 w-5" />
                    Exporter Excel
                </a>
            </div>

            {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="bg-fizou-dark-alt border border-white/10 rounded-xl overflow-hidden">
                {subscribers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Mail className="h-12 w-12 text-fizou-gray/30 mx-auto mb-4" />
                        <p className="text-fizou-gray text-lg mb-2">Aucun abonné pour le moment</p>
                        <p className="text-fizou-gray/50 text-sm">
                            Les abonnés apparaîtront ici lorsqu&apos;ils s&apos;inscriront à la newsletter
                        </p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">RGPD</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Date d&apos;inscription</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => {
                                const isLoading = isPending && actionId === sub.id;

                                return (
                                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-fizou-white font-medium">{sub.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.gdpr_consent ? (
                                                <span className="text-green-400 text-xs font-medium">✓ Accepté</span>
                                            ) : (
                                                <span className="text-red-400 text-xs font-medium">✗ Refusé</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-fizou-gray">
                                            {new Date(sub.subscribed_at).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end">
                                                <button
                                                    onClick={() => handleDelete(sub)}
                                                    disabled={isLoading}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-fizou-gray hover:text-red-400 disabled:opacity-50"
                                                    title="Supprimer"
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative bg-fizou-dark-alt border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-red-500/10">
                                <Trash2 className="h-5 w-5 text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-fizou-white">Supprimer l&apos;abonné</h3>
                        </div>
                        <p className="text-fizou-gray text-sm mb-6">
                            Êtes-vous sûr de vouloir supprimer <strong className="text-fizou-white">{deleteTarget.email}</strong> de la liste des abonnés ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-fizou-gray hover:text-fizou-white hover:bg-white/5 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isPending}
                                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
