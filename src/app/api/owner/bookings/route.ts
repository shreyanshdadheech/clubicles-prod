import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Get all bookings for this owner's spaces
    const bookings = await prisma.booking.findMany({
      where: {
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
          }
        }
      },
      include: {
        space: {
          select: {
            name: true,
            address: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform bookings to match the expected format
    const transformedBookings = bookings.map((booking: any) => ({
      id: booking.id,
      customer_name: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Guest User',
      customer_email: booking.user?.email || 'N/A',
      customer_phone: booking.user?.phone || 'N/A',
      date: booking.date.toISOString().split('T')[0],
      start_time: booking.startTime,
      end_time: booking.endTime,
      amount: Number(booking.totalAmount),
      status: booking.status,
      redemption_code: booking.redemptionCode || '',
      qr_code_data: booking.qrCodeData || '',
      is_redeemed: booking.isRedeemed || false,
      redeemed_at: booking.redeemedAt?.toISOString() || '',
      space_name: booking.space.name,
      created_at: booking.createdAt.toISOString()
    }))

    console.log('✅ Owner bookings fetched:', transformedBookings.length, 'bookings')

    return NextResponse.json({
      success: true,
      bookings: transformedBookings
    })

  } catch (error: any) {
    console.error('Error fetching owner bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error.message },
      { status: 500 }
    )
  }
}

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
    const { booking_id, action } = body

    if (!booking_id || !action) {
      return NextResponse.json({ error: 'Booking ID and action are required' }, { status: 400 })
    }

    // Find the booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: booking_id,
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Update booking status based on action
    let newStatus = booking.status
    switch (action) {
      case 'confirm':
        newStatus = 'confirmed'
        break
      case 'cancel':
        newStatus = 'cancelled'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking_id },
      data: { status: newStatus }
    })

    // If booking is cancelled, restore the seats
    if (action === 'cancel' && booking.status === 'confirmed') {
      await prisma.space.update({
        where: { id: booking.spaceId },
        data: {
          availableSeats: {
            increment: booking.seatsBooked
          }
        }
      })
      console.log(`✅ Restored ${booking.seatsBooked} seats for space ${booking.spaceId}`)
    }

    console.log('✅ Booking status updated:', {
      bookingId: booking_id,
      action,
      newStatus,
      spaceOwnerId: spaceOwner.id
    })

    return NextResponse.json({
      success: true,
      message: `Booking ${action}ed successfully`,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status
      }
    })

  } catch (error: any) {
    console.error('Error updating booking status:', error)
    return NextResponse.json(
      { error: 'Failed to update booking', details: error.message },
      { status: 500 }
    )
  }
}