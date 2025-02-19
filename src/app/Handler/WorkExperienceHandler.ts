import { PrismaClient,  WorkExperience } from '@prisma/client';
import { BaseHandler } from '../interface/BaseHandler';
import { HandlerResult } from '../interface/HandlerResult';

const prisma = new PrismaClient();

export class WorkExperienceHandler implements BaseHandler<WorkExperience> {
    async create(data: WorkExperience):Promise<HandlerResult> {
        try {
            const newWork = await prisma.workExperience.create({data});

            return { success: true, data: newWork };
        } catch (error) {
            console.error("Work creation failed:", error);
            return { success: false, data: "Work creation failed" };
        }
    }

    async update(id: string, data: WorkExperience):Promise<HandlerResult> {
        try {
            const existingWork = await prisma.workExperience.findUnique({
                where: { id }
            });

            if (!existingWork) {
                return { success: false, data: "work not found" };
            }

            // Merge existing user data with new data, keeping existing values if new data is empty
            const mergedData = {
                company: data.company || existingWork.company,
                jobTitle: data.jobTitle || existingWork.jobTitle,
                startDate: data.startDate || existingWork.startDate,
                endDate: data.endDate || existingWork.endDate,
                description: data.description || existingWork.description,
            };
 
            const updatedWork = await prisma.workExperience.update({
                where: { id },
                data: mergedData,
            });

            return { success: true, data: updatedWork };
        } catch (error) {
            console.error("Work update failed:", error);
            return { success: false, data: `Work update failed: ${error}` };
        }
    }
    
    
}

