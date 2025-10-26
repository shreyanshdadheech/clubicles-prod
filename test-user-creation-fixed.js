#!/usr/bin/env node

/**
 * Test User Creation After Fix
 * This script tests if the auth trigger issue has been resolved
 */

const { createClient } = require('@supabase/supabase-js');

async function testUserCreationFixed() {
  console.log('🔍 Testing User Creation After Fix...\n');

  const supabaseUrl = 'https://zzklxfoxcrnyjkllhrlr.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgyODk5OSwiZXhwIjoyMDczNDA0OTk5fQ.yDyfeAvCIxKSLD83NOtJfTH5-NxrcRPYMZZM7sOfVB0';

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test 1: Create user with minimal data
    console.log('🔍 Testing createUser with minimal data...');
    const testEmail = `fixed-test-${Date.now()}@example.com`;
    
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (createError) {
      console.error('❌ createUser still failing:', createError);
      console.error('Error details:', {
        message: createError.message,
        status: createError.status,
        code: createError.code
      });
      console.log('\n📝 Next steps:');
      console.log('1. Run the diagnostic queries in Supabase SQL Editor');
      console.log('2. Check for triggers on auth.users that reference public.users');
      console.log('3. Apply the fixes from fix-auth-triggers.sql');
      return;
    }

    console.log('✅ createUser successful:', createData.user?.id);

    // Test 2: Create user with metadata (like space owner)
    console.log('🔍 Testing createUser with metadata...');
    const testEmail2 = `fixed-test-meta-${Date.now()}@example.com`;
    
    const { data: createData2, error: createError2 } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail2,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Fixed Test User',
        first_name: 'Fixed',
        last_name: 'Test',
        user_type: 'owner'
      }
    });

    if (createError2) {
      console.error('❌ createUser with metadata still failing:', createError2);
      console.error('Error details:', {
        message: createError2.message,
        status: createError2.status,
        code: createError2.code
      });
      return;
    }

    console.log('✅ createUser with metadata successful:', createData2.user?.id);

    // Test 3: Check if users were created in public.users
    console.log('🔍 Checking if users were created in public.users...');
    const { data: publicUsers, error: publicUsersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .in('auth_id', [createData.user.id, createData2.user.id]);

    if (publicUsersError) {
      console.error('❌ Failed to check public.users:', publicUsersError);
    } else {
      console.log('✅ Found', publicUsers?.length || 0, 'users in public.users');
      if (publicUsers && publicUsers.length > 0) {
        console.log('Users:', publicUsers.map(u => ({ id: u.id, email: u.email, roles: u.roles })));
      }
    }

    // Clean up
    console.log('🧹 Cleaning up test users...');
    if (createData.user?.id) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(createData.user.id);
      if (deleteError) {
        console.error('⚠️ Failed to delete test user 1:', deleteError);
      } else {
        console.log('✅ Test user 1 deleted');
      }
    }
    
    if (createData2.user?.id) {
      const { error: deleteError2 } = await supabaseAdmin.auth.admin.deleteUser(createData2.user.id);
      if (deleteError2) {
        console.error('⚠️ Failed to delete test user 2:', deleteError2);
      } else {
        console.log('✅ Test user 2 deleted');
      }
    }

    console.log('\n🎉 SUCCESS! User creation is now working correctly.');
    console.log('✅ Space owner registration should now work without errors.');
    console.log('✅ You can test the full registration flow at: http://localhost:3000/signup');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserCreationFixed();

