import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';
import { PrismaClient, Skill } from '@prisma/client';


export class SkillsHandler implements BaseHandler<Skill> {
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
            const existingSkill = await prisma.skill.findUnique({
                where: { id }
            });

            if (!existingSkill) {
                return { success: false, data: "Skill not found" };
            }

            // Merge existing user data with new data, keeping existing values if new data is empty
            const mergedData = {
                name: data.name || existingSkill.name,
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
    
    async delete(id: string): Promise<HandlerResult> {
        try {
            await prisma.skill.delete({ where: { id } });

            const result: HandlerResult = { success: true};

            return result;
        } catch (error) {
            console.error("Skill deleted failed:", error);
            return { success: false, data: `Skill delete failed: ${error}` };
        }
    }
    
}






