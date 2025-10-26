// Test script for owner registration API
const testOwnerRegistration = async () => {
  console.log('🧪 Testing owner registration API...')
  
  const testData = {
    email: 'test-owner@example.com',
    password: 'TestPass123!',
    first_name: 'Test',
    last_name: 'Owner',
    business_info: {
      business_name: 'Test Coworking Space',
      business_type: 'coworking',
      pan_number: 'ABCDE1234F',
      business_address: '123 Test Street',
      business_city: 'Mumbai',
      business_state: 'Maharashtra',
      business_pincode: '400001'
    },
    payment_info: {
      bank_account_number: '1234567890',
      bank_ifsc_code: 'TEST0001234',
      bank_account_holder_name: 'Test Owner',
      bank_name: 'Test Bank',
      upi_id: 'testowner@paytm'
    }
  }

  try {
    const response = await fetch('http://localhost:3001/api/auth/register-owner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    
    console.log('📊 Response Status:', response.status)
    console.log('📋 Response Data:', result)
    
    if (response.ok) {
      console.log('✅ Owner registration test PASSED')
    } else {
      console.log('❌ Owner registration test FAILED')
    }
  } catch (error) {
    console.error('🚨 Test error:', error)
  }
}

testOwnerRegistration()