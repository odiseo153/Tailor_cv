import { PrismaClient, Education } from '@prisma/client';
import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';



export class EducationHandler implements BaseHandler<Education> {
    async get(userId: string): Promise<HandlerResult> {
        try {
            const education = await prisma.education.findMany({
                where: { userId: userId },
                orderBy: { startDate: 'desc' }
            });

            return { success: true, data: education };
        } catch (error) {
            console.error("Education fetching failed:", error);
            return { success: false, data: "Education fetching failed" };
        }
    }

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

    async update(id: string, data: any): Promise<HandlerResult> {
        try {
            const updateData: any = {};
            if (data.institution) updateData.institution = data.institution;
            if (data.degree) updateData.degree = data.degree;
            if (data.startDate) updateData.startDate = new Date(data.startDate);
            if (data.endDate) updateData.endDate = new Date(data.endDate);

            const updatedEducation = await prisma.education.update({
                where: { id },
                data: updateData,
            });


            const result: HandlerResult = { success: true, data: updatedEducation };

            return result;
        } catch (error: any) {
            console.error("Education update failed:", error);
            if (error.code === 'P2025') {
                return { success: false, data: "Education not found" };
            }
            return {
                data: "Sometimes happend " + error.message,
                success: false,
            };
        }
    }

    async delete(id: string): Promise<HandlerResult> {
        try {
            await prisma.education.delete({ where: { id } });

            const result: HandlerResult = { success: true };

            return result;
        } catch (error) {
            console.error("Education update failed:", error);
            return {
                success: false
            };
        }
    }

}

