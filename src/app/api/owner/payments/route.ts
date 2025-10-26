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

    // Get payment history
    const paymentHistory = await prisma.spaceOwnerPaymentHistory.findMany({
      where: { spaceOwnerId: spaceOwner.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 payments
    })

    // Get business balance
    const businessBalance = await prisma.businessBalance.findFirst({
      where: { businessId: spaceOwner.id }
    })

    // Get subscription info
    const subscription = await prisma.spaceOwnerSubscription.findFirst({
      where: { spaceOwnerId: spaceOwner.id }
    })

    // Calculate payment statistics
    const totalPayments = paymentHistory.length
    const successfulPayments = paymentHistory.filter(p => p.status === 'completed').length
    const failedPayments = paymentHistory.filter(p => p.status === 'failed').length
    const totalAmountPaid = paymentHistory
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0)

    // Get recent payments (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentPayments = paymentHistory.filter(p => 
      p.createdAt >= thirtyDaysAgo && p.status === 'completed'
    )
    const recentAmount = recentPayments.reduce((sum, p) => sum + Number(p.amount), 0)

    // Get monthly revenue from spaces
    const spaces = await prisma.space.findMany({
      where: { businessId: spaceOwner.id },
      select: { revenue: true, totalBookings: true }
    })

    const totalSpaceRevenue = spaces.reduce((sum, space) => sum + Number(space.revenue), 0)
    const totalBookings = spaces.reduce((sum, space) => sum + space.totalBookings, 0)

    const response = {
      success: true,
      data: {
        owner: {
          id: spaceOwner.id,
          email: spaceOwner.email,
          premiumPlan: spaceOwner.premiumPlan,
          planExpiryDate: spaceOwner.planExpiryDate
        },
        subscription: subscription ? {
          id: subscription.id,
          planName: subscription.planName,
          billingCycle: subscription.billingCycle,
          status: subscription.status,
          startDate: subscription.startDate,
          expiryDate: subscription.expiryDate,
          autoRenew: subscription.autoRenew
        } : null,
        balance: businessBalance ? {
          currentBalance: Number(businessBalance.currentBalance),
          totalEarned: Number(businessBalance.totalEarned),
          totalWithdrawn: Number(businessBalance.totalWithdrawn),
          pendingAmount: Number(businessBalance.pendingAmount),
          commissionDeducted: Number(businessBalance.commissionDeducted),
          taxDeducted: Number(businessBalance.taxDeducted),
          lastPayoutDate: businessBalance.lastPayoutDate
        } : {
          currentBalance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          pendingAmount: 0,
          commissionDeducted: 0,
          taxDeducted: 0,
          lastPayoutDate: null
        },
        payments: {
          history: paymentHistory.map(payment => ({
            id: payment.id,
            amount: Number(payment.amount),
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            description: payment.description,
            paymentDate: payment.paymentDate,
            createdAt: payment.createdAt
          })),
          statistics: {
            total: totalPayments,
            successful: successfulPayments,
            failed: failedPayments,
            totalAmountPaid: totalAmountPaid,
            recentAmount: recentAmount,
            successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0
          }
        },
        revenue: {
          totalSpaceRevenue: totalSpaceRevenue,
          totalBookings: totalBookings,
          averageBookingValue: totalBookings > 0 ? totalSpaceRevenue / totalBookings : 0
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Payments API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Unable to fetch payment information'
      },
      { status: 500 }
    )
  }
}

// POST method to update payment settings
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { action, data } = body

    // Get the space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: { userId: decoded.id }
    })

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 })
    }

    if (action === 'update_payment_info') {
      const { bankAccountNumber, bankIfscCode, bankAccountHolderName, bankName, upiId } = data

      const paymentInfo = await prisma.spaceOwnerPaymentInfo.upsert({
        where: { spaceOwnerId: spaceOwner.id },
        update: {
          bankAccountNumber,
          bankIfscCode,
          bankAccountHolderName,
          bankName,
          upiId
        },
        create: {
          spaceOwnerId: spaceOwner.id,
          bankAccountNumber,
          bankIfscCode,
          bankAccountHolderName,
          bankName,
          upiId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment information updated successfully',
        data: paymentInfo
      })
    }

    if (action === 'request_payout') {
      const { amount } = data

      if (!amount || amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid payout amount' },
          { status: 400 }
        )
      }

      // Check if owner has sufficient balance
      const businessBalance = await prisma.businessBalance.findFirst({
        where: { businessId: spaceOwner.id }
      })

      if (!businessBalance || Number(businessBalance.currentBalance) < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance for payout' },
          { status: 400 }
        )
      }

      // Update balance (in real implementation, this would create a payout request)
      await prisma.businessBalance.update({
        where: { businessId: spaceOwner.id },
        data: {
          currentBalance: {
            decrement: amount
          },
          totalWithdrawn: {
            increment: amount
          },
          lastPayoutDate: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payout request submitted successfully',
        data: { amount, requestedAt: new Date() }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Payments API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Unable to process payment request'
      },
      { status: 500 }
    )
  }
}
