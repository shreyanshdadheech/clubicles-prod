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

    // Build where clause for space owners
    const where: any = {
      roles: 'owner'
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get space owners with their business info and payout data
    const spaceOwners = await prisma.user.findMany({
      where,
      include: {
        spaceOwner: {
          include: {
            businessInfo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate payout data for each space owner
    const transformedUsers = spaceOwners.map((user: any) => {
      // Since we can't get spaces directly, we'll use placeholder values
      const totalRevenue = 0 // Would need to calculate from bookings table
      const platformCommission = 0
      const pendingPayout = 0

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        city: user.city,
        roles: user.roles,
        isActive: user.isActive,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
        business_info: user.spaceOwner?.businessInfo ? {
          business_name: user.spaceOwner.businessInfo.businessName,
          business_type: user.spaceOwner.businessInfo.businessType,
          gst_number: user.spaceOwner.businessInfo.gstNumber,
          pan_number: user.spaceOwner.businessInfo.panNumber,
          business_address: user.spaceOwner.businessInfo.businessAddress
        } : null,
        approval_status: user.spaceOwner?.approvalStatus || 'pending',
        total_revenue: totalRevenue,
        platform_commission: platformCommission,
        pending_payout: pendingPayout,
        spaces_count: 0, // Would need to count from spaces table
        total_bookings: 0 // Would need to count from bookings table
      }
    })

    // Filter by status if specified
    let filteredUsers = transformedUsers
    if (status !== 'all') {
      filteredUsers = transformedUsers.filter((user: any) => user.approval_status === status)
    }

    return NextResponse.json({
      success: true,
      data: { users: filteredUsers }
    })

  } catch (error: any) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users data', details: error.message },
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

    const { userId, action, reason } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update space owner approval status
    const updatedSpaceOwner = await prisma.spaceOwner.update({
      where: { userId },
      data: {
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Space owner ${action}d successfully`,
      data: { spaceOwner: updatedSpaceOwner }
    })

  } catch (error: any) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}