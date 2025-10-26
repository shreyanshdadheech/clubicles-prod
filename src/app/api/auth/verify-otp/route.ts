import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const { email, otp, password, userType = 'user', ...additionalData } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if OTP is valid and not expired
    if (!user.emailOtp || user.emailOtp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    if (!user.emailOtpExpiry || new Date() > user.emailOtpExpiry) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      )
    }

    // Hash password if provided
    let hashedPassword = user.password
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    // Update user with verified email and password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isEmailVerified: true,
        emailOtp: null,
        emailOtpExpiry: null,
        password: hashedPassword,
        roles: userType === 'owner' ? 'owner' : 'user',
        ...(additionalData.firstName && { firstName: additionalData.firstName }),
        ...(additionalData.lastName && { lastName: additionalData.lastName }),
        ...(additionalData.phone && { phone: additionalData.phone }),
        ...(additionalData.city && { city: additionalData.city }),
        ...(additionalData.professionalRole && { professionalRole: additionalData.professionalRole })
      }
    })

    // If this is a space owner signup, create space owner record
    if (userType === 'owner' && additionalData.businessInfo) {
      const spaceOwner = await prisma.spaceOwner.create({
        data: {
          userId: updatedUser.id,
          firstName: additionalData.firstName || '',
          lastName: additionalData.lastName || '',
          email: updatedUser.email,
          phone: additionalData.phone || '',
          onboardingCompleted: false,
          approvalStatus: 'pending',
          premiumPlan: 'basic',
          premiumPaymentsEnabled: false
        }
      })

      // Create business info if provided
      if (additionalData.businessInfo) {
        await prisma.spaceOwnerBusinessInfo.create({
          data: {
            spaceOwnerId: spaceOwner.id,
            businessName: additionalData.businessInfo.business_name || '',
            businessType: additionalData.businessInfo.business_type || '',
            gstNumber: additionalData.businessInfo.gst_number || '',
            panNumber: additionalData.businessInfo.pan_number || '',
            businessAddress: additionalData.businessInfo.business_address || '',
            businessCity: additionalData.businessInfo.business_city || '',
            businessState: additionalData.businessInfo.business_state || '',
            businessPincode: additionalData.businessInfo.business_pincode || '',
            verificationStatus: 'pending',
            verifiedBy: null,
            verifiedAt: null,
            rejectionReason: null
          }
        })
      }

      // Create payment info if provided
      if (additionalData.paymentInfo) {
        await prisma.spaceOwnerPaymentInfo.create({
          data: {
            spaceOwnerId: spaceOwner.id,
            bankAccountNumber: additionalData.paymentInfo.bank_account_number || '',
            bankIfscCode: additionalData.paymentInfo.bank_ifsc_code || '',
            bankAccountHolderName: additionalData.paymentInfo.bank_account_holder_name || '',
            bankName: additionalData.paymentInfo.bank_name || '',
            upiId: additionalData.paymentInfo.upi_id || ''
          }
        })
      }

      // Send owner signup notification email
      try {
        const emailResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/email/owner-signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerName: `${additionalData.firstName || ''} ${additionalData.lastName || ''}`.trim(),
            ownerEmail: updatedUser.email,
            businessName: additionalData.businessInfo?.business_name || 'Business',
            onboardingStatus: 'pending'
          })
        })

        if (emailResponse.ok) {
          console.log('✅ Owner signup notification email sent')
        } else {
          console.log('⚠️ Failed to send owner signup notification email')
        }
      } catch (emailError) {
        console.error('❌ Error sending owner signup email:', emailError)
      }
    }

    // Generate JWT token
    const token = generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles,
      isActive: updatedUser.isActive
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roles: updatedUser.roles,
        isEmailVerified: updatedUser.isEmailVerified
      }
    })

  } catch (error) {
    console.error('❌ Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
