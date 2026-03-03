"use client";

import { useState, useTransition } from "react";
import { Users, Download, Shield, User, Trash2, ShieldCheck, ShieldOff, X, Loader2 } from "lucide-react";
import { deleteUser, toggleAdminRole } from "./actions";

interface Profile {
    id: string;
    display_name: string | null;
    role: string;
    created_at: string;
}

export default function UsersTable({
    profiles: initialProfiles,
    currentUserId,
}: {
    profiles: Profile[];
    currentUserId: string;
}) {
    const [profiles, setProfiles] = useState(initialProfiles);
    const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
    const [isPending, startTransition] = useTransition();
    const [actionId, setActionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleDelete(profile: Profile) {
        setError(null);
        setDeleteTarget(profile);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setActionId(deleteTarget.id);
        startTransition(async () => {
            const result = await deleteUser(deleteTarget.id);
            if (result.error) {
                setError(result.error);
            } else {
                setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            }
            setDeleteTarget(null);
            setActionId(null);
        });
    }

    function handleToggleRole(profile: Profile) {
        setError(null);
        setActionId(profile.id);
        startTransition(async () => {
            const result = await toggleAdminRole(profile.id, profile.role);
            if (result.error) {
                setError(result.error);
            } else {
                setProfiles((prev) =>
                    prev.map((p) =>
                        p.id === profile.id ? { ...p, role: result.newRole! } : p
                    )
                );
            }
            setActionId(null);
        });
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-fizou-white flex items-center gap-3">
                        <Users className="h-8 w-8 text-fizou-red" />
                        Utilisateurs
                    </h1>
                    <p className="text-fizou-gray mt-1">
                        {profiles.length} utilisateur{profiles.length !== 1 ? "s" : ""} inscrit{profiles.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <a
                    href="/api/admin/export/users"
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
                {profiles.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="h-12 w-12 text-fizou-gray/30 mx-auto mb-4" />
                        <p className="text-fizou-gray text-lg">Aucun utilisateur inscrit</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider">Date d&apos;inscription</th>
                                <th className="px-6 py-4 text-xs font-bold text-fizou-gray uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile) => {
                                const isSelf = profile.id === currentUserId;
                                const isLoading = isPending && actionId === profile.id;

                                return (
                                    <tr key={profile.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-fizou-red/20 flex items-center justify-center text-fizou-red text-sm font-bold">
                                                    {(profile.display_name || "U")[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-fizou-white font-medium">
                                                        {profile.display_name || "Sans nom"}
                                                    </span>
                                                    {isSelf && (
                                                        <span className="ml-2 text-[10px] text-fizou-gray bg-white/5 px-1.5 py-0.5 rounded">
                                                            Vous
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {profile.role === "admin" ? (
                                                <span className="inline-flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                                    <Shield className="h-3 w-3" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-fizou-gray text-xs font-medium">
                                                    <User className="h-3 w-3" /> Membre
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-fizou-gray">
                                            {new Date(profile.created_at).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {!isSelf && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleRole(profile)}
                                                            disabled={isLoading}
                                                            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-fizou-gray hover:text-yellow-400 disabled:opacity-50"
                                                            title={profile.role === "admin" ? "Retirer admin" : "Promouvoir admin"}
                                                        >
                                                            {isLoading ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : profile.role === "admin" ? (
                                                                <ShieldOff className="h-4 w-4" />
                                                            ) : (
                                                                <ShieldCheck className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(profile)}
                                                            disabled={isLoading}
                                                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-fizou-gray hover:text-red-400 disabled:opacity-50"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
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
                            <h3 className="text-lg font-bold text-fizou-white">Supprimer l&apos;utilisateur</h3>
                        </div>
                        <p className="text-fizou-gray text-sm mb-6">
                            Êtes-vous sûr de vouloir supprimer <strong className="text-fizou-white">{deleteTarget.display_name || "cet utilisateur"}</strong> ?
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
