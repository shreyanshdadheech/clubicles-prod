import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, 'your-super-secret-jwt-key-change-this-in-production') as any;
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: {
        userId: decoded.id
      }
    });

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const {
      businessName,
      businessType,
      gstNumber,
      panNumber,
      businessAddress,
      businessCity,
      businessState,
      businessPincode
    } = body;

    // Update or create business info
    const businessInfo = await prisma.spaceOwnerBusinessInfo.upsert({
      where: {
        spaceOwnerId: spaceOwner.id
      },
      update: {
        businessName,
        businessType,
        gstNumber: gstNumber || null,
        panNumber,
        businessAddress,
        businessCity,
        businessState,
        businessPincode,
        verificationStatus: 'pending' // Set verification status to pending
      },
      create: {
        spaceOwnerId: spaceOwner.id,
        businessName,
        businessType,
        gstNumber: gstNumber || null,
        panNumber,
        businessAddress,
        businessCity,
        businessState,
        businessPincode,
        verificationStatus: 'pending' // Set verification status to pending
      }
    });

    // Update space owner to mark onboarding as completed
    await prisma.spaceOwner.update({
      where: {
        id: spaceOwner.id
      },
      data: {
        onboardingCompleted: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Business information saved successfully and submitted for verification',
      data: businessInfo
    });

  } catch (error: any) {
    console.error('Error saving business information:', error);
    return NextResponse.json(
      { error: 'Failed to save business information', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
