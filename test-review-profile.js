const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qohqtbufptudvxmfozju.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaHF0YnVmcHR1ZHZ4bWZvenp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MjE2NzYsImV4cCI6MjA1MDA5NzY3Nn0.bU6KGpjWRcBfP5bEqiRh0Ju-p8oJQrEWCNhxVmQ5XRQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReviewProfile() {
  console.log('🔍 Testing Review Profile Integration...\n');

  // Get the review
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .limit(1);

  if (reviewsError) {
    console.error('❌ Error fetching reviews:', reviewsError);
    return;
  }

  console.log('📝 Reviews found:', reviews?.length || 0);
  if (reviews && reviews.length > 0) {
    console.log('Review data:', reviews[0]);
    console.log('Review user_id:', reviews[0].user_id);
    
    // Check if this user_id exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', reviews[0].user_id)
      .single();

    if (profileError) {
      console.log('❌ Profile not found for review user_id:', profileError.message);
      
      // Check what profiles exist
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .limit(5);
        
      console.log('\n👥 Available profiles:');
      allProfiles?.forEach(p => console.log(`  - ${p.user_id}: ${p.display_name}`));
      
    } else {
      console.log('✅ Profile found:', profile);
    }
  }
}

testReviewProfile().catch(console.error);
