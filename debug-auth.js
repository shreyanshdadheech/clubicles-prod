const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAuthSessions() {
  console.log('=== Checking Auth Sessions ===');
  
  // Check auth.sessions table to see active sessions
  const { data: sessions, error } = await supabase
    .from('auth.sessions')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('Error fetching sessions (this is normal - RLS prevents access):', error.message);
  } else {
    console.log('Sessions found:', sessions?.length || 0);
  }
  
  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('auth_id, email, professional_role, user_role')
    .limit(5);
    
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  console.log('\\nUsers in system:');
  users.forEach(user => {
    console.log(`- ${user.email} (Auth ID: ${user.auth_id})`);
  });
  
  // Check space_owners
  const { data: owners, error: ownersError } = await supabase
    .from('space_owners')
    .select('auth_id, email')
    .limit(5);
    
  if (ownersError) {
    console.error('Error fetching owners:', ownersError);
    return;
  }
  
  console.log('\\nSpace owners:');
  owners.forEach(owner => {
    console.log(`- ${owner.email} (Auth ID: ${owner.auth_id})`);
  });
}

checkAuthSessions().then(() => {
  console.log('\\nAuth check complete.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});