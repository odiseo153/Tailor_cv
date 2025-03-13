"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CVTemplate {
  id: number
  name: string
  html: string
  image: string
  author: string
}

interface CVModalProps {
  template: CVTemplate
  onClose: () => void
}

export default function CVModal({ template, onClose }: CVModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>{template.name}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-4 max-h-[80vh] w-full overflow-auto">
          {/* Render the HTML content safely */}
          <div dangerouslySetInnerHTML={{ __html: template.html }} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

