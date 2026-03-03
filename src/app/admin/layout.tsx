import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    Users,
    Mail,
    Newspaper,
    LogOut,
    ChevronRight,
} from "lucide-react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/articles", label: "Articles", icon: FileText },
    { href: "/admin/polls", label: "Sondages", icon: BarChart3 },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    { href: "/admin/subscribers", label: "Abonnés", icon: Mail },
    { href: "/admin/newsletters", label: "Newsletter", icon: Newspaper },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?redirect=/admin");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="min-h-screen flex bg-fizou-dark">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-fizou-dark-alt flex flex-col">
                {/* Logo */}
                <div className="h-20 flex items-center px-6 border-b border-white/10">
                    <Link href="/">
                        <Image
                            src="/logofizoutv.png"
                            alt="FizouTV"
                            width={160}
                            height={50}
                            className="h-10 w-auto brightness-0 invert"
                        />
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-fizou-gray hover:text-fizou-white hover:bg-white/5 transition-all group"
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="flex-1">{item.label}</span>
                            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-fizou-red flex items-center justify-center text-white text-sm font-bold">
                            {(profile.display_name || user.email || "A")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-fizou-white truncate">
                                {profile.display_name || user.email}
                            </p>
                            <p className="text-xs text-fizou-gray">Administrateur</p>
                        </div>
                    </div>
                    <form action="/auth/signout" method="POST">
                        <button
                            type="submit"
                            className="flex items-center gap-2 text-sm text-fizou-gray hover:text-red-400 transition-colors w-full"
                        >
                            <LogOut className="h-4 w-4" />
                            Déconnexion
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
