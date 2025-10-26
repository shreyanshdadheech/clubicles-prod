import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spaceId } = await params

    if (!spaceId) {
      return NextResponse.json({ 
        success: false,
        error: 'Space ID is required'
      }, { status: 400 })
    }

    // Get space details with all related information
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      include: {
        businessInfo: {
          include: {
            spaceOwner: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true
          }
        },
        bookings: {
          select: {
            id: true,
            status: true,
            isRedeemed: true
          }
        }
      }
    })

    if (!space) {
      return NextResponse.json({ 
        success: false,
        error: 'Space not found'
      }, { status: 404 })
    }

    // Calculate average rating from reviews
    const reviews = space.reviews || []
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0

    // Calculate booking statistics
    const bookings = space.bookings || []
    const totalBookings = bookings.length
    const redeemedBookings = bookings.filter(booking => booking.isRedeemed).length
    const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed').length

    // Transform space data for frontend
    const transformedSpace = {
      id: space.id,
      owner_id: space.businessInfo?.spaceOwnerId || '',
      name: space.name,
      description: space.description || '',
      address: space.address,
      city: space.city,
      pincode: space.pincode,
      total_seats: space.totalSeats,
      available_seats: space.availableSeats,
      price_per_hour: Number(space.pricePerHour || 0),
      price_per_day: Number(space.pricePerDay || 0),
      amenities: space.amenities || [],
      images: space.images || [],
      status: 'approved', // Default status since it's not in schema
      rating: averageRating,
      averageRating: averageRating,
      totalReviews: reviews.length,
      totalBookings: totalBookings,
      redeemedBookings: redeemedBookings,
      confirmedBookings: confirmedBookings,
      created_at: space.createdAt.toISOString(),
      updated_at: space.updatedAt.toISOString(),
      // VIBGYOR data
      violet: space.violet || 0,
      indigo: space.indigo || 0,
      blue: space.blue || 0,
      green: space.green || 0,
      yellow: space.yellow || 0,
      orange: space.orange || 0,
      red: space.red || 0,
      grey: space.grey || 0,
      white: space.white || 0,
      black: space.black || 0,
      // Owner info
      owner: space.businessInfo?.spaceOwner ? {
        name: `${space.businessInfo.spaceOwner.firstName || ''} ${space.businessInfo.spaceOwner.lastName || ''}`.trim(),
        email: space.businessInfo.spaceOwner.email
      } : null
    }

    console.log('✅ Space details fetched successfully:', {
      spaceId: space.id,
      name: space.name,
      address: space.address,
      city: space.city,
      availableSeats: space.availableSeats,
      totalSeats: space.totalSeats,
      pricePerHour: space.pricePerHour,
      pricePerDay: space.pricePerDay,
      reviewsCount: reviews.length,
      averageRating: averageRating,
      totalBookings: totalBookings,
      redeemedBookings: redeemedBookings,
      confirmedBookings: confirmedBookings
    })

    return NextResponse.json({
      success: true,
      space: transformedSpace
    })

  } catch (error: any) {
    console.error('Error fetching space details:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch space details'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
