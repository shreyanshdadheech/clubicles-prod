const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserOwnerMatch() {
  console.log('=== Checking User-Owner Auth ID Matches ===');
  
  // Get space owners
  const { data: owners, error: ownersError } = await supabase
    .from('space_owners')
    .select('auth_id, email');
    
  if (ownersError) {
    console.error('Error fetching owners:', ownersError);
    return;
  }
  
  console.log('Found', owners.length, 'space owners');
  
  for (const owner of owners) {
    // Check if there's a corresponding user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('auth_id, email, professional_role')
      .eq('auth_id', owner.auth_id)
      .maybeSingle();
      
    if (userError) {
      console.log(`❌ Error checking user for ${owner.email}:`, userError.message);
    } else if (!user) {
      console.log(`❌ No user record found for space owner: ${owner.email} (Auth ID: ${owner.auth_id})`);
    } else {
      console.log(`✅ ${owner.email} - User match found, role: ${user.professional_role}`);
    }
  }
}

checkUserOwnerMatch().then(() => {
  console.log('\\nUser-Owner match check complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});