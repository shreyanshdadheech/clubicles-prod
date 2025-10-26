const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testAnalyticsAPI() {
  try {
    console.log('🔍 Testing analytics API...')
    
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
    
    // Test the analytics API
    const response = await fetch('http://localhost:3001/api/owner/analytics', {
      method: 'GET',
      headers: {
        'Cookie': `auth_token=${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('Analytics data:', JSON.stringify(data, null, 2))
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

testAnalyticsAPI()
