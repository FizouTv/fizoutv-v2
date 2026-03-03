import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Scale, Shield, Database, Mail, FileText } from "lucide-react";

export const metadata = {
    title: "Mentions Légales | FizouTV",
    description: "Mentions légales du site FizouTV - L'actualité en continu.",
};

export default function MentionsLegales() {
    return (
        <main className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-16 max-w-3xl">
                <h1 className="text-4xl font-black text-fizou-white mb-2 flex items-center gap-3">
                    <Scale className="h-8 w-8 text-fizou-red" />
                    Mentions Légales
                </h1>
                <p className="text-fizou-gray mb-12">Dernière mise à jour : Février 2026</p>

                <div className="space-y-10">
                    <section className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-fizou-white flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-fizou-red" /> Éditeur du site
                        </h2>
                        <div className="text-fizou-gray space-y-1 text-sm leading-relaxed">
                            <p><strong className="text-fizou-white">Nom du site :</strong> FizouTV</p>
                            <p><strong className="text-fizou-white">URL :</strong> fizoutv.com</p>
                            <p><strong className="text-fizou-white">Directeur de la publication :</strong> FizouTV</p>
                            <p><strong className="text-fizou-white">Contact :</strong> fizoutv@gmail.com</p>
                        </div>
                    </section>

                    <section className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-fizou-white flex items-center gap-2 mb-4">
                            <Database className="h-5 w-5 text-fizou-red" /> Hébergement
                        </h2>
                        <div className="text-fizou-gray space-y-1 text-sm leading-relaxed">
                            <p><strong className="text-fizou-white">Hébergeur :</strong> Vercel Inc.</p>
                            <p><strong className="text-fizou-white">Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
                            <p><strong className="text-fizou-white">Site :</strong> vercel.com</p>
                        </div>
                    </section>

                    <section className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-fizou-white flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-fizou-red" /> Propriété intellectuelle
                        </h2>
                        <p className="text-fizou-gray text-sm leading-relaxed">
                            L&apos;ensemble des contenus (textes, images, vidéos, logos) présents sur FizouTV sont protégés par le droit
                            d&apos;auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable écrite de FizouTV.
                        </p>
                    </section>

                    <section className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-fizou-white flex items-center gap-2 mb-4">
                            <Database className="h-5 w-5 text-fizou-red" /> Données personnelles (RGPD)
                        </h2>
                        <div className="text-fizou-gray text-sm leading-relaxed space-y-3">
                            <p>
                                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d&apos;un droit
                                d&apos;accès, de rectification, de suppression et de portabilité de vos données personnelles.
                            </p>
                            <p>
                                Les données collectées sur ce site (email d&apos;inscription, newsletter) sont uniquement utilisées pour le
                                fonctionnement du service et ne sont jamais vendues à des tiers.
                            </p>
                            <p>
                                Pour exercer vos droits, contactez-nous à : <a href="mailto:fizoutv@gmail.com" className="text-fizou-red hover:underline">fizoutv@gmail.com</a>
                            </p>
                        </div>
                    </section>

                    <section className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-fizou-white flex items-center gap-2 mb-4">
                            <Mail className="h-5 w-5 text-fizou-red" /> Contact
                        </h2>
                        <p className="text-fizou-gray text-sm leading-relaxed">
                            Pour toute question ou demande, vous pouvez nous contacter par email à{" "}
                            <a href="mailto:fizoutv@gmail.com" className="text-fizou-red hover:underline">fizoutv@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
