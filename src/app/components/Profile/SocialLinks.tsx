"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useAppContext } from "@/app/layout/AppContext"

interface SocialLink {
  id: string
  platform: string
  url: string
}

interface SocialLinksProps {
  links?: SocialLink[]
}

const defaultLinks: SocialLink[] = [{ id: "1", platform: "LinkedIn", url: "https://www.linkedin.com/" }]

export default function SocialLinks() {
  const {user} = useAppContext();
  const links = user?.links as SocialLink[];
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(links.length > 0 ? links : defaultLinks)

  const handleAddLink = (newLink: Omit<SocialLink, "id">) => {
    setSocialLinks([...socialLinks, { ...newLink, id: Date.now().toString() }])
  }

  const handleEditLink = (updatedLink: SocialLink) => {
    setSocialLinks(socialLinks.map((link) => (link.id === updatedLink.id ? updatedLink : link)))
  }

  const handleDeleteLink = (id: string) => {
    setSocialLinks(socialLinks.filter((link) => link.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Social Links</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Social Link</DialogTitle>
            </DialogHeader>
            <SocialLinkForm onSubmit={handleAddLink} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {socialLinks.map((link) => (
          <div key={link.id} className="flex justify-between items-center mb-2 p-2 border rounded">
            <div>
              <span className="font-semibold">{link.platform}</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-blue-500 hover:underline"
              >
                {link.url}
              </a>
            </div>
            <div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Social Link</DialogTitle>
                  </DialogHeader>
                  <SocialLinkForm
                    initialData={link}
                    onSubmit={(updatedLink) => handleEditLink({ ...updatedLink, id: link.id })}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface SocialLinkFormProps {
  initialData?: Omit<SocialLink, "id">
  onSubmit: (link: Omit<SocialLink, "id">) => void
}

function SocialLinkForm({ initialData, onSubmit }: SocialLinkFormProps) {
  const [formData, setFormData] = useState<Omit<SocialLink, "id">>(
    initialData || {
      platform: "",
      url: "",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="platform">Platform</Label>
        <Input id="platform" name="platform" value={formData.platform} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="url">URL</Label>
        <Input id="url" name="url" type="url" value={formData.url} onChange={handleChange} required />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}



