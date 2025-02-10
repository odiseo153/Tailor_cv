"use client"

import { useEffect, useState } from "react"

interface CodeEditorProps {
  html: string
  onChange: (html: string) => void
}

export default function CodeEditor({ html, onChange }: CodeEditorProps) {
  const [AceEditor, setAceEditor] = useState<any>(null)

  useEffect(() => {
    async function loadAce() {
      const ace = await import("react-ace")
      await import("ace-builds/src-noconflict/mode-html")
      await import("ace-builds/src-noconflict/theme-monokai")
      setAceEditor(() => ace.default)
    }
    loadAce()
  }, [])

  if (!AceEditor) {
    return <div>Loading editor...</div>
  }

  return (
    <AceEditor
      mode="html"
      theme="monokai"
      onChange={onChange}
      value={html}
      name="html-editor"
      editorProps={{ $blockScrolling: true }}
      setOptions={{
        useWorker: false,
      }}
      style={{ width: "100%", height: "600px" }}
    />
  )
}

