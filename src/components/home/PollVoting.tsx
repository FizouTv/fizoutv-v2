"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, CheckCircle2, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Poll } from "@/types/database";

interface PollVotingProps {
    poll: Poll;
}

export default function PollVoting({ poll }: PollVotingProps) {
    const [user, setUser] = useState<any>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [votes, setVotes] = useState<number[]>([]); // Array of vote counts per option index
    const [totalVotes, setTotalVotes] = useState(0);

    // Initial check for auth and existing vote
    useEffect(() => {
        const checkStatus = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Fetch current votes for this poll (public SELECT via RLS policy)
            const { data: allVotes } = await supabase
                .from("poll_votes")
                .select("option_index")
                .eq("poll_id", poll.id);

            if (allVotes) {
                const counts = new Array(poll.options.length).fill(0);
                allVotes.forEach(v => {
                    if (v.option_index >= 0 && v.option_index < counts.length) {
                        counts[v.option_index]++;
                    }
                });
                setVotes(counts);
                setTotalVotes(allVotes.length);
            }

            if (user) {
                // Check if user has voted
                const { data: myVote } = await supabase
                    .from("poll_votes")
                    .select("*")
                    .eq("poll_id", poll.id)
                    .eq("voter_id", user.id)
                    .single();

                if (myVote) {
                    setHasVoted(true);
                }
            }
            setLoading(false);
        };

        checkStatus();
    }, [poll.id, poll.options.length]);


    const handleVote = async (optionIndex: number) => {
        if (!user || hasVoted || voting) return;
        setVoting(true);

        const supabase = createClient();
        const { error } = await supabase.from("poll_votes").insert({
            poll_id: poll.id,
            option_index: optionIndex,
            voter_id: user.id
        });

        if (!error) {
            setHasVoted(true);
            // Optimistic update
            const newVotes = [...votes];
            newVotes[optionIndex]++;
            setVotes(newVotes);
            setTotalVotes(prev => prev + 1);
        } else {
            alert("Erreur lors du vote. Réessayez.");
        }
        setVoting(false);
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-fizou-red animate-spin" />
            </div>
        );
    }

    const showResults = hasVoted || !user;

    return (
        <div className="bg-fizou-dark-alt/50 border border-white/10 rounded-2xl p-6 md:p-8 h-full flex flex-col relative overflow-hidden">

            <div className="relative z-10 w-full">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-fizou-gray text-sm flex items-center gap-1.5">
                        <BarChart3 className="h-4 w-4 text-fizou-red" />
                        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                    </span>
                </div>

                <h3 className="text-lg md:text-xl font-black text-white mb-6 leading-tight">
                    {poll.question}
                </h3>

                <div className="space-y-3 w-full">
                    {poll.options.map((option, index) => {
                        const percent = totalVotes > 0 ? (votes[index] / totalVotes) * 100 : 0;

                        return (
                            <div key={index} className="relative group">
                                {showResults ? (
                                    // Result View
                                    <div className="relative h-12 w-full bg-fizou-dark rounded-xl overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="absolute top-0 left-0 h-full bg-fizou-red/20"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-between px-4">
                                            <span className="text-sm font-bold text-fizou-white truncate mr-2">
                                                {option}
                                            </span>
                                            <span className="text-sm font-black text-fizou-red">
                                                {Math.round(percent)}%
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    // Voting Button
                                    <button
                                        onClick={() => handleVote(index)}
                                        disabled={voting}
                                        className="w-full text-left bg-fizou-dark hover:bg-fizou-red hover:border-fizou-red border border-white/10 rounded-xl p-4 transition-all group-hover:scale-[1.02]"
                                    >
                                        <span className="font-bold text-fizou-white group-hover:text-white transition-colors">
                                            {option}
                                        </span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {!user && (
                    <div className="mt-6 pt-4 border-t border-white/5 text-center">
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-fizou-red hover:text-white transition-colors">
                            <Lock className="h-3.5 w-3.5" />
                            Connectez-vous pour voter
                        </Link>
                    </div>
                )}

                {hasVoted && (
                    <div className="mt-6 text-center text-fizou-gray/50 text-xs flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Merci de votre participation !
                    </div>
                )}
            </div>
        </div>
    );
}
