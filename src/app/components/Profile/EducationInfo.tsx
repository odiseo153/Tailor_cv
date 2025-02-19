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
 
interface Education {
  id: string
  institution: string
  degree: string
  startDate: string
  endDate: string
}

interface EducationProps {
  education?: Education[]
}

const defaultEducation: Education[] = [
  {
    id: "1",
    institution: "Default University",
    degree: "Default Degree",
    startDate: "2016-09-01",
    endDate: "2020-06-01",
  },
]

export default function EducationInfo() {
  const {user} = useAppContext();
  const education = user?.education as Education[];
  const [educationList, setEducationList] = useState<Education[]>(education.length > 0 ? education : defaultEducation)

  const handleAddEducation = (newEducation: Omit<Education, "id">) => {
    setEducationList([...educationList, { ...newEducation, id: Date.now().toString() }])
  }

  const handleEditEducation = (updatedEducation: Education) => {
    setEducationList(educationList.map((edu) => (edu.id === updatedEducation.id ? updatedEducation : edu)))
  }

  const handleDeleteEducation = (id: string) => {
    setEducationList(educationList.filter((edu) => edu.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Education</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Education</DialogTitle>
            </DialogHeader>
            <EducationForm onSubmit={handleAddEducation} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {educationList.map((edu) => (
          <div key={edu.id} className="mb-4 p-4 border rounded">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">{edu.degree}</h3>
                <p className="text-gray-600">{edu.institution}</p>
                <p className="text-sm text-gray-500">
                  {edu.startDate} - {edu.endDate}
                </p>
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
                      <DialogTitle>Edit Education</DialogTitle>
                    </DialogHeader>
                    <EducationForm
                      initialData={edu}
                      onSubmit={(updatedEdu) => handleEditEducation({ ...updatedEdu, id: edu.id })}
                    />
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteEducation(edu.id)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface EducationFormProps {
  initialData?: Omit<Education, "id">
  onSubmit: (education: Omit<Education, "id">) => void
}

function EducationForm({ initialData, onSubmit }: EducationFormProps) {
  const [formData, setFormData] = useState<Omit<Education, "id">>(
    initialData || {
      institution: "",
      degree: "",
      startDate: "",
      endDate: "",
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
        <Label htmlFor="institution">Institution</Label>
        <Input id="institution" name="institution" value={formData.institution} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="degree">Degree</Label>
        <Input id="degree" name="degree" value={formData.degree} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="endDate">End Date</Label>
        <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}

