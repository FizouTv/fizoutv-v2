import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import type { JSONContent } from "@tiptap/react";

// Extensions used to generate HTML from TipTap JSON
const extensions = [
    StarterKit.configure({
        heading: { levels: [2, 3, 4] },
    }),
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight.configure({ multicolor: true }),
    Link.configure({
        openOnClick: true,
        HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
        },
    }),
    Image,
    Youtube.configure({ width: 640, height: 360 }),
    TextStyle,
    Color,
    Subscript,
    Superscript,
];

interface ArticleContentProps {
    content: Record<string, unknown> | null;
}

function isOldFormat(content: Record<string, unknown>): boolean {
    return content.type === "text" && typeof content.text === "string";
}

function isTipTapJSON(content: Record<string, unknown>): boolean {
    return content.type === "doc" && Array.isArray(content.content);
}

export default function ArticleContent({ content }: ArticleContentProps) {
    if (!content) {
        return (
            <p className="text-fizou-gray italic">Aucun contenu disponible.</p>
        );
    }

    // Legacy plain text format: { type: "text", text: "..." }
    if (isOldFormat(content)) {
        return (
            <div className="article-content">
                <div className="text-fizou-gray/90 text-lg leading-relaxed whitespace-pre-line">
                    {content.text as string}
                </div>
            </div>
        );
    }

    // TipTap JSON format: { type: "doc", content: [...] }
    if (isTipTapJSON(content)) {
        const html = generateHTML(content as JSONContent, extensions);
        return (
            <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }

    // Unknown format fallback
    return (
        <div className="article-content">
            <p className="text-fizou-gray italic">
                Format de contenu non reconnu.
            </p>
        </div>
    );
}
