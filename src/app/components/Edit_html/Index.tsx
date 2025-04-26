"use client"

import HtmlEditor from "./HtmlEditor"
import { motion } from "framer-motion"

interface ShowHtmlProps {
  html: string
}

export default function ShowHtml({ html }: ShowHtmlProps) {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <section className="container  bg-white rounded-2xl shadow-xl overflow-hidden">
        <HtmlEditor initialHtml={html} />
      </section>
    </motion.main>
  )
}