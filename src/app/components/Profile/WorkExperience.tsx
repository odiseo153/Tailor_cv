"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { WorkExperience } from "@prisma/client"
import { useAppContext } from "@/app/context/AppContext"
import { HandlerResult } from "@/app/interface/HandlerResult"
import { Message } from "@/app/utils/Message"


export default function WorkExperienceInfo() {
  const { user } = useAppContext()
  const experiencesUser = user.workExperience as WorkExperience[];
  const [experiences,setExperiences] = useState<WorkExperience[]>(experiencesUser);
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<WorkExperience>({
    id: "",
    company: "",
    jobTitle: "",
    userId: user.id,
    startDate: new Date("20-2-2024"),
    endDate: new Date("20-2-2025"),
    description: "",
    createdAt: new Date("20-2-2024"),
    updatedAt: new Date("20-2-2024")
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSubmit = async () => {
    try {
      const request = await fetch(`/api/apiHandler/work`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      const result = await request.json() as HandlerResult;
         console.log(result);
      Message.successMessage("Experiencia agregada");

    } catch (error) {
      console.log(error);
    } finally {
      setFormData({
        id: "",
        company: "",
        jobTitle: "",
        userId: user.id,
        startDate: new Date("20-2-2024"),
        endDate: new Date("20-2-2025"),
        description: "",
        updatedAt: new Date("20-2-2024"),
        createdAt: new Date("20-2-2024"),
      });
    }

    setIsAddingNew(false)
  }

  const handleEditSubmit = async () => {
    if (editingId) {
      setEditingId(null)
    }
    try {
      const response = await fetch(`/api/apiHandler/work/${editingId}`,{
         method:"PUT",
         headers: {
          'Content-Type': 'application/json',
         },
         body: JSON.stringify({ formData }),
       });
     
      const result = await response.json() as HandlerResult; 

      console.log(result);

        Message.successMessage("Experiencia Actualizada");

    } catch (err: any) {
      console.log(err.message);
      Message.errorMessage("La Experiencia no se pudo eliminar");

    }
  }

  const startEditing =async (workExp: WorkExperience) => {
    setEditingId(workExp.id)
      setFormData({
      id: workExp.id,
      company: workExp.company,
      userId: workExp.userId,
      jobTitle: workExp.jobTitle,
      startDate: workExp.startDate,
      endDate: workExp.endDate,
      description: workExp.description,
      createdAt: workExp.createdAt,
      updatedAt: workExp.updatedAt,
    })
  }

  const handleDelete = async (id: string) => {
    console.log("Cosa eliminada");
    try {
      const response = await fetch(`/api/apiHandler/work/${id}`,{
         method:"DELETE",
         headers: {
          'Content-Type': 'application/json',
         },
         body: JSON.stringify({ id }),
       });
     
      const result = await response.json() as HandlerResult; 

      console.log(result);

        Message.successMessage("Experiencia eliminada");
        setExperiences(experiences.filter((skill) => skill.id !== id));

    } catch (err: any) {
      console.log(err.message);
      Message.errorMessage("La Experiencia no se pudo eliminar");

    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Work Experience</CardTitle>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Work Experience</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" name="company" value={formData.company} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description ?? ""}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddSubmit}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {experiences.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No work experience added yet.</p>
          ) : (
            experiences.map((workExp) => (
              <div key={workExp.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{workExp.company}</h3>
                    <p className="font-medium">{workExp.jobTitle}</p>

                    {/*
                    <p className="text-sm text-gray-500">
                    {formatDate(workExp.startDate.toDateString())} - {workExp.endDate ? formatDate(workExp.endDate.toDateString()) : "Present"}
                    </p>
                      */}

                    {workExp.description && <p className="mt-2 text-gray-700">{workExp.description}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <Dialog open={editingId === workExp.id} onOpenChange={(open) => !open && setEditingId(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => startEditing(workExp)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Work Experience</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-companyName">Company Name</Label>
                            <Input
                              id="edit-companyName"
                              name="company"
                              value={formData.company}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-jobTitle">Job Title</Label>
                            <Input
                              id="edit-jobTitle"
                              name="jobTitle"
                              value={formData.jobTitle}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-startDate">Start Date</Label>
                              <Input
                                id="edit-startDate"
                                name="startDate"
                                type="date"
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-endDate">End Date</Label>
                              <Input
                                id="edit-endDate"
                                name="endDate"
                                type="date"
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              name="description"
                              value={formData.description ?? ""}
                              onChange={handleInputChange}
                              rows={4}
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button onClick={handleEditSubmit}>Save</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(workExp.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

