import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UserHandler } from '@/app/Handler/PrismaHandler/UserHandler';
import { prisma } from '@/lib/utils';

const UPLOAD_DIR = 'uploads/profile';

async function deleteServerProfilePicture(profilePictureUrl: string | null): Promise<void> {
  if (!profilePictureUrl || !profilePictureUrl.startsWith(`/${UPLOAD_DIR}/`)) return;
  const filePath = path.join(process.cwd(), 'public', profilePictureUrl.replace(/^\//, ''));
  try {
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
  } catch {
    // File may already be missing; ignore
  }
}

interface ProfileUpdateRequest {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
}

interface ProfileResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

const userHandler = new UserHandler();

export async function GET(request: Request): Promise<NextResponse<ProfileResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const result = await userHandler.getById(userId);

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = result;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile: ' + (error.message || 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(request: Request): Promise<NextResponse<ProfileResponse>> {
  try {
    const requestData: ProfileUpdateRequest = await request.json();

    if (!requestData.id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Validate required fields
    if (!requestData.name || !requestData.email) {
      return NextResponse.json({
        success: false,
        error: 'Name and email are required fields'
      }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: requestData.id },
      select: { profilePicture: true },
    });
    const newPicture = requestData.profilePicture ?? existingUser?.profilePicture ?? '';
    if (
      existingUser?.profilePicture &&
      existingUser.profilePicture.startsWith(`/${UPLOAD_DIR}/`) &&
      existingUser.profilePicture !== newPicture
    ) {
      await deleteServerProfilePicture(existingUser.profilePicture);
    }

    const updateData = {
      id: requestData.id,
      name: requestData.name,
      email: requestData.email,
      phone: requestData.phone || '',
      location: requestData.location || '',
      profilePicture: newPicture
    };

    const result = await userHandler.update(requestData.id, updateData);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.data || 'Failed to update profile'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile: ' + (error.message || 'Unknown error')
    }, { status: 500 });
  }
} 