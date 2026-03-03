"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import { useCallback } from "react";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading2,
    Heading3,
    Heading4,
    List,
    ListOrdered,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Unlink,
    ImageIcon,
    Youtube as YoutubeIcon,
    Code,
    Minus,
    Undo2,
    Redo2,
    Highlighter,
    Subscript as SubIcon,
    Superscript as SupIcon,
    Type,
    Palette,
    RemoveFormatting,
} from "lucide-react";

interface RichTextEditorProps {
    content: JSONContent | null;
    onChange: (json: JSONContent) => void;
}

const TEXT_COLORS = [
    { label: "Par défaut", value: "" },
    { label: "Rouge FizouTV", value: "#e3342f" },
    { label: "Orange", value: "#f6993f" },
    { label: "Jaune", value: "#ffed4a" },
    { label: "Vert", value: "#38c172" },
    { label: "Bleu", value: "#3490dc" },
    { label: "Violet", value: "#9561e2" },
    { label: "Rose", value: "#f66d9b" },
    { label: "Blanc", value: "#f5f5f5" },
    { label: "Gris", value: "#a0a0a0" },
];

function ToolbarDivider() {
    return <div className="w-px h-6 bg-white/10 mx-1" />;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={title}
            className={`p-1.5 rounded-md transition-all duration-150 ${isActive
                ? "bg-fizou-red text-white shadow-md shadow-fizou-red/20"
                : "text-fizou-gray hover:text-fizou-white hover:bg-white/10"
                } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
        >
            {children}
        </button>
    );
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                blockquote: { HTMLAttributes: { class: "tiptap-blockquote" } },
                codeBlock: { HTMLAttributes: { class: "tiptap-code-block" } },
                horizontalRule: { HTMLAttributes: { class: "tiptap-hr" } },
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: "Rédigez votre article ici… Utilisez la barre d'outils pour mettre en forme votre contenu.",
            }),
            Highlight.configure({
                multicolor: true,
                HTMLAttributes: { class: "tiptap-highlight" },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "tiptap-link",
                    rel: "noopener noreferrer nofollow",
                },
            }),
            Image.configure({
                HTMLAttributes: { class: "tiptap-image" },
                allowBase64: false,
            }),
            Youtube.configure({
                HTMLAttributes: { class: "tiptap-youtube" },
                width: 640,
                height: 360,
            }),
            TextStyle,
            Color,
            Subscript,
            Superscript,
            CharacterCount,
        ],
        content: content || undefined,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: "tiptap-editor",
            },
        },
    });

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL du lien :", previousUrl);

        if (url === null) return; // Cancelled

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) return;
        const url = window.prompt("URL de l'image :");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const addYoutube = useCallback(() => {
        if (!editor) return;
        const url = window.prompt("URL de la vidéo YouTube :");
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return (
            <div className="bg-fizou-dark border border-white/10 rounded-xl overflow-hidden">
                <div className="h-12 bg-fizou-dark-alt border-b border-white/10 animate-pulse" />
                <div className="p-6 min-h-[400px] flex items-center justify-center">
                    <div className="h-6 w-6 border-2 border-fizou-red/30 border-t-fizou-red rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const wordCount = editor.storage.characterCount.words();
    const charCount = editor.storage.characterCount.characters();

    return (
        <div className="bg-fizou-dark border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-black/20">
            {/* Toolbar */}
            <div className="bg-fizou-dark-alt border-b border-white/10 px-3 py-2 flex flex-wrap items-center gap-0.5">
                {/* Undo / Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Annuler (Ctrl+Z)"
                >
                    <Undo2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Rétablir (Ctrl+Y)"
                >
                    <Redo2 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Text formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Gras (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italique (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive("underline")}
                    title="Souligné (Ctrl+U)"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    title="Barré"
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Highlight & Color */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()}
                    isActive={editor.isActive("highlight")}
                    title="Surbrillance"
                >
                    <Highlighter className="h-4 w-4" />
                </ToolbarButton>

                {/* Color picker dropdown */}
                <div className="relative group">
                    <ToolbarButton
                        onClick={() => { }}
                        title="Couleur du texte"
                    >
                        <Palette className="h-4 w-4" />
                    </ToolbarButton>
                    <div className="absolute top-full left-0 mt-1 bg-fizou-dark-alt border border-white/10 rounded-lg p-2 shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[140px]">
                        {TEXT_COLORS.map((color) => (
                            <button
                                key={color.value || "default"}
                                type="button"
                                onClick={() => {
                                    if (color.value) {
                                        editor.chain().focus().setColor(color.value).run();
                                    } else {
                                        editor.chain().focus().unsetColor().run();
                                    }
                                }}
                                className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs text-fizou-gray hover:text-fizou-white hover:bg-white/10 transition-colors"
                            >
                                <span
                                    className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                                    style={{ backgroundColor: color.value || "#f5f5f5" }}
                                />
                                {color.label}
                            </button>
                        ))}
                    </div>
                </div>

                <ToolbarDivider />

                {/* Sub / Sup */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    isActive={editor.isActive("subscript")}
                    title="Indice"
                >
                    <SubIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    isActive={editor.isActive("superscript")}
                    title="Exposant"
                >
                    <SupIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
                    title="Paragraphe"
                >
                    <Type className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Titre H2"
                >
                    <Heading2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive("heading", { level: 3 })}
                    title="Titre H3"
                >
                    <Heading3 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    isActive={editor.isActive("heading", { level: 4 })}
                    title="Titre H4"
                >
                    <Heading4 className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Liste à puces"
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Liste numérotée"
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Blockquote */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                    title="Citation"
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>

                {/* Code block */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive("codeBlock")}
                    title="Bloc de code"
                >
                    <Code className="h-4 w-4" />
                </ToolbarButton>

                {/* Horizontal rule */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Séparateur horizontal"
                >
                    <Minus className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Alignment */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    isActive={editor.isActive({ textAlign: "left" })}
                    title="Aligner à gauche"
                >
                    <AlignLeft className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    isActive={editor.isActive({ textAlign: "center" })}
                    title="Centrer"
                >
                    <AlignCenter className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    isActive={editor.isActive({ textAlign: "right" })}
                    title="Aligner à droite"
                >
                    <AlignRight className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    isActive={editor.isActive({ textAlign: "justify" })}
                    title="Justifier"
                >
                    <AlignJustify className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Links */}
                <ToolbarButton
                    onClick={setLink}
                    isActive={editor.isActive("link")}
                    title="Ajouter un lien"
                >
                    <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
                {editor.isActive("link") && (
                    <ToolbarButton
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        title="Retirer le lien"
                    >
                        <Unlink className="h-4 w-4" />
                    </ToolbarButton>
                )}

                <ToolbarDivider />

                {/* Media */}
                <ToolbarButton
                    onClick={addImage}
                    title="Insérer une image"
                >
                    <ImageIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={addYoutube}
                    title="Insérer une vidéo YouTube"
                >
                    <YoutubeIcon className="h-4 w-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Clear formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    title="Supprimer le formatage"
                >
                    <RemoveFormatting className="h-4 w-4" />
                </ToolbarButton>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />

            {/* Footer with word count */}
            <div className="bg-fizou-dark-alt border-t border-white/10 px-4 py-2 flex items-center justify-between text-xs text-fizou-gray">
                <div className="flex items-center gap-4">
                    <span>{wordCount} {wordCount <= 1 ? "mot" : "mots"}</span>
                    <span>{charCount} {charCount <= 1 ? "caractère" : "caractères"}</span>
                </div>
                <span className="opacity-60">
                    ~{Math.max(1, Math.ceil(wordCount / 200))} min de lecture
                </span>
            </div>
        </div>
    );
}
