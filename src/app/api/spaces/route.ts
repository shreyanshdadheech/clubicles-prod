import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/spaces - Fetch all spaces for public listing (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Optional query parameters for filtering
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || []
    const search = searchParams.get('search')
    
    // Build where clause
    const where: any = {}
    
    if (city) {
      where.city = city
    }
    
    if (minPrice) {
      where.pricePerHour = {
        gte: parseFloat(minPrice)
      }
    }
    
    if (maxPrice) {
      where.pricePerHour = {
        lte: parseFloat(maxPrice)
      }
    }
    
    // Don't filter in Prisma when search exists - we'll filter client-side to include amenities
    // This is because Prisma can't search within JSON arrays efficiently
    
    // Note: MySQL JSON array operations are complex, so amenities filtering is done client-side
    // if (amenities.length > 0) {
    //   where.amenities = {
    //     hasSome: amenities  // Not supported in MySQL Prisma
    //   }
    // }

    // Get spaces with business info and reviews
    let spaces = await prisma.space.findMany({
      where,
      include: {
        businessInfo: {
          select: {
            businessName: true,
            businessCity: true
          }
        },
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

    // Apply search filter for ALL fields including amenities and city matching
    if (search) {
      const searchLower = search.toLowerCase()
      spaces = spaces.filter(space => {
        // Check database fields
        const matchesDatabaseFields = 
          space.name.toLowerCase().includes(searchLower) ||
          space.description.toLowerCase().includes(searchLower) ||
          space.address.toLowerCase().includes(searchLower) ||
          space.city.toLowerCase().includes(searchLower) ||
          space.pincode.toLowerCase().includes(searchLower) ||
          (space.companyName && space.companyName.toLowerCase().includes(searchLower))
        
        // Check amenities (JSON array)
        const amenities = Array.isArray(space.amenities) ? space.amenities : JSON.parse(space.amenities as any)
        const matchesAmenities = amenities.some((amenity: string) => 
          amenity.toLowerCase().includes(searchLower)
        )
        
        return matchesDatabaseFields || matchesAmenities
      })
    }
    
    // Also filter by city if provided (client-side for better matching)
    if (city) {
      const cityLower = city.toLowerCase()
      spaces = spaces.filter(space => 
        space.city.toLowerCase().includes(cityLower)
      )
    }

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
        owner_id: space.businessInfo?.businessName || 'Unknown',
        name: space.name,
        description: space.description,
        address: space.address,
        city: space.city,
        pincode: space.pincode,
        latitude: space.latitude,
        longitude: space.longitude,
        total_seats: space.totalSeats,
        available_seats: space.availableSeats,
        price_per_hour: Number(space.pricePerHour),
        price_per_day: Number(space.pricePerDay),
        amenities: space.amenities || [],
        images: space.images || [],
        status: 'approved', // All spaces are considered approved
        hygiene_rating: 4.5, // Default hygiene rating
        restroom_hygiene: 4.3, // Default restroom hygiene
        created_at: space.createdAt.toISOString(),
        updated_at: space.updatedAt.toISOString(),
        vibgyorCounts: {
          violet: space.violet || 0,
          indigo: space.indigo || 0,
          blue: space.blue || 0,
          green: space.green || 0,
          yellow: space.yellow || 0,
          orange: space.orange || 0,
          red: space.red || 0,
          grey: space.grey || 0,
          white: space.white || 0,
          black: space.black || 0,
        },
        rating: averageRating,
        total_reviews: totalReviews,
        business_name: space.businessInfo?.businessName || 'Business',
        company_name: space.companyName || space.businessInfo?.businessName || 'Business',
        contact_number: space.contactNumber || ''
      }
    })

    return NextResponse.json({ 
      success: true, 
      spaces: transformedSpaces,
      count: transformedSpaces.length
    })

  } catch (error) {
    console.error('Error fetching spaces:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}