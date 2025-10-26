import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - Fetch all tax configurations
export async function GET(request: NextRequest) {
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

    const taxConfigurations = await prisma.taxConfiguration.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: taxConfigurations
    })

  } catch (error: any) {
    console.error('Error fetching tax configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax configurations', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new tax configuration
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name || percentage === undefined || !appliesTo) {
      return NextResponse.json(
        { error: 'Missing required fields: name, percentage, appliesTo' },
        { status: 400 }
      )
    }

    // Validate percentage
    if (percentage < 0 || percentage > 100) {
      return NextResponse.json(
        { error: 'Percentage must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Check if tax configuration with same name already exists
    const existingTax = await prisma.taxConfiguration.findFirst({
      where: { name }
    })

    if (existingTax) {
      return NextResponse.json(
        { error: 'Tax configuration with this name already exists' },
        { status: 400 }
      )
    }

    // Create new tax configuration
    const taxConfiguration = await prisma.taxConfiguration.create({
      data: {
        name,
        percentage: Number(percentage),
        isEnabled: isEnabled ?? true,
        appliesTo,
        description: description || null,
        createdBy: decoded.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tax configuration created successfully',
      data: taxConfiguration
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating tax configuration:', error)
    return NextResponse.json(
      { error: 'Failed to create tax configuration', details: error.message },
      { status: 500 }
    )
  }
}
