import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    console.log('Fetching bookings for user:', decoded.id)

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: {
        userId: decoded.id
      },
      include: {
        space: {
          select: {
            name: true,
            address: true,
            city: true,
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate stats
    const confirmedOrCompleted = bookings.filter(booking => booking.status === 'confirmed' || booking.status === 'completed')
    
    console.log('📊 Stats calculation:', {
      totalBookings: bookings.length,
      confirmedOrCompleted: confirmedOrCompleted.length,
      bookingAmounts: confirmedOrCompleted.map(b => ({
        id: b.id,
        status: b.status,
        totalAmount: b.totalAmount,
        totalAmountNumber: Number(b.totalAmount)
      }))
    })
    
    const totalSpent = confirmedOrCompleted.reduce((sum, booking) => sum + Number(booking.totalAmount), 0)
    
    console.log('📊 Total spent calculated:', totalSpent)

    const upcomingBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      const today = new Date()
      
      // Reset time to start of day for accurate date comparison
      bookingDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      
      return bookingDate >= today && (booking.status === 'confirmed' || booking.status === 'pending')
    })

    const stats = {
      totalBookings: bookings.length,
      upcomingBookings: upcomingBookings.length,
      totalSpent: totalSpent,
    }

    const mappedBookings = bookings.map((booking) => ({
      id: booking.id,
      spaceId: booking.spaceId,
      userId: booking.userId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      date: booking.date.toISOString(),
      seatsBooked: booking.seatsBooked,
      baseAmount: Number(booking.baseAmount),
      taxAmount: Number(booking.taxAmount || 0),
      totalAmount: Number(booking.totalAmount),
      ownerPayout: Number(booking.ownerPayout),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      space_name: booking.space?.name || 'N/A',
      space_location: booking.space ? `${booking.space.address}, ${booking.space.city}` : 'N/A',
      space_city: booking.space?.city || 'N/A',
      space_image: (booking.space?.images as string[])?.[0] || '/placeholder-space.jpg',
      redemption_code: booking.redemptionCode || null,
      is_redeemed: booking.isRedeemed || false,
      redeemed_at: booking.redeemedAt?.toISOString() || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        bookings: mappedBookings,
        stats
      }
    })

  } catch (error: any) {
    console.error('Error fetching user bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error.message },
      { status: 500 }
    )
  }
}
