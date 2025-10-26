const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateProfessionalRoles() {
  try {
    // Update existing users to use new VIBGYOR roles
    const users = await prisma.user.findMany({
      where: {
        professionalRole: {
          in: ['developer', 'designer', 'manager', 'consultant', 'freelancer', 'entrepreneur', 'student', 'other']
        }
      }
    })

    console.log(`Found ${users.length} users with old professional roles`)

    for (const user of users) {
      let newRole = 'violet' // Default to violet
      
      // Map old roles to new VIBGYOR roles
      switch (user.professionalRole) {
        case 'developer':
        case 'designer':
          newRole = 'indigo' // IT & Industrialists
          break
        case 'manager':
        case 'consultant':
          newRole = 'blue' // Branding & Marketing
          break
        case 'freelancer':
        case 'entrepreneur':
          newRole = 'yellow' // Young Entrepreneurs
          break
        case 'student':
          newRole = 'yellow' // Young Entrepreneurs
          break
        case 'other':
          newRole = 'grey' // Nomads (Multi-talented)
          break
        default:
          newRole = 'violet' // Visionaries & Venture Capitalists
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { professionalRole: newRole }
      })

      console.log(`Updated user ${user.email} from ${user.professionalRole} to ${newRole}`)
    }

    console.log('Professional roles updated successfully')
  } catch (error) {
    console.error('Error updating professional roles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateProfessionalRoles()
  .then(() => {
    console.log('Professional roles update completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to update professional roles:', error)
    process.exit(1)
  })
