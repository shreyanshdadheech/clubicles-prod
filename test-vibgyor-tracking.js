const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testVibgyorTracking() {
  try {
    console.log('🔍 Testing VIBGYOR tracking...')
    
    // Get a space to test with
    const space = await prisma.space.findFirst({
      where: {
        name: 'Morning 22 sep'
      },
      select: {
        id: true,
        name: true,
        violet: true,
        indigo: true,
        blue: true,
        green: true,
        yellow: true,
        orange: true,
        red: true,
        grey: true,
        white: true,
        black: true
      }
    })
    
    if (!space) {
      console.log('No space found')
      return
    }
    
    console.log('Space before update:', {
      name: space.name,
      violet: space.violet,
      indigo: space.indigo,
      blue: space.blue,
      green: space.green,
      yellow: space.yellow,
      orange: space.orange,
      red: space.red,
      grey: space.grey,
      white: space.white,
      black: space.black
    })
    
    // Test updating indigo count (since user has indigo role)
    const updatedSpace = await prisma.space.update({
      where: { id: space.id },
      data: {
        indigo: { increment: 1 }
      }
    })
    
    console.log('Space after indigo increment:', {
      name: updatedSpace.name,
      indigo: updatedSpace.indigo
    })
    
    // Test the VIBGYOR mapping logic
    const testRoles = ['violet', 'indigo', 'blue', 'green', 'yellow', 'orange', 'red', 'grey', 'white', 'black']
    
    console.log('\n🔍 Testing VIBGYOR role mapping:')
    testRoles.forEach(role => {
      const updateData = {}
      switch (role) {
        case 'violet':
          updateData.violet = { increment: 1 }
          break
        case 'indigo':
          updateData.indigo = { increment: 1 }
          break
        case 'blue':
          updateData.blue = { increment: 1 }
          break
        case 'green':
          updateData.green = { increment: 1 }
          break
        case 'yellow':
          updateData.yellow = { increment: 1 }
          break
        case 'orange':
          updateData.orange = { increment: 1 }
          break
        case 'red':
          updateData.red = { increment: 1 }
          break
        case 'grey':
          updateData.grey = { increment: 1 }
          break
        case 'white':
          updateData.white = { increment: 1 }
          break
        case 'black':
          updateData.black = { increment: 1 }
          break
      }
      console.log(`${role}:`, updateData)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testVibgyorTracking()
