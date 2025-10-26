import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

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

    const { userId, amount, paymentMethod, notes } = await request.json()

    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        businessId: userId, // Using businessId instead of userId
        amount: parseFloat(amount),
        payoutMethod: paymentMethod, // Using payoutMethod instead of paymentMethod
        status: 'completed',
        processedBy: decoded.id,
        processedAt: new Date()
      }
    })

    // Update space owner's last payout info (if these fields exist in the model)
    // Note: These fields might not exist in the current schema
    // await prisma.spaceOwner.update({
    //   where: { userId },
    //   data: {
    //     lastPayoutDate: new Date(),
    //     lastPayoutAmount: parseFloat(amount)
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Payout processed successfully',
      data: { payout }
    })

  } catch (error: any) {
    console.error('Payout processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process payout', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

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

    // Get all payouts
    const payouts = await prisma.payout.findMany({
      include: {
        businessInfo: {
          select: {
            businessName: true,
            businessType: true
          }
        }
      },
      orderBy: { processedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: { payouts }
    })

  } catch (error: any) {
    console.error('Payouts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
