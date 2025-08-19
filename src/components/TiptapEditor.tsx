"use client";

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// The Toolbar component you provided
const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  return (
    <div className="toolbar-container">
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} className={editor.isActive('strike') ? 'is-active' : ''}>Strike</button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
       <button onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }} className={editor.isActive('bulletList') ? 'is-active' : ''}>List</button>
    </div>
  );
};

interface TiptapProps {
  content: string;
  onChange: (richText: string) => void;
}

export const TiptapEditor = ({ content, onChange }: TiptapProps) => {
  const editor = useEditor({
    extensions: [StarterKit.configure()],
    content: content,
    // THIS IS CRUCIAL to satisfy Tiptap's internal check
    immediatelyRender: false, 
    editorProps: {
      attributes: { class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none' },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="editor-container">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};