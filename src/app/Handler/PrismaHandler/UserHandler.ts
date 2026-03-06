import { PrismaClient, User } from '@prisma/client';
import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';



export class UserHandler implements BaseHandler<User> {
    async create(data: any): Promise<HandlerResult> {
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

    async update(id: string, data: any): Promise<HandlerResult> {
        try {
            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.email) updateData.email = data.email;
            if (data.password) updateData.password = data.password;
            if (data.phone !== undefined) updateData.phone = data.phone;
            if (data.location !== undefined) updateData.location = data.location;
            if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;

            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData,
            });

            return { success: true, data: updatedUser };
        } catch (error: any) {
            console.error("User update failed:", error);
            if (error.code === 'P2025') {
                return { success: false, data: "User not found" };
            }
            return { success: false, data: `User update failed: ${error}` };
        }
    }

    async delete(id: string): Promise<HandlerResult> {
        try {
            await prisma.user.delete({ where: { id } });

            const result: HandlerResult = { success: true };

            return result;
        } catch (error) {
            console.error("User deleted failed:", error);
            return { success: false, data: `User deleted failed: ${error}` };
        }
    }

    async getById(id: string): Promise<User | null> {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                include: {
                    workExperience: true,
                    skills: true,
                    education: true,
                    socialLinks: true,
                    cvPreferences: true,
                }
            });

            return user;
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            return null;
        }
    }
}

