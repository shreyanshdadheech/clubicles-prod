/**
 * Test script for creating complete space owner accounts with business and payment info
 * Usage: node create-complete-owner-test.js
 */

const baseUrl = 'http://localhost:3001'

const testOwners = [
  {
    // Basic owner without business/payment info
    email: 'owner1@test.com',
    password: 'Test@123',
    first_name: 'John',
    last_name: 'Smith'
  },
  {
    // Owner with business info only
    email: 'owner2@test.com', 
    password: 'Test@123',
    first_name: 'Priya',
    last_name: 'Sharma',
    business_info: {
      business_name: 'Sharma Spaces',
      business_type: 'Co-working',
      gst_number: '27AAPFU0939F1ZV',
      pan_number: 'AAPFU0939F',
      business_address: '123 Business District',
      business_city: 'Mumbai',
      business_state: 'Maharashtra',
      business_pincode: '400001'
    }
  },
  {
    // Complete owner with both business and payment info
    email: 'owner3@test.com',
    password: 'Test@123',
    first_name: 'Rajesh',
    last_name: 'Kumar',
    business_info: {
      business_name: 'Kumar Co-working Hub',
      business_type: 'Shared Office',
      gst_number: '07AABCS1234N1Z5',
      pan_number: 'AABCS1234N',
      business_address: '456 Tech Park Avenue',
      business_city: 'Bangalore',
      business_state: 'Karnataka',
      business_pincode: '560001'
    },
    payment_info: {
      bank_account_number: '1234567890123456',
      bank_ifsc_code: 'HDFC0000123',
      bank_account_holder_name: 'Rajesh Kumar',
      bank_name: 'HDFC Bank',
      upi_id: 'rajesh@oksbi'
    }
  }
]

async function createCompleteOwner(ownerData) {
  try {
    console.log(`\n🚀 Creating complete owner: ${ownerData.email}`)
    console.log('Owner data:', JSON.stringify(ownerData, null, 2))
    
    const response = await fetch(`${baseUrl}/api/admin/create-complete-owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ownerData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Failed to create owner:', result)
      return false
    }

    console.log('✅ Owner created successfully!')
    console.log('📧 Login credentials:', result.login_info)
    console.log('👤 Owner ID:', result.owner?.id || result.owner.id)
    
    if (result.business) {
      console.log('🏢 Business info created:', result.business)
    }
    
    if (result.payment) {
      console.log('💳 Payment info created:', result.payment)
    }

    return true

  } catch (error) {
    console.error(`❌ Error creating owner ${ownerData.email}:`, error)
    return false
  }
}

async function testCompleteOwnerCreation() {
  console.log('🧪 Testing Complete Space Owner Creation API')
  console.log('===============================================')

  let successCount = 0
  let totalCount = testOwners.length

  for (const owner of testOwners) {
    const success = await createCompleteOwner(owner)
    if (success) successCount++
    
    // Small delay between creations
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n📊 Test Summary:')
  console.log(`✅ Successful: ${successCount}/${totalCount}`)
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`)

  if (successCount > 0) {
    console.log('\n🔗 You can now test login at:')
    console.log(`${baseUrl}/signin`)
    console.log('\nTest credentials:')
    testOwners.slice(0, successCount).forEach(owner => {
      console.log(`📧 ${owner.email} / ${owner.password}`)
    })
  }
}

// Run the test
testCompleteOwnerCreation().catch(console.error)
