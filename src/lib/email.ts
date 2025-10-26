import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Email templates and types
export interface EmailTemplate {
  to: string | string[]
  subject: string
  html: string
  cc?: string | string[]
  bcc?: string | string[]
}

export interface BookingConfirmationData {
  userName: string
  userEmail: string
  spaceName: string
  spaceAddress: string
  bookingDate: string
  startTime: string
  endTime: string
  duration: string
  totalAmount: number
  redemptionCode: string
  qrCodeData: string
  spaceOwnerName: string
  spaceOwnerEmail: string
}

export interface OwnerSignupData {
  ownerName: string
  ownerEmail: string
  businessName: string
  onboardingStatus: 'pending' | 'completed'
  adminEmail: string
}

export interface PayoutNotificationData {
  ownerName: string
  ownerEmail: string
  payoutAmount: number
  payoutMethod: string
  transactionId: string
  adminEmail: string
  notes?: string
}

export interface PasswordResetData {
  userName: string
  userEmail: string
  resetToken: string
  resetUrl: string
}

export interface OtpData {
  otp: string
  userType: 'user' | 'owner'
}

// Email template functions
export const createBookingConfirmationEmail = (data: BookingConfirmationData): EmailTemplate => {
  return {
    to: data.userEmail,
    subject: `Booking Confirmed - ${data.spaceName} | Clubicles`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .qr-code { text-align: center; margin: 20px 0; }
          .qr-code img { max-width: 200px; height: auto; }
          .redemption-code { background: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; margin: 15px 0; }
          .code { font-family: monospace; font-size: 18px; font-weight: bold; color: #2563eb; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
            <p>Your workspace is ready for you</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>Your booking has been successfully confirmed. Here are the details:</p>
            
            <div class="booking-details">
              <h3>📅 Booking Details</h3>
              <p><strong>Space:</strong> ${data.spaceName}</p>
              <p><strong>Address:</strong> ${data.spaceAddress}</p>
              <p><strong>Date:</strong> ${data.bookingDate}</p>
              <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
              <p><strong>Duration:</strong> ${data.duration}</p>
              <p><strong>Total Amount:</strong> ₹${data.totalAmount.toLocaleString()}</p>
            </div>
            
            <div class="redemption-code">
              <h3>🔑 Redemption Code</h3>
              <div class="code">${data.redemptionCode}</div>
              <p>Show this code to the space owner for entry</p>
            </div>
            
            <div class="qr-code">
              <h3>📱 QR Code</h3>
              <img src="data:image/png;base64,${data.qrCodeData}" alt="QR Code" />
              <p>Scan this QR code for quick entry</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="/bookings" class="button">View My Bookings</a>
            </div>
            
            <div class="footer">
              <p>Need help? Contact us at support@clubicles.com</p>
              <p>© 2025 Clubicles. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const createOwnerSignupEmail = (data: OwnerSignupData): EmailTemplate => {
  const statusColor = data.onboardingStatus === 'completed' ? '#10b981' : '#f59e0b'
  const statusText = data.onboardingStatus === 'completed' ? 'Completed' : 'Pending'
  
  return {
    to: data.ownerEmail,
    cc: data.adminEmail,
    subject: `Welcome to Clubicles - ${data.businessName} | Space Owner Registration`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Clubicles</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 Welcome to Clubicles!</h1>
            <p>Your space owner journey begins now</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.ownerName}!</h2>
            <p>Welcome to Clubicles! We're excited to have <strong>${data.businessName}</strong> join our platform.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3>📋 Onboarding Status</h3>
              <div class="status-badge" style="background-color: ${statusColor};">
                ${statusText}
              </div>
              <p>${data.onboardingStatus === 'completed' 
                ? 'Your onboarding is complete! You can start listing spaces and managing bookings.' 
                : 'Please complete your onboarding process to start listing spaces.'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clubicles.com'}/owner" class="button">Go to Owner Dashboard</a>
            </div>
            
            <div class="footer">
              <p>Questions? Contact us at support@clubicles.com</p>
              <p>© 2025 Clubicles. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const createPayoutNotificationEmail = (data: PayoutNotificationData): EmailTemplate => {
  return {
    to: data.ownerEmail,
    cc: data.adminEmail,
    subject: `Payout Processed - ₹${data.payoutAmount.toLocaleString()} | Clubicles`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payout Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .payout-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .amount { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payout Processed!</h1>
            <p>Your earnings have been transferred</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.ownerName}!</h2>
            <p>Your payout has been successfully processed. Here are the details:</p>
            
            <div class="payout-details">
              <h3>💳 Payout Details</h3>
              <div class="amount">₹${data.payoutAmount.toLocaleString()}</div>
              <p><strong>Payment Method:</strong> ${data.payoutMethod}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Processed Date:</strong> ${new Date().toLocaleDateString()}</p>
              ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clubicles.com'}/owner" class="button">View Dashboard</a>
            </div>
            
            <div class="footer">
              <p>Questions about your payout? Contact us at support@clubicles.com</p>
              <p>© 2025 Clubicles. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const createPasswordResetEmail = (data: PasswordResetData): EmailTemplate => {
  return {
    to: data.userEmail,
    subject: `Password Reset Request | Clubicles`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reset-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Reset your password securely</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.userName}!</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div class="reset-section">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
              <p style="margin-top: 15px; font-size: 14px; color: #666;">
                This link will expire in 1 hour for security reasons.
              </p>
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <div class="footer">
              <p>Need help? Contact us at support@clubicles.com</p>
              <p>© 2025 Clubicles. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Email sending functions
export const sendEmail = async (template: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Clubicles <noreply@clubicles.com>',
      to: template.to,
      subject: template.subject,
      html: template.html,
      cc: template.cc,
      bcc: template.bcc,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

// Specific email sending functions
export const sendBookingConfirmation = async (data: BookingConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const template = createBookingConfirmationEmail(data)
  return await sendEmail(template)
}

export const createOtpEmail = (otp: string, userType: 'user' | 'owner' = 'user'): EmailTemplate => {
  const title = userType === 'owner' ? 'Verify Your Space Owner Account' : 'Verify Your Email Address'
  const description = userType === 'owner' 
    ? 'Complete your space owner registration by verifying your email address.'
    : 'Complete your account registration by verifying your email address.'

  return {
    to: '', // Will be set when calling
    subject: `${otp} - Your Clubicles Verification Code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - Clubicles</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 20px; }
          .otp-container { background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: 700; color: #1e293b; letter-spacing: 8px; margin: 20px 0; }
          .otp-label { color: #64748b; font-size: 14px; margin-bottom: 10px; }
          .expiry-notice { color: #ef4444; font-size: 14px; margin-top: 10px; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Welcome to Clubicles!</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              ${description}
            </p>
            
            <div class="otp-container">
              <div class="otp-label">Your verification code is:</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry-notice">This code will expire in 10 minutes</div>
            </div>
            
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              Enter this code in the verification form to complete your ${userType === 'owner' ? 'space owner' : 'user'} registration.
            </p>
            
            <p style="color: #64748b; line-height: 1.6; font-size: 14px;">
              If you didn't request this verification, please ignore this email.
            </p>
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

export const sendOwnerSignupNotification = async (data: OwnerSignupData): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const template = createOwnerSignupEmail(data)
  return await sendEmail(template)
}

export const sendPayoutNotification = async (data: PayoutNotificationData): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const template = createPayoutNotificationEmail(data)
  return await sendEmail(template)
}

export const sendPasswordReset = async (data: PasswordResetData): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const template = createPasswordResetEmail(data)
  return await sendEmail(template)
}

export default resend
