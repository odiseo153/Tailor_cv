import { PrismaClient, User } from '@prisma/client';
import { HandlerResult } from '../interface/HandlerResult';
import { BaseHandler } from '../interface/BaseHandler';

const prisma = new PrismaClient();

export class UserHandler implements BaseHandler<User> {
    async create(data: User):Promise<HandlerResult> {
        try {
            const newUser = await prisma.user.create({
                data: data,
                include: {
                    workExperience: true,
                    skills: true,
                    education: true,
                    socialLinks: true,
                    cvPreferences: true,
                },
            });
            return { success: true, data: newUser };
        } catch (error) {
            console.error("User creation failed:", error);
            return { success: false, data: "User creation failed" };
        }
    }

    async update(id: string, data: User):Promise<HandlerResult>{
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id }
            });

            if (!existingUser) {
                return { success: false, data: "User not found" };
            }

            // Merge existing user data with new data, keeping existing values if new data is empty
            const mergedData = {
                name: data.name || existingUser.name,
                email: data.email || existingUser.email,
                phone: data.phone || existingUser.phone,
                password: data.password || existingUser.password,
                location: data.location || existingUser.location,
                profilePicture: data.profilePicture || existingUser.profilePicture,
            };
 
            const updatedUser = await prisma.user.update({
                where: { id },
                data: mergedData,
            });

            return { success: true, data: updatedUser };
        } catch (error) {
            console.error("User update failed:", error);
            return { success: false, data: `User update failed: ${error}` };
        }
    }
    
    
}

