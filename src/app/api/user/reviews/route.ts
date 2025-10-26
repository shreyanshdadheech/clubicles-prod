import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
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

    // Get user's reviews with space information
    const reviews = await prisma.review.findMany({
      where: {
        userId: decoded.id
      },
      include: {
        space: {
          select: {
            id: true,
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

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews.map(review => ({
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
          updated_at: review.updatedAt?.toISOString(),
          space: {
            id: review.space.id,
            name: review.space.name,
            address: review.space.address,
            city: review.space.city,
            images: review.space.images
          }
        })),
        total_reviews: reviews.length
      }
    })

  } catch (error: any) {
    console.error('Error fetching user reviews:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch reviews',
      details: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
