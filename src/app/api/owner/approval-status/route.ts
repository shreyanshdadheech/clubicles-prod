import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

/**
 * API Route to check space owner approval status
 * GET /api/owner/approval-status
 * 
 * Returns the approval status of the current authenticated space owner
 * Possible statuses: 'approved', 'pending', 'rejected'
 */

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    console.log('Checking approval status for user:', decoded.id)

    // Query space_owners table for the current user's approval status using Prisma
    const ownerData = await prisma.spaceOwner.findFirst({
      where: {
        userId: decoded.id
      },
      select: {
        id: true,
        approvalStatus: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    if (!ownerData) {
      return NextResponse.json(
        { error: 'Space owner record not found' },
        { status: 404 }
      )
    }

    const approval_status = ownerData.approvalStatus || 'pending'

    console.log('Owner approval status:', approval_status)

    return NextResponse.json({
      approval_status,
      owner_id: ownerData.id,
      owner_info: {
        first_name: ownerData.firstName,
        last_name: ownerData.lastName,
        email: ownerData.email
      }
    })

  } catch (err) {
    console.error('Unexpected error checking approval status:', err)
    return NextResponse.json(
      { error: 'Unexpected server error', details: String(err) },
      { status: 500 }
    )
  }
}
