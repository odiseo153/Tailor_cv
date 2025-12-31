import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';
import { PrismaClient, Skill } from '@prisma/client';


export class SkillsHandler implements BaseHandler<Skill> {
    async get(userId: string): Promise<HandlerResult> {
        try {
            const skills = await prisma.skill.findMany({
                where: { userId: userId },
                orderBy: { name: 'asc' }
            });

            return { success: true, data: skills };
        } catch (error) {
            console.error("Skill fetching failed:", error);
            return { success: false, data: "Skill fetching failed" };
        }
    }

    async create(data: any): Promise<HandlerResult> {
        console.log(data);

        try {
            const newSkill = await prisma.skill.create({
                data: data
            });


            return { success: true, data: newSkill };
        } catch (error) {
            console.error("Skill creation failed:", error);
            return { success: false, data: "Skill creation failed" };
        }
    }

    async update(id: string, data: any): Promise<HandlerResult> {
        try {
            const updateData: any = {};
            if (data.name) updateData.name = data.name;
            if (data.level) updateData.level = data.level;

            const updatedSkill = await prisma.skill.update({
                where: { id },
                data: updateData,
            });

            return { success: true, data: updatedSkill };
        } catch (error: any) {
            console.error("Skill update failed:", error);
            if (error.code === 'P2025') {
                return { success: false, data: "Skill not found" };
            }
            return { success: false, data: `Skill update failed: ${error.message}` };
        }
    }

    async delete(id: string): Promise<HandlerResult> {
        try {
            await prisma.skill.delete({ where: { id } });

            const result: HandlerResult = { success: true };

            return result;
        } catch (error) {
            console.error("Skill deleted failed:", error);
            return { success: false, data: `Skill delete failed: ${error}` };
        }
    }

}






