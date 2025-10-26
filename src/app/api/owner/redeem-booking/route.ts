import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: { userId: decoded.id }
    })

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 })
    }

    const body = await request.json()
    const { redemption_code } = body

    if (!redemption_code) {
      return NextResponse.json({ error: 'Redemption code is required' }, { status: 400 })
    }

    // Find the booking by redemption code
    const booking = await prisma.booking.findFirst({
      where: {
        redemptionCode: redemption_code,
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
          }
        }
      },
      include: {
        space: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ 
        error: 'Booking not found or invalid redemption code' 
      }, { status: 404 })
    }

    if (booking.isRedeemed) {
      return NextResponse.json({ 
        error: 'This booking has already been redeemed' 
      }, { status: 400 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ 
        error: 'Only confirmed bookings can be redeemed' 
      }, { status: 400 })
    }

    // Update the booking as redeemed
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        isRedeemed: true,
        redeemedAt: new Date(),
        redeemedBy: spaceOwner.id,
        status: 'completed'
      }
    })

    // Update VIBGYOR tracking only when booking is redeemed
    try {
      // Get the first professional role from the roles array
      const professionalRole = Array.isArray(booking.roles) && booking.roles.length > 0 
        ? String(booking.roles[0]).toLowerCase() 
        : 'marketer'; // Default fallback
      const updateData: any = {};

      // Map professional roles to VIBGYOR columns
      switch (professionalRole) {
        case 'visionary':
        case 'violet':
          updateData.violet = { increment: 1 };
          break;
        case 'industrialist':
        case 'indigo':
          updateData.indigo = { increment: 1 };
          break;
        case 'marketer':
        case 'blue':
          updateData.blue = { increment: 1 };
          break;
        case 'green_ev':
        case 'green':
          updateData.green = { increment: 1 };
          break;
        case 'young_entrepreneur':
        case 'yellow':
          updateData.yellow = { increment: 1 };
          break;
        case 'oracle':
        case 'orange':
          updateData.orange = { increment: 1 };
          break;
        case 'real_estate':
        case 'red':
          updateData.red = { increment: 1 };
          break;
        case 'nomad':
        case 'grey':
          updateData.grey = { increment: 1 };
          break;
        case 'policy_maker':
        case 'white':
          updateData.white = { increment: 1 };
          break;
        case 'prefer_not_to_say':
        case 'black':
          updateData.black = { increment: 1 };
          break;
        default:
          console.log('Unknown professional role for VIBGYOR tracking:', professionalRole);
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.space.update({
          where: { id: booking.spaceId },
          data: updateData
        });
        console.log(`✅ Updated VIBGYOR tracking for redeemed booking: ${professionalRole}`);
      }
    } catch (vibgyorError) {
      console.error('❌ Error updating VIBGYOR tracking on redemption:', vibgyorError);
      // Don't fail the redemption if VIBGYOR tracking fails
    }

    console.log('✅ Booking redeemed:', {
      bookingId: booking.id,
      redemptionCode: redemption_code,
      spaceName: booking.space.name,
      customerName: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim(),
      professionalRole: Array.isArray(booking.roles) && booking.roles.length > 0 ? String(booking.roles[0]) : 'marketer'
    })

    return NextResponse.json({
      success: true,
      message: 'Booking redeemed successfully',
      booking: {
        id: updatedBooking.id,
        redemption_code: updatedBooking.redemptionCode,
        is_redeemed: updatedBooking.isRedeemed,
        redeemed_at: updatedBooking.redeemedAt?.toISOString(),
        status: updatedBooking.status,
        space_name: booking.space.name,
        customer_name: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim()
      }
    })

  } catch (error: any) {
    console.error('Error redeeming booking:', error)
    return NextResponse.json(
      { error: 'Failed to redeem booking', details: error.message },
      { status: 500 }
    )
  }
}
