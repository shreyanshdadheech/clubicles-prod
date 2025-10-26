const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugOwnerDashboard() {
  console.log('=== Debugging Owner Dashboard Issues ===');
  
  // Get a space owner to test with
  const { data: owners, error: ownersError } = await supabase
    .from('space_owners')
    .select('id, auth_id, email, approval_status')
    .limit(1);
    
  if (ownersError || !owners.length) {
    console.error('Error fetching owners:', ownersError);
    return;
  }
  
  const testOwner = owners[0];
  console.log('Testing with owner:', testOwner.email, 'Auth ID:', testOwner.auth_id);
  
  // Check if this owner has business info
  const { data: businessInfo, error: businessError } = await supabase
    .from('space_owner_business_info')
    .select('*')
    .eq('space_owner_id', testOwner.id);
    
  console.log('\nBusiness Info:', businessInfo?.length || 0, 'records');
  if (businessInfo?.length) {
    console.log('Business ID:', businessInfo[0].id);
    
    // Check spaces for this business
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .select('id, name, business_id')
      .eq('business_id', businessInfo[0].id);
      
    console.log('\nSpaces for business:', spaces?.length || 0);
    if (spaces?.length) {
      spaces.forEach(space => {
        console.log('- Space:', space.name, 'ID:', space.id);
      });
    }
  }
  
  // Test API call as this user would
  console.log('\n=== Testing API Calls ===');
  
  // First test the spaces API endpoint
  try {
    console.log('Testing spaces API...');
    const spacesResponse = await fetch('http://localhost:3000/api/owner/spaces', {
      headers: {
        'Authorization': 'Bearer ' + testOwner.auth_id // This won't work in real API but helps debug
      }
    });
    console.log('Spaces API Status:', spacesResponse.status);
    
    if (spacesResponse.ok) {
      const spacesData = await spacesResponse.json();
      console.log('Spaces API Response:', JSON.stringify(spacesData, null, 2));
    } else {
      const errorData = await spacesResponse.text();
      console.log('Spaces API Error:', errorData);
    }
  } catch (error) {
    console.log('Spaces API Call Failed:', error.message);
  }
}

debugOwnerDashboard().then(() => {
  console.log('\nDebug complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});