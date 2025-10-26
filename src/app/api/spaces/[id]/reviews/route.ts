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

    // Get all reviews for this space with user information
    const reviews = await prisma.review.findMany({
      where: {
        spaceId: spaceId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            professionalRole: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform reviews for frontend
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      overallExperience: review.overallExperience,
      cleanliness: review.cleanliness,
      restroomHygiene: review.restroomHygiene,
      amenities: review.amenities,
      staffService: review.staffService,
      wifiQuality: review.wifiQuality,
      createdAt: review.createdAt.toISOString(),
      user: {
        firstName: review.user.firstName,
        lastName: review.user.lastName,
        professionalRole: review.user.professionalRole
      }
    }))

    console.log('✅ Space reviews fetched successfully:', {
      spaceId: spaceId,
      reviewsCount: reviews.length
    })

    return NextResponse.json({
      success: true,
      reviews: transformedReviews,
      totalReviews: reviews.length
    })

  } catch (error: any) {
    console.error('Error fetching space reviews:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch reviews'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}