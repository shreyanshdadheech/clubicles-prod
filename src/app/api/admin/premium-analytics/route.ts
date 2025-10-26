import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    // Get premium analytics data
    const [
      totalOwners,
      premiumOwners,
      basicOwners,
      premiumRevenue,
      basicRevenue,
      topEarningOwners,
      monthlyTaxTrend,
      subscriptionRenewals
    ] = await Promise.all([
      // Total space owners count
      prisma.spaceOwner.count(),
      
      // Premium owners count
      prisma.spaceOwner.count({
        where: { premiumPlan: 'premium' }
      }),
      
      // Basic owners count
      prisma.spaceOwner.count({
        where: { premiumPlan: 'basic' }
      }),
      
      // Premium owners revenue
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['confirmed', 'completed'] },
          space: {
            businessInfo: {
              spaceOwner: {
                premiumPlan: 'premium'
              }
            }
          }
        }
      }),
      
      // Basic owners revenue
      prisma.booking.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { in: ['confirmed', 'completed'] },
          space: {
            businessInfo: {
              spaceOwner: {
                premiumPlan: 'basic'
              }
            }
          }
        }
      }),
      
      // Top earning space owners
      prisma.spaceOwner.findMany({
        where: {
          businessInfo: {
            isNot: null
          }
        },
        include: {
          businessInfo: {
            include: {
              spaces: {
                include: {
                  bookings: {
                    where: {
                      status: { in: ['confirmed', 'completed'] }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Monthly tax collection trend (last 6 months)
      prisma.booking.groupBy({
        by: ['createdAt'],
        _sum: { taxAmount: true },
        _count: { id: true },
        where: {
          status: { in: ['confirmed', 'completed'] },
          createdAt: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'asc' }
      }),
      
      // Subscription renewals (expired in last 30 days)
      prisma.spaceOwner.findMany({
        where: {
          premiumPlan: 'premium',
          planExpiryDate: {
            lte: new Date(),
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })
    ])

    // Calculate revenue percentages
    const totalRevenue = Number(premiumRevenue._sum.totalAmount || 0) + Number(basicRevenue._sum.totalAmount || 0)
    const premiumRevenueShare = totalRevenue > 0 
      ? (Number(premiumRevenue._sum.totalAmount || 0) / totalRevenue) * 100 
      : 0

    // Process top earning owners
    const processedTopOwners = await Promise.all(topEarningOwners.map(async (owner) => {
      if (!owner.businessInfo) return null

      // Calculate total revenue for this owner
      const ownerRevenue = await prisma.booking.aggregate({
        _sum: { 
          totalAmount: true,
          taxAmount: true,
          ownerPayout: true
        },
        _count: { id: true },
        where: {
          space: {
            businessId: owner.businessInfo.id
          },
          status: { in: ['confirmed', 'completed'] }
        }
      })

      const totalAmount = Number(ownerRevenue._sum.totalAmount || 0)
      const taxAmount = Number(ownerRevenue._sum.taxAmount || 0)
      const netAmount = Number(ownerRevenue._sum.ownerPayout || 0)
      const bookingsCount = ownerRevenue._count.id

      return {
        id: owner.id,
        name: owner.businessInfo.businessName || `${owner.firstName} ${owner.lastName}`,
        plan: owner.premiumPlan,
        bookings: bookingsCount,
        totalRevenue: totalAmount,
        netRevenue: netAmount,
        taxAmount: taxAmount,
        spaces: owner.businessInfo.spaces.map(space => ({
          id: space.id,
          name: space.name,
          city: space.city
        }))
      }
    }))

    // Filter out null values and sort by revenue
    const sortedTopOwners = processedTopOwners
      .filter(owner => owner !== null)
      .sort((a, b) => b!.totalRevenue - a!.totalRevenue)
      .slice(0, 5)

    // Process monthly tax trend
    const monthlyTrend = monthlyTaxTrend.map(month => ({
      month: month.createdAt.toISOString().slice(0, 7), // YYYY-MM format
      bookings: month._count.id,
      taxAmount: Number(month._sum.taxAmount || 0)
    }))

    // Process subscription renewals
    const renewalData = subscriptionRenewals.map(owner => ({
      id: owner.id,
      name: `${owner.user.firstName} ${owner.user.lastName}`,
      email: owner.user.email,
      planExpiryDate: owner.planExpiryDate?.toISOString(),
      daysExpired: owner.planExpiryDate 
        ? Math.floor((Date.now() - owner.planExpiryDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    }))

    const analytics = {
      overview: {
        totalOwners,
        premiumOwners,
        basicOwners,
        premiumOwnersPercentage: totalOwners > 0 ? (premiumOwners / totalOwners) * 100 : 0,
        basicOwnersPercentage: totalOwners > 0 ? (basicOwners / totalOwners) * 100 : 0
      },
      revenue: {
        total: totalRevenue,
        premium: Number(premiumRevenue._sum.totalAmount || 0),
        basic: Number(basicRevenue._sum.totalAmount || 0),
        premiumShare: premiumRevenueShare,
        basicShare: 100 - premiumRevenueShare
      },
      topEarningOwners: sortedTopOwners,
      monthlyTaxTrend: monthlyTrend,
      subscriptionRenewals: {
        count: renewalData.length,
        data: renewalData
      }
    }

    return NextResponse.json({
      success: true,
      data: { analytics }
    })

  } catch (error: any) {
    console.error('Admin premium analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch premium analytics data', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { action, spaceOwnerId, data } = await request.json()

    switch (action) {
      case 'send_payment_reminder':
        // Send payment reminder to space owner
        // This would typically integrate with email service
        console.log(`Sending payment reminder to space owner: ${spaceOwnerId}`)
        return NextResponse.json({
          success: true,
          message: 'Payment reminder sent successfully'
        })

      case 'send_renewal_reminder':
        // Send renewal reminder to premium space owner
        console.log(`Sending renewal reminder to space owner: ${spaceOwnerId}`)
        return NextResponse.json({
          success: true,
          message: 'Renewal reminder sent successfully'
        })

      case 'update_premium_plan':
        // Update space owner's premium plan
        const { premiumPlan, planExpiryDate } = data
        const updatedOwner = await prisma.spaceOwner.update({
          where: { id: spaceOwnerId },
          data: {
            premiumPlan,
            planExpiryDate: planExpiryDate ? new Date(planExpiryDate) : null
          }
        })
        return NextResponse.json({
          success: true,
          data: { spaceOwner: updatedOwner },
          message: 'Premium plan updated successfully'
        })

      case 'extend_subscription':
        // Extend subscription for premium owner
        const { extensionDays } = data
        const currentExpiry = await prisma.spaceOwner.findUnique({
          where: { id: spaceOwnerId },
          select: { planExpiryDate: true }
        })
        
        const newExpiryDate = currentExpiry?.planExpiryDate 
          ? new Date(currentExpiry.planExpiryDate.getTime() + extensionDays * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000)

        const extendedOwner = await prisma.spaceOwner.update({
          where: { id: spaceOwnerId },
          data: { planExpiryDate: newExpiryDate }
        })

        return NextResponse.json({
          success: true,
          data: { spaceOwner: extendedOwner },
          message: `Subscription extended by ${extensionDays} days`
        })

      default:
        return NextResponse.json({
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Admin premium analytics action error:', error)
    return NextResponse.json(
      { error: 'Failed to process action', details: error.message },
      { status: 500 }
    )
  }
}
