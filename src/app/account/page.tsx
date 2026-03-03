"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    User, Mail, Lock, Trash2, Save, ArrowLeft, AlertTriangle, CheckCircle
} from "lucide-react";
import type { Profile } from "@/types/database";

import { COUNTRIES } from "@/lib/constants";

export default function AccountPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [email, setEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [nationality, setNationality] = useState("");
    const [sex, setSex] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            setEmail(user.email || "");

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setProfile(data);
                setDisplayName(data.display_name || "");
                setNationality(data.nationality || "");
                setSex(data.sex || "");
                setDateOfBirth(data.date_of_birth || "");
            }
            setLoading(false);
        };
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showMessage = (type: "success" | "error", text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("profiles")
            .update({
                display_name: displayName.trim() || null,
                nationality: nationality || null,
                sex: sex || null,
                date_of_birth: dateOfBirth || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", profile!.id);

        if (error) {
            showMessage("error", error.message);
        } else {
            showMessage("success", "Profil mis à jour avec succès !");
        }
        setSaving(false);
    };

    const handleChangeEmail = async () => {
        setSavingEmail(true);
        const { error } = await supabase.auth.updateUser({ email });
        if (error) {
            showMessage("error", error.message);
        } else {
            showMessage("success", "Un email de confirmation a été envoyé à votre nouvelle adresse.");
        }
        setSavingEmail(false);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            showMessage("error", "Les mots de passe ne correspondent pas.");
            return;
        }
        if (newPassword.length < 6) {
            showMessage("error", "Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setSavingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            showMessage("error", error.message);
        } else {
            showMessage("success", "Mot de passe mis à jour avec succès !");
            setNewPassword("");
            setConfirmNewPassword("");
        }
        setSavingPassword(false);
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const res = await fetch("/api/account/delete", { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) {
                showMessage("error", data.error || "Erreur lors de la suppression.");
                setDeleting(false);
                return;
            }
            router.push("/");
            router.refresh();
        } catch {
            showMessage("error", "Erreur de connexion avec le serveur.");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-fizou-dark">
                <div className="h-8 w-8 border-2 border-fizou-red/30 border-t-fizou-red rounded-full animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-fizou-dark py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/"
                        className="p-2 rounded-lg bg-fizou-dark-alt border border-white/10 text-fizou-gray hover:text-fizou-white transition-colors"
                        aria-label="Retour"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-fizou-white">Mon compte</h1>
                        <p className="text-fizou-gray text-sm mt-1">Gérez vos informations personnelles</p>
                    </div>
                </div>

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Image
                        src="/logofizoutv.png"
                        alt="FizouTV"
                        width={160}
                        height={50}
                        className="h-10 w-auto brightness-0 invert opacity-30"
                    />
                </div>

                {/* Toast Message */}
                {message && (
                    <div className={`flex items-center gap-2 rounded-lg p-3 mb-6 text-sm ${message.type === "success"
                        ? "bg-green-500/10 border border-green-500/30 text-green-400"
                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                        }`}>
                        {message.type === "success" ? (
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        ) : (
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        )}
                        {message.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Profile Info */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-fizou-white flex items-center gap-2 mb-6">
                            <User className="h-5 w-5 text-fizou-red" />
                            Informations personnelles
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    Nom d&apos;affichage
                                </label>
                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="sex" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                        Sexe
                                    </label>
                                    <select
                                        id="sex"
                                        value={sex}
                                        onChange={(e) => setSex(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                    >
                                        <option value="">Non renseigné</option>
                                        <option value="homme">Homme</option>
                                        <option value="femme">Femme</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="nationality" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                        Nationalité
                                    </label>
                                    <select
                                        id="nationality"
                                        value={nationality}
                                        onChange={(e) => setNationality(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                    >
                                        <option value="">Non renseigné</option>
                                        {COUNTRIES.map((country) => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    Date de naissance
                                </label>
                                <input
                                    id="dateOfBirth"
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>

                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg bg-fizou-red px-5 py-2.5 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Enregistrer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-fizou-white flex items-center gap-2 mb-6">
                            <Mail className="h-5 w-5 text-blue-400" />
                            Adresse e-mail
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    E-mail actuel
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                />
                            </div>

                            <button
                                onClick={handleChangeEmail}
                                disabled={savingEmail}
                                className="flex items-center gap-2 rounded-lg border border-white/10 bg-fizou-dark px-5 py-2.5 text-fizou-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                            >
                                {savingEmail ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Mail className="h-4 w-4" />
                                        Modifier l&apos;email
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-fizou-white flex items-center gap-2 mb-6">
                            <Lock className="h-5 w-5 text-purple-400" />
                            Mot de passe
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="6 caractères minimum"
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    Confirmer le nouveau mot de passe
                                </label>
                                <input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="Confirmez le mot de passe"
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red"
                                />
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={savingPassword || !newPassword}
                                className="flex items-center gap-2 rounded-lg border border-white/10 bg-fizou-dark px-5 py-2.5 text-fizou-white font-bold hover:bg-white/5 transition-all disabled:opacity-50"
                            >
                                {savingPassword ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Lock className="h-4 w-4" />
                                        Changer le mot de passe
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
                            <Trash2 className="h-5 w-5" />
                            Zone de danger
                        </h2>
                        <p className="text-fizou-gray text-sm mb-4">
                            La suppression de votre compte est irréversible. Toutes vos données seront perdues.
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-red-400 font-bold hover:bg-red-500/20 transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                                Supprimer mon compte
                            </button>
                        ) : (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <p className="text-red-300 text-sm font-medium mb-4">
                                    ⚠️ Êtes-vous absolument sûr(e) ? Cette action est irréversible.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-white font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            "Oui, supprimer définitivement"
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-5 py-2.5 text-fizou-gray hover:text-fizou-white transition-colors"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
