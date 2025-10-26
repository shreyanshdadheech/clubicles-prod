import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { NotificationService } from '@/lib/notification-service'

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
})

interface PaymentVerificationRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  amount: number
  currency: string
  plan?: 'premium'
  billing_cycle?: 'monthly' | 'yearly'
  booking_data?: {
    space_id: string
    user_id: string
    date: string
    dates: Array<{
      date: string
      start_time: string
      end_time: string
      seats: number
      booking_type: string
      professional_role: string
    }>
    start_time: string
    end_time: string
    seats: number
    booking_type: string
    total_amount: number
    space_name: string
    space_address: string
    price_per_hour: number
    price_per_day: number
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Verifying payment...')
    
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

    const body: PaymentVerificationRequest = await request.json()
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      amount, 
      currency, 
      plan, 
      billing_cycle,
      booking_data
    } = body

    // Set defaults for optional fields
    const planName = plan || 'premium'
    const billingCycle = billing_cycle || 'monthly'

    console.log('Payment verification data:', { 
      razorpay_order_id, 
      razorpay_payment_id, 
      amount, 
      plan: planName, 
      billing_cycle: billingCycle,
      isBooking: !!booking_data
    })

    // Check if this is a mock payment (development mode)
    if (razorpay_order_id.startsWith('mock_order_')) {
      console.log('🔧 Development mode: Processing mock payment')
      
      // Get space owner
      const spaceOwner = await prisma.spaceOwner.findFirst({
        where: { userId: decoded.id }
      })

      if (!spaceOwner) {
        return NextResponse.json(
          { error: 'Space owner not found' },
          { status: 404 }
        )
      }

      // Process mock payment
      const now = new Date()
      const expiryDate = new Date(now)
      
      if (billing_cycle === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      }

      // Update space owner to premium
      const updatedOwner = await prisma.spaceOwner.update({
        where: { id: spaceOwner.id },
        data: {
          premiumPlan: 'premium',
          planExpiryDate: expiryDate
        }
      })

      // Create subscription record
      const subscription = await prisma.spaceOwnerSubscription.upsert({
        where: { spaceOwnerId: spaceOwner.id },
        update: {
          planName: planName,
          billingCycle: billingCycle,
          status: 'active',
          startDate: now,
          expiryDate: expiryDate,
          autoRenew: true
        },
        create: {
          spaceOwnerId: spaceOwner.id,
          planName: planName,
          billingCycle: billingCycle,
          status: 'active',
          startDate: now,
          expiryDate: expiryDate,
          autoRenew: true
        }
      })

      // Record payment
      const paymentRecord = await prisma.spaceOwnerPaymentHistory.create({
        data: {
          spaceOwnerId: spaceOwner.id,
          subscriptionId: subscription.id,
          amount: amount,
          currency: currency,
          paymentMethod: 'razorpay',
          transactionId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          status: 'completed',
          paymentDate: now,
          description: `${plan} ${billing_cycle} subscription (Mock Payment)`
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Mock payment processed successfully',
        data: {
          subscription: {
            id: subscription.id,
            plan: subscription.planName,
            billingCycle: subscription.billingCycle,
            status: subscription.status,
            expiryDate: subscription.expiryDate
          },
          payment: {
            id: paymentRecord.id,
            amount: paymentRecord.amount,
            currency: paymentRecord.currency,
            transactionId: paymentRecord.transactionId,
            status: paymentRecord.status
          }
        }
      })
    }

    // Handle booking payments
    if (booking_data) {
      console.log('🔵 Processing booking payment verification...')
      
      try {
        // Extract amount and currency from booking data
        const bookingAmount = booking_data.total_amount
        const bookingCurrency = currency || 'INR'
        
        console.log('Booking payment details:', {
          amount: bookingAmount,
          currency: bookingCurrency,
          space_id: booking_data.space_id
        })
        
        // Verify the payment signature for real payments
        const body_signature = razorpay_order_id + "|" + razorpay_payment_id
        const expected_signature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
          .update(body_signature)
          .digest('hex')

        const is_authentic = expected_signature === razorpay_signature

        if (!is_authentic) {
          console.log('❌ Booking payment signature verification failed')
          return NextResponse.json(
            { 
              success: false, 
              error: 'Invalid payment signature',
              message: 'Payment verification failed. Please contact support if the payment was deducted from your account.'
            },
            { status: 400 }
          )
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id)
        console.log('✅ Payment details fetched:', payment.id)

        // Check if payment is already processed
        const existingBooking = await prisma.booking.findFirst({
          where: {
            paymentId: razorpay_payment_id
          }
        })

        if (existingBooking) {
          console.log('⚠️ Booking already exists for this payment')
          return NextResponse.json({
            success: true,
            message: 'Booking already processed',
            data: {
              booking: {
                id: existingBooking.id,
                status: existingBooking.status
              }
            }
          })
        }

        // Get tax configurations
        const taxConfigs = await prisma.taxConfiguration.findMany({
          where: { isEnabled: true },
          orderBy: { name: 'asc' }
        });

        // Get space owner to check premium payments status
        const space = await prisma.space.findUnique({
          where: { id: booking_data.space_id },
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            pricePerHour: true,
            pricePerDay: true,
            totalSeats: true,
            availableSeats: true,
            businessInfo: {
              include: {
                spaceOwner: true
              }
            }
          }
        });

        if (!space) {
          return NextResponse.json({
            success: false,
            error: 'Space not found'
          }, { status: 404 })
        }

        // Check if there are enough seats available
        if (space.availableSeats < booking_data.seats) {
          return NextResponse.json({
            success: false,
            error: `Not enough seats available. Only ${space.availableSeats} seats remaining.`
          }, { status: 400 })
        }

        const isPremiumPaymentsEnabled = space?.businessInfo?.spaceOwner?.premiumPaymentsEnabled || false;

        // Calculate taxes based on configuration
        let totalTaxAmount = 0;
        let platformCommission = 0;

        for (const taxConfig of taxConfigs) {
          let taxPercentage = Number(taxConfig.percentage);
          
          // Apply premium discount for platform fee
          if (taxConfig.name === 'Platform Fee' && isPremiumPaymentsEnabled) {
            taxPercentage = taxPercentage / 2; // 50% discount for premium payments enabled
          }
          
          const taxAmount = (bookingAmount * taxPercentage) / 100;
          totalTaxAmount += taxAmount;
          
          if (taxConfig.name === 'Platform Fee') {
            platformCommission = taxAmount;
          }
        }

        const ownerPayout = bookingAmount - totalTaxAmount;

        // Handle multiple dates or single date
        const datesToProcess = booking_data.dates && booking_data.dates.length > 0 
          ? booking_data.dates 
          : [{
              date: booking_data.date,
              start_time: booking_data.start_time,
              end_time: booking_data.end_time,
              seats: booking_data.seats,
              booking_type: booking_data.booking_type,
              professional_role: 'marketer' // Default role for single date
            }];

        console.log(`🔵 Processing ${datesToProcess.length} date(s) for booking`);

        // Debug space data
        console.log('🔍 Space data:', {
          id: space.id,
          name: space.name,
          price_per_hour: space.pricePerHour,
          price_per_day: space.pricePerDay,
          totalSeats: space.totalSeats,
          availableSeats: space.availableSeats
        });

        // Debug booking data
        console.log('🔍 Booking data:', {
          user_id: booking_data.user_id,
          space_id: booking_data.space_id,
          dates: datesToProcess,
          totalTaxAmount,
          platformCommission,
          price_per_hour: booking_data.price_per_hour,
          price_per_day: booking_data.price_per_day
        });

        // Validate user ID
        if (!booking_data.user_id) {
          throw new Error('User ID is required for booking creation');
        }

        // Create individual booking records for each date
        const createdBookings = [];
        let totalSeatsReduced = 0;

        for (const dateInfo of datesToProcess) {
          // Generate unique redemption code for each date
          const redemptionCode = `CLB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          
          // Calculate amount per booking (proportional to seats and duration)
          const isHourly = dateInfo.booking_type === 'hourly';
          const start = new Date(`2024-01-01 ${dateInfo.start_time}`);
          const end = new Date(`2024-01-01 ${dateInfo.end_time}`);
          const hours = isHourly ? Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60)) : 1;
          
          // Get rate with proper validation - use booking_data pricing instead of database
          const rate = isHourly ? (booking_data.price_per_hour || 0) : (booking_data.price_per_day || 0);
          if (rate <= 0) {
            throw new Error(`Invalid ${isHourly ? 'hourly' : 'daily'} rate for space: ${rate}`);
          }
          
          const bookingAmount = rate * dateInfo.seats * hours;
          console.log(`🔍 Booking calculation for ${dateInfo.date}:`, {
            isHourly,
            startTime: dateInfo.start_time,
            endTime: dateInfo.end_time,
            hours,
            rate,
            seats: dateInfo.seats,
            bookingAmount
          });
          
          // Calculate proportional tax and commission based on total booking amount
          const totalBookingAmount = datesToProcess.reduce((total, d) => {
            const dIsHourly = d.booking_type === 'hourly';
            const dStart = new Date(`2024-01-01 ${d.start_time}`);
            const dEnd = new Date(`2024-01-01 ${d.end_time}`);
            const dHours = dIsHourly ? Math.max(1, (dEnd.getTime() - dStart.getTime()) / (1000 * 60 * 60)) : 1;
            const dRate = dIsHourly ? (booking_data.price_per_hour || 0) : (booking_data.price_per_day || 0);
            return total + (dRate * d.seats * dHours);
          }, 0);
          
          const bookingTaxAmount = totalBookingAmount > 0 ? (bookingAmount / totalBookingAmount) * totalTaxAmount : 0;
          const bookingPlatformCommission = totalBookingAmount > 0 ? (bookingAmount / totalBookingAmount) * platformCommission : 0;
          const bookingOwnerPayout = bookingAmount - bookingTaxAmount - bookingPlatformCommission;
          
          console.log(`🔍 Final booking amounts for ${dateInfo.date}:`, {
            bookingAmount,
            bookingTaxAmount,
            bookingPlatformCommission,
            bookingOwnerPayout
          });

          // Create booking record for this date
          const booking = await prisma.booking.create({
            data: {
              spaceId: booking_data.space_id,
              userId: booking_data.user_id, // Use actual user ID, not 'guest'
              date: new Date(dateInfo.date),
              startTime: dateInfo.start_time,
              endTime: dateInfo.end_time,
              seatsBooked: dateInfo.seats,
              baseAmount: bookingAmount,
              totalAmount: bookingAmount,
              taxAmount: bookingTaxAmount,
              ownerPayout: bookingOwnerPayout,
              platformCommission: bookingPlatformCommission,
              status: 'confirmed',
              paymentId: razorpay_payment_id,
              redemptionCode: redemptionCode,
              roles: [dateInfo.professional_role] as any // Store as array
            }
          });

          createdBookings.push(booking);
          totalSeatsReduced += dateInfo.seats;

          console.log(`✅ Created booking ${booking.id} for date ${dateInfo.date} with redemption code ${redemptionCode}`);
        }

        // Reduce available seats for the space (total for all bookings)
        await prisma.space.update({
          where: { id: booking_data.space_id },
          data: {
            availableSeats: {
              decrement: totalSeatsReduced
            }
          }
        });

        console.log(`✅ Reduced ${totalSeatsReduced} seats for space ${booking_data.space_id}`);

        // Record payment in booking payment table (one record for all bookings)
        await prisma.bookingPayment.create({
          data: {
            bookingId: createdBookings[0].id, // Reference to first booking
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            amount: bookingAmount,
            currency: bookingCurrency,
            status: 'completed',
            gatewayResponse: payment as any
          }
        });

        // Update business balance for the space owner
        try {
          const businessInfo = space.businessInfo;
          if (businessInfo) {
            await prisma.businessBalance.upsert({
              where: { businessId: businessInfo.id },
              update: {
                currentBalance: {
                  increment: ownerPayout
                },
                totalEarned: {
                  increment: ownerPayout
                },
                pendingAmount: {
                  increment: ownerPayout
                },
                commissionDeducted: {
                  increment: platformCommission
                },
                taxDeducted: {
                  increment: totalTaxAmount
                }
              },
              create: {
                businessId: businessInfo.id,
                currentBalance: ownerPayout,
                totalEarned: ownerPayout,
                totalWithdrawn: 0,
                pendingAmount: ownerPayout,
                commissionDeducted: platformCommission,
                taxDeducted: totalTaxAmount
              }
            })
            console.log(`✅ Updated business balance for space owner: ${ownerPayout}`)
          }
        } catch (balanceError) {
          console.error('❌ Error updating business balance:', balanceError)
          // Don't fail the booking if balance update fails
        }

        // Note: VIBGYOR tracking is now handled only when bookings are redeemed
        // This ensures only redeemed professional roles are counted in analytics
        console.log('📊 VIBGYOR tracking will be updated when bookings are redeemed');

        console.log('✅ Bookings created successfully:', createdBookings.map(b => b.id).join(', '))

        // Fetch user data for email
        const user = await prisma.user.findUnique({
          where: { id: booking_data.user_id },
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        })

        // Send booking confirmation email for each booking
        try {
          for (const booking of createdBookings) {
            const emailResponse = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/email/booking-confirmation`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userName: user ? (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email) : 'Guest User',
                userEmail: user?.email || 'guest@clubicles.com',
                spaceName: space?.name || 'Unknown Space',
                spaceAddress: space ? `${space.address}, ${space.city}` : 'Unknown Location',
                bookingDate: booking.date.toLocaleDateString(),
                startTime: booking.startTime,
                endTime: booking.endTime,
                duration: `${Math.max(1, (new Date(`2000-01-01 ${booking.endTime}`).getTime() - new Date(`2000-01-01 ${booking.startTime}`).getTime()) / (1000 * 60 * 60))} hours`,
                totalAmount: Number(booking.totalAmount),
                redemptionCode: booking.redemptionCode,
                spaceOwnerName: space?.businessInfo?.spaceOwner?.firstName ? `${space.businessInfo.spaceOwner.firstName} ${space.businessInfo.spaceOwner.lastName || ''}`.trim() : space?.businessInfo?.spaceOwner?.email || 'Space Owner',
                spaceOwnerEmail: space?.businessInfo?.spaceOwner?.email || ''
              })
            });

            if (emailResponse.ok) {
              console.log(`✅ Booking confirmation email sent for booking ${booking.id}`);
            } else {
              console.log(`⚠️ Failed to send booking confirmation email for booking ${booking.id}`);
            }
          }
        } catch (emailError) {
          console.error('❌ Error sending booking confirmation email:', emailError);
          // Don't fail the booking if email fails
        }

        // Send notification to space owner
        try {
          const spaceOwner = await prisma.spaceOwner.findFirst({
            where: { 
              businessInfo: {
                spaces: {
                  some: { id: booking_data.space_id }
                }
              }
            },
            include: { user: true }
          })

          if (spaceOwner) {
            // Send notification for each booking
            for (const booking of createdBookings) {
              await NotificationService.sendBookingNotification({
                ownerId: spaceOwner.userId,
                spaceName: space?.name || 'Unknown Space',
                customerName: user ? (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email) : 'Guest User',
                customerEmail: user?.email || 'guest@clubicles.com',
                bookingDate: booking.date.toLocaleDateString(),
                bookingTime: `${booking.startTime} - ${booking.endTime}`,
                totalAmount: Number(booking.totalAmount),
                bookingId: booking.id,
                status: 'confirmed'
              });
            }
            console.log(`✅ Booking notifications sent to space owner for ${createdBookings.length} bookings`);
          }
        } catch (notificationError) {
          console.error('❌ Error sending booking notification:', notificationError)
          // Don't fail the booking if notification fails
        }

        return NextResponse.json({
          success: true,
          message: 'Booking payment verified successfully',
          bookings: createdBookings.map(booking => ({
            id: booking.id,
            space_name: space?.name || 'Unknown Space',
            space_location: space ? `${space.address}, ${space.city}` : 'Unknown Location',
            booking_date: booking.date.toISOString(),
            start_time: booking.startTime,
            end_time: booking.endTime,
            duration: Math.max(1, (new Date(`2000-01-01 ${booking.endTime}`).getTime() - new Date(`2000-01-01 ${booking.startTime}`).getTime()) / (1000 * 60 * 60)),
            amount: Number(booking.totalAmount),
            status: booking.status,
            redemption_code: booking.redemptionCode,
             professional_role: Array.isArray(booking.roles) && booking.roles.length > 0 ? booking.roles[0] : 'marketer',
            created_at: booking.createdAt.toISOString()
          })),
          total_amount: bookingAmount,
          total_bookings: createdBookings.length,
          redemption_info: {
            codes: createdBookings.map(b => b.redemptionCode),
            primary_code: createdBookings[0]?.redemptionCode
          }
        })

      } catch (error: any) {
        console.error('❌ Booking payment verification failed:', error)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Booking payment verification failed',
            message: 'Unable to verify booking payment. Please contact support if the payment was deducted from your account.'
          },
          { status: 500 }
        )
      }
    }

    // Verify the payment signature for real payments (subscription payments)
    const body_signature = razorpay_order_id + "|" + razorpay_payment_id
    const expected_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
      .update(body_signature)
      .digest('hex')

    const is_authentic = expected_signature === razorpay_signature

    if (!is_authentic) {
      console.log('❌ Payment signature verification failed')
      console.log('Expected:', expected_signature)
      console.log('Received:', razorpay_signature)
      
      // Record failed payment attempt
      await recordPaymentAttempt(decoded.id, {
        razorpay_order_id,
        razorpay_payment_id,
        amount,
        currency,
        plan: planName,
        billing_cycle: billingCycle,
        status: 'failed',
        error: 'Invalid signature'
      })

      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment verification failed',
          message: 'Invalid payment signature. Please contact support if payment was deducted.'
        },
        { status: 400 }
      )
    }

    // Verify payment with Razorpay
    try {
      console.log('🔍 Fetching payment from Razorpay...')
      console.log('Payment ID:', razorpay_payment_id)
      console.log('Razorpay credentials check:', {
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Set' : 'Not set',
        keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set'
      })
      
      const payment = await razorpay.payments.fetch(razorpay_payment_id)
      console.log('✅ Payment fetched successfully:', {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency
      })
      
      if (payment.status !== 'captured') {
        console.log('❌ Payment not captured:', payment.status)
        
        // Record failed payment
        await recordPaymentAttempt(decoded.id, {
          razorpay_order_id,
          razorpay_payment_id,
          amount,
          currency,
          plan: planName,
          billing_cycle: billingCycle,
          status: 'failed',
          error: `Payment status: ${payment.status}`
        })

        return NextResponse.json(
          { 
            success: false, 
            error: 'Payment not captured',
            message: 'Payment was not successfully captured'
          },
          { status: 400 }
        )
      }

      console.log('✅ Payment verified successfully')

      // Get space owner
      const spaceOwner = await prisma.spaceOwner.findFirst({
        where: { userId: decoded.id }
      })

      if (!spaceOwner) {
        return NextResponse.json(
          { error: 'Space owner not found' },
          { status: 404 }
        )
      }

      // Check if this payment has already been processed
      const existingPayment = await prisma.spaceOwnerPaymentHistory.findFirst({
        where: {
          transactionId: razorpay_payment_id,
          status: 'completed'
        }
      })

      if (existingPayment) {
        console.log('⚠️ Payment already processed:', razorpay_payment_id)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Payment already processed',
            message: 'This payment has already been processed successfully.'
          },
          { status: 400 }
        )
      }

      // Calculate subscription dates
      const now = new Date()
      const expiryDate = new Date(now)
      
      if (billing_cycle === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1)
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      }

      // Start transaction to update multiple tables
      const result = await prisma.$transaction(async (tx: any) => {
        // Update space owner to premium
        const updatedOwner = await tx.spaceOwner.update({
          where: { id: spaceOwner.id },
          data: {
            premiumPlan: 'premium',
            planExpiryDate: expiryDate
          }
        })

        // Create or update subscription
        const subscription = await tx.spaceOwnerSubscription.upsert({
          where: { spaceOwnerId: spaceOwner.id },
          update: {
            planName: planName,
            billingCycle: billingCycle,
            status: 'active',
            startDate: now,
            expiryDate: expiryDate,
            autoRenew: true
          },
          create: {
            spaceOwnerId: spaceOwner.id,
            planName: planName,
            billingCycle: billingCycle,
            status: 'active',
            startDate: now,
            expiryDate: expiryDate,
            autoRenew: true
          }
        })

        // Record successful payment
        const paymentRecord = await tx.spaceOwnerPaymentHistory.create({
          data: {
            spaceOwnerId: spaceOwner.id,
            subscriptionId: subscription.id,
            amount: amount,
            currency: currency,
            paymentMethod: 'razorpay',
            transactionId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
            status: 'completed',
            paymentDate: now,
            description: `${plan} ${billing_cycle} subscription`
          }
        })

        // Ensure business info exists
        let businessInfo = await tx.spaceOwnerBusinessInfo.findFirst({
          where: { spaceOwnerId: spaceOwner.id }
        })

        if (!businessInfo) {
          // Create business info if it doesn't exist
          businessInfo = await tx.spaceOwnerBusinessInfo.create({
            data: {
              spaceOwnerId: spaceOwner.id,
              businessName: spaceOwner.firstName + ' ' + spaceOwner.lastName + ' Business',
              businessType: 'Space Rental',
              gstNumber: '',
              panNumber: '',
              address: '',
              city: '',
              state: '',
              pincode: '',
              phone: spaceOwner.phone || '',
              email: spaceOwner.email
            }
          })
        }

        // Update business balance using correct business ID
        await tx.businessBalance.upsert({
          where: { businessId: businessInfo.id },
          update: {
            totalEarned: {
              increment: amount
            }
          },
          create: {
            businessId: businessInfo.id,
            currentBalance: 0,
            totalEarned: amount,
            totalWithdrawn: 0,
            pendingAmount: 0,
            commissionDeducted: 0,
            taxDeducted: 0
          }
        })

        return {
          owner: updatedOwner,
          subscription,
          payment: paymentRecord
        }
      })

      console.log('✅ Payment processed and recorded successfully')

      return NextResponse.json({
        success: true,
        message: 'Payment verified and subscription activated successfully',
        data: {
          subscription: {
            id: result.subscription.id,
            plan: result.subscription.planName,
            billingCycle: result.subscription.billingCycle,
            status: result.subscription.status,
            expiryDate: result.subscription.expiryDate
          },
          payment: {
            id: result.payment.id,
            amount: result.payment.amount,
            currency: result.payment.currency,
            transactionId: result.payment.transactionId,
            status: result.payment.status
          }
        }
      })

    } catch (razorpayError: any) {
      console.error('❌ Razorpay verification error:', razorpayError)
      console.error('Error details:', {
        message: razorpayError.message,
        statusCode: razorpayError.statusCode,
        error: razorpayError.error
      })
      
      // Record failed payment
      await recordPaymentAttempt(decoded.id, {
        razorpay_order_id,
        razorpay_payment_id,
        amount,
        currency,
        plan: planName,
        billing_cycle: billingCycle,
        status: 'failed',
        error: `Razorpay verification failed: ${razorpayError.message}`
      })

      let errorMessage = 'Unable to verify payment with Razorpay'
      if (razorpayError.statusCode === 401) {
        errorMessage = 'Payment verification failed due to authentication error. Please contact support.'
      } else if (razorpayError.statusCode === 404) {
        errorMessage = 'Payment not found. Please contact support if payment was deducted.'
      } else if (razorpayError.message) {
        errorMessage = `Payment verification failed: ${razorpayError.message}`
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment verification failed',
          message: errorMessage
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Payment verification failed. Please try again.'
      },
      { status: 500 }
    )
  }
}

// Helper function to record payment attempts (both successful and failed)
async function recordPaymentAttempt(
  userId: string, 
  paymentData: {
    razorpay_order_id: string
    razorpay_payment_id: string
    amount: number
    currency: string
    plan: string
    billing_cycle: string
    status: 'success' | 'failed'
    error?: string
  }
) {
  try {
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: { userId }
    })

    if (spaceOwner) {
      await prisma.spaceOwnerPaymentHistory.create({
        data: {
          spaceOwnerId: spaceOwner.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          paymentMethod: 'razorpay',
          transactionId: paymentData.razorpay_payment_id,
          razorpayOrderId: paymentData.razorpay_order_id,
          status: paymentData.status === 'success' ? 'completed' : 'failed',
          paymentDate: new Date(),
          description: `${paymentData.plan} ${paymentData.billing_cycle} subscription${paymentData.error ? ` - ${paymentData.error}` : ''}`
        }
      })
    }
  } catch (error) {
    console.error('Error recording payment attempt:', error)
  }
}
