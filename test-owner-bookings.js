const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOwnerBookings() {
  try {
    console.log('🔍 Testing owner bookings data...')
    
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
    
    recentBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ID: ${booking.id}`)
      console.log(`   Status: ${booking.status}`)
      console.log(`   Date: ${booking.date}`)
      console.log(`   Start Time: ${booking.startTime}`)
      console.log(`   End Time: ${booking.endTime}`)
      console.log(`   Amount: ${booking.totalAmount}`)
      console.log(`   Space ID: ${booking.spaceId}`)
      console.log(`   Space Name: ${booking.space?.name || 'NULL'}`)
      console.log(`   Space Address: ${booking.space?.address || 'NULL'}`)
      console.log(`   Space City: ${booking.space?.city || 'NULL'}`)
      console.log(`   Customer: ${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`)
      console.log(`   Customer Email: ${booking.user?.email || 'NULL'}`)
    })
    
    // Check if spaces exist
    const spaces = await prisma.space.findMany({
      where: {
        businessInfo: {
          spaceOwnerId: spaceOwner.id
        }
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true
      }
    })
    
    console.log('\nSpaces owned by this owner:', spaces.length)
    spaces.forEach((space, index) => {
      console.log(`${index + 1}. Space ID: ${space.id}`)
      console.log(`   Name: ${space.name}`)
      console.log(`   Address: ${space.address}`)
      console.log(`   City: ${space.city}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOwnerBookings()