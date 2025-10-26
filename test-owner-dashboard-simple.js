const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testOwnerDashboardSimple() {
  try {
    console.log('🔍 Testing owner dashboard API...')
    
    // Get the space owner
    const spaceOwner = await prisma.spaceOwner.findFirst({
      where: {
        email: 'spaceowner@gmail.com'
      },
      select: {
        id: true,
        email: true,
        userId: true
      }
    })
    
    if (!spaceOwner) {
      console.log('No space owner found')
      return
    }
    
    console.log('Space Owner:', spaceOwner.email)
    
    // Get recent bookings for this owner
    const recentBookings = await prisma.booking.findMany({
      where: {
        space: {
          businessInfo: {
            spaceOwnerId: spaceOwner.id
          }
        }
      },
      include: {
        space: {
          select: {
            name: true,
            address: true,
            city: true
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
      },
      take: 10
    })
    
    console.log('Recent Bookings:', recentBookings.length)
    
    // Transform the data exactly like the API does
    const transformedRecentBookings = recentBookings.map((booking) => ({
      id: booking.id,
      spaceName: booking.space?.name || 'Unknown Space',
      customerName: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim() || 'Unknown Customer',
      date: booking.date,
      time: booking.startTime,
      duration: `${booking.startTime} - ${booking.endTime}`,
      amount: Number(booking.totalAmount),
      status: booking.status
    }))
    
    console.log('\nTransformed Recent Bookings:')
    transformedRecentBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.spaceName} - ${booking.customerName} - ${booking.amount} - ${booking.status}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOwnerDashboardSimple()
