import { PrismaClient, SocialLink } from '@prisma/client';
import { BaseHandler } from '../interface/BaseHandler';
import { HandlerResult } from '../interface/HandlerResult';

const prisma = new PrismaClient();

export class SocialLinksHandler implements BaseHandler<SocialLink> {
    async create(data: SocialLink): Promise<HandlerResult> {
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

    async update(id: string, data: SocialLink): Promise<HandlerResult> {
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
    
    
}

