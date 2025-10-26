import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userType = 'user' } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find user with valid reset token
    let user = null
    if (userType === 'owner') {
      user = await prisma.spaceOwner.findFirst({
        where: {
          user: {
            resetToken: token,
            resetTokenExpiry: {
              gt: new Date()
            }
          }
        },
        include: { user: true }
      })
    } else if (userType === 'admin') {
      user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          },
          roles: 'admin'
        }
      })
    } else {
      user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Valid reset token'
    })

  } catch (error: any) {
    console.error('Error validating reset token:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
