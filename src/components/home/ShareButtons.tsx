"use client";

import { Twitter, Facebook, Link as LinkIcon, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
    title: string;
    slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== "undefined" ? `${window.location.origin}/article/${slug}` : "";
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-fizou-gray font-bold uppercase tracking-wider mr-1">
                <Share2 className="h-4 w-4 inline mr-1" />
                Partager
            </span>
            <a
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-fizou-gray hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                aria-label="Partager sur Twitter"
            >
                <Twitter className="h-4 w-4" />
            </a>
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 text-fizou-gray hover:text-blue-600 hover:bg-blue-600/10 transition-all"
                aria-label="Partager sur Facebook"
            >
                <Facebook className="h-4 w-4" />
            </a>
            <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white/5 text-fizou-gray hover:text-fizou-white hover:bg-white/10 transition-all"
                aria-label="Copier le lien"
            >
                {copied ? (
                    <span className="text-green-400 text-xs font-bold">Copié !</span>
                ) : (
                    <LinkIcon className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
