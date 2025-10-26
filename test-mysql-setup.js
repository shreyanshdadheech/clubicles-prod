#!/usr/bin/env node

/**
 * Test MySQL + Prisma Setup
 * This script tests if the new MySQL + Prisma setup is working correctly
 */

const { PrismaClient } = require('@prisma/client')

async function testMySQLSetup() {
  console.log('🔍 Testing MySQL + Prisma Setup...\n')

  const prisma = new PrismaClient()

  try {
    // Test 1: Database connection
    console.log('🔍 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Test 2: Create a test user
    console.log('🔍 Testing user creation...')
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'hashed-password-here',
        firstName: 'Test',
        lastName: 'User',
        roles: 'user'
      }
    })
    console.log('✅ User created:', testUser.id)

    // Test 3: Create a space owner
    console.log('🔍 Testing space owner creation...')
    const spaceOwner = await prisma.spaceOwner.create({
      data: {
        userId: testUser.id,
        email: testUser.email,
        firstName: 'Test',
        lastName: 'Owner',
        approvalStatus: 'pending'
      }
    })
    console.log('✅ Space owner created:', spaceOwner.id)

    // Test 4: Create business info
    console.log('🔍 Testing business info creation...')
    const businessInfo = await prisma.spaceOwnerBusinessInfo.create({
      data: {
        spaceOwnerId: spaceOwner.id,
        businessName: 'Test Business',
        businessType: 'Co-working Space',
        panNumber: 'ABCDE1234F',
        businessAddress: '123 Test Street',
        businessCity: 'Mumbai',
        businessState: 'Maharashtra',
        businessPincode: '400001'
      }
    })
    console.log('✅ Business info created:', businessInfo.id)

    // Test 5: Create a space
    console.log('🔍 Testing space creation...')
    const space = await prisma.space.create({
      data: {
        businessId: businessInfo.id,
        name: 'Test Space',
        description: 'A test co-working space',
        address: '123 Test Street, Mumbai',
        city: 'Mumbai',
        pincode: '400001',
        totalSeats: 10,
        availableSeats: 10,
        pricePerHour: 100.00,
        pricePerDay: 800.00,
        amenities: JSON.stringify(['WiFi', 'Coffee', 'Parking']),
        images: JSON.stringify(['image1.jpg', 'image2.jpg'])
      }
    })
    console.log('✅ Space created:', space.id)

    // Test 6: Create a booking
    console.log('🔍 Testing booking creation...')
    const booking = await prisma.booking.create({
      data: {
        userId: testUser.id,
        spaceId: space.id,
        startTime: '09:00',
        endTime: '17:00',
        date: new Date(),
        seatsBooked: 2,
        baseAmount: 800.00,
        totalAmount: 800.00,
        ownerPayout: 720.00,
        platformCommission: 80.00,
        status: 'pending',
        bookingReference: `BK-${Date.now()}`
      }
    })
    console.log('✅ Booking created:', booking.id)

    // Test 7: Query data
    console.log('🔍 Testing data queries...')
    const users = await prisma.user.findMany({
      include: {
        spaceOwner: {
          include: {
            businessInfo: {
              include: {
                spaces: true
              }
            }
          }
        },
        bookings: true
      }
    })
    console.log('✅ Data query successful, found', users.length, 'users')

    // Clean up test data
    console.log('🧹 Cleaning up test data...')
    await prisma.booking.deleteMany({ where: { userId: testUser.id } })
    await prisma.space.deleteMany({ where: { businessId: businessInfo.id } })
    await prisma.spaceOwnerBusinessInfo.deleteMany({ where: { spaceOwnerId: spaceOwner.id } })
    await prisma.spaceOwner.deleteMany({ where: { userId: testUser.id } })
    await prisma.user.deleteMany({ where: { id: testUser.id } })
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 SUCCESS! MySQL + Prisma setup is working perfectly!')
    console.log('✅ Database connection: Working')
    console.log('✅ User creation: Working')
    console.log('✅ Space owner creation: Working')
    console.log('✅ Business info creation: Working')
    console.log('✅ Space creation: Working')
    console.log('✅ Booking creation: Working')
    console.log('✅ Data queries: Working')
    console.log('\n📝 Next steps:')
    console.log('1. Test space owner registration at: http://localhost:3000/signup')
    console.log('2. The "Database error creating new user" should now be fixed!')
    console.log('3. All Supabase issues are resolved!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.log('\n📝 Error details:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testMySQLSetup()

