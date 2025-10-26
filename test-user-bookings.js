const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUserBookings() {
  try {
    console.log('🔍 Testing user bookings data...')
    
    // Get a user who has bookings
    const user = await prisma.user.findFirst({
      where: {
        email: 'user@gmail.com'
      },
      select: {
        id: true,
        email: true,
        professionalRole: true
      }
    })
    
    if (!user) {
      console.log('No user found')
      return
    }
    
    console.log('User:', user.email, 'Professional Role:', user.professionalRole)
    
    // Get user's bookings with space data
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id
      },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('User Bookings:', bookings.length)
    
    bookings.forEach((booking, index) => {
      console.log(`${index + 1}. Booking ID: ${booking.id}`)
      console.log(`   Status: ${booking.status}`)
      console.log(`   Amount: ${booking.totalAmount}`)
      console.log(`   Space ID: ${booking.spaceId}`)
      console.log(`   Space Name: ${booking.space?.name || 'NULL'}`)
      console.log(`   Space Address: ${booking.space?.address || 'NULL'}`)
      console.log(`   Space City: ${booking.space?.city || 'NULL'}`)
      console.log('')
    })
    
    // Check if spaces exist
    const spaces = await prisma.space.findMany({
      where: {
        id: {
          in: bookings.map(b => b.spaceId)
        }
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true
      }
    })
    
    console.log('Spaces found:', spaces.length)
    spaces.forEach((space, index) => {
      console.log(`${index + 1}. Space ID: ${space.id}`)
      console.log(`   Name: ${space.name}`)
      console.log(`   Address: ${space.address}`)
      console.log(`   City: ${space.city}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserBookings()
