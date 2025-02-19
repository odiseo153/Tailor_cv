"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PencilIcon } from "lucide-react"
import { useAppContext } from "@/app/layout/AppContext"

interface CVPreferences {
  template: string
  font: string
  color: string
}

interface CVPreferencesProps { 
  preferences?: Partial<CVPreferences>
}

const defaultPreferences: CVPreferences = {
  template: "modern",
  font: "Arial",
  color: "#000000",
}

export default function CVPreferences({ preferences = {} }: CVPreferencesProps) {
  const {user} = useAppContext();
  const [cvPreferences, setCVPreferences] = useState<CVPreferences>({
    ...defaultPreferences,
    ...user.cvPreferences,
  })

  const handleUpdatePreferences = (updatedPreferences: CVPreferences) => {
    setCVPreferences(updatedPreferences)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>CV Preferences</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PencilIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit CV Preferences</DialogTitle>
            </DialogHeader>
            <CVPreferencesForm initialData={cvPreferences} onSubmit={handleUpdatePreferences} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>Template:</strong> {cvPreferences.template}
          </p>
          <p>
            <strong>Font:</strong> {cvPreferences.font}
          </p>
          <p>
            <strong>Color:</strong> {cvPreferences.color}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

interface CVPreferencesFormProps {
  initialData: CVPreferences
  onSubmit: (preferences: CVPreferences) => void
}

function CVPreferencesForm({ initialData, onSubmit }: CVPreferencesFormProps) {
  const [formData, setFormData] = useState<CVPreferences>(initialData)

  const handleChange = (name: keyof CVPreferences, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="template">Template</Label>
        <Select onValueChange={(value) => handleChange("template", value)} defaultValue={formData.template}>
          <SelectTrigger id="template">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="minimalist">Minimalist</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="font">Font</Label>
        <Select onValueChange={(value) => handleChange("font", value)} defaultValue={formData.font}>
          <SelectTrigger id="font">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          name="color"
          type="color"
          value={formData.color}
          onChange={(e) => handleChange("color", e.target.value)}
          required
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}

