"use client"

import { useEffect, useState } from "react"
import { Editor } from "@monaco-editor/react"

interface CodeEditorProps {
  html: string
  onChange: (html: string) => void
}

export default function CodeEditor({ html, onChange }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading editor...</div>
  }

  return (
    <Editor
      height="600px"
      defaultLanguage="html"
      defaultValue={html}
      theme="vs-dark"
      onChange={(value) => onChange(value || "")}
      options={{
        minimap: { enabled: false },
        wordWrap: "on",
        automaticLayout: true,
      }}
    />
  )
}
