import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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
      },
      select: {
        id: true,
        premiumPaymentsEnabled: true,
        premiumPlan: true
      }
    });

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        premiumPaymentsEnabled: spaceOwner.premiumPaymentsEnabled,
        premiumPlan: spaceOwner.premiumPlan
      }
    });

  } catch (error: any) {
    console.error('Error fetching premium payments status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch premium payments status', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
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

    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid enabled value' }, { status: 400 });
    }

    // Update the space owner's premium payments status
    const updatedSpaceOwner = await prisma.spaceOwner.updateMany({
      where: {
        userId: decoded.id
      },
      data: {
        premiumPaymentsEnabled: enabled
      }
    });

    if (updatedSpaceOwner.count === 0) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 });
    }

    console.log(`✅ Premium payments ${enabled ? 'enabled' : 'disabled'} for owner: ${decoded.id}`);

    return NextResponse.json({
      success: true,
      message: `Premium payments ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: {
        premiumPaymentsEnabled: enabled
      }
    });

  } catch (error: any) {
    console.error('Error updating premium payments status:', error);
    return NextResponse.json(
      { error: 'Failed to update premium payments status', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
