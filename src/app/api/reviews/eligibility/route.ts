import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ 
        eligible: false, 
        reason: 'Authentication required',
        action_required: 'Please sign in to write a review'
      })
    }

    // Verify the token using the same method as other APIs
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ 
        eligible: false, 
        reason: 'Invalid token',
        action_required: 'Please sign in again'
      })
    }

    const spaceId = request.nextUrl.searchParams.get('space_id')
    
    if (!spaceId) {
      return NextResponse.json({ 
        eligible: false, 
        reason: 'Space ID is required',
        action_required: 'Please select a space'
      })
    }

    // Check if user has any redeemed bookings for this space
    const redeemedBookings = await prisma.booking.findMany({
      where: {
        userId: decoded.id,
        spaceId: spaceId,
        isRedeemed: true
      },
      select: {
        id: true,
        redemptionCode: true,
        date: true,
        status: true
      }
    })

    // Check if user already has a review for this space
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: decoded.id,
        spaceId: spaceId
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        overallExperience: true,
        cleanliness: true,
        restroomHygiene: true,
        amenities: true,
        staffService: true,
        wifiQuality: true,
        createdAt: true
      }
    })

    // If user has no redeemed bookings, they can't review
    if (redeemedBookings.length === 0) {
      return NextResponse.json({
        eligible: false,
        reason: 'You must redeem a booking before writing a review',
        action_required: 'Book and redeem a space to write a review',
        bookings: [],
        redeemed_bookings: []
      })
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        firstName: true,
        lastName: true,
        professionalRole: true
      }
    })

    // If user has existing review, they can edit it
    if (existingReview) {
      return NextResponse.json({
        eligible: true,
        reason: 'You have a redeemed booking and can write a review',
        action_available: 'edit',
        user: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          professionalRole: user?.professionalRole
        },
        existing_review: {
          id: existingReview.id,
          rating: existingReview.rating,
          review_text: existingReview.comment,
          overall_experience: existingReview.overallExperience,
          cleanliness: existingReview.cleanliness,
          restroom_hygiene: existingReview.restroomHygiene,
          amenities: existingReview.amenities,
          staff_service: existingReview.staffService,
          wifi_quality: existingReview.wifiQuality,
          created_at: existingReview.createdAt.toISOString()
        },
        bookings: redeemedBookings.map(booking => ({
          id: booking.id,
          date: booking.date.toISOString(),
          is_redeemed: true,
          status: booking.status
        })),
        redeemed_bookings: redeemedBookings.map(booking => ({
          id: booking.id,
          redemption_code: booking.redemptionCode,
          date: booking.date.toISOString()
        }))
      })
    }

    // User can create a new review
    return NextResponse.json({
      eligible: true,
      reason: 'You have redeemed bookings and can write a review',
      action_available: 'create',
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        professionalRole: user?.professionalRole
      },
      bookings: redeemedBookings.map(booking => ({
        id: booking.id,
        date: booking.date.toISOString(),
        is_redeemed: true,
        status: booking.status
      })),
      redeemed_bookings: redeemedBookings.map(booking => ({
        id: booking.id,
        redemption_code: booking.redemptionCode,
        date: booking.date.toISOString()
      }))
    })

  } catch (error: any) {
    console.error('Error checking review eligibility:', error)
    return NextResponse.json({ 
      eligible: false, 
      reason: 'Failed to check eligibility',
      action_required: 'Please try again later'
    })
  } finally {
    await prisma.$disconnect()
  }
}