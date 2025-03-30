"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PencilIcon } from "lucide-react"
import { validateEmail, validatePhone } from "@/app/utils/validation"
import { useStore } from "@/app/context/AppContext"
import { User } from "@prisma/client"
import { useSession } from "next-auth/react"
import { Message } from "@/app/utils/Message"

interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  profilePicture: string
}

const defaultUser: User = {
  id:"a6464649-56c1-4a39-960f-4246c85fb79d",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  password: "1234567890",
  location: "New York, USA",
  profilePicture: "https://w0.peakpx.com/wallpaper/608/902/HD-wallpaper-businessman-business-man.jpg",
  createdAt: new Date(""),
  updatedAt: new Date(""),
}

export default function PersonalInfo() {
  const { data: session } = useSession();
  const user = session?.user;
 
  const [editedUser, setEditedUser] = useState<User>(user || defaultUser);
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value })
  }

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!validateEmail(editedUser.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!validatePhone(editedUser?.phone ?? "28912")) {
      newErrors.phone = "Invalid phone number format"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try{

      const request = await fetch('/api/apiHandler/user',{
        method:"PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify(editedUser)
      });

      const response = await request.json();

      console.log(response)
      
      setIsEditing(false)
      setErrors({})
      Message.successMessage("Datos actualizados");
    }catch(e){
      console.log(e);
    }
  }

  const [isEditing, setIsEditing] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Information</CardTitle>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PencilIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Personal Information</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={editedUser.name} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={editedUser.phone ?? ""} onChange={handleInputChange} required />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={editedUser.location ?? ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={editedUser.profilePicture ?? ""} alt={editedUser.name} />
          <AvatarFallback>{editedUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{editedUser.name}</h2>
          <p className="text-gray-500">{editedUser.email}</p>
          <p className="text-gray-500">{editedUser.phone}</p>
          <p className="text-gray-500">{editedUser.location}</p>
        </div>
      </CardContent>
    </Card>
  )
}

