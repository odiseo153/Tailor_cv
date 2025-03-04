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
import { Skill } from "@prisma/client"
import { HandlerResult } from "@/app/interface/HandlerResult"
import { Message } from "@/app/utils/Message"



const defaultSkills:Skill[] = [{ id: "1", name: "Default Skill", level: 3,userId:"",createdAt:new Date("10-2-2024") }]


export default function Skills() {
    const {user} = useAppContext();
    const skills = user?.skills;
 
    const [userSkills, setUserSkills] = useState<Skill[]>(skills || defaultSkills)
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
    const [searchQuery, setSearchQuery] = useState("");

    const handleAddSkill = (newSkill: Omit<Skill, "id">) => {
        setUserSkills([...userSkills, { ...newSkill, id: Date.now().toString() }])
    }

    const handleEditSkill = (updatedSkill: Skill) => {
        setUserSkills(userSkills.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill)))
    }

    const handleDeleteSkill = async (id: string) => {
      try {
        const response = await fetch(`/api/apiHandler/skill/${id}`,{
           method:"DELETE",
           headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
           });
       
        const result = await response.json() as HandlerResult ; 

          Message.successMessage("Skill removed");
          setUserSkills(userSkills.filter((skill) => skill.id !== id));

      } catch (err: any) {
        console.log(err.message);
      }

    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value.toLowerCase());
    }

    const filteredSkills = userSkills.filter(skill => skill.name.toLowerCase().includes(searchQuery));

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Skills</CardTitle>
                <div className="flex items-center space-x-2">
                    <Input
                        type="text"
                        placeholder="Search skills..."
                        onChange={handleSearchChange}
                        className="mr-2"
                    />
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
                </div>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
                {filteredSkills.map((skill) => (
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
  initialData?: Omit<Skill, "createdAt" >
  onSubmit: (skill: any) => void
}

function SkillForm({ initialData, onSubmit }: SkillFormProps) {
  const {user} = useAppContext();

  const [formData, setFormData] = useState<any>(
    initialData || {
      name: "",
      userId: user.id,
      level: 1,
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === "level" ? Number.parseInt(e.target.value) : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    try {
      const url = initialData ? `/api/apiHandler/skill/${formData.id}` : "/api/apiHandler/skill";
      const method = initialData ? "PUT" : "POST";
      const message = initialData ? "Skill Updated" : "Skill Added";

      const response = await fetch(url, {
        method:method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.data || "Failed to submit");
      }

      console.log(result);

      Message.successMessage(message);
      onSubmit(formData); 
    } catch (err: any) {
      console.log(err.message);
    }
  };

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
          value={formData.level}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}

