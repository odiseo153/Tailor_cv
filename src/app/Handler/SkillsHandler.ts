import { PrismaClient, Skill } from '@prisma/client';
import { BaseHandler } from '../interface/BaseHandler';
import { HandlerResult } from '../interface/HandlerResult';

const prisma = new PrismaClient();

export class SkillsHandler implements BaseHandler<Skill> {
    async create(data: Skill): Promise<HandlerResult> {
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

    async update(id: string, data: Skill): Promise<HandlerResult> {
        try {
            const existingSkill = await prisma.skill.findUnique({
                where: { id }
            });

            if (!existingSkill) {
                return { success: false, data: "Skill not found" };
            }

            // Merge existing user data with new data, keeping existing values if new data is empty
            const mergedData = {
                name: existingSkill.name || existingSkill.name,
                level: data.level || existingSkill.level,
            };
 
            const updatedSkill = await prisma.skill.update({
                where: { id },
                data: mergedData,
            });

            return { success: true, data: updatedSkill };
        } catch (error) {
            console.error("Skill update failed:", error);
            return { success: false, data: `Skill update failed: ${error}` };
        }
    }
    
    
}

