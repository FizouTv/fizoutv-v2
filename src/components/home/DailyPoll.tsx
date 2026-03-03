import { createClient } from "@/lib/supabase/server";
import PollVoting from "./PollVoting";
import { BarChart3 } from "lucide-react";

export default async function DailyPoll() {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // 1. Try to fetch scheduled poll for today
    let { data: poll } = await supabase
        .from("polls")
        .select("*")
        .eq("scheduled_for", today)
        .eq("is_active", true)
        .maybeSingle();

    // 2. Fallback: Latest active poll
    if (!poll) {
        const { data: latest } = await supabase
            .from("polls")
            .select("*")
            .eq("is_active", true)
            .order("scheduled_for", { ascending: false }) // Prioritize recently scheduled
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
        poll = latest;
    }

    if (!poll) {
        return (
            <div className="h-full min-h-[300px] bg-fizou-dark-alt/30 border border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                <BarChart3 className="h-12 w-12 text-fizou-gray/20 mb-3" />
                <p className="text-fizou-gray text-sm">Aucun sondage pour le moment</p>
            </div>
        );
    }

    return (
        <section className="h-full min-h-[300px]">
            <PollVoting poll={poll} />
        </section>
    );
}
