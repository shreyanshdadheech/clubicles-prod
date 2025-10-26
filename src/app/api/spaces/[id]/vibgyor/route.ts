import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spaceId } = await params

    if (!spaceId) {
      return NextResponse.json({ error: 'Space ID is required' }, { status: 400 })
    }

    // Get space with VIBGYOR data (only redeemed bookings)
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
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

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    // Calculate total redeemed bookings
    const totalRedeemedBookings = Object.values(space).reduce((sum: number, count: any) => {
      return typeof count === 'number' ? sum + count : sum
    }, 0)

    // Only show VIBGYOR data if there are redeemed bookings
    if (totalRedeemedBookings === 0) {
      return NextResponse.json({
        success: true,
        data: {
          spaceId: space.id,
          spaceName: space.name,
          hasRedeemedBookings: false,
          message: 'No redeemed bookings yet'
        }
      })
    }

    // Calculate VIBGYOR percentages (only for redeemed bookings)
    const vibgyorData = {
      violet: {
        count: space.violet || 0,
        percentage: Math.round(((space.violet || 0) / totalRedeemedBookings) * 100),
        label: 'Visionaries & Venture Capitalists'
      },
      indigo: {
        count: space.indigo || 0,
        percentage: Math.round(((space.indigo || 0) / totalRedeemedBookings) * 100),
        label: 'IT & Industrialists'
      },
      blue: {
        count: space.blue || 0,
        percentage: Math.round(((space.blue || 0) / totalRedeemedBookings) * 100),
        label: 'Branding & Marketing'
      },
      green: {
        count: space.green || 0,
        percentage: Math.round(((space.green || 0) / totalRedeemedBookings) * 100),
        label: 'Green Footprint & EV'
      },
      yellow: {
        count: space.yellow || 0,
        percentage: Math.round(((space.yellow || 0) / totalRedeemedBookings) * 100),
        label: 'Young Entrepreneurs'
      },
      orange: {
        count: space.orange || 0,
        percentage: Math.round(((space.orange || 0) / totalRedeemedBookings) * 100),
        label: 'Oracle of Bharat'
      },
      red: {
        count: space.red || 0,
        percentage: Math.round(((space.red || 0) / totalRedeemedBookings) * 100),
        label: 'Real Estate & Recreationists'
      },
      grey: {
        count: space.grey || 0,
        percentage: Math.round(((space.grey || 0) / totalRedeemedBookings) * 100),
        label: 'Nomads (Multi-talented)'
      },
      white: {
        count: space.white || 0,
        percentage: Math.round(((space.white || 0) / totalRedeemedBookings) * 100),
        label: 'Policy Makers & Health Professionals'
      },
      black: {
        count: space.black || 0,
        percentage: Math.round(((space.black || 0) / totalRedeemedBookings) * 100),
        label: 'Prefer Not to Say'
      }
    }

    // Filter out professional types with 0 redeemed bookings
    const activeVibgyorTypes = Object.entries(vibgyorData)
      .filter(([_, data]) => data.count > 0)
      .reduce((acc, [key, data]) => {
        acc[key] = data
        return acc
      }, {} as any)

    // Find dominant professional type
    const dominantType = Object.keys(activeVibgyorTypes).reduce((a, b) => 
      activeVibgyorTypes[a].count > activeVibgyorTypes[b].count ? a : b, 
      Object.keys(activeVibgyorTypes)[0]
    )

    return NextResponse.json({
      success: true,
      data: {
        spaceId: space.id,
        spaceName: space.name,
        hasRedeemedBookings: true,
        totalRedeemedBookings,
        vibgyorTypes: activeVibgyorTypes,
        dominantType,
        summary: {
          totalTypes: Object.keys(activeVibgyorTypes).length,
          mostPopular: dominantType ? activeVibgyorTypes[dominantType] : null
        }
      }
    })

  } catch (error: any) {
    console.error('Error fetching VIBGYOR data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VIBGYOR data', details: error.message },
      { status: 500 }
    )
  }
}
