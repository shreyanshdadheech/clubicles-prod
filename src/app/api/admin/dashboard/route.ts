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

    // Get dashboard statistics
    const [
      totalSpaces,
      totalUsers,
      individualUsers,
      spaceOwners,
      pendingVerifications,
      totalBookings,
      totalRevenue,
      totalPlatformRevenue
    ] = await Promise.all([
      prisma.space.count(),
      prisma.user.count(),
      prisma.user.count({ where: { roles: 'user' } }),
      prisma.user.count({ where: { roles: 'owner' } }),
      prisma.spaceOwner.count({ where: { approvalStatus: 'pending' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['confirmed', 'completed'] } }
      }),
      prisma.booking.aggregate({
        _sum: { platformCommission: true },
        where: { status: { in: ['confirmed', 'completed'] } }
      })
    ])

    const stats = {
      total_spaces: totalSpaces,
      pending_spaces: 0, // Space doesn't have status field
      approved_spaces: totalSpaces, // All spaces are considered approved
      rejected_spaces: 0, // Space doesn't have status field
      total_users: totalUsers,
      individual_users: individualUsers,
      space_owners: spaceOwners,
      pending_verifications: pendingVerifications,
      total_bookings: totalBookings,
      total_revenue: Number(totalRevenue._sum.totalAmount || 0),
      platform_revenue: Number(totalPlatformRevenue._sum.platformCommission || 0),
      monthly_growth: 18.5 // This would need to be calculated based on historical data
    }

    return NextResponse.json({
      success: true,
      data: { stats }
    })

  } catch (error: any) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
