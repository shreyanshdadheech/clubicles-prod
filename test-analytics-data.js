const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAnalyticsData() {
  try {
    console.log('🔍 Checking analytics data...')
    
    // Check space owners
    const spaceOwners = await prisma.spaceOwner.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    })
    console.log('Space Owners:', spaceOwners.length)
    
    // Check spaces
    const spaces = await prisma.space.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        totalSeats: true,
        businessInfo: {
          select: {
            spaceOwnerId: true
          }
        }
      }
    })
    console.log('Spaces:', spaces.length)
    
    // Check bookings
    const bookings = await prisma.booking.findMany({
      take: 10,
      select: {
        id: true,
        status: true,
        totalAmount: true,
        seatsBooked: true,
        space: {
          select: {
            name: true,
            businessInfo: {
              select: {
                spaceOwnerId: true
              }
            }
          }
        }
      }
    })
    console.log('Bookings:', bookings.length)
    console.log('Booking statuses:', [...new Set(bookings.map(b => b.status))])
    
    // Check business balance
    const businessBalances = await prisma.businessBalance.findMany({
      take: 5,
      select: {
        id: true,
        currentBalance: true,
        totalEarned: true
      }
    })
    console.log('Business Balances:', businessBalances.length)
    
    // Check business info
    const businessInfos = await prisma.spaceOwnerBusinessInfo.findMany({
      take: 5,
      select: {
        id: true,
        spaceOwnerId: true,
        businessName: true
      }
    })
    console.log('Business Infos:', businessInfos.length)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAnalyticsData()
