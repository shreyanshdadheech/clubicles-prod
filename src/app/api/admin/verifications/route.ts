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
    const type = searchParams.get('type') || 'all'

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { businessType: { contains: search, mode: 'insensitive' } },
        { businessCity: { contains: search, mode: 'insensitive' } },
        { spaceOwner: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }

    if (status !== 'all') {
      where.verificationStatus = status
    }

    if (type !== 'all') {
      where.businessType = type
    }

    // Get business info with related data
    const businessInfos = await prisma.spaceOwnerBusinessInfo.findMany({
      where,
      include: {
        spaceOwner: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                city: true,
                createdAt: true
              }
            },
            paymentInfo: {
              select: {
                id: true,
                bankAccountNumber: true,
                bankIfscCode: true,
                bankAccountHolderName: true,
                bankName: true,
                upiId: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        spaces: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        businessBalance: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data for the frontend
    const transformedVerifications = businessInfos.map((businessInfo) => {
      return {
        id: businessInfo.id,
        spaceOwnerId: businessInfo.spaceOwnerId,
        businessName: businessInfo.businessName,
        businessType: businessInfo.businessType,
        gstNumber: businessInfo.gstNumber,
        panNumber: businessInfo.panNumber,
        businessAddress: businessInfo.businessAddress,
        businessCity: businessInfo.businessCity,
        businessState: businessInfo.businessState,
        businessPincode: businessInfo.businessPincode,
        verificationStatus: businessInfo.verificationStatus,
        verifiedBy: businessInfo.verifiedBy,
        verifiedAt: businessInfo.verifiedAt?.toISOString(),
        rejectionReason: businessInfo.rejectionReason,
        createdAt: businessInfo.createdAt.toISOString(),
        updatedAt: businessInfo.updatedAt.toISOString(),
        spaceOwner: {
          id: businessInfo.spaceOwner.id,
          email: businessInfo.spaceOwner.email,
          firstName: businessInfo.spaceOwner.firstName,
          lastName: businessInfo.spaceOwner.lastName,
          phone: businessInfo.spaceOwner.phone,
          approvalStatus: businessInfo.spaceOwner.approvalStatus,
          onboardingCompleted: businessInfo.spaceOwner.onboardingCompleted,
          user: businessInfo.spaceOwner.user,
          paymentInfo: businessInfo.spaceOwner.paymentInfo
        },
        spaces: businessInfo.spaces.map(space => ({
          id: space.id,
          name: space.name,
          city: space.city,
          status: 'active' // Default status since Space model doesn't have status field
        })),
        spacesCount: businessInfo.spaces.length,
        businessBalance: businessInfo.businessBalance ? {
          currentBalance: Number(businessInfo.businessBalance.currentBalance),
          pendingAmount: Number(businessInfo.businessBalance.pendingAmount),
          totalEarned: Number(businessInfo.businessBalance.totalEarned)
        } : null
      }
    })

    return NextResponse.json({
      success: true,
      data: { verifications: transformedVerifications }
    })

  } catch (error: any) {
    console.error('Admin verifications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verifications data', details: error.message },
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

    const { 
      businessInfoId, 
      verificationStatus, 
      rejectionReason,
      verifiedBy 
    } = await request.json()

    if (!businessInfoId) {
      return NextResponse.json({ error: 'Business info ID is required' }, { status: 400 })
    }

    // Update business info verification status
    const updatedBusinessInfo = await prisma.spaceOwnerBusinessInfo.update({
      where: { id: businessInfoId },
      data: {
        verificationStatus,
        ...(rejectionReason && { rejectionReason }),
        ...(verifiedBy && { verifiedBy }),
        ...(verificationStatus === 'verified' && { 
          verifiedAt: new Date(),
          verifiedBy: verifiedBy || decoded.id
        })
      },
      include: {
        spaceOwner: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                city: true
              }
            },
            paymentInfo: {
              select: {
                id: true,
                bankAccountNumber: true,
                bankIfscCode: true,
                bankAccountHolderName: true,
                bankName: true,
                upiId: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        spaces: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        businessBalance: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { verification: updatedBusinessInfo }
    })

  } catch (error: any) {
    console.error('Admin verification update error:', error)
    return NextResponse.json(
      { error: 'Failed to update verification', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}