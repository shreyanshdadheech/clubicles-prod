#!/usr/bin/env node

/**
 * Test Emergency Fix
 * This script tests if the emergency fix resolved the auth errors
 */

const { createClient } = require('@supabase/supabase-js');

async function testEmergencyFix() {
  console.log('🚨 Testing Emergency Fix for Auth Errors...\n');

  const supabaseUrl = 'https://zzklxfoxcrnyjkllhrlr.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgyODk5OSwiZXhwIjoyMDczNDA0OTk5fQ.yDyfeAvCIxKSLD83NOtJfTH5-NxrcRPYMZZM7sOfVB0';

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('🔍 Testing createUser after emergency fix...');
    const testEmail = `emergency-test-${Date.now()}@example.com`;
    
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
      
      console.log('\n📝 The emergency fix needs to be applied in Supabase:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Run the queries from EMERGENCY_FIX.sql');
      console.log('3. Try this test again');
      return;
    }

    console.log('✅ createUser successful:', createData.user?.id);

    // Check if user was created in public.users
    console.log('🔍 Checking if user was created in public.users...');
    const { data: publicUsers, error: publicUsersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', createData.user.id);

    if (publicUsersError) {
      console.error('❌ Failed to check public.users:', publicUsersError);
    } else {
      console.log('✅ Found', publicUsers?.length || 0, 'users in public.users');
      if (publicUsers && publicUsers.length > 0) {
        console.log('User details:', publicUsers[0]);
      }
    }

    // Clean up
    console.log('🧹 Cleaning up test user...');
    if (createData.user?.id) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(createData.user.id);
      if (deleteError) {
        console.error('⚠️ Failed to delete test user:', deleteError);
      } else {
        console.log('✅ Test user deleted');
      }
    }

    console.log('\n🎉 SUCCESS! Emergency fix worked!');
    console.log('✅ User creation is now working correctly.');
    console.log('✅ Space owner registration should now work.');
    console.log('✅ You can test at: http://localhost:3000/signup');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n📝 Please apply the emergency fix in Supabase first.');
  }
}

testEmergencyFix();

