import { PrismaClient, SocialLink } from '@prisma/client';
import { BaseHandler } from '@/app/interface/BaseHandler';
import { HandlerResult } from '@/app/interface/HandlerResult';
import { prisma } from '@/lib/utils';



export class SocialLinksHandler implements BaseHandler<SocialLink> {
    async get(userId: string): Promise<HandlerResult> {
        try {
            const socialLinks = await prisma.socialLink.findMany({
                where: { userId: userId },
                orderBy: { platform: 'asc' }
            });

            return { success: true, data: socialLinks };
        } catch (error) {
            console.error("Social fetching failed:", error);
            return { success: false, data: "Social fetching failed" };
        }
    }

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
            const updateData: any = {};
            if (data.platform) updateData.platform = data.platform;
            if (data.url) updateData.url = data.url;

            const updatedSocial = await prisma.socialLink.update({
                where: { id },
                data: updateData,
            });

            return { success: true, data: updatedSocial };
        } catch (error: any) {
            console.error("Social update failed:", error);
            if (error.code === 'P2025') {
                return { success: false, data: "Social not found" };
            }
            return { success: false, data: `Social update failed: ${error.message}` };
        }
    }

    async delete(id: string): Promise<HandlerResult> {
        try {
            await prisma.socialLink.delete({ where: { id } });

            const result: HandlerResult = { success: true };

            return result;
        } catch (error) {
            console.error("Social Links deleted failed:", error);
            return { success: false, data: `Social Links deleted failed: ${error}` };
        }
    }


}

