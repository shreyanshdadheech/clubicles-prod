import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, 'your-super-secret-jwt-key-change-this-in-production') as any;
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: {
        userId: decoded.id
      }
    });

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 });
    }

    // Get business info
    const businessInfo = await prisma.spaceOwnerBusinessInfo.findFirst({
      where: { spaceOwnerId: spaceOwner.id }
    });
    
    if (!businessInfo) {
      return NextResponse.json({ error: 'Business info not found' }, { status: 404 });
    }

    // Get business balance
    const businessBalance = await prisma.businessBalance.findFirst({
      where: { businessId: businessInfo.id }
    });

    // Get all completed bookings for this owner
    const completedBookings = await prisma.booking.findMany({
      where: {
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
          }
        },
        status: 'completed',
        isRedeemed: true
      },
      include: {
        space: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all bookings (including non-completed) for total count
    const allBookings = await prisma.booking.findMany({
      where: {
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
          }
        }
      },
      select: {
        id: true,
        totalAmount: true,
        taxAmount: true,
        platformCommission: true,
        ownerPayout: true,
        status: true,
        isRedeemed: true,
        createdAt: true,
        date: true
      }
    });

    // Get tax configurations
    const taxConfigs = await prisma.taxConfiguration.findMany({
      where: { isEnabled: true },
      orderBy: { name: 'asc' }
    });

    // Check if owner has premium payments enabled
    const isPremiumPaymentsEnabled = spaceOwner.premiumPaymentsEnabled;

    // Calculate financial metrics
    const totalRevenue = completedBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0);
    
    // Calculate taxes based on configuration
    let totalTaxCollected = 0;
    let totalPlatformCommission = 0;
    let totalGST = 0;
    let totalPaymentGatewayFee = 0;
    let totalPlatformFee = 0;

    for (const booking of completedBookings) {
      const bookingAmount = Number(booking.totalAmount);
      
      for (const taxConfig of taxConfigs) {
        let taxPercentage = Number(taxConfig.percentage);
        
        // Apply premium discount for platform fee
        if (taxConfig.name === 'Platform Fee' && isPremiumPaymentsEnabled) {
          taxPercentage = taxPercentage / 2; // 50% discount for premium payments enabled
        }
        
        const taxAmount = (bookingAmount * taxPercentage) / 100;
        
        switch (taxConfig.name) {
          case 'GST':
            totalGST += taxAmount;
            totalTaxCollected += taxAmount;
            break;
          case 'Payment Gateway Fee':
            totalPaymentGatewayFee += taxAmount;
            totalTaxCollected += taxAmount;
            break;
          case 'Platform Fee':
            totalPlatformFee += taxAmount;
            totalPlatformCommission += taxAmount;
            totalTaxCollected += taxAmount;
            break;
        }
      }
    }

    const totalOwnerPayout = totalRevenue - totalTaxCollected;
    
    // Calculate net profit (revenue - all taxes and fees)
    const netProfit = totalRevenue - totalTaxCollected;
    
    // Calculate effective tax rate
    const effectiveTaxRate = totalRevenue > 0 ? (totalTaxCollected / totalRevenue) * 100 : 0;
    
    // Calculate average payout per booking
    const averagePayoutPerBooking = completedBookings.length > 0 ? totalOwnerPayout / completedBookings.length : 0;

    // Get payouts
    const payouts = await prisma.payout.findMany({
      where: { businessId: businessInfo.id },
      select: { 
        amount: true, 
        status: true, 
        createdAt: true,
        processedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalPayouts = payouts
      .filter((payout: any) => payout.status === 'completed')
      .reduce((sum: number, payout: any) => sum + Number(payout.amount), 0);

    const pendingPayouts = payouts
      .filter((payout: any) => payout.status === 'pending')
      .reduce((sum: number, payout: any) => sum + Number(payout.amount), 0);

    // Calculate monthly revenue for growth calculation
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
    
    const lastMonthBookings = completedBookings.filter((booking: any) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= lastMonth && bookingDate <= lastMonthEnd;
    });
    
    const lastMonthRevenue = lastMonthBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0);
    const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Calculate tax breakdown from configurations
    const taxBreakdown = taxConfigs.map(config => {
      let rate = Number(config.percentage);
      
      // Apply premium discount for platform fee
      if (config.name === 'Platform Fee' && isPremiumPaymentsEnabled) {
        rate = rate / 2;
      }
      
      let amount = 0;
      switch (config.name) {
        case 'GST':
          amount = totalGST;
          break;
        case 'Payment Gateway Fee':
          amount = totalPaymentGatewayFee;
          break;
        case 'Platform Fee':
          amount = totalPlatformFee;
          break;
        default:
          amount = (totalRevenue * rate) / 100;
      }
      
      return {
        name: config.name,
        rate: rate,
        amount: amount,
        percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
        description: config.description || `${rate}% of revenue`
      };
    });

    const totalTaxDeducted = totalTaxCollected;

    // Create or update pending payout
    await createOrUpdatePendingPayout(businessInfo.id, totalOwnerPayout, completedBookings);

    // Get recent bookings for display
    const recentBookings = completedBookings.slice(0, 10).map((booking: any) => ({
      id: booking.id,
      bookingReference: booking.redemptionCode || `#${booking.id.slice(-6)}`,
      spaceName: booking.space?.name || 'Unknown Space',
      customerName: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Unknown Customer',
      date: booking.date.toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      baseAmount: Number(booking.baseAmount),
      totalAmount: Number(booking.totalAmount),
      taxAmount: Number(booking.taxAmount || 0),
      ownerPayout: Number(booking.ownerPayout || 0),
      status: booking.status,
      isRedeemed: booking.isRedeemed,
      createdAt: booking.createdAt.toISOString()
    }));

    // Get current year bookings count
    const currentYear = new Date().getFullYear();
    const currentYearBookings = allBookings.filter((booking: any) => {
      const bookingYear = new Date(booking.createdAt).getFullYear();
      return bookingYear === currentYear;
    });

    // Calculate next payout date (15th of next month)
    const nextPayoutDate = new Date();
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
    nextPayoutDate.setDate(15);

    const revenueData = {
      financialOverview: {
        lastUpdated: new Date().toISOString(),
        totalRevenue: {
          amount: totalRevenue,
          growth: Math.round(revenueGrowth * 10) / 10,
          growthText: `${revenueGrowth >= 0 ? '+' : ''}${Math.round(revenueGrowth * 10) / 10}% from last month`
        },
        taxDeducted: {
          amount: totalTaxCollected,
          effectiveRate: Math.round(effectiveTaxRate * 10) / 10,
          effectiveRateText: `${Math.round(effectiveTaxRate * 10) / 10}% effective rate`
        },
        netProfit: {
          amount: netProfit,
          description: 'After all taxes & fees'
        },
        pendingPayout: {
          amount: pendingPayouts,
          nextPayoutDate: nextPayoutDate.toISOString().split('T')[0],
          nextPayoutText: `Will be paid on ${nextPayoutDate.getDate()}th`
        },
        averagePayoutPerBooking: {
          amount: averagePayoutPerBooking,
          description: 'After taxes & fees'
        },
        totalBookings: {
          count: currentYearBookings.length,
          period: 'This year'
        }
      },
      taxBreakdown: taxBreakdown,
      totalTaxDeducted: {
        amount: totalTaxDeducted,
        effectiveRate: totalRevenue > 0 ? (totalTaxDeducted / totalRevenue) * 100 : 0,
        description: 'All taxes combined'
      },
      recentBookings: recentBookings,
      summary: {
        totalRevenue,
        totalTaxCollected,
        totalPlatformCommission,
        totalOwnerPayout,
        netProfit,
        effectiveTaxRate,
        averagePayoutPerBooking,
        totalPayouts,
        pendingPayouts,
        totalBookings: allBookings.length,
        completedBookings: completedBookings.length,
        currentYearBookings: currentYearBookings.length
      }
    };

    console.log('✅ Revenue data calculated:', {
      totalRevenue,
      totalTaxCollected,
      totalPlatformCommission,
      netProfit,
      effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
      averagePayoutPerBooking: Math.round(averagePayoutPerBooking * 100) / 100,
      totalBookings: allBookings.length,
      completedBookings: completedBookings.length,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10
    });

    return NextResponse.json({
      success: true,
      data: revenueData
    });

  } catch (error: any) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to create or update pending payout
async function createOrUpdatePendingPayout(businessId: string, totalOwnerPayout: number, completedBookings: any[]) {
  try {
    if (totalOwnerPayout <= 0) return;

    // Get the latest booking date
    const latestBookingDate = completedBookings.length > 0 
      ? new Date(Math.max(...completedBookings.map(b => new Date(b.date).getTime())))
      : new Date();

    // Check if there's an existing pending payout
    const existingPayout = await prisma.payout.findFirst({
      where: {
        businessId: businessId,
        status: 'pending'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // If no existing payout or existing payout is older than latest booking, create/update
    if (!existingPayout || new Date(existingPayout.createdAt) < latestBookingDate) {
      if (existingPayout) {
        // Update existing payout
        await prisma.payout.update({
          where: { id: existingPayout.id },
          data: {
            amount: totalOwnerPayout,
            updatedAt: new Date()
          }
        });
        console.log(`✅ Updated pending payout: ₹${totalOwnerPayout}`);
      } else {
        // Create new payout
        await prisma.payout.create({
          data: {
            businessId: businessId,
            amount: totalOwnerPayout,
            status: 'pending',
            payoutMethod: 'bank_transfer',
            notes: `Automatic payout for completed bookings up to ${latestBookingDate.toISOString().split('T')[0]}`
          }
        });
        console.log(`✅ Created new pending payout: ₹${totalOwnerPayout}`);
      }
    }
  } catch (error) {
    console.error('❌ Error managing pending payout:', error);
  }
}
