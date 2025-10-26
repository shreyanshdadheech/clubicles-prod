// Simple script to add sample booking data directly
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zzklxfoxcrnyjkllhrlr.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgyODk5OSwiZXhwIjoyMDczNDA0OTk5fQ.yDyfeAvCIxKSLD83NOtJfTH5-NxrcRPYMZZM7sOfVB0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createSampleData() {
  console.log('🚀 Creating sample booking data...')
  
  try {
    // First, create a test user via auth
    const testEmail = 'testuser@clubicles.com'
    const testPassword = 'testpass123'
    
    console.log('👤 Creating test user...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      user_metadata: {
        full_name: 'Test User',
        phone: '+91 9876543210',
        city: 'Mumbai',
        professional_role: 'indigo'
      }
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.error('Error creating user:', authError)
      return
    }
    
    const userId = authData?.user?.id || 'existing-user'
    console.log('✅ Test user ready:', testEmail)
    
    // Create a test space
    console.log('🏢 Creating test space...')
    const { data: spaceData, error: spaceError } = await supabase
      .from('spaces')
      .insert({
        name: 'Tech Hub Coworking',
        description: 'Modern coworking space with all amenities',
        city: 'Mumbai',
        address: '123 Business District, Mumbai',
        pincode: '400001',
        total_seats: 50,
        available_seats: 35,
        price_per_hour: 150,
        price_per_day: 1200,
        amenities: ['WiFi', 'Coffee', 'AC', 'Parking'],
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c'],
        status: 'approved',
        owner_id: userId
      })
      .select()
      .single()
    
    if (spaceError) {
      console.error('Error creating space:', spaceError)
      return
    }
    
    console.log('✅ Test space created:', spaceData.name)
    
    // Create sample bookings
    const sampleBookings = [
      {
        user_id: userId,
        space_id: spaceData.id,
        date: '2025-08-15',
        start_time: '10:00',
        end_time: '14:30',
        seats_booked: 2,
        base_amount: 675,
        tax_amount: 121.5,
        total_amount: 796.5,
        owner_payout: 675,
        status: 'confirmed',
        payment_id: 'pay_test_001'
      },
      {
        user_id: userId,
        space_id: spaceData.id,
        date: '2025-08-20',
        start_time: '09:00',
        end_time: '17:00',
        seats_booked: 1,
        base_amount: 1200,
        tax_amount: 216,
        total_amount: 1416,
        owner_payout: 1200,
        status: 'confirmed',
        payment_id: 'pay_test_002'
      },
      {
        user_id: userId,
        space_id: spaceData.id,
        date: '2025-08-10',
        start_time: '14:00',
        end_time: '18:00',
        seats_booked: 1,
        base_amount: 600,
        tax_amount: 108,
        total_amount: 708,
        owner_payout: 600,
        status: 'completed',
        payment_id: 'pay_test_003'
      }
    ]
    
    console.log('📅 Creating sample bookings...')
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .insert(sampleBookings)
      .select()
    
    if (bookingsError) {
      console.error('Error creating bookings:', bookingsError)
      return
    }
    
    console.log('✅ Created', bookingsData.length, 'sample bookings')
    
    // Show summary
    console.log('\n📊 Sample data created successfully!')
    console.log('📧 Test user:', testEmail, '/ Password:', testPassword)
    console.log('🏢 Test space:', spaceData.name)
    console.log('📅 Bookings:', bookingsData.length)
    console.log('\n🎉 You can now login with the test user to see real booking data!')
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  }
}

createSampleData()
