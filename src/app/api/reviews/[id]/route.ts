import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
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

    const { rating, review_text } = await request.json()

    if (!rating || !review_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find the review and verify ownership
    const existingReview = await prisma.review.findFirst({
      where: {
        id: id,
        userId: decoded.id
      },
      include: {
        space: {
          select: {
            id: true
          }
        }
      }
    })

    if (!existingReview) {
      return NextResponse.json({ 
        error: 'Review not found or you do not have permission to update it' 
      }, { status: 404 })
    }

    // Check if user has redeemed bookings for this space
    const redeemedBookings = await prisma.booking.findFirst({
      where: {
        userId: decoded.id,
        spaceId: existingReview.space.id,
        isRedeemed: true
      }
    })

    if (!redeemedBookings) {
      return NextResponse.json({ 
        error: 'You must redeem a booking before writing a review' 
      }, { status: 403 })
    }

    // Update the review
    const review = await prisma.review.update({
      where: { id: id },
      data: {
        rating: parseInt(rating),
        comment: review_text,
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
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

    // Find the review and verify ownership
    const existingReview = await prisma.review.findFirst({
      where: {
        id: id,
        userId: decoded.id
      }
    })

    if (!existingReview) {
      return NextResponse.json({ 
        error: 'Review not found or you do not have permission to delete it' 
      }, { status: 404 })
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ 
      error: 'Failed to delete review',
      details: error.message 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
