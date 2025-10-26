import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is owner or admin
    if (decoded.roles !== 'owner' && decoded.roles !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Owner privileges required.' }, { status: 403 })
    }

    // Get owner ID from token
    const ownerId = decoded.id

    // Get or create notification settings
    let settings = await prisma.ownerNotificationSettings.findUnique({
      where: { ownerId }
    })

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.ownerNotificationSettings.create({
        data: {
          ownerId,
          emailNotifications: true,
          bookingEmailNotifications: true,
          reviewEmailNotifications: true,
          paymentReminders: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
        emailNotifications: settings.emailNotifications,
        bookingEmailNotifications: settings.bookingEmailNotifications,
        reviewEmailNotifications: settings.reviewEmailNotifications,
        paymentReminders: settings.paymentReminders
      }
    })

  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is owner or admin
    if (decoded.roles !== 'owner' && decoded.roles !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Owner privileges required.' }, { status: 403 })
    }

    const body = await request.json()
    const ownerId = decoded.id

    // Update notification settings in database
    const updatedSettings = await prisma.ownerNotificationSettings.upsert({
      where: { ownerId },
      update: {
        emailNotifications: body.emailNotifications ?? true,
        bookingEmailNotifications: body.bookingEmailNotifications ?? true,
        reviewEmailNotifications: body.reviewEmailNotifications ?? true,
        paymentReminders: body.paymentReminders ?? true
      },
      create: {
        ownerId,
        emailNotifications: body.emailNotifications ?? true,
        bookingEmailNotifications: body.bookingEmailNotifications ?? true,
        reviewEmailNotifications: body.reviewEmailNotifications ?? true,
        paymentReminders: body.paymentReminders ?? true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        emailNotifications: updatedSettings.emailNotifications,
        bookingEmailNotifications: updatedSettings.bookingEmailNotifications,
        reviewEmailNotifications: updatedSettings.reviewEmailNotifications,
        paymentReminders: updatedSettings.paymentReminders
      }
    })

  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings', details: error.message },
      { status: 500 }
    )
  }
}
