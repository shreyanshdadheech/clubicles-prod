const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixMissingUserRecords() {
  console.log('=== Fixing Missing User Records ===');
  
  // Get space owners without corresponding user records
  const { data: owners, error: ownersError } = await supabase
    .from('space_owners')
    .select('auth_id, email, first_name, last_name');
    
  if (ownersError) {
    console.error('Error fetching owners:', ownersError);
    return;
  }
  
  for (const owner of owners) {
    // Check if user record exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('auth_id')
      .eq('auth_id', owner.auth_id)
      .maybeSingle();
      
    if (userCheckError) {
      console.error(`Error checking user for ${owner.email}:`, userCheckError);
      continue;
    }
    
    if (!existingUser) {
      console.log(`Creating user record for space owner: ${owner.email}`);
      
      // Create user record
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_id: owner.auth_id,
          email: owner.email,
          first_name: owner.first_name,
          last_name: owner.last_name,
          professional_role: 'grey', // Default role for owners
          user_role: 'owner',
          roles: 'owner'
        })
        .select()
        .single();
        
      if (createError) {
        console.error(`Error creating user for ${owner.email}:`, createError);
      } else {
        console.log(`✅ Created user record for ${owner.email}`);
      }
    }
  }
}

fixMissingUserRecords().then(() => {
  console.log('\\nUser record fixing complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});