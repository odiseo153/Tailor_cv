import { PrismaClient, WorkExperience } from '@prisma/client';
import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';


export class WorkExperienceHandler implements BaseHandler<WorkExperience> {

    async get(userId: string): Promise<HandlerResult> {
        try {
            const work = await prisma.workExperience.findMany({
                where: { userId: userId },
                orderBy: { startDate: 'desc' }
            });

            return { success: true, data: work };
        } catch (error) {
            console.error("Work fetching failed:", error);
            return { success: false, data: "Work fetching failed" };
        }
    }

    async create(data: any): Promise<HandlerResult> {
        try {
            const newWork = await prisma.workExperience.create({ data });

            return { success: true, data: newWork };
        } catch (error) {
            console.error("Work creation failed:", error);
            return { success: false, data: "Work creation failed" };
        }
    }

    async update(id: string, data: any): Promise<HandlerResult> {
        try {
            const updateData: any = {};
            if (data.company) updateData.company = data.company;
            if (data.jobTitle) updateData.jobTitle = data.jobTitle;
            if (data.startDate) updateData.startDate = new Date(data.startDate);
            if (data.endDate) updateData.endDate = new Date(data.endDate);
            if (data.description) updateData.description = data.description;

            const updatedWork = await prisma.workExperience.update({
                where: { id },
                data: updateData,
            });

            return { success: true, data: updatedWork };
        } catch (error: any) {
            console.error("Work update failed:", error);
            if (error.code === 'P2025') {
                return { success: false, data: "work not found" };
            }
            return { success: false, data: `Work update failed: ${error.message}` };
        }
    }


    async delete(id: string): Promise<HandlerResult> {
        try {
            // Validate id format (optional, depending on your setup)
            if (!id || typeof id !== 'string') {
                return { success: false, data: 'Invalid ID provided' };
            }

            // Attempt to delete the record
            await prisma.workExperience.delete({
                where: { id },
            });

            return { success: true };
        } catch (error: any) {
            // Handle Prisma-specific errors
            if (error.code === 'P2025') {
                // Prisma error code for "Record not found"
                return { success: false, data: 'Work Experience not found' };
            }

            // Log the error safely
            console.error('Work Experience deletion failed:', error?.message || 'Unknown error');

            // Return a safe error message
            return {
                success: false,
                data: `Work Experience deletion failed: ${error?.message || 'Unknown error'}`,
            };
        }
    }
}


