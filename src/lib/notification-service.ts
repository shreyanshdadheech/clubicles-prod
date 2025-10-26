import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export interface BookingNotificationData {
  ownerId: string
  spaceName: string
  customerName: string
  customerEmail: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  bookingId: string
  status: 'confirmed' | 'cancelled' | 'completed'
}

export interface ReviewNotificationData {
  ownerId: string
  spaceName: string
  customerName: string
  rating: number
  reviewText: string
  reviewId: string
}

export interface GeneralNotificationData {
  ownerId: string
  subject: string
  message: string
  type: 'system_update' | 'promotional' | 'payment_reminder'
}

export class NotificationService {
  // Send booking notification to space owner
  static async sendBookingNotification(data: BookingNotificationData) {
    try {
      // Check if owner has booking notifications enabled
      const settings = await prisma.ownerNotificationSettings.findUnique({
        where: { ownerId: data.ownerId },
        include: { owner: true }
      })

      if (!settings?.bookingEmailNotifications || !settings.owner) {
        console.log('Booking notifications disabled for owner:', data.ownerId)
        return { success: false, reason: 'Notifications disabled' }
      }

      const ownerEmail = settings.owner.email
      const ownerName = `${settings.owner.firstName || ''} ${settings.owner.lastName || ''}`.trim() || 'Space Owner'

      let subject = ''
      let html = ''

      switch (data.status) {
        case 'confirmed':
          subject = `New Booking Confirmed - ${data.spaceName}`
          html = this.createBookingConfirmedEmail(ownerName, data)
          break
        case 'cancelled':
          subject = `Booking Cancelled - ${data.spaceName}`
          html = this.createBookingCancelledEmail(ownerName, data)
          break
        case 'completed':
          subject = `Booking Completed - ${data.spaceName}`
          html = this.createBookingCompletedEmail(ownerName, data)
          break
      }

      await sendEmail({
        to: ownerEmail,
        subject,
        html
      })

      console.log(`✅ Booking notification sent to ${ownerEmail}`)
      return { success: true }

    } catch (error) {
      console.error('❌ Error sending booking notification:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send review notification to space owner
  static async sendReviewNotification(data: ReviewNotificationData) {
    try {
      // Check if owner has review notifications enabled
      const settings = await prisma.ownerNotificationSettings.findUnique({
        where: { ownerId: data.ownerId },
        include: { owner: true }
      })

      if (!settings?.reviewEmailNotifications || !settings.owner) {
        console.log('Review notifications disabled for owner:', data.ownerId)
        return { success: false, reason: 'Notifications disabled' }
      }

      const ownerEmail = settings.owner.email
      const ownerName = `${settings.owner.firstName || ''} ${settings.owner.lastName || ''}`.trim() || 'Space Owner'

      const subject = `New Review Received - ${data.spaceName}`
      const html = this.createReviewNotificationEmail(ownerName, data)

      await sendEmail({
        to: ownerEmail,
        subject,
        html
      })

      console.log(`✅ Review notification sent to ${ownerEmail}`)
      return { success: true }

    } catch (error) {
      console.error('❌ Error sending review notification:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Send general notification to space owner
  static async sendGeneralNotification(data: GeneralNotificationData) {
    try {
      // Check if owner has general notifications enabled
      const settings = await prisma.ownerNotificationSettings.findUnique({
        where: { ownerId: data.ownerId },
        include: { owner: true }
      })

      if (!settings?.emailNotifications || !settings.owner) {
        console.log('General notifications disabled for owner:', data.ownerId)
        return { success: false, reason: 'Notifications disabled' }
      }

      const ownerEmail = settings.owner.email
      const ownerName = `${settings.owner.firstName || ''} ${settings.owner.lastName || ''}`.trim() || 'Space Owner'

      const subject = data.subject
      const html = this.createGeneralNotificationEmail(ownerName, data)

      await sendEmail({
        to: ownerEmail,
        subject,
        html
      })

      console.log(`✅ General notification sent to ${ownerEmail}`)
      return { success: true }

    } catch (error) {
      console.error('❌ Error sending general notification:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Email templates
  private static createBookingConfirmedEmail(ownerName: string, data: BookingNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Confirmed - Clubicles</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .booking-details { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .detail-label { color: #64748b; font-weight: 600; }
          .detail-value { color: #1e293b; font-weight: 500; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Booking Confirmed!</h1>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${ownerName}!</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              Great news! You have received a new booking for your space.
            </p>

            <div class="booking-details">
              <h3 style="color: #1e293b; margin-bottom: 20px;">Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Space:</span>
                <span class="detail-value">${data.spaceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${data.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${data.bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${data.bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">₹${data.totalAmount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${data.bookingId}</span>
              </div>
            </div>

            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              You can view and manage this booking in your owner dashboard.
            </p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clubicles.com'}/owner" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            <p>© 2024 Clubicles. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static createBookingCancelledEmail(ownerName: string, data: BookingNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Cancelled - Clubicles</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .booking-details { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .detail-label { color: #64748b; font-weight: 600; }
          .detail-value { color: #1e293b; font-weight: 500; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Booking Cancelled</h1>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${ownerName}!</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              A booking for your space has been cancelled.
            </p>

            <div class="booking-details">
              <h3 style="color: #1e293b; margin-bottom: 20px;">Cancelled Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Space:</span>
                <span class="detail-value">${data.spaceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${data.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${data.bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${data.bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${data.bookingId}</span>
              </div>
            </div>

            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              The space is now available for new bookings.
            </p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clubicles.com'}/owner" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            <p>© 2024 Clubicles. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static createBookingCompletedEmail(ownerName: string, data: BookingNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Completed - Clubicles</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .booking-details { background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .detail-label { color: #64748b; font-weight: 600; }
          .detail-value { color: #1e293b; font-weight: 500; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Completed</h1>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${ownerName}!</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              A booking for your space has been completed successfully.
            </p>

            <div class="booking-details">
              <h3 style="color: #1e293b; margin-bottom: 20px;">Completed Booking Details</h3>
              <div class="detail-row">
                <span class="detail-label">Space:</span>
                <span class="detail-value">${data.spaceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${data.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${data.bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${data.bookingTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Earned:</span>
                <span class="detail-value">₹${data.totalAmount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${data.bookingId}</span>
              </div>
            </div>

            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              The customer may leave a review for your space. Check your dashboard for updates.
            </p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clubicles.com'}/owner" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            <p>© 2024 Clubicles. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static createReviewNotificationEmail(ownerName: string, data: ReviewNotificationData): string {
    const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Review Received - Clubicles</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .review-details { background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .stars { color: #f59e0b; font-size: 24px; margin: 12px 0; }
          .review-text { background-color: #ffffff; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f59e0b; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ New Review Received!</h1>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${ownerName}!</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              A customer has left a review for your space.
            </p>

            <div class="review-details">
              <h3 style="color: #1e293b; margin-bottom: 16px;">Review Details</h3>
              <div style="margin-bottom: 16px;">
                <strong>Space:</strong> ${data.spaceName}
              </div>
              <div style="margin-bottom: 16px;">
                <strong>Customer:</strong> ${data.customerName}
              </div>
              <div style="margin-bottom: 16px;">
                <strong>Rating:</strong> 
                <span class="stars">${stars}</span>
                <span style="color: #64748b; margin-left: 8px;">(${data.rating}/5)</span>
              </div>
              ${data.reviewText ? `
                <div>
                  <strong>Review:</strong>
                  <div class="review-text">${data.reviewText}</div>
                </div>
              ` : ''}
            </div>

            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              This review will be visible to other customers and can help attract more bookings.
            </p>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clubicles.com'}/owner" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            <p>© 2024 Clubicles. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static createGeneralNotificationEmail(ownerName: string, data: GeneralNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject} - Clubicles</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .message-box { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 ${data.subject}</h1>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${ownerName}!</h2>
            
            <div class="message-box">
              <p style="color: #1e293b; line-height: 1.6; margin: 0; white-space: pre-line;">${data.message}</p>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clubicles.com'}/owner" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            <p>© 2024 Clubicles. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
