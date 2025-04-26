"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react"
import { Education } from "@prisma/client"
import { Message } from "@/app/utils/Message"
import { useSession } from "next-auth/react"
import { ExtendedSession } from "@/app/api/auth/[...nextauth]/route"

const defaultEducation: any[] = [
  {
    id: "1",
    institution: "Default University",
    degree: "Default Degree",
    userId: "",
    startDate: new Date("2016-09-01"),
    endDate: new Date("2020-06-01"),
  },
]

export default function EducationInfo() {
  const { data: session,  update } = useSession() as {
    data: ExtendedSession | null;
    update: (data: Partial<ExtendedSession["user"]>) => Promise<ExtendedSession | null>;
  }
  const user = session?.user
  // fallback to defaultEducation if user.education is undefined
  const education = (user?.education as Education[]) || defaultEducation

  const [educationList, setEducationList] = useState<Education[]>(education)

  const handleAddEducation = async (newEducation: Education) => {
    const newEducationList = [...educationList, newEducation]
    setEducationList(newEducationList)
    await update({ education: newEducationList })
  }

  const handleEditEducation = async (updatedEducation: Education) => {
    const newEducationList = educationList.map((edu) =>
      edu.id === updatedEducation.id ? updatedEducation : edu
    );
    setEducationList(newEducationList)
    await update({ education: newEducationList })
  }

  const handleDeleteEducation = async (id: string) => {
    try {
      const response = await fetch(`/api/apiHandler/education/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al procesar la solicitud");
      }

      const { resultado } = await response.json();
      console.log("Deleted education record:", resultado);

      const updatedEducationList = educationList.filter((edu) => edu.id !== id);

      Message.successMessage("Educacion borrada correctamente");
      setEducationList(updatedEducationList);
      await update({ education: updatedEducationList });
    } catch (error) {
      console.error("Failed to delete education:", error);
      // Optionally, display an error message to the user
      // Message.errorMessage("Failed to delete education");
    }
  };

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
                  {new Date(edu.startDate).toLocaleDateString()} -{" "}
                  {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ""}
                </p>
              </div>
              <div className="flex items-center">
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
                    <EducationForm initialData={edu} onSubmit={handleEditEducation} />
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
  initialData?: Education
  onSubmit: (education: Education) => void
}

function EducationForm({ initialData, onSubmit }: EducationFormProps) {
  const { data: session } = useSession() as {
    data: ExtendedSession | null
  }
  const user = session?.user

  const [formData, setFormData] = useState({
    institution: initialData?.institution || "",
    userId: user?.id || "",
    degree: initialData?.degree || "",
    startDate: initialData ? new Date(initialData.startDate).toISOString().split("T")[0] : "",
    endDate:
      initialData && initialData.endDate
        ? new Date(initialData.endDate).toISOString().split("T")[0]
        : "",
    id: initialData?.id || ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const newValue = type === "date" ? new Date(value).toISOString().split("T")[0] : value
    setFormData((prev) => ({ ...prev, [name]: newValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const isEdit = Boolean(initialData)
      const url = isEdit ? `/api/apiHandler/education/${formData.id}` : "/api/apiHandler/education"
      const method = isEdit ? "PUT" : "POST"
      const message = isEdit ? "Educación actualizada" : "Educación agregada"

      console.log(url,method,initialData,formData)
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error( "Error al procesar la solicitud")
      }

      const {resultado} = await response.json();
      console.log(resultado);

      const updatedEducation: Education = await resultado.data
      Message.successMessage(message)
      onSubmit(updatedEducation)
    } catch (error: any) {
      console.error(error.message)
      Message.errorMessage("Algo salió mal: " + error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="institution">Institution</Label>
        <Input
          id="institution"
          name="institution"
          value={formData.institution}
          onChange={handleChange}
          required
        />
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
        <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}
