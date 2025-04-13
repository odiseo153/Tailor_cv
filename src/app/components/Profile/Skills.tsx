"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { Skill } from "@prisma/client";

interface SkillFormProps {
  initialData?: Skill;
  onSubmit: (skill: Omit<Skill, "id" | "createdAt" | "updatedAt">, id?: string) => void;
}

function SkillForm({ initialData, onSubmit }: SkillFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<Omit<Skill, "id" | "createdAt" | "updatedAt">>(
    initialData
      ? {
          name: initialData.name,
          level: initialData.level,
          userId: initialData.userId,
        }
      : {
          name: "",
          level: 1,
          userId: session?.user?.id || "",
        }
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.name === "level"
        ? Number.parseInt(e.target.value)
        : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("El nombre de la habilidad es requerido");
      }
      if (formData.level < 1 || formData.level > 5) {
        throw new Error("El nivel debe estar entre 1 y 5");
      }

      onSubmit(formData, initialData?.id);
    } catch (err: any) {
      console.error(err.message);
      Message.errorMessage(err.message || "Error al procesar la habilidad");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Skill Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
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

export default function Skills() {
  const { data: session, status, update } = useSession() as {
    data: any | null;
    status: string;
    update: (data: any) => Promise<any | null>;
  };
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  

  // Inicializar habilidades desde la sesión
  useEffect(() => {
    if (status === "authenticated" && session?.user?.skills) {
      setUserSkills(session.user.skills);
      setLoading(false);
    }
  }, [status, session]);

  const handleSubmitSkill = async (
    skillData: Omit<Skill, "id" | "createdAt" | "updatedAt">,
    skillId?: string
  ) => {
    setRefreshing(true);
    try {
      const isEditing = !!skillId;
      const url = isEditing
        ? `/api/apiHandler/skill/${skillId}`
        : "/api/apiHandler/skill";
      const method = isEditing ? "PUT" : "POST";
      const successMessage = isEditing ? "Skill updated" : "Skill added";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.data || `Failed to ${isEditing ? "update" : "add"} skill`);
      }

      const result = await response.json();
      let updatedSkills: Skill[];
      
      console.log(result);

      if (isEditing) {
        // Editar habilidad existente
        const updatedSkill: Skill = result.data;
        updatedSkills = userSkills.map((skill) =>
          skill.id === skillId ? updatedSkill : skill
        );
      } else {
        // Agregar nueva habilidad
        const newSkill: Skill = {
          ...result.data,
        };
        updatedSkills = [...userSkills, newSkill];
      }

      setUserSkills(updatedSkills);
      await update({ skills: updatedSkills });

      Message.successMessage(successMessage);
    } catch (err: any) {
      console.error(err.message);
      Message.errorMessage(`Error al ${skillId ? "actualizar" : "agregar"} la habilidad`);
    } finally {
      setEditingSkill(null);
      setRefreshing(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/apiHandler/skill/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to delete skill");

      const updatedSkills = userSkills.filter((skill) => skill.id !== id);
      setUserSkills(updatedSkills);
      
      await update({ skills: updatedSkills });

      Message.successMessage("Skill removed");
    } catch (err: any) {
      console.error(err.message);
      Message.errorMessage("Error al eliminar la habilidad");
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
        <CardTitle>Skills</CardTitle>
        <div className="flex items-center space-x-2">
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" disabled={refreshing}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Add Skill</DialogTitle>
              <SkillForm onSubmit={handleSubmitSkill} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        {userSkills.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No skills found.</p>
        ) : (
          userSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex justify-between items-center mb-2 p-2 border rounded"
            >
              <div>
                <span className="font-semibold">{skill.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  Level: {skill.level}
                </span>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSkill(skill)}
                      disabled={refreshing}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                      <DialogTitle>Edit Skill</DialogTitle>
                    <SkillForm
                      initialData={skill}
                      onSubmit={handleSubmitSkill}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSkill(skill.id)}
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