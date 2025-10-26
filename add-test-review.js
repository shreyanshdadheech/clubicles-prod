const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qohqtbufptudvxmfozju.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaHF0YnVmcHR1ZHZ4bWZvenp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MjE2NzYsImV4cCI6MjA1MDA5NzY3Nn0.bU6KGpjWRcBfP5bEqiRh0Ju-p8oJQrEWCNhxVmQ5XRQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestReview() {
  console.log('🔍 Adding test review...\n');

  const spaceId = '42f0aa87-790c-4234-9931-90049f701649';

  // First, get a profile to use for the review
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .limit(1);

  if (profileError || !profiles || profiles.length === 0) {
    console.error('❌ No profiles found:', profileError);
    return;
  }

  const profile = profiles[0];
  console.log('👤 Using profile:', profile);

  // Add a review using this profile's user_id
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert([
      {
        space_id: spaceId,
        user_id: profile.user_id, // This should now reference auth.users.id
        rating: 5,
        comment: 'Amazing space! Perfect for our team meeting. Clean, modern, and well-equipped.'
      }
    ])
    .select();

  if (reviewError) {
    console.error('❌ Error adding review:', reviewError);
  } else {
    console.log('✅ Review added successfully:', review[0]);
  }

  // Test the API
  console.log('\n🧪 Testing API...');
  const response = await fetch(`http://localhost:3000/api/spaces/${spaceId}`);
  const spaceData = await response.json();
  
  console.log('Reviews from API:', spaceData.reviews?.length || 0);
  if (spaceData.reviews && spaceData.reviews.length > 0) {
    console.log('First review:', spaceData.reviews[0]);
  }
}

addTestReview().catch(console.error);
