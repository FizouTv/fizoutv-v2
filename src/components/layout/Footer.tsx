import Link from "next/link";
import { Newspaper, Mail, Youtube, Twitter, Instagram } from "lucide-react";

const categories = [
    { name: "Politique", slug: "politique" },
    { name: "Économie", slug: "economie" },
    { name: "International", slug: "international" },
    { name: "Société", slug: "societe" },
    { name: "Immigration", slug: "immigration" },
    { name: "Police-Justice", slug: "police-justice" },
    { name: "Sport", slug: "sport" },
    { name: "Histoire", slug: "histoire" },
    { name: "Investigation", slug: "investigation" },
];

const legal = [
    { name: "Mentions Légales", href: "/mentions-legales" },
    { name: "À Propos", href: "/a-propos" },
    { name: "Contact", href: "mailto:fizoutv@gmail.com" },
];

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-fizou-dark-alt/50 mt-0">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Newspaper className="h-6 w-6 text-fizou-red" />
                            <span className="text-xl font-black text-fizou-white tracking-tight">FIZOUTV</span>
                        </Link>
                        <p className="text-sm text-fizou-gray leading-relaxed mb-4">
                            L&apos;actualité en continu. Politique, économie, société, international :
                            toute l&apos;info sans filtre.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-fizou-gray hover:text-red-500 hover:bg-white/10 transition-all" aria-label="YouTube">
                                <Youtube className="h-5 w-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-fizou-gray hover:text-blue-400 hover:bg-white/10 transition-all" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-fizou-gray hover:text-pink-400 hover:bg-white/10 transition-all" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="mailto:fizoutv@gmail.com" className="p-2 rounded-lg bg-white/5 text-fizou-gray hover:text-fizou-white hover:bg-white/10 transition-all" aria-label="Email">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-sm font-bold text-fizou-white uppercase tracking-wider mb-4">Rubriques</h3>
                        <ul className="space-y-2">
                            {categories.slice(0, 6).map((cat) => (
                                <li key={cat.slug}>
                                    <Link href={`/category/${cat.slug}`} className="text-sm text-fizou-gray hover:text-fizou-white transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-fizou-white uppercase tracking-wider mb-4">Rubriques (suite)</h3>
                        <ul className="space-y-2">
                            {categories.slice(6).map((cat) => (
                                <li key={cat.slug}>
                                    <Link href={`/category/${cat.slug}`} className="text-sm text-fizou-gray hover:text-fizou-white transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal + Info */}
                    <div>
                        <h3 className="text-sm font-bold text-fizou-white uppercase tracking-wider mb-4">Informations</h3>
                        <ul className="space-y-2">
                            {legal.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="text-sm text-fizou-gray hover:text-fizou-white transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-fizou-gray">
                        © {new Date().getFullYear()} FIZOUTV. Tous droits réservés.
                    </p>
                    <p className="text-xs text-fizou-gray/50">
                        Fait avec ❤️ pour l&apos;information libre
                    </p>
                </div>
            </div>
        </footer>
    );
}
