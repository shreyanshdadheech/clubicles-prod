import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Fetch specific tax configuration
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.roles !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const taxConfiguration = await prisma.taxConfiguration.findUnique({
      where: { id: id }
    })

    if (!taxConfiguration) {
      return NextResponse.json({ error: 'Tax configuration not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: taxConfiguration
    })

  } catch (error: any) {
    console.error('Error fetching tax configuration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax configuration', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update tax configuration
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.roles !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, percentage, isEnabled, appliesTo, description } = body

    // Check if tax configuration exists
    const existingTax = await prisma.taxConfiguration.findUnique({
      where: { id: id }
    })

    if (!existingTax) {
      return NextResponse.json({ error: 'Tax configuration not found' }, { status: 404 })
    }

    // Validate percentage if provided
    if (percentage !== undefined && (percentage < 0 || percentage > 100)) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if another tax configuration with same name exists (excluding current one)
    if (name && name !== existingTax.name) {
      const duplicateTax = await prisma.taxConfiguration.findFirst({
        where: { 
          name,
          id: { not: id }
        }
      })

      if (duplicateTax) {
        return NextResponse.json(
          { error: 'Tax configuration with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Update tax configuration
    const updatedTaxConfiguration = await prisma.taxConfiguration.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(percentage !== undefined && { percentage: Number(percentage) }),
        ...(isEnabled !== undefined && { isEnabled }),
        ...(appliesTo && { appliesTo }),
        ...(description !== undefined && { description: description || null })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tax configuration updated successfully',
      data: updatedTaxConfiguration
    })

  } catch (error: any) {
    console.error('Error updating tax configuration:', error)
    return NextResponse.json(
      { error: 'Failed to update tax configuration', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete tax configuration
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    if (decoded.roles !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Check if tax configuration exists
    const existingTax = await prisma.taxConfiguration.findUnique({
      where: { id: id }
    })

    if (!existingTax) {
      return NextResponse.json({ error: 'Tax configuration not found' }, { status: 404 })
    }

    // Check if tax configuration is being used in any bookings
    const bookingTaxes = await prisma.bookingTax.findFirst({
      where: { taxId: id }
    })

    if (bookingTaxes) {
      return NextResponse.json(
        { error: 'Cannot delete tax configuration that is being used in bookings' },
        { status: 400 }
      )
    }

    // Delete tax configuration
    await prisma.taxConfiguration.delete({
      where: { id: id }
    })

    return NextResponse.json({
      success: true,
      message: 'Tax configuration deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting tax configuration:', error)
    return NextResponse.json(
      { error: 'Failed to delete tax configuration', details: error.message },
      { status: 500 }
    )
  }
}
