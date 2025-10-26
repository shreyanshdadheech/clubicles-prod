import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: { userId: decoded.id }
    })

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 })
    }

    // Get business balance
    const businessInfo = await prisma.spaceOwnerBusinessInfo.findFirst({
      where: { spaceOwnerId: spaceOwner.id }
    })
    
    const businessBalance = businessInfo ? await prisma.businessBalance.findFirst({
      where: { businessId: businessInfo.id }
    }) : null

    // Get all bookings for this owner's spaces
    const bookings = await prisma.booking.findMany({
      where: {
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
          }
        },
        status: { in: ['confirmed', 'completed'] }
      },
      include: {
        space: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate analytics data
    const completedBookings = bookings.filter((booking: any) => booking.status === 'completed')
    const totalRevenue = completedBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0)
    const totalBookings = bookings.length
    
    // Calculate total tax collected
    const totalTaxCollected = completedBookings.reduce((sum: number, booking: any) => sum + Number(booking.taxAmount || 0), 0)
    
    // Calculate total platform commission
    const totalPlatformCommission = completedBookings.reduce((sum: number, booking: any) => sum + Number(booking.platformCommission || 0), 0)
    
    // Check if there are any payouts
    const payouts = businessInfo ? await prisma.payout.findMany({
      where: { businessId: businessInfo.id },
      select: { amount: true, status: true }
    }) : []
    
    const totalPayouts = payouts
      .filter((payout: any) => payout.status === 'completed')
      .reduce((sum: number, payout: any) => sum + Number(payout.amount), 0)
    
    // Calculate current balance
    let currentBalance = Number(businessBalance?.currentBalance || 0)
    
    // If no payouts have been made, show revenue minus tax as balance
    if (totalPayouts === 0 && totalRevenue > 0) {
      currentBalance = totalRevenue - totalTaxCollected - totalPlatformCommission
    }
    
    // Calculate monthly revenue for last 6 months
    const monthlyRevenue = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthBookings = completedBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date)
        return bookingDate >= monthStart && bookingDate <= monthEnd
      })
      
      const monthRevenue = monthBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0)
      monthlyRevenue.push(monthRevenue)
    }

    // Calculate booking patterns (last 7 days)
    const bookingPatterns = []
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(dayStart.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayBookings = bookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date)
        return bookingDate >= dayStart && bookingDate <= dayEnd
      })
      
      bookingPatterns.push({
        day: days[dayStart.getDay()],
        bookings: dayBookings.length
      })
    }

    const maxBookingsInWeek = Math.max(...bookingPatterns.map(p => p.bookings))

    // Calculate occupancy rate (based on actual bookings vs capacity)
    const spaces = await prisma.space.findMany({
      where: {
        businessInfo: {
          spaceOwnerId: spaceOwner.id
        }
      },
      select: {
        id: true,
        totalSeats: true
      }
    })

    const totalCapacity = spaces.reduce((sum: number, space: any) => sum + space.totalSeats, 0)
    const totalSeatsBooked = bookings.reduce((sum: number, booking: any) => sum + booking.seatsBooked, 0)
    
    const occupancyRate = totalCapacity > 0 ? Math.min(100, (totalSeatsBooked / totalCapacity) * 100) : 0

    // Calculate average booking duration
    const avgDuration = bookings.length > 0 
      ? bookings.reduce((sum: number, booking: any) => {
          const start = new Date(`2000-01-01 ${booking.startTime}`)
          const end = new Date(`2000-01-01 ${booking.endTime}`)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
        }, 0) / bookings.length
      : 0

    // Calculate peak hours
    const hourCounts: { [key: string]: number } = {}
    bookings.forEach((booking: any) => {
      const hour = booking.startTime.split(':')[0]
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    
    const peakHour = Object.keys(hourCounts).length > 0 
      ? Object.keys(hourCounts).reduce((a, b) => 
          hourCounts[a] > hourCounts[b] ? a : b
        )
      : '9'

    // Calculate recent trends
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    const lastMonthBookings = completedBookings.filter((booking: any) => {
      const bookingDate = new Date(booking.date)
      return bookingDate >= lastMonth && bookingDate <= lastMonthEnd
    })
    
    const lastMonthRevenue = lastMonthBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0)
    const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    // Get VIBGYOR analytics for redeemed bookings only
    const vibgyorSpaces = await prisma.space.findMany({
      where: {
        businessInfo: {
          spaceOwnerId: spaceOwner.id
        }
      },
      select: {
        id: true,
        name: true,
        violet: true,
        indigo: true,
        blue: true,
        green: true,
        yellow: true,
        orange: true,
        red: true,
        grey: true,
        white: true,
        black: true
      }
    })

    // Calculate total VIBGYOR counts across all spaces (only redeemed bookings)
    const vibgyorAnalytics = vibgyorSpaces.reduce((totals: any, space: any) => {
      return {
        violet: (totals.violet || 0) + (space.violet || 0),
        indigo: (totals.indigo || 0) + (space.indigo || 0),
        blue: (totals.blue || 0) + (space.blue || 0),
        green: (totals.green || 0) + (space.green || 0),
        yellow: (totals.yellow || 0) + (space.yellow || 0),
        orange: (totals.orange || 0) + (space.orange || 0),
        red: (totals.red || 0) + (space.red || 0),
        grey: (totals.grey || 0) + (space.grey || 0),
        white: (totals.white || 0) + (space.white || 0),
        black: (totals.black || 0) + (space.black || 0)
      }
    }, {})

    // Calculate total redeemed bookings
    const totalRedeemedBookings = Object.values(vibgyorAnalytics).reduce((sum: number, count: any) => sum + (count || 0), 0)

    // Calculate VIBGYOR percentages (only show if there are redeemed bookings)
    const vibgyorPercentages = totalRedeemedBookings > 0 ? {
      violet: Math.round(((vibgyorAnalytics.violet || 0) / totalRedeemedBookings) * 100),
      indigo: Math.round(((vibgyorAnalytics.indigo || 0) / totalRedeemedBookings) * 100),
      blue: Math.round(((vibgyorAnalytics.blue || 0) / totalRedeemedBookings) * 100),
      green: Math.round(((vibgyorAnalytics.green || 0) / totalRedeemedBookings) * 100),
      yellow: Math.round(((vibgyorAnalytics.yellow || 0) / totalRedeemedBookings) * 100),
      orange: Math.round(((vibgyorAnalytics.orange || 0) / totalRedeemedBookings) * 100),
      red: Math.round(((vibgyorAnalytics.red || 0) / totalRedeemedBookings) * 100),
      grey: Math.round(((vibgyorAnalytics.grey || 0) / totalRedeemedBookings) * 100),
      white: Math.round(((vibgyorAnalytics.white || 0) / totalRedeemedBookings) * 100),
      black: Math.round(((vibgyorAnalytics.black || 0) / totalRedeemedBookings) * 100)
    } : {}

    // Find dominant professional type (only from redeemed bookings)
    const dominantType = totalRedeemedBookings > 0 ? Object.keys(vibgyorAnalytics).reduce((a, b) => 
      (vibgyorAnalytics[a] || 0) > (vibgyorAnalytics[b] || 0) ? a : b
    ) : null

    const analyticsData = {
      monthlyRevenue,
      bookingTrends: bookingPatterns,
      customerSatisfaction: 4.2, // Mock data for now
      occupancyRate: Math.round(occupancyRate),
      averageBookingDuration: Math.round(avgDuration * 10) / 10,
      peakHours: {
        start: `${peakHour}:00`,
        end: `${parseInt(peakHour) + 2}:00`
      },
      totalRevenue,
      totalTaxCollected,
      totalPlatformCommission,
      totalPayouts,
      totalBookings,
      currentBalance,
      recentTrends: {
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        bookingGrowth: 0 // Can be calculated similarly
      },
      maxBookingsInWeek,
      // VIBGYOR Analytics (only redeemed bookings)
      vibgyorAnalytics: {
        counts: vibgyorAnalytics,
        percentages: vibgyorPercentages,
        totalRedeemedBookings,
        dominantType,
        hasRedeemedBookings: totalRedeemedBookings > 0
      }
    }

    console.log('✅ Analytics data calculated:', {
      totalRevenue,
      totalTaxCollected,
      totalPlatformCommission,
      totalPayouts,
      currentBalance,
      totalBookings,
      completedBookings: completedBookings.length,
      occupancyRate: Math.round(occupancyRate),
      totalCapacity,
      totalSeatsBooked,
      spacesCount: spaces.length,
      monthlyRevenue
    })

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error: any) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error.message },
      { status: 500 }
    )
  }
}