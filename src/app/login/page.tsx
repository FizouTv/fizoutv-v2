"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(
                error.message === "Invalid login credentials"
                    ? "Email ou mot de passe incorrect."
                    : error.message
            );
            setLoading(false);
            return;
        }

        router.push(redirect);
        router.refresh();
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-fizou-dark px-4">
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
                        Connexion
                    </h1>
                    <p className="text-fizou-gray text-sm text-center mb-8">
                        Connectez-vous pour accéder au contenu exclusif
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                Adresse e-mail
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

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-fizou-gray mb-1.5">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-white/10 bg-fizou-dark px-4 py-3 text-fizou-white placeholder:text-fizou-gray/50 focus:outline-none focus:ring-2 focus:ring-fizou-red focus:border-transparent transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fizou-gray hover:text-fizou-white transition-colors"
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-lg bg-fizou-red px-4 py-3 text-white font-bold transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5" />
                                    Se connecter
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-fizou-gray">
                        Pas encore de compte ?{" "}
                        <Link href="/register" className="text-fizou-red font-semibold hover:underline">
                            Créer un compte
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
