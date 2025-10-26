import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/tax-configurations/public - Fetch active tax configurations for public use
export async function GET(request: NextRequest) {
  try {
    // Get all active tax configurations
    const taxConfigurations = await prisma.taxConfiguration.findMany({
      where: {
        isEnabled: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Transform the data for frontend use
    const transformedTaxes = taxConfigurations.map(tax => ({
      id: tax.id,
      name: tax.name,
      percentage: Number(tax.percentage),
      isEnabled: tax.isEnabled,
      appliesTo: tax.appliesTo,
      description: tax.description
    }))

    return NextResponse.json({
      success: true,
      taxes: transformedTaxes
    })

  } catch (error) {
    console.error('Error fetching tax configurations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
