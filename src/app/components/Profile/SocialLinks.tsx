"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useStore } from "@/app/context/AppContext"
import { Message } from "@/app/utils/Message"
import { useSession } from "next-auth/react"

interface SocialLink {
  id?: string
  platform: string
  url: string
  userId?: string
}

interface SocialLinksProps {
  links?: SocialLink[]
}

const defaultLinks: SocialLink[] = [{ platform: "LinkedIn", url: "https://www.linkedin.com/" }]

export default function SocialLinks() {
  const { data: session } = useSession();
  const user = session?.user;
  //const links = user?.socialLinks as SocialLink[];

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>( defaultLinks)

  const handleAddLink = (newLink: SocialLink) => {
    setSocialLinks([...socialLinks, { ...newLink, id: Date.now().toString() }])
  }

  const handleEditLink = (updatedLink: SocialLink) => {
    //console.log(links);
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
          <div key={link.id ?? ""} className="flex justify-between items-center mb-2 p-2 border rounded">
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
              <Button variant="ghost" size="icon" onClick={() => handleDeleteLink(link.id ?? "")}>
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
  initialData?: SocialLink
  onSubmit: (link:SocialLink) => void
}

function SocialLinkForm({ initialData, onSubmit }: SocialLinkFormProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const [formData, setFormData] = useState<SocialLink>(
    initialData || {
      platform: "",
      url: "", 
      userId:" user.id", 
    }, 
  )
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
 
    try {
      const url = initialData ? `/api/apiHandler/social/${formData.id}` : "/api/apiHandler/social";
      const method = initialData ? "PUT" : "POST";
      const message = initialData ? "Social Link Updated" : "Social Link Added";

      console.log(url,method);
      const response = await fetch(url, {
        method:method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({formData}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.data || "Failed to submit");
      }

      console.log(result);

      Message.successMessage(message);
      onSubmit(formData); 
    } catch (err: any) {
      console.log(err);
    }
  };

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



