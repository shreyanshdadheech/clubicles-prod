// Quick test script to verify booking data exists and add sample bookings if needed
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zzklxfoxcrnyjkllhrlr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mjg5OTksImV4cCI6MjA3MzQwNDk5OX0.jRz3tptj0F7I5P4p1xd-M3Bs6F6dzc5ZIf0eZDR660M'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBookings() {
  console.log('🔍 Checking existing bookings...')
  
  // Check if we have any bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      *,
      spaces (
        id,
        name,
        city,
        address
      ),
      users (
        id,
        email
      )
    `)
    .limit(5)
  
  if (bookingsError) {
    console.error('❌ Error fetching bookings:', bookingsError)
    return
  }
  
  console.log(`📊 Found ${bookings?.length || 0} bookings in database`)
  
  if (bookings && bookings.length > 0) {
    console.log('📋 Sample bookings:')
    bookings.forEach((booking, index) => {
      console.log(`  ${index + 1}. Space: ${booking.spaces?.name || 'Unknown'} | Date: ${booking.date} | Time: ${booking.start_time} | Status: ${booking.status} | Amount: ₹${booking.total_amount}`)
    })
  } else {
    console.log('📝 No bookings found. Database integration ready but no data to display.')
  }
  
  // Check spaces and users too
  const { data: spaces } = await supabase.from('spaces').select('id, name').limit(3)
  const { data: users } = await supabase.from('users').select('id, email').limit(3) 
  
  console.log(`\n🏢 Found ${spaces?.length || 0} spaces`)
  console.log(`👥 Found ${users?.length || 0} users`)
  
  if (spaces?.length && users?.length) {
    console.log('\n✅ Database has the necessary data structure for bookings!')
    console.log('🔄 Users can now create real bookings through the booking flow.')
  }
}

testBookings().catch(console.error)
