const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testUserBookingsAPI() {
  try {
    console.log('🔍 Testing user bookings API...')
    
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
    
    // Create a JWT token for this user
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        roles: 'user'
      },
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '1h' }
    )
    
    console.log('JWT Token created')
    
    // Test the user bookings API
    const response = await fetch('http://localhost:3001/api/user/bookings', {
      method: 'GET',
      headers: {
        'Cookie': `auth_token=${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('API Response:')
      console.log('- Success:', data.success)
      console.log('- Bookings count:', data.data?.bookings?.length || 0)
      
      if (data.data?.bookings && data.data.bookings.length > 0) {
        const booking = data.data.bookings[0]
        console.log('\nFirst booking details:')
        console.log('- ID:', booking.id)
        console.log('- Space Name:', booking.space_name)
        console.log('- Redemption Code:', booking.redemption_code || 'NOT FOUND')
        console.log('- Is Redeemed:', booking.is_redeemed)
        console.log('- Redeemed At:', booking.redeemed_at || 'N/A')
        console.log('- Status:', booking.status)
      }
    } else {
      const error = await response.text()
      console.log('Error response:', error)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUserBookingsAPI()
