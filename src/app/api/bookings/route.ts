import { getServerUser } from '@/lib/auth-utils'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/bookings - Get bookings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { user, dbUser } = await getServerUser(request)
    
    if (!user || !dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // filter by status if provided

    // Build where clause
    const where: any = {
      userId: dbUser.id
    }
    
    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        space: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            pricePerHour: true,
            pricePerDay: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      bookings: bookings || []
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // TODO: Convert entire POST method to Prisma
    return NextResponse.json({ error: 'Booking creation temporarily disabled - converting to Prisma' }, { status: 501 })
  } catch (error) {
    console.error('Unexpected error in POST /api/bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}