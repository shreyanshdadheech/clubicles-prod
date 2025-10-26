import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    const { spaceOwnerId, amount, paymentMethod, transactionId, notes } = await request.json()

    if (!spaceOwnerId || !amount || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Space owner ID, amount, and payment method are required' 
      }, { status: 400 })
    }

    // Get space owner and their business balance
    const spaceOwner = await prisma.spaceOwner.findUnique({
      where: { id: spaceOwnerId },
      include: {
        businessInfo: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 })
    }

    if (!spaceOwner.businessInfo) {
      return NextResponse.json({ error: 'Business information not found' }, { status: 400 })
    }

    // Check if there's enough balance
    const businessBalance = await prisma.businessBalance.findUnique({
      where: { businessId: spaceOwner.businessInfo.id }
    })

    if (!businessBalance) {
      return NextResponse.json({ error: 'Business balance not found' }, { status: 400 })
    }

    const availableBalance = Number(businessBalance.pendingAmount)
    if (amount > availableBalance) {
      return NextResponse.json({ 
        error: `Insufficient balance. Available: ₹${availableBalance.toLocaleString()}` 
      }, { status: 400 })
    }

    // Create payout record
    const payout = await prisma.spaceOwnerPayout.create({
      data: {
        spaceOwnerId: spaceOwnerId,
        amount: amount,
        paymentMethod: paymentMethod,
        transactionId: transactionId || `PAYOUT_${Date.now()}`,
        status: 'completed',
        processedBy: decoded.id,
        notes: notes || `Payout processed by admin`,
        processedAt: new Date()
      }
    })

    // Update business balance
    await prisma.businessBalance.update({
      where: { businessId: spaceOwner.businessInfo.id },
      data: {
        currentBalance: amount,
        pendingAmount: {
          decrement: amount
        },
        totalWithdrawn: {
          increment: amount
        },
        lastPayoutDate: new Date()
      }
    })

    // Send payout notification email
    try {
      const emailResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/email/payout-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: `${spaceOwner.firstName || ''} ${spaceOwner.lastName || ''}`.trim() || spaceOwner.email,
          ownerEmail: spaceOwner.email,
          payoutAmount: amount,
          payoutMethod: paymentMethod,
          transactionId: payout.id,
          notes: notes
        })
      })

      if (emailResponse.ok) {
        console.log('✅ Payout notification email sent')
      } else {
        console.log('⚠️ Failed to send payout notification email')
      }
    } catch (emailError) {
      console.error('❌ Error sending payout notification email:', emailError)
      // Don't fail the payout if email fails
    }

    return NextResponse.json({
      success: true,
      data: { payout },
      message: 'Payout processed successfully'
    })

  } catch (error: any) {
    console.error('Admin payout error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: 'Failed to process payout', 
        details: error.message,
        type: error.name
      },
      { status: 500 }
    )
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

    const { searchParams } = new URL(request.url)
    const spaceOwnerId = searchParams.get('spaceOwnerId')

    // Get payouts
    const payouts = await prisma.spaceOwnerPayout.findMany({
      where: spaceOwnerId ? { spaceOwnerId } : {},
      include: {
        spaceOwner: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: { payouts }
    })

  } catch (error: any) {
    console.error('Admin payouts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts', details: error.message },
      { status: 500 }
    )
  }
}
