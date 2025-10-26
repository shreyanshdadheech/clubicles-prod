const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@clubicles.com' },
          { roles: 'admin' }
        ]
      }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      return existingAdmin
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@clubicles.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roles: 'admin',
        isActive: true,
        phone: '+91 9999999999',
        city: 'Mumbai',
        professionalRole: 'violet' // VIBGYOR role
      }
    })

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      roles: adminUser.roles,
      professionalRole: adminUser.professionalRole
    })

    return adminUser
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
  .then(() => {
    console.log('Admin user creation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to create admin user:', error)
    process.exit(1)
  })
