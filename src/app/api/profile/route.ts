import { NextResponse } from 'next/server';
import { UserHandler } from '@/app/Handler/PrismaHandler/UserHandler';

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

    const updateData = {
      id: requestData.id,
      name: requestData.name,
      email: requestData.email,
      phone: requestData.phone || '',
      location: requestData.location || '',
      profilePicture: requestData.profilePicture || ''
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