"use client"

import { useEffect, useState } from "react"
import { EditorView } from "@codemirror/view"
import { html } from "@codemirror/lang-html"
import { dracula } from "@uiw/codemirror-theme-dracula"
import CodeMirror from "@uiw/react-codemirror" 

interface CodeEditorProps {
  htmlView: string
  onChange: (html: string) => void
}

export default function CodeEditor({ htmlView, onChange }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { 
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading editor...</div>
  }

  return (
    <CodeMirror
      value={htmlView}
      height="600px"
      extensions={[html()]}
      theme={dracula}
      onChange={(value) => onChange(value)}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: true,
      }}
    />
  )
}
