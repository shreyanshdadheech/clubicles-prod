import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

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
      },
      include: {
        businessInfo: true,
        paymentInfo: true
      }
    });

    console.log('🔍 Space owner lookup:', {
      userId: decoded.id,
      spaceOwnerFound: !!spaceOwner,
      spaceOwnerId: spaceOwner?.id
    });

    if (!spaceOwner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 });
    }

    // Get business balance
    const businessInfo = await prisma.spaceOwnerBusinessInfo.findFirst({
      where: { spaceOwnerId: spaceOwner.id }
    });
    
    const businessBalance = businessInfo ? await prisma.businessBalance.findFirst({
      where: { businessId: businessInfo.id }
    }) : null;

    // Get all spaces for this owner
    const spaces = await prisma.space.findMany({
      where: {
        businessInfo: {
          spaceOwnerId: spaceOwner.id
        }
      },
      include: {
        bookings: {
          where: {
            status: { in: ['confirmed', 'completed'] }
          },
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log('🔍 Spaces query result:', {
      spacesCount: spaces.length,
      spaces: spaces.map(space => ({
        id: space.id,
        name: space.name,
        businessId: space.businessId,
        bookingsCount: space.bookings.length
      }))
    });

    // Get all bookings for analytics
    const allBookings = await prisma.booking.findMany({
      where: {
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
        }
        },
        status: { in: ['confirmed', 'completed'] }
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

    // Calculate analytics data
    const completedBookings = allBookings.filter((booking: any) => booking.status === 'completed');
    // Use all confirmed/completed bookings for revenue calculation (gross revenue before deductions)
    const totalRevenue = allBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0);
    const totalBookings = allBookings.length;
    
    // Get tax configurations
    const taxConfigs = await prisma.taxConfiguration.findMany({
      where: { isEnabled: true },
      orderBy: { name: 'asc' }
    });

    // Check if owner has premium payments enabled
    const isPremiumPaymentsEnabled = spaceOwner.premiumPaymentsEnabled;

    // Calculate taxes based on configuration
    let totalTaxCollected = 0;
    let totalPlatformCommission = 0;

    for (const booking of completedBookings) {
      const bookingAmount = Number(booking.totalAmount);
      
      for (const taxConfig of taxConfigs) {
        let taxPercentage = Number(taxConfig.percentage);
        
        // Apply premium discount for platform fee
        if (taxConfig.name === 'Platform Fee' && isPremiumPaymentsEnabled) {
          taxPercentage = taxPercentage / 2; // 50% discount for premium payments enabled
        }
        
        const taxAmount = (bookingAmount * taxPercentage) / 100;
        totalTaxCollected += taxAmount;
        
        if (taxConfig.name === 'Platform Fee') {
          totalPlatformCommission += taxAmount;
        }
      }
    }
    
    // Check if there are any payouts
    const payouts = businessInfo ? await prisma.payout.findMany({
      where: { businessId: businessInfo.id },
      select: { amount: true, status: true }
    }) : [];
    
    const totalPayouts = payouts
      .filter((payout: any) => payout.status === 'completed')
      .reduce((sum: number, payout: any) => sum + Number(payout.amount), 0);
    
    // Calculate current balance
    let currentBalance = Number(businessBalance?.currentBalance || 0);
    
    // If no payouts have been made, show revenue minus tax as balance
    if (totalPayouts === 0 && totalRevenue > 0) {
      currentBalance = totalRevenue - totalTaxCollected - totalPlatformCommission;
    }

    // Calculate occupancy rate
    const totalCapacity = spaces.reduce((sum: number, space: any) => sum + space.totalSeats, 0);
    const totalSeatsBooked = allBookings.reduce((sum: number, booking: any) => sum + booking.seatsBooked, 0);
    const occupancyRate = totalCapacity > 0 ? Math.min(100, (totalSeatsBooked / totalCapacity) * 100) : 0;

    // Calculate average booking duration
    const avgDuration = allBookings.length > 0 
      ? allBookings.reduce((sum: number, booking: any) => {
          const start = new Date(`2000-01-01 ${booking.startTime}`);
          const end = new Date(`2000-01-01 ${booking.endTime}`);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
        }, 0) / allBookings.length
      : 0;

    // Calculate peak hours
    const hourCounts: { [key: string]: number } = {};
    allBookings.forEach((booking: any) => {
      const hour = booking.startTime.split(':')[0];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const peakHour = Object.keys(hourCounts).length > 0 
      ? Object.keys(hourCounts).reduce((a, b) => 
          hourCounts[a] > hourCounts[b] ? a : b
        )
      : '09';

    // Calculate monthly revenue for last 6 months
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthBookings = completedBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      const monthRevenue = monthBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0);
      monthlyRevenue.push(monthRevenue);
    }

    // Calculate recent trends
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthBookings = completedBookings.filter((booking: any) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= lastMonth && bookingDate <= lastMonthEnd;
    });
    
    const lastMonthRevenue = lastMonthBookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0);
    const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Transform recent bookings for display (only first 5)
    const transformedRecentBookings = allBookings.slice(0, 5).map((booking: any) => ({
      id: booking.id,
      spaceName: booking.space?.name || 'Unknown Space',
      customerName: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Unknown Customer',
      customerEmail: booking.user?.email || 'Unknown Email',
      date: booking.date.toISOString().split('T')[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      amount: Number(booking.totalAmount),
      status: booking.status,
      seatsBooked: booking.seatsBooked,
      createdAt: booking.createdAt.toISOString()
    }));

    // Transform spaces for display
    const transformedSpaces = spaces.map((space: any) => ({
      id: space.id,
      name: space.name,
      address: space.address,
      city: space.city,
      location: `${space.city}, India`, // Add location property for frontend compatibility
      fullAddress: space.address,
      companyName: space.companyName || 'Space Company',
      contactNumber: space.contactNumber || '',
      pincode: space.pincode || '',
      latitude: space.latitude || 0,
      longitude: space.longitude || 0,
      totalSeats: space.totalSeats,
      total_seats: space.totalSeats,
      available_seats: space.availableSeats || space.totalSeats,
      hourlyRate: Number(space.pricePerHour || 0),
      dailyRate: Number(space.pricePerDay || 0),
      pricePerHour: Number(space.pricePerHour || 0),
      pricePerDay: Number(space.pricePerDay || 0),
      rating: space.rating || 0,
      status: 'approved', // Default status since it's not in schema
      category: 'Coworking Space', // Default category
      images: space.images || [],
      amenities: space.amenities || [],
      bookingsCount: space.bookings.length,
      totalBookings: space.bookings.length,
      revenue: space.bookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0),
      createdAt: space.createdAt.toISOString()
    }));

    const dashboardData = {
      owner: {
        id: spaceOwner.id,
        userId: spaceOwner.userId,
        email: spaceOwner.email,
        firstName: spaceOwner.firstName || '',
        lastName: spaceOwner.lastName || '',
        phone: spaceOwner.phone || '',
        membershipType: 'basic', // Default to basic
        premiumPlan: 'basic', // Default to basic
        isVerified: spaceOwner.approvalStatus === 'approved',
        createdAt: spaceOwner.createdAt.toISOString()
      },
      businessInfo: businessInfo ? {
        id: businessInfo.id,
        businessName: businessInfo.businessName,
        businessType: businessInfo.businessType,
        gstNumber: businessInfo.gstNumber,
        panNumber: businessInfo.panNumber,
        address: businessInfo.businessAddress,
        city: businessInfo.businessCity,
        state: businessInfo.businessState,
        pincode: businessInfo.businessPincode,
        membershipType: 'basic', // Default to basic
        isVerified: businessInfo.verificationStatus === 'verified',
        createdAt: businessInfo.createdAt.toISOString()
      } : null,
      spaces: transformedSpaces,
      recentBookings: transformedRecentBookings,
      analytics: {
        totalRevenue,
        totalTaxCollected,
        totalPlatformCommission,
        totalPayouts,
        totalBookings,
        completedBookings: completedBookings.length,
        currentBalance,
        occupancyRate: Math.round(occupancyRate),
        averageBookingDuration: Math.round(avgDuration * 10) / 10,
        peakHours: {
          start: `${peakHour}:00`,
          end: `${parseInt(peakHour) + 2}:00`
        },
        monthlyRevenue,
        recentTrends: {
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          bookingGrowth: 0
        },
        totalCapacity,
        totalSeatsBooked,
        spacesCount: spaces.length,
        // Additional analytics data
        activeSpaces: spaces.length,
        totalEarned: totalRevenue - totalTaxCollected - totalPlatformCommission,
        pendingAmount: Number(businessBalance?.pendingAmount || 0)
      },
      businessBalance: businessBalance ? {
        currentBalance: Number(businessBalance.currentBalance),
        totalEarned: Number(businessBalance.totalEarned),
        totalWithdrawn: Number(businessBalance.totalWithdrawn),
        pendingAmount: Number(businessBalance.pendingAmount),
        commissionDeducted: Number(businessBalance.commissionDeducted),
        taxDeducted: Number(businessBalance.taxDeducted),
        lastPayoutDate: businessBalance.lastPayoutDate?.toISOString() || null,
        createdAt: businessBalance.createdAt.toISOString(),
        updatedAt: businessBalance.updatedAt.toISOString()
      } : null,
      paymentInfo: spaceOwner.paymentInfo ? {
        id: spaceOwner.paymentInfo.id,
        bankAccountNumber: spaceOwner.paymentInfo.bankAccountNumber,
        bankIfscCode: spaceOwner.paymentInfo.bankIfscCode,
        bankAccountHolderName: spaceOwner.paymentInfo.bankAccountHolderName,
        bankName: spaceOwner.paymentInfo.bankName,
        upiId: spaceOwner.paymentInfo.upiId,
        createdAt: spaceOwner.paymentInfo.createdAt.toISOString(),
        updatedAt: spaceOwner.paymentInfo.updatedAt.toISOString()
      } : null
    };

    console.log('✅ Owner dashboard data calculated:', {
      totalRevenue,
      totalTaxCollected,
      totalPlatformCommission,
      totalPayouts,
      currentBalance,
      totalBookings,
      completedBookings: completedBookings.length,
      occupancyRate: Math.round(occupancyRate),
      totalCapacity,
      totalSeatsBooked,
      spacesCount: spaces.length,
      monthlyRevenue
    });

    console.log('🔍 Spaces data for debugging:', {
      spacesCount: spaces.length,
      spacesData: spaces.map(space => ({
        id: space.id,
        name: space.name,
        bookingsCount: space.bookings.length,
        totalBookings: space.bookings.length,
        revenue: space.bookings.reduce((sum: number, booking: any) => sum + Number(booking.totalAmount), 0),
        bookings: space.bookings.map(booking => ({
          id: booking.id,
          totalAmount: booking.totalAmount,
          status: booking.status
        }))
      }))
    });

    console.log('🔍 Raw spaces data from database:', spaces.map(space => ({
      id: space.id,
      name: space.name,
      bookings: space.bookings,
      totalSeats: space.totalSeats
    })));

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error: any) {
    console.error('Error fetching owner dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}