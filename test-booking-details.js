const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testBookingDetails() {
  try {
    console.log('🔍 Testing booking details...')
    
    // Get a user who has bookings
    const user = await prisma.user.findFirst({
      where: {
        email: 'user@gmail.com'
      },
      select: {
        id: true,
        email: true
      }
    })
    
    if (!user) {
      console.log('No user found')
      return
    }
    
    console.log('User:', user.email)
    
    // Get user's bookings with all details
    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id
      },
      include: {
        space: {
          select: {
            name: true,
            address: true,
            city: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('User Bookings:', bookings.length)
    
    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ID: ${booking.id}`)
      console.log(`   Status: ${booking.status}`)
      console.log(`   Date: ${booking.date}`)
      console.log(`   Start Time: ${booking.startTime}`)
      console.log(`   End Time: ${booking.endTime}`)
      console.log(`   Seats Booked: ${booking.seatsBooked}`)
      console.log(`   Base Amount: ${booking.baseAmount}`)
      console.log(`   Total Amount: ${booking.totalAmount}`)
      console.log(`   Created At: ${booking.createdAt}`)
      console.log(`   Updated At: ${booking.updatedAt}`)
      console.log(`   Space Name: ${booking.space?.name || 'NULL'}`)
      console.log(`   Space Address: ${booking.space?.address || 'NULL'}`)
      console.log(`   Space City: ${booking.space?.city || 'NULL'}`)
      
      // Calculate duration
      const startTime = new Date(`2000-01-01 ${booking.startTime}`)
      const endTime = new Date(`2000-01-01 ${booking.endTime}`)
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      console.log(`   Calculated Duration: ${duration} hours`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testBookingDetails()