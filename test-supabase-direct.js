#!/usr/bin/env node

/**
 * Direct Supabase Test
 * This script tests Supabase user creation directly without Next.js
 */

const { createClient } = require('@supabase/supabase-js');

async function testSupabaseDirect() {
  console.log('🔍 Testing Supabase Direct Connection...\n');

  // Environment variables
  const supabaseUrl = 'https://zzklxfoxcrnyjkllhrlr.supabase.co';
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgyODk5OSwiZXhwIjoyMDczNDA0OTk5fQ.yDyfeAvCIxKSLD83NOtJfTH5-NxrcRPYMZZM7sOfVB0';

  // Create admin client
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test 1: List users
    console.log('🔍 Testing listUsers...');
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ listUsers failed:', usersError);
      return;
    }

    console.log('✅ listUsers successful, found', usersData.users?.length || 0, 'users');

    // Test 2: Create user
    console.log('🔍 Testing createUser...');
    const testEmail = `direct-test-${Date.now()}@example.com`;
    
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (createError) {
      console.error('❌ createUser failed:', createError);
      console.error('Error details:', {
        message: createError.message,
        status: createError.status,
        code: createError.code,
        name: createError.name
      });
      return;
    }

    console.log('✅ createUser successful:', createData.user?.id);

    // Test 3: Create user with metadata
    console.log('🔍 Testing createUser with metadata...');
    const testEmail2 = `direct-test-meta-${Date.now()}@example.com`;
    
    const { data: createData2, error: createError2 } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail2,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Direct Test User',
        first_name: 'Direct',
        last_name: 'Test',
        user_type: 'owner'
      }
    });

    if (createError2) {
      console.error('❌ createUser with metadata failed:', createError2);
      console.error('Error details:', {
        message: createError2.message,
        status: createError2.status,
        code: createError2.code,
        name: createError2.name
      });
      return;
    }

    console.log('✅ createUser with metadata successful:', createData2.user?.id);

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

    console.log('\n🎉 All tests passed! Supabase is working correctly.');
    console.log('The issue might be with the Next.js environment or middleware.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSupabaseDirect();

