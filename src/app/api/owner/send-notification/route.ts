import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { NotificationService } from '@/lib/notification-service'

export async function POST(request: NextRequest) {
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

    // Check if user is admin
    if (decoded.roles !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 })
    }

    const { ownerId, subject, message, type } = await request.json()

    if (!ownerId || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Send general notification
    const result = await NotificationService.sendGeneralNotification({
      ownerId,
      subject,
      message,
      type: type || 'system_update'
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send notification'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    )
  }
}
