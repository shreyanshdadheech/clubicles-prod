import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'
import { NotificationService } from '@/lib/notification-service'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token using the same method as other APIs
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { 
      spaceId, 
      rating, 
      reviewText,
      overallExperience,
      cleanliness,
      restroomHygiene,
      amenities,
      staffService,
      wifiQuality
    } = await request.json()

    if (!spaceId || !rating || !reviewText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user has redeemed bookings for this space
    const redeemedBookings = await prisma.booking.findFirst({
      where: {
        userId: decoded.id,
        spaceId: spaceId,
        isRedeemed: true
      }
    })

    if (!redeemedBookings) {
      return NextResponse.json({ 
        error: 'You must redeem a booking before writing a review' 
      }, { status: 403 })
    }

    // Check if user already has a review for this space
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: decoded.id,
        spaceId: spaceId
      }
    })

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You already have a review for this space. Use PUT to update it.' 
      }, { status: 409 })
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: decoded.id,
        spaceId: spaceId,
        bookingId: redeemedBookings.id, // Link to the redeemed booking
        rating: parseInt(rating),
        comment: reviewText,
        overallExperience: overallExperience ? parseInt(overallExperience) : null,
        cleanliness: cleanliness ? parseInt(cleanliness) : null,
        restroomHygiene: restroomHygiene ? parseInt(restroomHygiene) : null,
        amenities: amenities ? parseInt(amenities) : null,
        staffService: staffService ? parseInt(staffService) : null,
        wifiQuality: wifiQuality ? parseInt(wifiQuality) : null
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            professionalRole: true
          }
        }
      }
    })

    // Send notification to space owner
    try {
      const space = await prisma.space.findUnique({
        where: { id: spaceId },
        include: {
          businessInfo: {
            include: {
              spaceOwner: {
                include: { user: true }
              }
            }
          }
        }
      })

      if (space?.businessInfo?.spaceOwner) {
        await NotificationService.sendReviewNotification({
          ownerId: space.businessInfo.spaceOwner.userId,
          spaceName: space.name,
          customerName: `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 'Anonymous',
          rating: review.rating,
          reviewText: review.comment || '',
          reviewId: review.id
        })
        console.log('✅ Review notification sent to space owner')
      }
    } catch (notificationError) {
      console.error('❌ Error sending review notification:', notificationError)
      // Don't fail the review if notification fails
    }

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        review_text: review.comment,
        overall_experience: review.overallExperience,
        cleanliness: review.cleanliness,
        restroom_hygiene: review.restroomHygiene,
        amenities: review.amenities,
        staff_service: review.staffService,
        wifi_quality: review.wifiQuality,
        created_at: review.createdAt.toISOString(),
        user: {
          name: `${review.user.firstName} ${review.user.lastName}`.trim(),
          professional_role: review.user.professionalRole
        }
      }
    })

  } catch (error: any) {
    console.error('Error creating review:', error)
    return NextResponse.json({ 
      error: 'Failed to create review',
      details: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token using the same method as other APIs
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { 
      spaceId, 
      rating, 
      reviewText,
      overallExperience,
      cleanliness,
      restroomHygiene,
      amenities,
      staffService,
      wifiQuality
    } = await request.json()

    if (!spaceId || !rating || !reviewText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user has redeemed bookings for this space
    const redeemedBookings = await prisma.booking.findFirst({
      where: {
        userId: decoded.id,
        spaceId: spaceId,
        isRedeemed: true
      }
    })

    if (!redeemedBookings) {
      return NextResponse.json({ 
        error: 'You must redeem a booking before writing a review' 
      }, { status: 403 })
    }

    // Find and update the existing review
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: decoded.id,
        spaceId: spaceId
      }
    })

    if (!existingReview) {
      return NextResponse.json({ 
        error: 'No existing review found to update' 
      }, { status: 404 })
    }

    // Update the review
    const review = await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating: parseInt(rating),
        comment: reviewText,
        overallExperience: overallExperience ? parseInt(overallExperience) : null,
        cleanliness: cleanliness ? parseInt(cleanliness) : null,
        restroomHygiene: restroomHygiene ? parseInt(restroomHygiene) : null,
        amenities: amenities ? parseInt(amenities) : null,
        staffService: staffService ? parseInt(staffService) : null,
        wifiQuality: wifiQuality ? parseInt(wifiQuality) : null,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            professionalRole: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        review_text: review.comment,
        overall_experience: review.overallExperience,
        cleanliness: review.cleanliness,
        restroom_hygiene: review.restroomHygiene,
        amenities: review.amenities,
        staff_service: review.staffService,
        wifi_quality: review.wifiQuality,
        created_at: review.createdAt.toISOString(),
        updated_at: review.updatedAt.toISOString(),
        user: {
          name: `${review.user.firstName} ${review.user.lastName}`.trim(),
          professional_role: review.user.professionalRole
        }
      }
    })

  } catch (error: any) {
    console.error('Error updating review:', error)
    return NextResponse.json({ 
      error: 'Failed to update review',
      details: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}