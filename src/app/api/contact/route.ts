import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body || {}

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 })
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>New Contact Message</title></head>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>📫 New Contact Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="margin-top:16px; padding:12px; background:#f6f7f9; border-radius:8px;">
          <div style="font-weight:600; margin-bottom:8px;">Message</div>
          <div style="white-space:pre-wrap; line-height:1.6;">${message}</div>
        </div>
      </body>
      </html>
    `

    const result = await sendEmail({
      to: 'bharath.bholey@gmail.com',
      subject: `[Contact] ${subject}`,
      html
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to send message.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Unexpected error' }, { status: 500 })
  }
}


