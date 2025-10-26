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

    // Check system status
    const systemStatus = await checkSystemStatus()

    return NextResponse.json({
      success: true,
      data: { systemStatus }
    })

  } catch (error: any) {
    console.error('System status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check system status', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

async function checkSystemStatus() {
  const status = {
    paymentGateway: { status: 'offline', message: 'Not configured' },
    database: { status: 'offline', message: 'Connection failed' },
    emailService: { status: 'offline', message: 'Not configured' },
    environment: { status: 'offline', message: 'Missing variables' }
  }

  // Check Database Status
  try {
    await prisma.$queryRaw`SELECT 1`
    status.database = { status: 'online', message: 'Connected' }
  } catch (error) {
    console.error('Database check failed:', error)
    status.database = { status: 'offline', message: 'Connection failed' }
  }

  // Check Payment Gateway Status (Razorpay)
  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
    
    if (razorpayKeyId && razorpayKeySecret) {
      // Test Razorpay API connectivity with a simple request
      const response = await fetch('https://api.razorpay.com/v1/payments?count=1', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok || response.status === 400) { // 400 means auth is working but no payments
        status.paymentGateway = { status: 'online', message: 'Razorpay connected' }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        status.paymentGateway = { status: 'offline', message: `Razorpay API error: ${response.status}` }
      }
    } else {
      const missingVars = []
      if (!razorpayKeyId) missingVars.push('RAZORPAY_KEY_ID')
      if (!razorpayKeySecret) missingVars.push('RAZORPAY_KEY_SECRET')
      status.paymentGateway = { status: 'offline', message: `Missing: ${missingVars.join(', ')}` }
    }
  } catch (error) {
    console.error('Payment gateway check failed:', error)
    status.paymentGateway = { status: 'offline', message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }

  // Check Email Service Status (Resend)
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (resendApiKey) {
      // Test Resend API connectivity
      const response = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        status.emailService = { status: 'online', message: 'Resend connected' }
      } else if (response.status === 401) {
        // Check if it's a restricted key (which is valid for sending emails)
        const errorData = await response.json().catch(() => ({}))
        if (errorData.message && errorData.message.includes('restricted')) {
          status.emailService = { status: 'online', message: 'Resend connected (restricted key)' }
        } else {
          status.emailService = { status: 'offline', message: 'Invalid Resend API key' }
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        status.emailService = { status: 'offline', message: `Resend API error: ${response.status}` }
      }
    } else {
      status.emailService = { status: 'offline', message: 'RESEND_API_KEY not configured' }
    }
  } catch (error) {
    console.error('Email service check failed:', error)
    status.emailService = { status: 'offline', message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }

  // Check Environment Variables
  try {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'RESEND_API_KEY'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      status.environment = { status: 'online', message: 'All required variables set' }
    } else {
      status.environment = { status: 'offline', message: `Missing: ${missingVars.join(', ')}` }
    }
  } catch (error) {
    console.error('Environment check failed:', error)
    status.environment = { status: 'offline', message: 'Configuration error' }
  }

  return status
}
