import { PrismaClient, Education } from '@prisma/client';
import { BaseHandler } from '../interface/BaseHandler';
import { HandlerResult } from '../interface/HandlerResult';

const prisma = new PrismaClient();

export class EducationHandler implements BaseHandler<Education> {
    async create(data: Education): Promise<HandlerResult> {
        try {
            const newEducation = await prisma.education.create({
                data: data
            });

            const result: HandlerResult = {
                success: true,
                data: newEducation
            };

            return result;
        } catch (error: any) {
            console.error("Education creation failed:", error);
            return {
                success: false,
                data: {}
            };
        }
    }

    async update(id: string, data: Education):Promise<HandlerResult> {
        try {
            const existingEntity = await prisma.education.findUnique({
                where: { id }
            });

            if (!existingEntity) {
                return {
                    success: false,
                    data: {}
                };
            }

            // Merge existing user data with new data, keeping existing values if new data is empty
            const mergedData = {
                institution: data.institution || existingEntity.institution,
                degree: data.degree || existingEntity.degree,
                startDate: data.startDate || existingEntity.startDate,
                endDate: data.endDate || existingEntity.endDate,
            };
 
            const updatedEducation = await prisma.education.update({
                where: { id },
                data: mergedData,
            });

            const result: HandlerResult = { success: true, data: updatedEducation };

            return result;
        } catch (error) {
            console.error("Education update failed:", error);
            return {
                success: false,
                data: {}
            };
        }
    }
    
    
}

