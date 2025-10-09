import { PrismaClient,  WorkExperience } from '@prisma/client';
import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';


export class WorkExperienceHandler implements BaseHandler<WorkExperience> {
    
    async get(userId: string):Promise<HandlerResult> {
        try {
            const work = await prisma.workExperience.findMany({where:{
                userId: userId
            }});

            return { success: true, data: work };
        } catch (error) {
            console.error("Work creation failed:", error);
            return { success: false, data: "Work creation failed" };
        }
    }

    async create(data: any):Promise<HandlerResult> {
        console.log(data);
        try {
            const newWork = await prisma.workExperience.create({data});

            return { success: true, data: newWork };
        } catch (error) {
            console.error("Work creation failed:", error);
            return { success: false, data: "Work creation failed" };
        }
    }

    async update(id: string, data: any):Promise<HandlerResult> {
        try {
            const existingWork = await prisma.workExperience.findUnique({
                where: { id }
            });

            if (!existingWork) {
                return { success: false, data: "work not found" };
            }
            
            const updatedData = {
                company: data.company || existingWork.company,
                jobTitle: data.jobTitle || existingWork.jobTitle,
                startDate: new Date(data.startDate || existingWork.startDate),
                endDate: new Date(data.endDate || existingWork.endDate),
                description: data.description || existingWork.description
            };
          
            console.log(updatedData);
          
            const updatedWork = await prisma.workExperience.update({
                where: { id },
                data: updatedData,
            });

            return { success: true, data: updatedWork };
        } catch (error) {
            console.error("Work update failed:", error);
            return { success: false, data: `Work update failed: ${error}` };
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


