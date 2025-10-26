const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRedemptionCodes() {
  try {
    console.log('🔍 Testing redemption codes...')
    
    // Get all bookings
    const bookings = await prisma.booking.findMany({
      include: {
        space: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('Total bookings:', bookings.length)
    
    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ID: ${booking.id}`)
      console.log(`   Space: ${booking.space?.name || 'N/A'}`)
      console.log(`   User: ${booking.user?.email || 'N/A'}`)
      console.log(`   Status: ${booking.status}`)
      console.log(`   Redemption Code: ${booking.redemptionCode || 'NOT GENERATED'}`)
      console.log(`   Is Redeemed: ${booking.isRedeemed || false}`)
      console.log(`   Redeemed At: ${booking.redeemedAt || 'N/A'}`)
    })
    
    // Update existing bookings without redemption codes
    const bookingsWithoutCodes = bookings.filter(b => !b.redemptionCode)
    console.log(`\nBookings without redemption codes: ${bookingsWithoutCodes.length}`)
    
    if (bookingsWithoutCodes.length > 0) {
      console.log('Generating redemption codes for existing bookings...')
      
      for (const booking of bookingsWithoutCodes) {
        const redemptionCode = `CLB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        
        await prisma.booking.update({
          where: { id: booking.id },
          data: { redemptionCode: redemptionCode }
        })
        
        console.log(`✅ Generated code for booking ${booking.id}: ${redemptionCode}`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRedemptionCodes()
