import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

// GET /api/owner/spaces - Fetch spaces for the authenticated space owner
export async function GET(request: NextRequest) {
  try {
    const { user, dbUser } = await getServerUser(request)
    
    if (!user || !dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has owner role
    if (dbUser.roles !== 'owner') {
      return NextResponse.json({ error: 'Access denied. Owner role required.' }, { status: 403 })
    }

    // Get the space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: {
        userId: dbUser.id
      }
    })

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 })
    }

    // Get business info to find spaces
    const businessInfo = await prisma.spaceOwnerBusinessInfo.findFirst({
      where: {
        spaceOwnerId: spaceOwner.id
      }
    })

    if (!businessInfo) {
      return NextResponse.json({ error: 'Business info not found' }, { status: 404 })
    }

    // Get spaces for this owner
    const spaces = await prisma.space.findMany({
      where: {
        businessId: businessInfo.id
      },
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform spaces data for frontend
    const transformedSpaces = spaces.map(space => {
      // Calculate average rating
      let averageRating = 0
      let totalReviews = 0
      
      if (space.reviews && space.reviews.length > 0) {
        const total = space.reviews.reduce((sum, r) => sum + (r.rating || 0), 0)
        averageRating = Math.round((total / space.reviews.length) * 10) / 10
        totalReviews = space.reviews.length
      }

      return {
        id: space.id,
        name: space.name,
        description: space.description,
        category: 'office', // Default category since it's not in the schema
        location: space.city,
        status: 'active', // Default status since it's not in the schema
        total_seats: space.totalSeats,
        available_seats: space.availableSeats,
        hourly_rate: space.pricePerHour,
        daily_rate: space.pricePerDay,
        images: space.images || [],
        full_address: space.address,
        company_name: space.companyName,
        contact_number: space.contactNumber,
        pincode: space.pincode,
        latitude: space.latitude,
        longitude: space.longitude,
        amenities: space.amenities || [],
        created_at: space.createdAt,
        updated_at: space.updatedAt,
        business_name: businessInfo.businessName,
        business_city: businessInfo.businessCity,
        rating: averageRating,
        total_reviews: totalReviews
      }
    })

    return NextResponse.json({
      success: true,
      spaces: transformedSpaces
    })

  } catch (error) {
    console.error('Error fetching owner spaces:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/owner/spaces - Create a new space
export async function POST(request: NextRequest) {
  try {
    const { user, dbUser } = await getServerUser(request)
    
    if (!user || !dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has owner role
    if (dbUser.roles !== 'owner') {
      return NextResponse.json({ error: 'Access denied. Owner role required.' }, { status: 403 })
    }

    const body = await request.json()

    // Get the space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: {
        userId: dbUser.id
      }
    })

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 })
    }

    // Get business info for this owner
    const businessInfo = await prisma.spaceOwnerBusinessInfo.findFirst({
      where: {
        spaceOwnerId: spaceOwner.id
      }
    })

    if (!businessInfo) {
      return NextResponse.json({ error: 'Business info not found. Please complete your business profile first.' }, { status: 400 })
    }

    // Create the space
    const newSpace = await prisma.space.create({
      data: {
        name: body.name,
        description: body.description,
        businessId: businessInfo.id,
        address: body.full_address || body.address || 'Address not provided',
        city: body.location || body.city || 'City not provided',
        pincode: body.pincode,
        totalSeats: parseInt(body.total_seats) || 1,
        availableSeats: parseInt(body.total_seats) || 1,
        pricePerHour: parseFloat(body.price_per_hour || body.hourly_rate) || 0,
        pricePerDay: parseFloat(body.price_per_day || body.daily_rate) || 0,
        images: body.images || [],
        companyName: body.company_name || businessInfo.businessName,
        contactNumber: body.contact_number,
        latitude: parseFloat(body.latitude) || 0,
        longitude: parseFloat(body.longitude) || 0,
        amenities: body.amenities || []
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Space created successfully',
      space: {
        id: newSpace.id,
        name: newSpace.name,
        description: newSpace.description,
        category: 'office', // Default category since it's not in the schema
        location: newSpace.city,
        status: 'active', // Default status since it's not in the schema
        total_seats: newSpace.totalSeats,
        available_seats: newSpace.availableSeats,
        hourly_rate: newSpace.pricePerHour,
        daily_rate: newSpace.pricePerDay,
        images: newSpace.images,
        full_address: newSpace.address,
        company_name: newSpace.companyName,
        contact_number: newSpace.contactNumber,
        pincode: newSpace.pincode,
        latitude: newSpace.latitude,
        longitude: newSpace.longitude,
        amenities: newSpace.amenities,
        created_at: newSpace.createdAt,
        updated_at: newSpace.updatedAt
      }
    })

  } catch (error) {
    console.error('Error creating space:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}