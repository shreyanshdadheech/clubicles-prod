// Check database state for reviews, users, and profiles
const { createClient } = require('@supabase/supabase-js')

async function checkDatabaseState() {
  console.log('Checking database state...')
  
  const supabase = createClient(
    'https://zzklxfoxcrnyjkllhrlr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mjg5OTksImV4cCI6MjA3MzQwNDk5OX0.jRz3tptj0F7I5P4p1xd-M3Bs6F6dzc5ZIf0eZDR660M'
  )
  
  try {
    // Check review
    const { data: review } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', '08aac05a-c487-4478-b96c-bb2445996ef4')
      .single()
    
    console.log('\\n=== REVIEW ===')
    console.log('Review exists:', review ? 'Yes' : 'No')
    if (review) console.log('User ID in review:', review.user_id)
    
    // Check if user exists
    if (review) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', review.user_id)
        .single()
      
      console.log('\\n=== USER ===')
      console.log('User exists:', user ? 'Yes' : 'No')
      if (user) {
        console.log('User auth_id:', user.auth_id)
        console.log('User name:', user.first_name, user.last_name)
        console.log('Professional role:', user.professional_role)
      }
      
      // Check if profile exists
      if (user && user.auth_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.auth_id)
          .single()
        
        console.log('\\n=== PROFILE ===')
        console.log('Profile exists:', profile ? 'Yes' : 'No')
        if (profile) {
          console.log('Display name:', profile.display_name)
          console.log('Avatar URL:', profile.avatar_url)
          console.log('City:', profile.city)
        }
      }
    }
    
    // Check total counts and show some sample profiles
    const { data: allProfiles } = await supabase.from('profiles').select('*').limit(3)
    const { data: allUsers } = await supabase.from('users').select('*')
    
    console.log('\\n=== TOTALS ===')
    console.log('Total users:', allUsers?.length || 0)
    console.log('Total profiles:', (await supabase.from('profiles').select('*', { count: 'exact', head: true })).count || 0)
    
    console.log('\\n=== SAMPLE PROFILES ===')
    if (allProfiles) {
      allProfiles.forEach((profile, i) => {
        console.log(`Profile ${i + 1}:`)
        console.log(`  - user_id: ${profile.user_id}`)
        console.log(`  - display_name: ${profile.display_name}`)
        console.log(`  - city: ${profile.city}`)
      })
    }
    
  } catch (error) {
    console.error('Check failed:', error)
  }
}

checkDatabaseState()
