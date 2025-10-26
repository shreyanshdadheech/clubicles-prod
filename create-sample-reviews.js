const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSampleReviews() {
  console.log('Creating sample reviews...')
  
  try {
    // First check if space exists
    const { data: space, error: spaceError } = await supabase
      .from('spaces')
      .select('id, name')
      .eq('id', '42f0aa87-790c-4234-9931-90049f701649')
      .single()
    
    if (spaceError) {
      console.error('Error fetching space:', spaceError)
      return
    }
    
    console.log('Space found:', space)
    
    // Get some users to create reviews from
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, professional_role')
      .limit(4)
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }
    
    console.log('Users found:', users.length)
    
    // Get some confirmed bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, user_id')
      .eq('space_id', '42f0aa87-790c-4234-9931-90049f701649')
      .eq('status', 'confirmed')
      .limit(4)
    
    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return
    }
    
    console.log('Bookings found:', bookings.length)
    
    if (bookings.length === 0) {
      console.log('No confirmed bookings found, cannot create reviews')
      return
    }
    
    // Create sample reviews
    const reviewsToCreate = [
      {
        user_id: bookings[0]?.user_id,
        space_id: '42f0aa87-790c-4234-9931-90049f701649',
        booking_id: bookings[0]?.id,
        rating: 5,
        comment: 'Excellent workspace! Perfect for productive work sessions. The ambiance is professional and facilities are top-notch.'
      },
      {
        user_id: bookings[1]?.user_id,
        space_id: '42f0aa87-790c-4234-9931-90049f701649',
        booking_id: bookings[1]?.id,
        rating: 4,
        comment: 'Great space with good facilities. WiFi is fast and the environment is conducive to work. Would book again.'
      }
    ].filter(review => review.user_id && review.booking_id)
    
    if (reviewsToCreate.length === 0) {
      console.log('No suitable bookings found for creating reviews')
      return
    }
    
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .insert(reviewsToCreate)
      .select()
    
    if (reviewsError) {
      console.error('Error creating reviews:', reviewsError)
      return
    }
    
    console.log('Reviews created successfully:', reviews)
    
    // Verify reviews were created
    const { data: allReviews, error: fetchError } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        users!inner(
          id, professional_role,
          full_name
        )
      `)
      .eq('space_id', '42f0aa87-790c-4234-9931-90049f701649')
    
    if (fetchError) {
      console.error('Error fetching reviews:', fetchError)
      return
    }
    
    console.log('All reviews for space:', allReviews)
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createSampleReviews()
