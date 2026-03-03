"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, User, Shield, LogOut, ChevronRight, Search } from "lucide-react";

interface MobileMenuProps {
    categories: { name: string; slug: string }[];
    user: { email?: string } | null;
    isAdmin: boolean;
}

export default function MobileMenu({ categories, user, isAdmin }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const drawerContent = (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Slide-in Panel */}
            <div
                className={`fixed top-0 right-0 z-[9999] h-full w-[85vw] max-w-sm bg-fizou-dark border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <span className="text-sm font-bold text-fizou-white uppercase tracking-wider">Menu</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-fizou-gray hover:text-fizou-white transition-colors"
                        aria-label="Fermer le menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Panel Content */}
                <div className="overflow-y-auto h-[calc(100%-65px)] pb-8">
                    {/* Search Link */}
                    <div className="px-4 pt-4 pb-2">
                        <Link
                            href="/recherche"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 w-full rounded-xl bg-fizou-dark-alt border border-white/10 px-4 py-3 text-fizou-gray hover:text-fizou-white transition-colors"
                        >
                            <Search className="h-4 w-4" />
                            <span className="text-sm">Rechercher un article...</span>
                        </Link>
                    </div>

                    {/* Categories */}
                    <div className="px-4 pt-4">
                        <p className="text-[10px] font-bold text-fizou-gray/50 uppercase tracking-widest mb-3 px-1">
                            Rubriques
                        </p>
                        <nav className="space-y-1">
                            {categories.map((category) => (
                                <Link
                                    key={category.slug}
                                    href={`/category/${category.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between rounded-lg px-4 py-3 text-fizou-gray hover:text-fizou-white hover:bg-fizou-dark-alt transition-all group"
                                >
                                    <span className="text-sm font-medium">{category.name}</span>
                                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 my-4 h-px bg-white/10" />

                    {/* User Actions */}
                    <div className="px-4 space-y-2">
                        {user ? (
                            <>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 text-sm font-semibold text-yellow-400 hover:bg-yellow-500/20 transition-all"
                                    >
                                        <Shield className="h-4 w-4" />
                                        Panel Admin
                                    </Link>
                                )}
                                <Link
                                    href="/account"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 rounded-xl bg-fizou-dark-alt border border-white/10 px-4 py-3 text-sm font-semibold text-fizou-white hover:bg-white/10 transition-all"
                                >
                                    <User className="h-4 w-4" />
                                    Mon compte
                                </Link>
                                <form action="/auth/signout" method="POST">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-3 w-full rounded-xl bg-fizou-dark-alt border border-white/10 px-4 py-3 text-sm font-semibold text-fizou-white hover:bg-fizou-red hover:border-fizou-red transition-all"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Déconnexion
                                    </button>
                                </form>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 w-full rounded-xl bg-fizou-red px-4 py-3 text-sm font-bold text-white hover:bg-red-600 transition-all"
                            >
                                <User className="h-4 w-4" />
                                Se connecter
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Hamburger Button — stays in the header */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden text-fizou-gray transition-colors hover:text-fizou-white p-2"
                aria-label="Ouvrir le menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Portal: overlay + drawer rendered on document.body, outside header's backdrop-blur */}
            {mounted && createPortal(drawerContent, document.body)}
        </>
    );
}
