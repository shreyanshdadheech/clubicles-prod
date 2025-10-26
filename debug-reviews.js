// Test to check if reviews exist in database directly
const { createClient } = require('@supabase/supabase-js')

async function testReviewsDirectly() {
  console.log('Testing reviews directly...')
  
  // Use the same supabase config as the API
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zzklxfoxcrnyjkllhrlr.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mjg5OTksImV4cCI6MjA3MzQwNDk5OX0.jRz3tptj0F7I5P4p1xd-M3Bs6F6dzc5ZIf0eZDR660M'
  )
  
  try {
    // Check what users actually exist
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, professional_role')
      .limit(5)
    
    console.log('\\n=== USERS IN DATABASE ===')
    console.log('Users found:', allUsers?.length || 0)
    if (allUsers) {
      allUsers.forEach((user, i) => {
        console.log(`User ${i + 1}: ${user.id} - ${user.first_name} ${user.last_name} (${user.professional_role})`)
      })
    }
    if (usersError) console.log('Users error:', usersError)
    
    // Check what bookings exist for this space
    const { data: spaceBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, user_id, space_id, status')
      .eq('space_id', '42f0aa87-790c-4234-9931-90049f701649')
      .limit(5)
    
    console.log('\\n=== BOOKINGS FOR THIS SPACE ===')
    console.log('Bookings found:', spaceBookings?.length || 0)
    if (spaceBookings) {
      spaceBookings.forEach((booking, i) => {
        console.log(`Booking ${i + 1}: ${booking.id} - User: ${booking.user_id} - Status: ${booking.status}`)
      })
    }
    if (bookingsError) console.log('Bookings error:', bookingsError)
    
    // Check if there are any reviews now
    const { data: allReviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
    
    console.log('\\n=== REVIEWS IN DATABASE ===')
    console.log('Reviews found:', allReviews?.length || 0)
    if (allReviews && allReviews.length > 0) {
      allReviews.forEach((review, i) => {
        console.log(`Review ${i + 1}: ${review.id} - Rating: ${review.rating} - Space: ${review.space_id}`)
      })
    }
    if (reviewsError) console.log('Reviews error:', reviewsError)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testReviewsDirectly()
