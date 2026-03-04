"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, ArrowLeft, Mail, RefreshCw, Calendar } from "lucide-react";
import { COUNTRIES } from "@/lib/constants";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [nationality, setNationality] = useState("");
    const [sex, setSex] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gdprConsent, setGdprConsent] = useState(false);
    const [statsConsent, setStatsConsent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendDone, setResendDone] = useState(false);
    const router = useRouter();

    // Calculate max date for 16 years old restriction
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate())
        .toISOString()
        .split("T")[0];

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Age validation
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 16) {
            setError("Vous devez avoir au moins 16 ans pour vous inscrire.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        if (!gdprConsent) {
            setError("Vous devez accepter la politique de confidentialité.");
            return;
        }

        if (!nationality) {
            setError("Veuillez sélectionner votre nationalité.");
            return;
        }

        if (!sex) {
            setError("Veuillez indiquer votre sexe.");
            return;
        }

        if (!dateOfBirth) {
            setError("Veuillez indiquer votre date de naissance.");
            return;
        }

        if (!firstName || !lastName) {
            setError("Veuillez indiquer votre nom et prénom.");
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: `${firstName} ${lastName}`,
                    first_name: firstName,
                    last_name: lastName,
                    nationality,
                    sex,
                    date_of_birth: dateOfBirth,
                    stats_consent: statsConsent,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    const handleResendEmail = async () => {
        setResendLoading(true);
        const supabase = createClient();
        await supabase.auth.resend({
            type: "signup",
            email,
        });
        setResendLoading(false);
        setResendDone(true);
        setTimeout(() => setResendDone(false), 5000);
    };

    if (success) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-fizou-dark px-4">
                <div className="w-full max-w-md text-center">
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-black text-fizou-white mb-2">
                            Vérifiez votre boîte mail !
                        </h1>
                        <p className="text-fizou-gray text-sm mb-4">
                            Un email de confirmation a été envoyé à <span className="text-fizou-white font-semibold">{email}</span>.
                        </p>

                        {/* Spam warning */}
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-left">
                            <p className="text-yellow-300 text-sm font-medium mb-2">⚠️ Vous ne trouvez pas l&apos;email ?</p>
                            <ul className="text-yellow-200/70 text-xs space-y-1 list-disc list-inside">
                                <li>Vérifiez votre dossier <strong>Spam / Courrier indésirable</strong></li>
                                <li>Vérifiez l&apos;onglet <strong>Promotions</strong> (Gmail)</li>
                                <li>Attendez quelques minutes, le délai peut varier</li>
                            </ul>
                        </div>

                        {/* Resend button */}
                        <button
                            onClick={handleResendEmail}
                            disabled={resendLoading || resendDone}
                            className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white font-medium transition-all hover:bg-white/5 disabled:opacity-50 mb-4"
                        >
                            {resendLoading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : resendDone ? (
                                <>✓ Email renvoyé !</>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4" />
                                    Renvoyer l&apos;email de confirmation
                                </>
                            )}
                        </button>

                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-lg bg-fizou-red px-6 py-2.5 text-white font-bold hover:bg-red-600 transition-all"
                        >
                            J&apos;ai confirmé, me connecter
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-fizou-dark px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Image
                            src="/logofizoutv.png"
                            alt="FizouTV"
                            width={200}
                            height={60}
                            className="h-14 w-auto brightness-0 invert"
                            priority
                        />
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-fizou-dark-alt border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-black text-fizou-white text-center mb-2">
                        Créer un compte
                    </h1>
                    <p className="text-fizou-gray text-sm text-center mb-8">
                        Inscrivez-vous pour accéder au contenu exclusif FizouTV
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    Prénom *
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    placeholder="Votre prénom"
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    Nom *
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    placeholder="Votre nom"
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                Adresse e-mail *
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="vous@exemple.com"
                                className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Date of Birth w/ Style Fix & Age Check */}
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                Date de naissance * <span className="text-xs font-normal opacity-50">(16 ans min.)</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="dob"
                                    type="date"
                                    value={dateOfBirth}
                                    max={maxDate}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert pr-4"
                                />
                            </div>
                        </div>

                        {/* Sex & Nationality row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="sex" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    Sexe *
                                </label>
                                <select
                                    id="sex"
                                    value={sex}
                                    onChange={(e) => setSex(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all"
                                >
                                    <option value="">Choisir...</option>
                                    <option value="homme">Homme</option>
                                    <option value="femme">Femme</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="nationality" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                    Nationalité *
                                </label>
                                <select
                                    id="nationality"
                                    value={nationality}
                                    onChange={(e) => setNationality(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all"
                                >
                                    <option value="">Choisir...</option>
                                    {COUNTRIES.map((country) => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                Mot de passe *
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="6 caractères minimum"
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fizou-gray hover:text-fizou-white transition-colors"
                                    aria-label={showPassword ? "Masquer" : "Afficher"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                Confirmer le mot de passe *
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="Confirmez votre mot de passe"
                                className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Stats Consent */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={statsConsent}
                                onChange={(e) => setStatsConsent(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-white/20 bg-fizou-dark text-fizou-red focus:ring-fizou-red"
                            />
                            <span className="text-sm text-fizou-gray leading-snug">
                                J&apos;accepte que mes données soient utilisées à des fins de <strong>statistiques internes</strong>. Elles ne seront jamais transmises à un tiers.
                            </span>
                        </label>

                        {/* RGPD Consent */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={gdprConsent}
                                onChange={(e) => setGdprConsent(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-white/20 bg-fizou-dark text-fizou-red focus:ring-fizou-red"
                            />
                            <span className="text-sm text-fizou-gray leading-snug">
                                J&apos;accepte la{" "}
                                <Link href="/mentions-legales" className="text-fizou-red hover:underline">
                                    politique de confidentialité
                                </Link>{" "}
                                et le traitement de mes données personnelles. *
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-fizou-red px-4 py-3 text-white font-bold transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="h-5 w-5" />
                                    Créer mon compte
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-fizou-gray">
                        Déjà un compte ?{" "}
                        <Link href="/login" className="text-fizou-red font-semibold hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/" className="inline-flex items-center gap-1 text-sm text-fizou-gray hover:text-fizou-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </main>
    );
}
