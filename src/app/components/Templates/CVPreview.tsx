"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Eye } from "lucide-react"

interface CVTemplate {
  id: number
  name: string
  html: string
  image: string // Ahora será la URL del PNG o PDF
  author: string
}

export default function CVPreview({ template, onClick }: { template: CVTemplate; onClick: () => void }) {
  return (
    <div className="flex flex-col">
      <Card className="relative overflow-hidden cursor-pointer group" onClick={onClick}>
        <div className="aspect-[3/4] relative">
          <Image
            src={template.image || "/placeholder.svg"}
            alt={template.name}
            fill
            className="object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white rounded-full p-2">
              <Eye className="w-5 h-5 text-gray-800" />
            </div>
          </div>
        </div>
      </Card>
    
    </div>
  )
}