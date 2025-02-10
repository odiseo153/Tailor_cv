"use client"

import HtmlEditor from "./HtmlEditor"


export default function ShowHtml({html}:{html:string}) {
  return (
    <main className="w-full   flex-col items-center justify-center ">
      <HtmlEditor initialHtml={html} />
    </main>
  )
}

