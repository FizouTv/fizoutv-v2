export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { FileText, Users, Mail, BarChart3, TrendingUp } from "lucide-react";

async function getStats() {
    const supabase = await createClient();

    const [articles, users, subscribers, polls] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscribers").select("id", { count: "exact", head: true }),
        supabase.from("polls").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);

    return {
        articlesCount: articles.count ?? 0,
        usersCount: users.count ?? 0,
        subscribersCount: subscribers.count ?? 0,
        activePollsCount: polls.count ?? 0,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    const cards = [
        {
            label: "Articles publiés",
            value: stats.articlesCount,
            icon: FileText,
            color: "bg-blue-500/10 text-blue-400",
            iconBg: "bg-blue-500/20",
        },
        {
            label: "Utilisateurs inscrits",
            value: stats.usersCount,
            icon: Users,
            color: "bg-green-500/10 text-green-400",
            iconBg: "bg-green-500/20",
        },
        {
            label: "Abonnés newsletter",
            value: stats.subscribersCount,
            icon: Mail,
            color: "bg-purple-500/10 text-purple-400",
            iconBg: "bg-purple-500/20",
        },
        {
            label: "Sondages actifs",
            value: stats.activePollsCount,
            icon: BarChart3,
            color: "bg-orange-500/10 text-orange-400",
            iconBg: "bg-orange-500/20",
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-fizou-white flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-fizou-red" />
                    Dashboard
                </h1>
                <p className="text-fizou-gray mt-1">
                    Vue d&apos;ensemble de votre plateforme FizouTV
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${card.iconBg}`}>
                                <card.icon className={`h-6 w-6 ${card.color.split(" ")[1]}`} />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-fizou-white">
                                    {card.value}
                                </p>
                                <p className="text-sm text-fizou-gray">{card.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-fizou-dark-alt border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-fizou-white mb-4">Actions rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/admin/articles/new"
                        className="flex items-center gap-3 p-4 rounded-lg bg-fizou-red/10 border border-fizou-red/20 hover:bg-fizou-red/20 transition-all text-fizou-white"
                    >
                        <FileText className="h-5 w-5 text-fizou-red" />
                        <span className="font-medium">Nouvel article</span>
                    </a>
                    <a
                        href="/admin/polls"
                        className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-fizou-white"
                    >
                        <BarChart3 className="h-5 w-5 text-blue-400" />
                        <span className="font-medium">Créer un sondage</span>
                    </a>
                    <a
                        href="/admin/subscribers"
                        className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all text-fizou-white"
                    >
                        <Mail className="h-5 w-5 text-purple-400" />
                        <span className="font-medium">Voir les abonnés</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
