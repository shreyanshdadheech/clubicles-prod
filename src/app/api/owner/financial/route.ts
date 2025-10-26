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

    // Get all bookings for this owner's spaces
    const bookings = await prisma.booking.findMany({
      where: {
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
          }
        },
        status: 'confirmed'
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

    // Calculate financial data
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0)
    const totalTaxDeducted = bookings.reduce((sum, booking) => sum + Number(booking.taxAmount || 0), 0)
    const totalOwnerPayout = bookings.reduce((sum, booking) => sum + Number(booking.ownerPayout), 0)
    const platformCommission = bookings.reduce((sum, booking) => sum + Number(booking.platformCommission || 0), 0)
    
    const netProfit = totalOwnerPayout
    const pendingPayout = totalOwnerPayout // For now, all payouts are pending
    const totalBookings = bookings.length

    // Get recent bookings (last 10)
    const recentBookings = bookings.slice(0, 10).map(booking => ({
      id: booking.id,
      space_name: booking.space.name,
      date: booking.date.toISOString().split('T')[0],
      start_time: booking.startTime,
      end_time: booking.endTime,
      base_amount: Number(booking.baseAmount),
      total_amount: Number(booking.totalAmount),
      tax_amount: Number(booking.taxAmount || 0),
      owner_payout: Number(booking.ownerPayout),
      status: booking.status
    }))

    // Mock tax breakdown (in a real app, this would come from tax calculations)
    const taxBreakdown = [
      {
        tax_id: 'gst',
        tax_name: 'GST (18%)',
        tax_percentage: 18,
        tax_amount: totalTaxDeducted * 0.6 // 60% of total tax is GST
      },
      {
        tax_id: 'platform_fee',
        tax_name: 'Platform Fee (10%)',
        tax_percentage: 10,
        tax_amount: platformCommission
      },
      {
        tax_id: 'service_tax',
        tax_name: 'Service Tax (5%)',
        tax_percentage: 5,
        tax_amount: totalTaxDeducted * 0.4 // 40% of total tax is service tax
      }
    ]

    const financialData = {
      id: spaceOwner.id,
      owner_id: spaceOwner.id,
      total_revenue: totalRevenue,
      total_tax_deducted: totalTaxDeducted,
      net_profit: netProfit,
      pending_payout: pendingPayout,
      total_bookings: totalBookings,
      recent_bookings: recentBookings,
      tax_breakdown: taxBreakdown,
      last_calculated: new Date().toISOString()
    }

    console.log('✅ Financial data calculated:', {
      totalRevenue,
      totalBookings,
      netProfit,
      recentBookingsCount: recentBookings.length
    })

    return NextResponse.json({
      success: true,
      data: financialData
    })

  } catch (error: any) {
    console.error('Error fetching financial data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial data', details: error.message },
      { status: 500 }
    )
  }
}