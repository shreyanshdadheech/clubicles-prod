const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qohqtbufptudvxmfozju.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaHF0YnVmcHR1ZHZ4bWZvenp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1MjE2NzYsImV4cCI6MjA1MDA5NzY3Nn0.bU6KGpjWRcBfP5bEqiRh0Ju-p8oJQrEWCNhxVmQ5XRQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugReviews() {
  console.log('🔍 Debug Reviews Integration...\n');

  const spaceId = '42f0aa87-790c-4234-9931-90049f701649';

  // First, check if reviews exist for this space
  console.log('1. Checking reviews for space:', spaceId);
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .eq('space_id', spaceId);

  console.log('Direct reviews query:');
  console.log('  Error:', reviewsError);
  console.log('  Count:', reviews?.length || 0);
  if (reviews && reviews.length > 0) {
    console.log('  First review:', reviews[0]);
  }

  // Check all reviews
  console.log('\n2. All reviews in database:');
  const { data: allReviews, error: allReviewsError } = await supabase
    .from('reviews')
    .select('*');
    
  console.log('  Error:', allReviewsError);
  console.log('  Total count:', allReviews?.length || 0);
  if (allReviews && allReviews.length > 0) {
    console.log('  All reviews:');
    allReviews.forEach(review => {
      console.log(`    - Space: ${review.space_id}, User: ${review.user_id}, Rating: ${review.rating}`);
    });
  }

  // Test the exact same query as the API
  console.log('\n3. Testing API-style query:');
  const { data: space, error: spaceError } = await supabase
    .from('spaces')
    .select(`
      id,
      title,
      reviews (
        id,
        user_id,
        rating,
        comment,
        created_at
      )
    `)
    .eq('id', spaceId)
    .maybeSingle();

  console.log('  Space error:', spaceError);
  console.log('  Space found:', !!space);
  console.log('  Reviews in space:', space?.reviews?.length || 0);
  if (space?.reviews && space.reviews.length > 0) {
    console.log('  Space reviews:', space.reviews);
  }
}

debugReviews().catch(console.error);
