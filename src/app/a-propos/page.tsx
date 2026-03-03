import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Newspaper, Target, Eye, Users, Zap } from "lucide-react";

export const metadata = {
    title: "À Propos | FizouTV",
    description: "Découvrez FizouTV - L'actualité en continu, sans filtre. Notre mission, notre équipe et nos valeurs.",
};

export default function APropos() {
    return (
        <main className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-16 max-w-3xl">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-fizou-red/10 border border-fizou-red/30 text-fizou-red px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                        <Newspaper className="h-4 w-4" />
                        QUI SOMMES-NOUS ?
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-fizou-white mb-4">
                        L&apos;info <span className="text-fizou-red">sans filtre</span>
                    </h1>
                    <p className="text-lg text-fizou-gray max-w-xl mx-auto leading-relaxed">
                        FizouTV est un média d&apos;information indépendant dédié à une couverture complète et honnête de l&apos;actualité.
                    </p>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6 hover:border-fizou-red/30 transition-colors">
                        <Target className="h-8 w-8 text-fizou-red mb-3" />
                        <h3 className="text-lg font-bold text-fizou-white mb-2">Indépendance</h3>
                        <p className="text-sm text-fizou-gray leading-relaxed">
                            Aucun actionnaire, aucun parti politique. Notre seul employeur : l&apos;information.
                        </p>
                    </div>
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6 hover:border-fizou-red/30 transition-colors">
                        <Eye className="h-8 w-8 text-blue-400 mb-3" />
                        <h3 className="text-lg font-bold text-fizou-white mb-2">Transparence</h3>
                        <p className="text-sm text-fizou-gray leading-relaxed">
                            Nous citons nos sources, corrigeons nos erreurs et distinguons faits et opinions.
                        </p>
                    </div>
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6 hover:border-fizou-red/30 transition-colors">
                        <Users className="h-8 w-8 text-green-400 mb-3" />
                        <h3 className="text-lg font-bold text-fizou-white mb-2">Proximité</h3>
                        <p className="text-sm text-fizou-gray leading-relaxed">
                            Nous couvrons les sujets qui comptent pour nos lecteurs, pas ceux qui génèrent des clics.
                        </p>
                    </div>
                    <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6 hover:border-fizou-red/30 transition-colors">
                        <Zap className="h-8 w-8 text-yellow-400 mb-3" />
                        <h3 className="text-lg font-bold text-fizou-white mb-2">Réactivité</h3>
                        <p className="text-sm text-fizou-gray leading-relaxed">
                            L&apos;actualité n&apos;attend pas. Nous couvrons les événements en temps réel, 24h/24.
                        </p>
                    </div>
                </div>

                {/* Mission */}
                <section className="bg-fizou-dark-alt border border-white/10 rounded-xl p-8 mb-16">
                    <h2 className="text-2xl font-black text-fizou-white mb-4 border-l-4 border-fizou-red pl-4">
                        Notre mission
                    </h2>
                    <div className="text-fizou-gray space-y-4 leading-relaxed">
                        <p>
                            Dans un paysage médiatique saturé de contenus sponsorisés et de titres sensationnalistes,
                            FizouTV a été créé pour offrir une alternative : <strong className="text-fizou-white">une information factuelle,
                                accessible et sans compromis</strong>.
                        </p>
                        <p>
                            Nous couvrons la politique française et internationale, l&apos;économie, la société,
                            l&apos;immigration, la justice, le sport et l&apos;histoire avec le même engagement :
                            vous donner les faits pour que vous puissiez vous forger votre propre opinion.
                        </p>
                    </div>
                </section>

                {/* Contact */}
                <section className="text-center bg-gradient-to-br from-fizou-red/10 to-transparent border border-fizou-red/20 rounded-xl p-8">
                    <h2 className="text-2xl font-black text-fizou-white mb-3">Contactez-nous</h2>
                    <p className="text-fizou-gray mb-4">Une info, un témoignage, une question ?</p>
                    <a
                        href="mailto:fizoutv@gmail.com"
                        className="inline-flex items-center gap-2 bg-fizou-red hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                    >
                        <Newspaper className="h-5 w-5" />
                        fizoutv@gmail.com
                    </a>
                </section>
            </div>
            <Footer />
        </main>
    );
}
