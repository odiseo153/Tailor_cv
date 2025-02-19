"use client"

import { useEffect, useState } from "react"
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
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <CodeMirror
        value={htmlView}
        height="600px"
        width="100%"
        extensions={[html()]}
        theme={dracula}
        onChange={(value) => onChange(value)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightSelectionMatches: true,
        }}
      />
    </div>
  )
}