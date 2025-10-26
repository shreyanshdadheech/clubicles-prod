#!/usr/bin/env node

/**
 * Supabase Keys Verification Script
 * Run this to verify your Supabase environment variables are correct
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Supabase Environment Variables...\n');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  console.log('❌ .env.local file not found');
  console.log('Please create a .env.local file with your Supabase credentials');
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Check required variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY', 
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY'
];

console.log('📋 Checking required environment variables:');
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    console.log(`✅ ${varName}: Present`);
  } else {
    console.log(`❌ ${varName}: Missing`);
  }
});

console.log('\n🔑 Verifying key formats:');

// Check Supabase URL
const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
if (supabaseUrl) {
  const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
  console.log(`URL Format: ${isValidUrl ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`   URL: ${supabaseUrl}`);
} else {
  console.log('URL Format: ❌ Missing');
}

// Check Service Role Key
const serviceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];
if (serviceRoleKey) {
  const isValidServiceKey = serviceRoleKey.startsWith('eyJ') && serviceRoleKey.includes('service_role');
  console.log(`Service Role Key: ${isValidServiceKey ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`   Prefix: ${serviceRoleKey.substring(0, 30)}...`);
  console.log(`   Contains 'service_role': ${serviceRoleKey.includes('service_role') ? 'Yes' : 'No'}`);
} else {
  console.log('Service Role Key: ❌ Missing');
}

// Check Anon Key
const anonKey = envVars['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY'];
if (anonKey) {
  const isValidAnonKey = anonKey.startsWith('eyJ') && anonKey.includes('anon');
  console.log(`Anon Key: ${isValidAnonKey ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`   Prefix: ${anonKey.substring(0, 30)}...`);
  console.log(`   Contains 'anon': ${anonKey.includes('anon') ? 'Yes' : 'No'}`);
} else {
  console.log('Anon Key: ❌ Missing');
}

console.log('\n📝 Summary:');
const allValid = requiredVars.every(varName => envVars[varName]) &&
                 supabaseUrl?.startsWith('https://') && supabaseUrl?.includes('.supabase.co') &&
                 serviceRoleKey?.startsWith('eyJ') && serviceRoleKey?.includes('service_role') &&
                 anonKey?.startsWith('eyJ') && anonKey?.includes('anon');

if (allValid) {
  console.log('🎉 All environment variables are correctly configured!');
  console.log('You can now run: npm run dev');
  console.log('And test space owner registration at: http://localhost:3000/signup');
} else {
  console.log('❌ Some environment variables need to be fixed.');
  console.log('\n📖 Next steps:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Settings → API');
  console.log('3. Copy the correct keys:');
  console.log('   - service_role key (for SUPABASE_SERVICE_ROLE_KEY)');
  console.log('   - anon key (for NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY)');
  console.log('4. Update your .env.local file');
  console.log('5. Run this script again to verify');
}

console.log('\n🔗 Supabase Dashboard: https://supabase.com/dashboard');

