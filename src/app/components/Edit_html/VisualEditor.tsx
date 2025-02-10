"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

interface VisualEditorProps {
  html: string
  onChange: (html: string) => void
}

export default function VisualEditor({ html, onChange }: VisualEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: html,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-md p-4 " >
   
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  )
}

