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
      bankAccountNumber,
      bankIfscCode,
      bankAccountHolderName,
      bankName,
      upiId,
      businessAddress,
      businessEmail,
      businessPhone,
      accountType,
      branchCode,
      paypalEmail,
      paymentSchedule,
      minimumPayoutAmount,
      tdsDeduction,
      form16Generation
    } = body;

    // Update or create payment info
    const paymentInfo = await prisma.spaceOwnerPaymentInfo.upsert({
      where: {
        spaceOwnerId: spaceOwner.id
      },
      update: {
        bankAccountNumber,
        bankIfscCode,
        bankAccountHolderName,
        bankName,
        upiId: upiId || null
      },
      create: {
        spaceOwnerId: spaceOwner.id,
        bankAccountNumber,
        bankIfscCode,
        bankAccountHolderName,
        bankName,
        upiId: upiId || null
      }
    });

    // Update business info with payment-related fields
    const businessInfo = await prisma.spaceOwnerBusinessInfo.findFirst({
      where: { spaceOwnerId: spaceOwner.id }
    });

    if (businessInfo) {
      await prisma.spaceOwnerBusinessInfo.update({
        where: { id: businessInfo.id },
        data: {
          businessAddress: businessAddress || businessInfo.businessAddress
        }
      });
    }

    // TODO: Store additional payment settings in a separate table or extend existing tables
    // For now, we'll just log the additional settings
    console.log('Additional payment settings:', {
      businessEmail,
      businessPhone,
      accountType,
      branchCode,
      paypalEmail,
      paymentSchedule,
      minimumPayoutAmount,
      tdsDeduction,
      form16Generation
    });

    return NextResponse.json({
      success: true,
      message: 'Payment settings saved successfully',
      data: paymentInfo
    });

  } catch (error: any) {
    console.error('Error saving payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to save payment settings', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}