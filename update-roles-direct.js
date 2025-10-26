const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:password@localhost:3306/clubicles"
    }
  }
})

async function updateRolesDirect() {
  try {
    console.log('Updating professional roles using raw SQL...')
    
    // Use raw SQL to update the roles
    await prisma.$executeRaw`
      UPDATE users 
      SET professionalRole = CASE 
        WHEN professionalRole = 'developer' THEN 'indigo'
        WHEN professionalRole = 'designer' THEN 'indigo'
        WHEN professionalRole = 'manager' THEN 'blue'
        WHEN professionalRole = 'consultant' THEN 'blue'
        WHEN professionalRole = 'freelancer' THEN 'yellow'
        WHEN professionalRole = 'entrepreneur' THEN 'yellow'
        WHEN professionalRole = 'student' THEN 'yellow'
        WHEN professionalRole = 'other' THEN 'grey'
        ELSE 'violet'
      END
      WHERE professionalRole IN ('developer', 'designer', 'manager', 'consultant', 'freelancer', 'entrepreneur', 'student', 'other')
    `
    
    console.log('Professional roles updated successfully')
    
    // Now try to push the schema changes
    console.log('Pushing schema changes...')
    const { execSync } = require('child_process')
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    
    console.log('Schema updated successfully')
    
  } catch (error) {
    console.error('Error updating roles:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateRolesDirect()
  .then(() => {
    console.log('Role update completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to update roles:', error)
    process.exit(1)
  })
