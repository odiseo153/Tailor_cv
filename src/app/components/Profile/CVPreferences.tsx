"use client"

import type React from "react"

import { useState } from "react"
import { useStore } from "@/app/context/AppContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { Message } from "@/app/utils/Message"
import { useSession } from "next-auth/react"

export default function CVPreferences() {
  const { data: session } = useSession();
  const user = session?.user;
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    template:  "monte",
    id:  "",
    font:  "cap",
    color:  "#f0000",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    try {
      const url = isEditing ? `/api/apiHandler/skill/${formData.id}` : "/api/apiHandler/skill";
      const method = isEditing ? "PUT" : "POST";
      const message = isEditing ? "Skill Updated" : "Skill Added";

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
      setIsEditing(false)
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleTemplateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, template: value }))
  }

  const handleFontChange = (value: string) => {
    setFormData((prev) => ({ ...prev, font: value }))
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, color: e.target.value }))
  }


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>CV Preferences</CardTitle>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit CV Preferences</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select value={formData.template} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Classic">Classic</SelectItem>
                    <SelectItem value="Minimalist">Minimalist</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="font">Font</Label>
                <Select value={formData.font} onValueChange={handleFontChange}>
                  <SelectTrigger id="font">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-3">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={handleColorChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input value={formData.color} onChange={handleColorChange} className="flex-1" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmit}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      {/*
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Template</p>
            <p className="font-medium">{user?.cvPreferences?.template}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Font</p>
            <p className="font-medium">{user?.cvPreferences?.font}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-500">Color</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: "#f000" }} />
              <p className="font-medium">{user?.cvPreferences?.color}</p>
            </div>
          </div>
        </div>
      </CardContent>
          */}
    </Card>
  )
}

