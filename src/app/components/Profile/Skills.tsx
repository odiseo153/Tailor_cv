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

interface Skill {
  id: string
  name: string
  level: number
}

interface SkillsProps {
  skills?: Skill[]
}

const defaultSkills: Skill[] = [{ id: "1", name: "Default Skill", level: 3 }]

export default function Skills() {
    const {user} = useAppContext();
    const skills = user?.skills;

  const [userSkills, setUserSkills] = useState<Skill[]>(skills.length > 0 ? skills : defaultSkills)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

  const handleAddSkill = (newSkill: Omit<Skill, "id">) => {
    setUserSkills([...userSkills, { ...newSkill, id: Date.now().toString() }])
  }

  const handleEditSkill = (updatedSkill: Skill) => {
    setUserSkills(userSkills.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill)))
  }

  const handleDeleteSkill = (id: string) => {
    setUserSkills(userSkills.filter((skill) => skill.id !== id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Skills</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Skill</DialogTitle>
            </DialogHeader>
            <SkillForm onSubmit={handleAddSkill} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {userSkills.map((skill) => (
          <div key={skill.id} className="flex justify-between items-center mb-2 p-2 border rounded">
            <div>
              <span className="font-semibold">{skill.name}</span>
              <span className="ml-2 text-sm text-gray-500">Level: {skill.level}</span>
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
                    <DialogTitle>Edit Skill</DialogTitle>
                  </DialogHeader>
                  <SkillForm
                    initialData={skill}
                    onSubmit={(updatedSkill) => handleEditSkill({ ...updatedSkill, id: skill.id })}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteSkill(skill.id)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface SkillFormProps {
  initialData?: Omit<Skill, "id">
  onSubmit: (skill: Omit<Skill, "id">) => void
}

function SkillForm({ initialData, onSubmit }: SkillFormProps) {
  const [formData, setFormData] = useState<Omit<Skill, "id">>(
    initialData || {
      name: "",
      level: 1,
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === "level" ? Number.parseInt(e.target.value) : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Skill Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="level">Skill Level (1-5)</Label>
        <Input
          id="level"
          name="level"
          type="number"
          min="1"
          max="5"
          value={formData.level}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}

