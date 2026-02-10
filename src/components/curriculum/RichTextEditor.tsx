"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Highlighter,
    Type,
    Heading1,
    Heading2,
    Heading3,
    Table as TableIcon,
    Plus,
    Trash2,
    Columns,
    Rows,
    Merge
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Color,
            TextStyle,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-base lg:prose-lg max-w-none focus:outline-none min-h-[1.5rem] p-10',
            },
        },
        immediatelyRender: false,
    });

    if (!editor) {
        return null;
    }

    const highlightColors = [
        { name: 'Yellow', value: '#FCC11A' },
        { name: 'Orange', value: '#FF8800' },
        { name: 'Pink', value: '#FF6B9D' },
        { name: 'Purple', value: '#9D6BFF' },
        { name: 'Cyan', value: '#6BFFE3' },
        { name: 'Green', value: '#A8FF6B' },
    ];

    const textColors = [
        { name: 'Navy', value: '#0C3449' },
        { name: 'Teal', value: '#2D9CB8' },
        { name: 'Orange', value: '#FF8800' },
        { name: 'Purple', value: '#9D6BFF' },
        { name: 'Pink', value: '#FF6B9D' },
        { name: 'Black', value: '#000000' },
    ];

    return (
        <div className="rounded-[inherit] overflow-hidden bg-white h-full flex flex-col">
            <style jsx global>{`
                .ProseMirror {
                    color: #0C3449;
                    font-family: 'Inter', sans-serif;
                    line-height: 1.6;
                }
                .ProseMirror h1 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #0C3449;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                    line-height: 1.1;
                    border-bottom: 4px solid #F0F9FF;
                    padding-bottom: 1rem;
                }
                .ProseMirror h2 {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #2D9CB8;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                }
                .ProseMirror h3 {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: #0C3449;
                    margin-top: 2rem;
                    margin-bottom: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .ProseMirror p {
                    margin-bottom: 1.25rem;
                }
                .ProseMirror ul, .ProseMirror ol {
                    margin-bottom: 1.5rem;
                    padding-left: 1.5rem;
                }
                .ProseMirror li {
                    margin-bottom: 0.5rem;
                }
                .ProseMirror table {
                    border-collapse: separate;
                    border-spacing: 0;
                    width: 100%;
                    margin: 2rem 0;
                    border-radius: 1rem;
                    overflow: hidden;
                    border: 2px solid #F1F5F9;
                }
                .ProseMirror td,
                .ProseMirror th {
                    min-width: 1em;
                    border: 1px solid #F1F5F9;
                    padding: 12px 16px;
                    vertical-align: middle;
                    box-sizing: border-box;
                    position: relative;
                }
                .ProseMirror th {
                    font-weight: 900;
                    text-align: left;
                    background-color: #F8FAFC;
                    color: #0C3449;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.1em;
                }
                .ProseMirror tr:nth-child(even) {
                    background-color: #FAFAFA;
                }
                .ProseMirror mark {
                    background-color: #FCC11A;
                    color: #0C3449;
                    font-weight: 700;
                    padding: 0.1rem 0.3rem;
                    border-radius: 0.25rem;
                }
                .ProseMirror .selectedCell:after {
                    z-index: 2;
                    position: absolute;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(45, 156, 184, 0.1);
                    pointer-events: none;
                }
                .ProseMirror .column-resize-handle {
                    position: absolute;
                    right: -2px;
                    top: 0;
                    bottom: -2px;
                    width: 4px;
                    background-color: #2D9CB8;
                    pointer-events: none;
                }
            `}</style>
            {/* Toolbar */}
            <div className="bg-zinc-50/50 border-b border-zinc-100 p-4 flex flex-wrap gap-2">
                {/* Text Style */}
                <div className="flex items-center gap-1 border-r-2 border-zinc-200 pr-3">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive('heading', { level: 1 }) ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Heading 1"
                    >
                        <Heading1 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive('heading', { level: 2 }) ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Heading 2"
                    >
                        <Heading2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive('heading', { level: 3 }) ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Heading 3"
                    >
                        <Heading3 className="h-4 w-4" />
                    </button>
                </div>

                {/* Formatting */}
                <div className="flex items-center gap-1 border-r-2 border-zinc-200 pr-3">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive('bold') ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Bold"
                    >
                        <Bold className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive('italic') ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Italic"
                    >
                        <Italic className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive('underline') ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Underline"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </button>
                </div>

                {/* Lists */}
                <div className="flex items-center gap-1 border-r-2 border-zinc-200 pr-3">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive('bulletList') ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive('orderedList') ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </button>
                </div>

                {/* Table Controls */}
                <div className="flex items-center gap-1 border-r-2 border-zinc-200 pr-3">
                    <div className="relative group/table z-20">
                        <button
                            className={cn(
                                "h-9 px-3 rounded-lg flex items-center gap-2 transition-all hover:bg-white text-zinc-600",
                                editor.isActive('table') && "bg-[#2D9CB8]/10 text-[#2D9CB8]"
                            )}
                            title="Table"
                        >
                            <TableIcon className="h-4 w-4" />
                            <span className="text-xs font-bold">Table</span>
                        </button>

                        <div className="absolute top-full left-0 mt-2 bg-white border-2 border-zinc-200 rounded-xl p-2 shadow-xl opacity-0 invisible group-hover/table:opacity-100 group-hover/table:visible transition-all w-48">
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                                    className="text-left px-3 py-2 rounded-lg hover:bg-zinc-50 text-sm text-zinc-600 flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Insert Table 3x3
                                </button>
                                <div className="h-px bg-zinc-100 my-1" />
                                <button
                                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                                    disabled={!editor.can().addColumnAfter()}
                                    className="text-left px-3 py-2 rounded-lg hover:bg-zinc-50 text-sm text-zinc-600 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Columns className="h-4 w-4" /> Add Column
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().deleteColumn().run()}
                                    disabled={!editor.can().deleteColumn()}
                                    className="text-left px-3 py-2 rounded-lg hover:bg-zinc-50 text-sm text-zinc-600 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete Column
                                </button>
                                <div className="h-px bg-zinc-100 my-1" />
                                <button
                                    onClick={() => editor.chain().focus().addRowAfter().run()}
                                    disabled={!editor.can().addRowAfter()}
                                    className="text-left px-3 py-2 rounded-lg hover:bg-zinc-50 text-sm text-zinc-600 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Rows className="h-4 w-4" /> Add Row
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().deleteRow().run()}
                                    disabled={!editor.can().deleteRow()}
                                    className="text-left px-3 py-2 rounded-lg hover:bg-zinc-50 text-sm text-zinc-600 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete Row
                                </button>
                                <div className="h-px bg-zinc-100 my-1" />
                                <button
                                    onClick={() => editor.chain().focus().mergeCells().run()}
                                    disabled={!editor.can().mergeCells()}
                                    className="text-left px-3 py-2 rounded-lg hover:bg-zinc-50 text-sm text-zinc-600 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Merge className="h-4 w-4" /> Merge Cells
                                </button>
                                <button
                                    onClick={() => editor.chain().focus().deleteTable().run()}
                                    disabled={!editor.can().deleteTable()}
                                    className="text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete Table
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-1 border-r-2 border-zinc-200 pr-3">
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive({ textAlign: 'left' }) ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Align Left"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive({ textAlign: 'center' }) ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Align Center"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center transition-all hover:bg-white",
                            editor.isActive({ textAlign: 'right' }) ? 'bg-[#2D9CB8] text-white' : 'text-zinc-600'
                        )}
                        title="Align Right"
                    >
                        <AlignRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Highlight Colors */}
                <div className="flex items-center gap-1 border-r-2 border-zinc-200 pr-3">
                    <div className="relative group">
                        <button
                            className="h-9 px-3 rounded-lg flex items-center gap-2 transition-all hover:bg-white text-zinc-600"
                            title="Highlight Color"
                        >
                            <Highlighter className="h-4 w-4" />
                            <span className="text-xs font-bold">Highlight</span>
                        </button>
                        <div className="absolute top-full left-0 mt-2 bg-white border-2 border-zinc-200 rounded-xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="flex gap-1">
                                {highlightColors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                                        className="h-8 w-8 rounded-lg border-2 border-zinc-200 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                                <button
                                    onClick={() => editor.chain().focus().unsetHighlight().run()}
                                    className="h-8 w-8 rounded-lg border-2 border-zinc-200 hover:scale-110 transition-transform bg-white flex items-center justify-center text-zinc-400"
                                    title="Remove Highlight"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Colors */}
                <div className="flex items-center gap-1">
                    <div className="relative group">
                        <button
                            className="h-9 px-3 rounded-lg flex items-center gap-2 transition-all hover:bg-white text-zinc-600"
                            title="Text Color"
                        >
                            <Type className="h-4 w-4" />
                            <span className="text-xs font-bold">Color</span>
                        </button>
                        <div className="absolute top-full left-0 mt-2 bg-white border-2 border-zinc-200 rounded-xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <div className="flex gap-1">
                                {textColors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => editor.chain().focus().setColor(color.value).run()}
                                        className="h-8 w-8 rounded-lg border-2 border-zinc-200 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                                <button
                                    onClick={() => editor.chain().focus().unsetColor().run()}
                                    className="h-8 w-8 rounded-lg border-2 border-zinc-200 hover:scale-110 transition-transform bg-white flex items-center justify-center text-zinc-400"
                                    title="Remove Color"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto relative bg-white">
                <EditorContent editor={editor} className="min-h-full" />
            </div>
        </div>
    );
}
