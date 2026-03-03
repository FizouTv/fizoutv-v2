import type { JSONContent } from "@tiptap/react";

/**
 * Extracts plain text from TipTap JSON content recursively.
 * Walks through all nodes and concatenates text content.
 */
export function extractTextFromTipTap(content: Record<string, unknown> | null): string {
    if (!content) return "";

    // Legacy format: { type: "text", text: "..." }
    if (content.type === "text" && typeof content.text === "string" && !content.content) {
        return content.text as string;
    }

    // TipTap JSON format: recursively extract text
    if (content.type === "doc" && Array.isArray(content.content)) {
        return extractFromNodes(content as JSONContent);
    }

    return "";
}

function extractFromNodes(node: JSONContent): string {
    if (!node) return "";

    // Text node
    if (node.type === "text" && typeof node.text === "string") {
        return node.text;
    }

    // Recursively process children
    if (Array.isArray(node.content)) {
        return node.content
            .map((child) => extractFromNodes(child))
            .join(node.type === "paragraph" || node.type === "heading" || node.type === "blockquote" ? " " : "");
    }

    return "";
}

/**
 * Calculates reading time from text.
 * Uses 238 words per minute (average adult reading speed for web content).
 * Returns at least 1 minute.
 */
export function calculateReadingTime(text: string): number {
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 238));
}

/**
 * Counts words from TipTap JSON or legacy text content.
 */
export function countWords(content: Record<string, unknown> | null): number {
    const text = extractTextFromTipTap(content);
    return text.split(/\s+/).filter(Boolean).length;
}
