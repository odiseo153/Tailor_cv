import { PrismaClient, SocialLink } from '@prisma/client';
import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';



export class SocialLinksHandler implements BaseHandler<SocialLink> {
    async create(data: any): Promise<HandlerResult> {
        try {
            const newSocial = await prisma.socialLink.create({
                data: data
            });
            return { success: true, data: newSocial };
        } catch (error) {
            console.error("Social creation failed:", error);
            return { success: false, data: "Social creation failed" };
        }
    }

    async update(id: string, data: any): Promise<HandlerResult> {
        try {
            const existingSocial = await prisma.socialLink.findUnique({
                where: { id }
            });

            if (!existingSocial) {
                return { success: false, data: "Social not found" };
            }

            // Merge existing user data with new data, keeping existing values if new data is empty
            const mergedData = {
                platform: data.platform || existingSocial.platform,
                url: data.url || existingSocial.url,
            };
 
            const updatedSocial = await prisma.socialLink.update({
                where: { id },
                data: mergedData,
            });

            return { success: true, data: updatedSocial };
        } catch (error) {
            console.error("Social update failed:", error);
            return { success: false, data: `Social update failed: ${error}` };
        }
    }

    async delete(id: string): Promise<HandlerResult> {
        try {
            await prisma.socialLink.delete({ where: { id } });

            const result: HandlerResult = { success: true};

            return result;
        } catch (error) {
            console.error("Social Links deleted failed:", error);
            return { success: false, data: `Social Links deleted failed: ${error}` };
        }
    }
    
    
}

