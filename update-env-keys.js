#!/usr/bin/env node

/**
 * Update Environment Variables Script
 * This script will help you update your .env.local file with the correct Supabase keys
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating Supabase Environment Variables...\n');

// The correct keys you provided
const correctKeys = {
  supabaseUrl: 'https://zzklxfoxcrnyjkllhrlr.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mjg5OTksImV4cCI6MjA3MzQwNDk5OX0.jRz3tptj0F7I5P4p1xd-M3Bs6F6dzc5ZIf0eZDR660M',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a2x4Zm94Y3JueWprbGxocmxyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgyODk5OSwiZXhwIjoyMDczNDA0OTk5fQ.yDyfeAvCIxKSLD83NOtJfTH5-NxrcRPYMZZM7sOfVB0'
};

// Path to .env.local
const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('Creating .env.local file with correct keys...\n');
  
  // Create .env.local with correct keys
  const envContent = `# ================================
# CLUBICLES - ENVIRONMENT VARIABLES
# ================================

# ================================
# SUPABASE CONFIGURATION
# ================================
NEXT_PUBLIC_SUPABASE_URL=${correctKeys.supabaseUrl}
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=${correctKeys.anonKey}
SUPABASE_SERVICE_ROLE_KEY=${correctKeys.serviceRoleKey}

# ================================
# RAZORPAY CONFIGURATION (EXISTING)
# ================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# ================================
# APPLICATION CONFIGURATION
# ================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Node environment
NODE_ENV=development
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
    console.log('\n📝 Please create the file manually with the following content:');
    console.log(envContent);
    process.exit(1);
  }
} else {
  console.log('📝 .env.local file found, updating keys...\n');
  
  // Read existing .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update the keys
  envContent = envContent.replace(
    /NEXT_PUBLIC_SUPABASE_URL=.*/,
    `NEXT_PUBLIC_SUPABASE_URL=${correctKeys.supabaseUrl}`
  );
  
  envContent = envContent.replace(
    /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=.*/,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=${correctKeys.anonKey}`
  );
  
  envContent = envContent.replace(
    /SUPABASE_SERVICE_ROLE_KEY=.*/,
    `SUPABASE_SERVICE_ROLE_KEY=${correctKeys.serviceRoleKey}`
  );
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file updated successfully!');
  } catch (error) {
    console.error('❌ Failed to update .env.local file:', error.message);
    console.log('\n📝 Please update the file manually with these values:');
    console.log(`NEXT_PUBLIC_SUPABASE_URL=${correctKeys.supabaseUrl}`);
    console.log(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=${correctKeys.anonKey}`);
    console.log(`SUPABASE_SERVICE_ROLE_KEY=${correctKeys.serviceRoleKey}`);
    process.exit(1);
  }
}

console.log('\n🔍 Verifying updated keys...');

// Verify the keys
const { data: envData, error: envError } = require('child_process').execSync('node verify-supabase-keys.js', { encoding: 'utf8' });
console.log(envData);

console.log('\n🎉 Environment variables updated successfully!');
console.log('📝 Next steps:');
console.log('1. Restart your development server: npm run dev');
console.log('2. Test space owner registration at: http://localhost:3000/signup');
console.log('3. The "Database error creating new user" should now be fixed!');

