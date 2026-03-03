"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function NewsletterSection() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Merci ! Vous êtes bien inscrit à la newsletter.");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Une erreur est survenue.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Erreur de connexion avec le serveur.");
        }
    };

    return (
        <section className="py-16 bg-gradient-to-br from-fizou-dark to-black relative overflow-hidden border-t border-fizou-dark-alt">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-fizou-red rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900 rounded-full blur-[128px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-12 text-center shadow-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
                            NE RATEZ <span className="text-fizou-red">RIEN</span> DE L'INFO
                        </h2>
                        <p className="text-fizou-gray text-base lg:text-lg mb-8 max-w-2xl mx-auto">
                            Rejoignez notre communauté et recevez chaque matin l'essentiel de l'actualité directement dans votre boîte mail via notre newsletter "L'Édito du Matin".
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                            <div className="flex-grow relative">
                                <input
                                    type="email"
                                    placeholder="votre.email@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === "loading" || status === "success"}
                                    className="w-full bg-black/50 border border-white/20 rounded-xl px-6 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-fizou-red focus:ring-1 focus:ring-fizou-red transition-all disabled:opacity-50"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === "loading" || status === "success"}
                                className="bg-fizou-red hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 whitespace-nowrap min-w-[160px]"
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Envoi...
                                    </>
                                ) : status === "success" ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        Inscrit !
                                    </>
                                ) : (
                                    <>
                                        S'INSCRIRE <Send className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className={`mt-4 text-sm font-medium flex items-center justify-center gap-2 ${status === "success" ? "text-green-400" : "text-red-400"
                                    }`}
                            >
                                {status === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                {message}
                            </motion.div>
                        )}

                        <p className="text-xs text-fizou-gray/50 mt-6">
                            En vous inscrivant, vous acceptez de recevoir nos emails. Vous pourrez vous désinscrire à tout moment.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
