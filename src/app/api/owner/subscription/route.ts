import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the token
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the space owner
    const owner = await prisma.spaceOwner.findFirst({
      where: {
        userId: decoded.id
      }
    });

    if (!owner) {
      return NextResponse.json({ error: 'Space owner not found' }, { status: 404 });
    }

    // Get current subscription from database
    const subscription = await prisma.spaceOwnerSubscription.findFirst({
      where: { spaceOwnerId: owner.id }
    })

    // Get payment history
    const paymentHistory = await prisma.spaceOwnerPaymentHistory.findMany({
      where: { spaceOwnerId: owner.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const currentDate = new Date();
    const currentPlan = owner.premiumPlan || 'basic';
    const isExpired = subscription ? new Date(subscription.expiryDate) < currentDate : false;
    const daysUntilExpiry = subscription ? Math.ceil((new Date(subscription.expiryDate).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) : null;

    const subscriptionInfo = {
      owner: {
        id: owner.id,
        email: owner.email,
        firstName: owner.firstName,
        lastName: owner.lastName,
        approvalStatus: owner.approvalStatus
      },
      currentPlan: currentPlan,
      subscription: subscription ? {
        id: subscription.id,
        planName: subscription.planName,
        billingCycle: subscription.billingCycle,
        status: subscription.status,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        autoRenew: subscription.autoRenew
      } : null,
      isExpired,
      daysUntilExpiry,
      paymentHistory: paymentHistory.map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        description: payment.description,
        paymentDate: payment.paymentDate,
        createdAt: payment.createdAt
      })),
      canUpgrade: currentPlan === 'basic',
      features: {
        maxSpaces: currentPlan === 'premium' ? Infinity : 5,
        hasAdvancedAnalytics: currentPlan === 'premium',
        hasPrioritySupport: currentPlan === 'premium',
        hasMultiLocationDashboard: currentPlan === 'premium',
        hasSmsNotifications: currentPlan === 'premium',
        hasDynamicPricing: currentPlan === 'premium'
      }
    };

    return NextResponse.json(subscriptionInfo);

  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
