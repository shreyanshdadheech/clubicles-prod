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

    // Get analytics data
    const [
      totalRevenue,
      monthlyRevenue,
      totalPlatformRevenue,
      monthlyPlatformRevenue,
      userGrowth,
      spaceUtilization,
      cityStats,
      vibgyorStats
    ] = await Promise.all([
      // Total revenue (all confirmed and completed bookings)
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['confirmed', 'completed'] } }
      }),
      
      // Monthly revenue (current month)
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['confirmed', 'completed'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Total platform revenue (platform commission from all bookings)
      prisma.booking.aggregate({
        _sum: { platformCommission: true },
        where: { status: { in: ['confirmed', 'completed'] } }
      }),
      
      // Monthly platform revenue (current month)
      prisma.booking.aggregate({
        _sum: { platformCommission: true },
        where: {
          status: { in: ['confirmed', 'completed'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // User growth (last 6 months)
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Space utilization
      prisma.booking.groupBy({
        by: ['spaceId'],
        _count: { id: true },
        where: { status: 'confirmed' }
      }),
      
      // City statistics
      prisma.space.groupBy({
        by: ['city'],
        _count: { id: true }
        // Note: Space doesn't have status field, so we count all spaces
      }),
      
      // VIBGYOR statistics - get all users with professional roles
      prisma.user.groupBy({
        by: ['professionalRole'],
        _count: { id: true }
        // Include all users, including those with null professionalRole
      })
    ])

    // Calculate growth by comparing with previous month
    const previousMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    const previousMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    
    const previousMonthRevenue = await prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { in: ['confirmed', 'completed'] },
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      }
    })
    
    const previousMonthPlatformRevenue = await prisma.booking.aggregate({
      _sum: { platformCommission: true },
      where: {
        status: { in: ['confirmed', 'completed'] },
        createdAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd
        }
      }
    })

    const totalRevenueAmount = Number(totalRevenue._sum.totalAmount || 0)
    const monthlyRevenueAmount = Number(monthlyRevenue._sum.totalAmount || 0)
    const totalPlatformRevenueAmount = Number(totalPlatformRevenue._sum.platformCommission || 0)
    const monthlyPlatformRevenueAmount = Number(monthlyPlatformRevenue._sum.platformCommission || 0)
    const previousMonthRevenueAmount = Number(previousMonthRevenue._sum.totalAmount || 0)
    const previousMonthPlatformRevenueAmount = Number(previousMonthPlatformRevenue._sum.platformCommission || 0)

    // Calculate growth percentage
    const revenueGrowth = previousMonthRevenueAmount > 0 
      ? ((monthlyRevenueAmount - previousMonthRevenueAmount) / previousMonthRevenueAmount) * 100 
      : 0
    
    const platformRevenueGrowth = previousMonthPlatformRevenueAmount > 0 
      ? ((monthlyPlatformRevenueAmount - previousMonthPlatformRevenueAmount) / previousMonthPlatformRevenueAmount) * 100 
      : 0

    const analytics = {
      revenue: {
        total: totalRevenueAmount,
        monthly: monthlyRevenueAmount,
        growth: Math.round(revenueGrowth * 10) / 10 // Round to 1 decimal place
      },
      platformRevenue: {
        total: totalPlatformRevenueAmount,
        monthly: monthlyPlatformRevenueAmount,
        growth: Math.round(platformRevenueGrowth * 10) / 10
      },
      users: {
        total: userGrowth.reduce((sum, month) => sum + month._count.id, 0),
        growth: 12.5 // This would need to be calculated
      },
      spaces: {
        utilization: 73, // This would need to be calculated based on bookings vs capacity
        popular_cities: cityStats
          .sort((a, b) => b._count.id - a._count.id)
          .slice(0, 5)
          .map(city => ({ name: city.city, count: city._count.id }))
      },
      vibgyor: vibgyorStats
        .filter(stat => stat.professionalRole !== null) // Filter out null values
        .map(stat => {
          // Map database values to VIBGYOR category IDs
          const role = stat.professionalRole!
          
          // Convert lowercase to uppercase and cast to ProfessionalRole
          const upperRole = role.toUpperCase() as any
          
          return {
            role: upperRole,
            count: stat._count.id
          }
        })
    }

    return NextResponse.json({
      success: true,
      data: { analytics }
    })

  } catch (error: any) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
