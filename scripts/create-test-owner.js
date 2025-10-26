#!/usr/bin/env node

/**
 * Test script to create a space owner account
 * Run with: node scripts/create-test-owner.js
 */

const API_BASE = 'http://localhost:3001';

async function createTestOwner(userData) {
  try {
    console.log('🚀 Creating test space owner...');
    console.log('Data:', userData);
    
    const response = await fetch(`${API_BASE}/api/admin/create-test-owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Failed to create test owner:');
      console.error('Status:', response.status);
      console.error('Error:', result);
      return;
    }

    console.log('✅ Test space owner created successfully!');
    console.log('');
    console.log('📧 Login Details:');
    console.log('Email:', result.login_info.email);
    console.log('Password:', result.login_info.password);
    console.log('Signin URL:', result.login_info.signin_url);
    console.log('');
    console.log('🔍 Account Details:');
    console.log('Auth ID:', result.auth_id);
    console.log('Owner Record:', result.owner);
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Test data
const testOwnerData = {
  email: "papa@example.com",
  password: "oyepapaji", 
  first_name: "Test",
  last_name: "Owner"
};

createTestOwner(testOwnerData);
