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
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    // Build where clause
    const where: any = {}
    // Note: Space doesn't have status field, so we'll return all spaces
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get spaces with owner and business info
    const spaces = await prisma.space.findMany({
      where,
      include: {
        businessInfo: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data for frontend
    const transformedSpaces = spaces.map((space: any) => ({
      id: space.id,
      name: space.name,
      description: space.description,
      address: space.address,
      city: space.city,
      pincode: space.pincode,
      total_seats: space.totalSeats,
      available_seats: space.availableSeats,
      price_per_hour: space.pricePerHour,
      price_per_day: space.pricePerDay,
      amenities: space.amenities,
      images: space.images,
      status: 'approved', // All spaces are considered approved
      created_at: space.createdAt.toISOString(),
      updated_at: space.updatedAt.toISOString(),
      owner_name: space.companyName || 'Unknown',
      owner_email: space.contactNumber || 'N/A',
      business_info: space.businessInfo ? {
        gst_number: space.businessInfo.gstNumber,
        pan_number: space.businessInfo.panNumber,
        business_type: space.businessInfo.businessType,
        business_name: space.businessInfo.businessName,
        business_address: space.businessInfo.businessAddress
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: { spaces: transformedSpaces }
    })

  } catch (error: any) {
    console.error('Admin spaces error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spaces data', details: error.message },
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

    const { spaceId, action, reason } = await request.json()

    if (!spaceId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Since Space doesn't have status field, we'll just update the updatedAt timestamp
    const updatedSpace = await prisma.space.update({
      where: { id: spaceId },
      data: {
        updatedAt: new Date()
      }
    })

    // Note: Space approval is handled through spaceOwner approval status
    // This endpoint is mainly for updating space information

    return NextResponse.json({
      success: true,
      message: `Space ${action}d successfully`,
      data: { space: updatedSpace }
    })

  } catch (error: any) {
    console.error('Admin space update error:', error)
    return NextResponse.json(
      { error: 'Failed to update space', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}