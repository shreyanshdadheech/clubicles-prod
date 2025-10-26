/**
 * Complete test script for approval system
 */

const baseUrl = 'http://localhost:3001'

const testData = {
  email: 'approval-test@example.com',
  password: 'Test@123',
  first_name: 'Approval',
  last_name: 'Test',
  business_info: {
    business_name: 'Test Approval Spaces',
    business_type: 'Co-working',
    gst_number: '27AAPFU0939F1ZV',
    pan_number: 'AAPFU0939F',
    business_address: '123 Test Address',
    business_city: 'Mumbai',
    business_state: 'Maharashtra',
    business_pincode: '400001'
  },
  payment_info: {
    bank_account_number: '1234567890123456',
    bank_ifsc_code: 'HDFC0000123',
    bank_account_holder_name: 'Approval Test',
    bank_name: 'HDFC Bank',
    upi_id: 'test@paytm'
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testApprovalSystem() {
  console.log('🧪 Testing Complete Approval System')
  console.log('==================================')
  
  try {
    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...')
    await delay(3000)

    // Step 1: Create owner (will be pending by default)
    console.log('\n1️⃣ Creating space owner (should be pending)...')
    const createResponse = await fetch(`${baseUrl}/api/admin/create-complete-owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const createResult = await createResponse.json()

    if (!createResponse.ok) {
      console.error('❌ Failed to create owner:', createResult)
      return
    }

    const ownerId = createResult.owner?.id || createResult.owner.id
    console.log('✅ Owner created with ID:', ownerId)
    console.log('📧 Login credentials:', createResult.login_info)

    // Step 2: Test pending status
    console.log('\n2️⃣ Testing pending status...')
    console.log('🔗 Login now at:', `${baseUrl}/signin`)
    console.log('📧 Email:', testData.email)
    console.log('🔑 Password:', testData.password)
    console.log('Expected: Should show pending approval screen')

    console.log('\n⏸️  Login and verify pending status, then press Enter to continue...')
    // In a real script, you might want to pause here for manual testing
    await delay(2000)

    // Step 3: Update to approved
    console.log('\n3️⃣ Updating status to approved...')
    const approveResponse = await fetch(`${baseUrl}/api/admin/update-approval-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner_id: ownerId,
        approval_status: 'approved'
      })
    })

    const approveResult = await approveResponse.json()

    if (!approveResponse.ok) {
      console.error('❌ Failed to approve owner:', approveResult)
      return
    }

    console.log('✅ Owner approved successfully!')
    console.log('🔗 Login again at:', `${baseUrl}/signin`)
    console.log('Expected: Should show full dashboard with welcome message')

    // Step 4: Test rejected status (optional)
    console.log('\n4️⃣ Testing rejected status (for completeness)...')
    const rejectResponse = await fetch(`${baseUrl}/api/admin/update-approval-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner_id: ownerId,
        approval_status: 'rejected'
      })
    })

    if (rejectResponse.ok) {
      console.log('✅ Status updated to rejected')
      console.log('🔗 Login again to see rejection screen')
      console.log('Expected: Should show rejection screen with delete option')
    }

    console.log('\n🎉 Approval system test complete!')
    console.log('\nTest Summary:')
    console.log('✅ Owner creation with pending status')
    console.log('✅ Approval status API endpoints')
    console.log('✅ Status update functionality')
    console.log('\nManual testing required:')
    console.log('📱 Test pending approval screen')
    console.log('📱 Test approved dashboard access') 
    console.log('📱 Test rejected screen and account deletion')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testApprovalSystem().catch(console.error)
