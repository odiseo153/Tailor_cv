"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { useAppContext } from "@/app/layout/AppContext"
import { WorkExperience } from "@prisma/client"




const defaultExperiences: WorkExperience[] = [
  {
    id: "1",
    company: "Default Company",
    jobTitle: "Default Position",
    userId: "Default Position",
    startDate: new Date("2020-01-01"),
    endDate: new Date("2023-01-01"),
    createdAt: new Date("2020-01-01"),
    updatedAt: new Date("2023-01-01"),
    description: "Default job description",
  },
]

export default function WorkExperienceInfo() {
  const {user} = useAppContext();
  const experiences = user?.workExperience;
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>(
    experiences.length > 0 ? experiences : defaultExperiences,
  )
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null)

  const handleAddExperience = (newExperience: Omit<WorkExperience, "id">) => {
    setWorkExperiences([...workExperiences, { ...newExperience, id: Date.now().toString() }])
  }

  const handleEditExperience = (updatedExperience: WorkExperience) => {
    setWorkExperiences(workExperiences.map((exp) => (exp.id === updatedExperience.id ? updatedExperience : exp)))
  }

  const handleDeleteExperience = (id: string) => {
    setWorkExperiences(workExperiences.filter((exp) => exp.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Work Experience</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Work Experience</DialogTitle>
            </DialogHeader>
            <ExperienceForm onSubmit={handleAddExperience} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {workExperiences.map((experience) => (
          <div key={experience.id} className="mb-4 p-4 border rounded">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">{experience.jobTitle}</h3>
                <p className="text-gray-600">{experience.company}</p>
                <p className="text-sm text-gray-500">
                  {experience.startDate.toString()} - {experience.endDate?.toString()}
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
                      <DialogTitle>Edit Work Experience</DialogTitle>
                    </DialogHeader>
                    <ExperienceForm
                      initialData={experience}
                      onSubmit={(updatedExp) => handleEditExperience({ ...updatedExp, id: experience.id })}
                    />
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteExperience(experience.id)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm">{experience.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface ExperienceFormProps {
  initialData?: Omit<WorkExperience, "id">
  onSubmit: (experience: Omit<WorkExperience, "id">) => void
}

function ExperienceForm({ initialData, onSubmit }: ExperienceFormProps) {
  const {user} = useAppContext();

  const [formData, setFormData] = useState<any>(
    initialData || {
      company: "",
      userId: user.id,
      jobTitle: "",
      startDate: "",
      endDate: "",
      createdAt: new Date("2020-01-01"), 
      updatedAt: new Date("2023-01-01"),
      description: "",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault()

    const NewformData = new FormData();

    NewformData.append('data',JSON.stringify(formData));
 
    try{
      const request = await fetch("/api/work",{
        method:"POST",
        body:NewformData
      });

      const response = await request.json();

      console.log(response)

      onSubmit(formData);
    }catch(error){

      console.log(error);
    }
    
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" value={formData.company} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
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
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}



