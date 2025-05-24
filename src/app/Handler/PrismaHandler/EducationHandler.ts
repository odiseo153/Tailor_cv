import { PrismaClient, Education } from '@prisma/client';
import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';



export class EducationHandler implements BaseHandler<Education> {
    async create(data: any): Promise<HandlerResult> {
        try {
            const safeData = data && typeof data === 'object' ? data : {};
            const newEducation = await prisma.education.create({
                data: safeData
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
            };
        }
    }

    async update(id: string, data: any):Promise<HandlerResult> {
        try {
            const existingEntity = await prisma.education.findUnique({
                where: { id }
            });

            if (!existingEntity) {
                return {
                data: "Entity with that Id doesnt exist",
                success: false,
                };
            }

            // Merge existing user data with new data, keeping existing values if new data is empty
            const mergedData = {
                institution: data.institution || existingEntity.institution,
                degree: data.degree || existingEntity.degree,
                startDate: data.startDate || existingEntity.startDate,
                endDate: data.endDate || existingEntity.endDate,
            };
 
            const safeData = mergedData && typeof mergedData === 'object' ? mergedData : {};
 
            console.log(safeData)
            const updatedEducation = await prisma.education.update({
                where: { id },
                data: safeData,
            });


            const result: HandlerResult = { success: true, data: updatedEducation };

            return result;
        } catch (error) {
            console.error("Education update failed:", error);
            return {
                data: "Sometimes happend ",
                success: false,
            };
        }
    }
    
    async delete(id: string):Promise<HandlerResult> {
        try {
            await prisma.education.delete({ where: { id } });

            const result: HandlerResult = { success: true};

            return result;
        } catch (error) {
            console.error("Education update failed:", error);
            return {
                success: false
            };
        }
    }
    
}

