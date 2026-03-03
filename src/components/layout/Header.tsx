import Link from "next/link";
import Image from "next/image";
import { Search, User, Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import MobileMenu from "./MobileMenu";

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

export default async function Header() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        isAdmin = profile?.role === "admin";
    }

    // Serialize user data for client component
    const serializedUser = user ? { email: user.email } : null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-fizou-dark-alt bg-fizou-dark/95 backdrop-blur">
            <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
                <div className="flex items-center gap-4 lg:gap-8">
                    <Link href="/" className="flex items-center h-16 md:h-20 overflow-hidden">
                        <Image
                            src="/logofizoutv.png"
                            alt="FizouTV Logo"
                            width={400}
                            height={400}
                            className="h-28 md:h-40 w-auto object-contain brightness-0 invert"
                            priority
                        />
                    </Link>

                    <nav className="hidden lg:flex items-center space-x-3 xl:space-x-6 text-xs xl:text-sm font-medium whitespace-nowrap">
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/category/${cat.slug}`}
                                className="text-fizou-gray transition-colors hover:text-fizou-white"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/recherche" className="text-fizou-gray transition-colors hover:text-fizou-white p-2" aria-label="Rechercher">
                        <Search className="h-5 w-5" />
                    </Link>

                    {/* Mobile menu (hamburger + drawer) */}
                    <MobileMenu categories={categories} user={serializedUser} isAdmin={isAdmin} />

                    {/* Desktop auth buttons */}
                    {user ? (
                        <div className="hidden lg:flex items-center gap-3">
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 text-sm font-semibold text-yellow-400 transition-all hover:bg-yellow-500/20"
                                    aria-label="Accéder au panel admin"
                                >
                                    <Shield className="h-4 w-4" />
                                    <span>Admin</span>
                                </Link>
                            )}
                            <Link
                                href="/account"
                                className="flex items-center gap-2 rounded-full bg-fizou-dark-alt border border-white/10 px-4 py-1.5 text-sm font-semibold text-fizou-white transition-all hover:bg-white/10"
                                aria-label="Mon compte"
                            >
                                <User className="h-4 w-4" />
                                <span>Mon compte</span>
                            </Link>
                            <form action="/auth/signout" method="POST">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 rounded-full bg-fizou-dark-alt px-4 py-1.5 text-sm font-semibold text-fizou-white transition-all hover:bg-fizou-red"
                                    aria-label="Se déconnecter"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Déconnexion</span>
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login" className="hidden lg:flex items-center gap-2 rounded-full bg-fizou-dark-alt px-4 py-1.5 text-sm font-semibold text-fizou-white transition-all hover:bg-fizou-red">
                            <User className="h-4 w-4" />
                            <span>Connexion</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
