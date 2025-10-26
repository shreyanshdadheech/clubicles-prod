import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the space ID from params
    const { id: spaceId } = await params

    // Verify JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's space owner record
    const spaceOwner = await prisma.spaceOwner.findUnique({
      where: { userId: decoded.id },
      include: {
        businessInfo: true
      }
    })

    if (!spaceOwner) {
      return NextResponse.json(
        { error: 'Space owner record not found' },
        { status: 404 }
      )
    }

    // Get the space to verify ownership
    const existingSpace = await prisma.space.findFirst({
      where: {
        id: spaceId,
        businessId: spaceOwner.businessInfo?.id
      }
    })

    if (!existingSpace) {
      return NextResponse.json(
        { error: 'Space not found or access denied' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.address || !body.city || !body.pincode) {
      return NextResponse.json({ error: 'Name, address, city, and pincode are required' }, { status: 400 })
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(body.pincode)) {
      return NextResponse.json({ error: 'Pincode must be 6 digits' }, { status: 400 })
    }

    // Validate price fields
    if (body.price_per_hour && (isNaN(parseFloat(body.price_per_hour)) || parseFloat(body.price_per_hour) < 0)) {
      return NextResponse.json({ error: 'Price per hour must be a positive number' }, { status: 400 })
    }

    if (body.price_per_day && (isNaN(parseFloat(body.price_per_day)) || parseFloat(body.price_per_day) < 0)) {
      return NextResponse.json({ error: 'Price per day must be a positive number' }, { status: 400 })
    }

    // Validate seat fields
    const totalSeats = body.total_seats ? parseInt(body.total_seats) : existingSpace.totalSeats
    const availableSeats = body.available_seats ? parseInt(body.available_seats) : existingSpace.availableSeats

    if (isNaN(totalSeats) || totalSeats <= 0) {
      return NextResponse.json({ error: 'Total seats must be a positive integer' }, { status: 400 })
    }

    if (isNaN(availableSeats) || availableSeats < 0 || availableSeats > totalSeats) {
      return NextResponse.json({ error: 'Available seats must be between 0 and total seats' }, { status: 400 })
    }

    // Update the space
    const updatedSpace = await prisma.space.update({
      where: { id: spaceId },
      data: {
        name: body.name,
        description: body.description || existingSpace.description,
        address: body.address,
        city: body.city,
        pincode: body.pincode,
        latitude: body.latitude ? parseFloat(body.latitude) : existingSpace.latitude,
        longitude: body.longitude ? parseFloat(body.longitude) : existingSpace.longitude,
        totalSeats: totalSeats,
        availableSeats: availableSeats,
        pricePerHour: body.price_per_hour ? parseFloat(body.price_per_hour) : existingSpace.pricePerHour,
        pricePerDay: body.price_per_day ? parseFloat(body.price_per_day) : existingSpace.pricePerDay,
        amenities: body.amenities || existingSpace.amenities,
        images: body.images || existingSpace.images,
        companyName: body.company_name || existingSpace.companyName,
        contactNumber: body.contact_number || existingSpace.contactNumber
      }
    })

    return NextResponse.json({
      success: true,
      space: updatedSpace,
      message: 'Space updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating space:', error)
    return NextResponse.json(
      { error: 'Failed to update space', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the space ID from params
    const { id: spaceId } = await params

    // Verify JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user's space owner record
    const spaceOwner = await prisma.spaceOwner.findUnique({
      where: { userId: decoded.id },
      include: {
        businessInfo: true
      }
    })

    if (!spaceOwner) {
      return NextResponse.json(
        { error: 'Space owner record not found' },
        { status: 404 }
      )
    }

    // Get the space to verify ownership
    const existingSpace = await prisma.space.findFirst({
      where: {
        id: spaceId,
        businessId: spaceOwner.businessInfo?.id
      }
    })

    if (!existingSpace) {
      return NextResponse.json(
        { error: 'Space not found or access denied' },
        { status: 404 }
      )
    }

    // Delete all associated bookings first
    await prisma.booking.deleteMany({
      where: {
        spaceId: spaceId
      }
    })

    // Delete the space
    await prisma.space.delete({
      where: { id: spaceId }
    })

    return NextResponse.json({
      success: true,
      message: 'Space and all associated bookings deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting space:', error)
    return NextResponse.json(
      { error: 'Failed to delete space', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
