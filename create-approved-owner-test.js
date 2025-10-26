/**
 * Test script to create an approved space owner for testing
 */

const baseUrl = 'http://localhost:3001'

const approvedOwnerData = {
  email: 'approved-owner@test.com',
  password: 'Test@123',
  first_name: 'Approved',
  last_name: 'Owner',
  business_info: {
    business_name: 'Approved Test Spaces',
    business_type: 'Co-working',
    gst_number: '27AAPFU0939F1ZV',
    pan_number: 'AAPFU0939F',
    business_address: '123 Approved Address',
    business_city: 'Mumbai',
    business_state: 'Maharashtra',
    business_pincode: '400001'
  },
  payment_info: {
    bank_account_number: '1234567890123456',
    bank_ifsc_code: 'HDFC0000123',
    bank_account_holder_name: 'Approved Owner',
    bank_name: 'HDFC Bank',
    upi_id: 'approved@paytm'
  }
}

async function createApprovedOwner() {
  try {
    console.log('🧪 Creating approved space owner for testing...')
    
    const response = await fetch(`${baseUrl}/api/admin/create-complete-owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvedOwnerData)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Failed to create owner:', result)
      return false
    }

    console.log('✅ Owner created successfully!')
    
    // Now update the approval status to 'approved' using direct database query
    console.log('🔄 Updating approval status to approved...')
    
    // Note: In production, this would be done through an admin interface
    // For testing, we'll just note the owner_id
    const ownerId = result.owner?.id || result.owner.id
    console.log('📋 Owner ID:', ownerId)
    console.log('📧 Login credentials:', result.login_info)
    
    console.log('\n⚠️  Manual step required:')
    console.log('Update the approval_status in the database:')
    console.log(`UPDATE space_owners SET approval_status = 'approved' WHERE id = '${ownerId}';`)
    
    console.log('\n🔗 Then test login at:')
    console.log(`${baseUrl}/signin`)
    console.log(`Email: ${approvedOwnerData.email}`)
    console.log(`Password: ${approvedOwnerData.password}`)

    return true

  } catch (error) {
    console.error('❌ Error creating approved owner:', error)
    return false
  }
}

createApprovedOwner().catch(console.error)
