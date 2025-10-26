const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testOwnerDashboard() {
  try {
    console.log('🔍 Testing owner dashboard API...')
    
    // Get the space owner who has bookings
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
    
    // Create a JWT token for this owner
    const token = jwt.sign(
      { 
        id: spaceOwner.userId, 
        email: spaceOwner.email,
        roles: 'owner'
      },
      'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '1h' }
    )
    
    console.log('JWT Token created')
    
    // Test the owner dashboard API
    const response = await fetch('http://localhost:3001/api/owner/dashboard', {
      method: 'GET',
      headers: {
        'Cookie': `auth_token=${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Dashboard data:')
      console.log('- Recent Bookings:', data.recentBookings?.length || 0)
      if (data.recentBookings && data.recentBookings.length > 0) {
        console.log('  First booking:', {
          spaceName: data.recentBookings[0].spaceName,
          customerName: data.recentBookings[0].customerName,
          amount: data.recentBookings[0].amount,
          status: data.recentBookings[0].status
        })
      }
      console.log('- Analytics:', {
        totalRevenue: data.analytics?.totalRevenue,
        totalBookings: data.analytics?.totalBookings
      })
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

testOwnerDashboard()
