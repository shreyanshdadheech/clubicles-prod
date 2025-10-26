import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Fetching user bookings...')
    
    const { user, dbUser } = await getServerUser(request)
    
    if (!user || !dbUser) {
      console.error('❌ Authentication failed')
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'Please log in to view your bookings'
      }, { status: 401 })
    }

    console.log('✅ Authenticated user ID:', dbUser.id)

    // Fetch bookings using Prisma
    const bookings = await prisma.booking.findMany({
      where: {
        userId: dbUser.id
      },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            pricePerHour: true,
            pricePerDay: true,
            totalSeats: true,
            availableSeats: true,
            amenities: true,
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('✅ Found bookings:', bookings.length)

    return NextResponse.json({
      success: true,
      bookings: bookings || []
    })

  } catch (error) {
    console.error('❌ Error fetching user bookings:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch bookings',
        message: 'Something went wrong while loading your bookings'
      },
      { status: 500 }
    )
  }
}