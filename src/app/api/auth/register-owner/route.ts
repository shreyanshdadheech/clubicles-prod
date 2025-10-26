import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, generateToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Public API Route for space owner registration
 * POST /api/auth/register-owner
 * 
 * Body: {
 *   email: string,
 *   password: string,
 *   first_name: string,
 *   last_name?: string,
 *   business_info?: {
 *     business_name: string,
 *     business_type: string,
 *     gst_number: string,
 *     pan_number: string,
 *     business_address: string,
 *     business_city: string,
 *     business_state: string,
 *     business_pincode: string
 *   },
 *   payment_info?: {
 *     bank_account_number: string,
 *     bank_ifsc_code: string,
 *     bank_account_holder_name: string,
 *     bank_name: string,
 *     upi_id?: string
 *   }
 * }
 */

export async function GET() {
  return NextResponse.json({ message: 'Owner registration endpoint is working' })
}

export async function POST(request: NextRequest) {
  console.log('🎯 REGISTER OWNER API CALLED!')
  try {
    console.log('🔍 Owner registration API called')
    const body = await request.json().catch(() => null)
    
    if (!body || !body.email || !body.password || !body.first_name) {
      console.log('❌ Missing required fields:', body)
      return NextResponse.json(
        { error: 'Missing required fields: email, password, first_name' },
        { status: 400 }
      )
    }

    console.log('Creating space owner account:', { 
      email: body.email, 
      first_name: body.first_name,
      last_name: body.last_name,
      has_business_info: !!body.business_info,
      has_payment_info: !!body.payment_info
    })

    const { email, password, first_name, last_name, business_info, payment_info } = body

    // Check if user already exists
    console.log('🔍 Checking if user already exists...')
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email)
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    console.log('✅ User does not exist, proceeding with creation')

    // Create user
    console.log('👤 Creating user...')
    const user = await createUser({
      email,
      password,
      firstName: first_name,
      lastName: last_name,
      roles: 'owner'
    })

    if (!user) {
      console.error('❌ User creation failed')
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    console.log('✅ User created successfully:', user.id)

    // Create space owner record
    console.log('🏢 Creating space owner record...')
    const spaceOwner = await prisma.spaceOwner.create({
      data: {
        userId: user.id,
        email,
        firstName: first_name,
        lastName: last_name,
        approvalStatus: 'pending',
        onboardingCompleted: false
      }
    })

    console.log('✅ Space owner record created successfully:', spaceOwner.id)

    // Create business info if provided
    if (business_info) {
      console.log('🏢 Creating business info...')
      try {
        await prisma.spaceOwnerBusinessInfo.create({
          data: {
            spaceOwnerId: spaceOwner.id,
            businessName: business_info.business_name,
            businessType: business_info.business_type,
            gstNumber: business_info.gst_number,
            panNumber: business_info.pan_number,
            businessAddress: business_info.business_address,
            businessCity: business_info.business_city,
            businessState: business_info.business_state,
            businessPincode: business_info.business_pincode,
            verificationStatus: 'pending'
          }
        })
        console.log('✅ Business info created successfully')
      } catch (businessError) {
        console.error('❌ Business info creation failed:', businessError)
        // Don't fail the entire registration for business info
      }
    }

    // Create payment info if provided
    if (payment_info) {
      console.log('💳 Creating payment info...')
      try {
        await prisma.spaceOwnerPaymentInfo.create({
          data: {
            spaceOwnerId: spaceOwner.id,
            bankAccountNumber: payment_info.bank_account_number,
            bankIfscCode: payment_info.bank_ifsc_code,
            bankAccountHolderName: payment_info.bank_account_holder_name,
            bankName: payment_info.bank_name,
            upiId: payment_info.upi_id || null
          }
        })
        console.log('✅ Payment info created successfully')
      } catch (paymentError) {
        console.error('❌ Payment info creation failed:', paymentError)
        // Don't fail the entire registration for payment info
      }
    }

    console.log('🎉 Space owner registration completed successfully!')
    
    // Send owner signup notification email
    try {
      const emailResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/email/owner-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: `${first_name} ${last_name}`.trim(),
          ownerEmail: email,
          businessName: business_info?.business_name || 'Business',
          onboardingStatus: spaceOwner.onboardingCompleted ? 'completed' : 'pending'
        })
      })

      if (emailResponse.ok) {
        console.log('✅ Owner signup notification email sent')
      } else {
        console.log('⚠️ Failed to send owner signup notification email')
      }
    } catch (emailError) {
      console.error('❌ Error sending owner signup notification email:', emailError)
      // Don't fail the registration if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Space owner registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        roles: user.roles
      },
      space_owner: {
        id: spaceOwner.id,
        approval_status: spaceOwner.approvalStatus,
        onboarding_completed: spaceOwner.onboardingCompleted
      }
    })

  } catch (error) {
    console.error('❌ Owner registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    )
  }
}