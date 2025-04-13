"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {  ExtendedSession, SocialLink } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Message } from "@/app/utils/Message";

interface SocialLinkFormProps {
  initialData?: SocialLink;
  onSubmit: (link: Omit<SocialLink, "id" | "createdAt" | "updatedAt">, id?: string) => void;
}

function SocialLinkForm({ initialData, onSubmit }: SocialLinkFormProps) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [formData, setFormData] = useState<Omit<SocialLink, "id" | "createdAt" | "updatedAt">>(
    initialData
      ? {
          platform: initialData.platform,
          url: initialData.url,
          userId: initialData.userId,
        }
      : {
          platform: "",
          url: "",
          userId: session?.user?.id || "",
        }
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.platform.trim()) {
        throw new Error("La plataforma es requerida");
      }
      if (!formData.url.trim() || !/^https?:\/\//.test(formData.url)) {
        throw new Error("Por favor, ingrese una URL válida");
      }

      onSubmit(formData, initialData?.id);
    } catch (err: any) {
      console.error(err.message);
      Message.errorMessage(err.message || "Error al procesar el enlace social");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="platform">Platform</Label>
        <Input
          id="platform"
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          value={formData.url}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? (
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
        ) : (
          "Save"
        )}
      </Button>
    </form>
  );
}

export default function SocialLinks() {
  const { data: session, status, update } = useSession() as {
    data: ExtendedSession | null;
    status: string;
    update: (data: Partial<ExtendedSession["user"]>) => Promise<ExtendedSession | null>;
  };
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Inicializar enlaces sociales desde la sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user?.socialLinks) {
      console.log(session.user)
      setSocialLinks(session.user.socialLinks ?? []);
      setLoading(false);
    }
  }, [status, session]);

  const handleSubmitLink = async (
    linkData: Omit<SocialLink, "id" | "createdAt" | "updatedAt">,
    linkId?: string
  ) => {
    setRefreshing(true);
    try {
      const isEditing = !!linkId;
      const url = isEditing
        ? `/api/apiHandler/social/${linkId}`
        : "/api/apiHandler/social";
      const method = isEditing ? "PUT" : "POST";
      const successMessage = isEditing ? "Social Link updated" : "Social Link added";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.data || `Failed to ${isEditing ? "update" : "add"} social link`);
      }

      const result = await response.json();
      console.log(result);

      let updatedLinks: SocialLink[];

      if (isEditing) {
        const updatedLink: SocialLink = result.data;

        updatedLinks = socialLinks.map((link) =>
          link.id === linkId ? updatedLink : link
        );
      } else {
      
        updatedLinks = [...socialLinks, result.data];
      }

      setSocialLinks(updatedLinks);
      await update({ socialLinks: updatedLinks });

      Message.successMessage(successMessage);
    } catch (err: any) {
      console.error(err.message);
      Message.errorMessage(`Error al ${linkId ? "actualizar" : "agregar"} el enlace social`);
    } finally {
      setEditingLink(null);
      setRefreshing(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/apiHandler/social/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete social link");

      const updatedLinks = socialLinks.filter((link) => link.id !== id);
      setSocialLinks(updatedLinks);
      await update({ socialLinks: updatedLinks });

      Message.successMessage("Social Link removed");
    } catch (err: any) {
      console.error(err.message);
      Message.errorMessage("Error al eliminar el enlace social");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Social Links</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={refreshing}>
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Social Link</DialogTitle>
            </DialogHeader>
            <SocialLinkForm onSubmit={handleSubmitLink} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {socialLinks.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No social links found.</p>
        ) : (
          socialLinks.map((link) => (
            <div
              key={link.id}
              className="flex justify-between items-center mb-2 p-2 border rounded"
            >
              <div>
                <span className="font-semibold">{link.platform }</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm text-blue-500 hover:underline"
                >
                  {link.url}
                </a>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-2"
                      onClick={() => setEditingLink(link)}
                      disabled={refreshing}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Social Link</DialogTitle>
                    </DialogHeader>
                    <SocialLinkForm
                      initialData={link}
                      onSubmit={handleSubmitLink}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteLink(link.id)}
                  disabled={refreshing}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}