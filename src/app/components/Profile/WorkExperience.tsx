"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { Message } from "@/app/utils/Message"

interface WorkExperience {
  id: string
  company: string
  jobTitle: string
  userId: string
  startDate: string // Usamos string para evitar problemas con Date en JSON
  endDate?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function WorkExperienceInfo() {
  const { data: session, status, update } = useSession()
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<WorkExperience>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Inicializar experiencias desde la sesión cuando esté disponible
  useEffect(() => {
    if (status === "authenticated" && session?.user?.workExperience) {
      setExperiences(session.user.workExperience)
      setLoading(false)
    }
  }, [status, session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const submitExperience = async (method: "POST" | "PUT", url: string) => {
    setRefreshing(true);

    try {
      const formDataWithUserId = { ...formData, userId: session?.user?.id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: formDataWithUserId }), // Envuelve los datos en un objeto 'formData'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Request failed: ${res.status} - ${errorData.error || 'Unknown error'}`);
      }
      const data = await res.json();

      console.log(data.resultado);
      let updatedExperiences: WorkExperience[]
      if (method === "POST") {
        // Agregar la nueva experiencia al estado local
        const newExperience = { ...data.resultado.data }
        updatedExperiences = [...experiences, newExperience]
        setExperiences(updatedExperiences)
      } else {
        // Actualizar la experiencia existente en el estado local
        updatedExperiences = experiences.map((exp) =>
          exp.id === editingId ? { ...formDataWithUserId, id: editingId } as WorkExperience : exp
        )
        setExperiences(updatedExperiences)
      }

      // Actualizar la sesión con las experiencias modificadas
      await update({ workExperience: updatedExperiences });

      Message.successMessage(method === "POST" ? "Experiencia agregada" : "Experiencia actualizada")
    } catch (error: any) {
      console.error(error)
      Message.errorMessage("Error al procesar la experiencia: " + error.message)
    } finally {
      setFormData({})
      setIsOpen(false)
      setEditingId(null)
      setRefreshing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/apiHandler/work/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")

      // Actualizar el estado local eliminando la experiencia
      const updatedExperiences = experiences.filter((exp) => exp.id !== id)
      setExperiences(updatedExperiences)

      // Actualizar la sesión con las experiencias restantes
      await update({ workExperience: updatedExperiences })

      Message.successMessage("Experiencia eliminada")
    } catch (error) {
      console.error(error)
      Message.errorMessage("Error al eliminar la experiencia")
    } finally {
      setRefreshing(false)
    }
  }

  const FormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Company Name</Label>
        <Input name="company" value={formData.company || ""} onChange={handleInputChange} />
      </div>
      <div className="space-y-2">
        <Label>Job Title</Label>
        <Input name="jobTitle" value={formData.jobTitle || ""} onChange={handleInputChange} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input name="startDate" type="date" value={formData.startDate || ""} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input name="endDate" type="date" value={formData.endDate || ""} onChange={handleInputChange} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea name="description" value={formData.description || ""} onChange={handleInputChange} rows={4} />
      </div>
      <Button
        onClick={() => submitExperience(isEdit ? "PUT" : "POST", isEdit ? `/api/apiHandler/work/${editingId}` : "/api/apiHandler/work")}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        disabled={refreshing}
      >
        {refreshing ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" /> : "Save"}
      </Button>
    </div>
  )

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600" />
      </motion.div>
    )
  }

  return (
    <Card className="bg-white shadow-lg rounded-xl border-none">
      <CardHeader className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Work Experience</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-600">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl">
            <DialogTitle className="text-lg font-semibold text-gray-800">{editingId ? "Edit" : "Add"} Work Experience</DialogTitle>
            <FormContent isEdit={!!editingId} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {experiences.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No work experience yet.</p>
        ) : (
          experiences.map((exp) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{exp.jobTitle}</h3>
                  <p className="text-gray-700">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(exp.startDate).toLocaleDateString()} -{" "}
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
                  </p>
                  {exp.description && <p className="mt-2 text-gray-600">{exp.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(exp.id)
                      setFormData(exp)
                      setIsOpen(true)
                    }}
                    disabled={refreshing}
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)} disabled={refreshing}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  )
}