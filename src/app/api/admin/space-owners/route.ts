import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.roles !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const onboarding = searchParams.get('onboarding') || 'all'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.approvalStatus = status
    }

    if (onboarding !== 'all') {
      where.onboardingCompleted = onboarding === 'completed'
    }

    // Get space owners with related data
    const spaceOwners = await prisma.spaceOwner.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            createdAt: true
          }
        },
        businessInfo: {
          include: {
            spaces: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        },
        paymentInfo: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate financial data for each space owner
    const transformedOwners = await Promise.all(spaceOwners.map(async (owner) => {
      // Get total revenue from bookings
      const revenueData = await prisma.booking.aggregate({
        _sum: { 
          totalAmount: true,
          platformCommission: true,
          ownerPayout: true,
          taxAmount: true
        },
        where: {
          space: {
            businessId: owner.businessInfo?.id
          },
          status: { in: ['confirmed', 'completed'] }
        }
      })

      // Get pending payout amount
      const businessBalance = await prisma.businessBalance.findUnique({
        where: { businessId: owner.businessInfo?.id || '' }
      })

      // Get total bookings count
      const bookingsCount = await prisma.booking.count({
        where: {
          space: {
            businessId: owner.businessInfo?.id
          },
          status: { in: ['confirmed', 'completed'] }
        }
      })

      return {
        id: owner.id,
        userId: owner.userId,
        email: owner.email,
        firstName: owner.firstName,
        lastName: owner.lastName,
        phone: owner.phone,
        premiumPlan: owner.premiumPlan,
        isActive: owner.isActive,
        onboardingCompleted: owner.onboardingCompleted,
        approvalStatus: owner.approvalStatus,
        commissionRate: Number(owner.commissionRate),
        premiumPaymentsEnabled: owner.premiumPaymentsEnabled,
        planExpiryDate: owner.planExpiryDate?.toISOString(),
        createdAt: owner.createdAt.toISOString(),
        updatedAt: owner.updatedAt.toISOString(),
        businessInfo: owner.businessInfo,
        paymentInfo: owner.paymentInfo,
        spaces: owner.businessInfo?.spaces || [],
        spacesCount: owner.businessInfo?.spaces?.length || 0,
        totalRevenue: Number(revenueData._sum.totalAmount || 0),
        platformCommission: Number(revenueData._sum.platformCommission || 0),
        totalTax: Number(revenueData._sum.taxAmount || 0),
        ownerPayout: Number(revenueData._sum.ownerPayout || 0),
        pendingPayout: Number(businessBalance?.pendingAmount || 0),
        currentBalance: Number(businessBalance?.currentBalance || 0),
        totalWithdrawn: Number(businessBalance?.totalWithdrawn || 0),
        totalBookings: bookingsCount
      }
    }))

    return NextResponse.json({
      success: true,
      data: { spaceOwners: transformedOwners }
    })

  } catch (error: any) {
    console.error('Admin space owners error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch space owners data', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || decoded.roles !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { spaceOwnerId, approvalStatus, onboardingCompleted, rejectionReason } = await request.json()

    if (!spaceOwnerId) {
      return NextResponse.json({ error: 'Space owner ID is required' }, { status: 400 })
    }

    // Update space owner
    const updatedOwner = await prisma.spaceOwner.update({
      where: { id: spaceOwnerId },
      data: {
        ...(approvalStatus && { approvalStatus }),
        ...(onboardingCompleted !== undefined && { onboardingCompleted }),
        ...(rejectionReason && { 
          businessInfo: {
            update: {
              rejectionReason
            }
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true
          }
        },
        businessInfo: {
          include: {
            spaces: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        },
        paymentInfo: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { spaceOwner: updatedOwner }
    })

  } catch (error: any) {
    console.error('Admin space owner update error:', error)
    return NextResponse.json(
      { error: 'Failed to update space owner', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
