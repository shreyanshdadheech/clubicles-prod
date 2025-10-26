import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search-suggestions - Get search suggestions based on real data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    
    if (query.length < 2) {
      return NextResponse.json({ success: true, suggestions: [] })
    }

    // Search spaces for suggestions
    const spaces = await prisma.space.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { address: { contains: query } },
          { city: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        amenities: true
      },
      take: 10 // Limit to 10 suggestions
    })


    // Search business info for suggestions
    const businessInfo = await prisma.spaceOwnerBusinessInfo.findMany({
      where: {
        OR: [
          { businessName: { contains: query } },
          { businessCity: { contains: query } },
          { businessType: { contains: query } }
        ]
      },
      select: {
        businessName: true,
        businessCity: true,
        businessType: true
      },
      take: 5 // Limit to 5 business suggestions
    })

    // Transform spaces into suggestions
    const spaceSuggestions = spaces.map(space => ({
      type: 'space',
      value: space.name,
      category: 'Workspace',
      location: `${space.city}, India`
    }))

    // Transform business info into suggestions
    const businessSuggestions = businessInfo.map(business => ({
      type: 'business',
      value: business.businessName,
      category: business.businessType,
      location: `${business.businessCity}, India`
    }))

    // Create city suggestions based on spaces
    const citySuggestions = spaces
      .map(space => space.city)
      .filter((city, index, self) => self.indexOf(city) === index) // Remove duplicates
      .slice(0, 5)
      .map(city => ({
        type: 'city',
        value: city,
        category: 'Location',
        location: `${city}, India`
      }))

    // Create amenity suggestions
    const amenitySuggestions = spaces
      .flatMap(space => space.amenities || [])
      .filter((amenity, index, self) => typeof amenity === 'string' && self.indexOf(amenity) === index) // Remove duplicates and ensure strings
      .filter(amenity => typeof amenity === 'string' && amenity.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(amenity => ({
        type: 'amenity',
        value: amenity as string,
        category: 'Amenity',
        location: 'Available'
      }))

    // Combine all suggestions
    const suggestions = [
      ...spaceSuggestions,
      ...businessSuggestions,
      ...citySuggestions,
      ...amenitySuggestions
    ]

    // Remove duplicates based on value
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      self.findIndex(s => s.value === suggestion.value) === index
    )

    return NextResponse.json({ 
      success: true,
      suggestions: uniqueSuggestions.slice(0, 10) // Limit to 10 total suggestions
    })

  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json(
      { success: false, suggestions: [] },
      { status: 500 }
    )
  }
}
