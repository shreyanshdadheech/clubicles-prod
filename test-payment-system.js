// Test script for the payment system
const testPaymentSystem = async () => {
  console.log('🧪 Testing Payment System...')

  try {
    // Test 1: Create payment order
    console.log('\n1. Testing payment order creation...')
    const orderResponse = await fetch('http://localhost:3000/api/payment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'subscription',
        amount: 1001,
        currency: 'INR',
        plan: 'premium',
        billing_cycle: 'monthly'
      })
    })

    const orderData = await orderResponse.json()
    console.log('Order creation result:', orderData)

    if (orderData.success) {
      console.log('✅ Payment order created successfully')
      console.log('Order ID:', orderData.orderId)
    } else {
      console.log('❌ Payment order creation failed:', orderData.error)
    }

    // Test 2: Get payment status
    if (orderData.success) {
      console.log('\n2. Testing payment status retrieval...')
      const statusResponse = await fetch(`http://localhost:3000/api/payment/process?orderId=${orderData.orderId}&type=subscription`)
      const statusData = await statusResponse.json()
      console.log('Payment status result:', statusData)

      if (statusData.success) {
        console.log('✅ Payment status retrieved successfully')
      } else {
        console.log('❌ Payment status retrieval failed:', statusData.error)
      }
    }

    // Test 3: Test owner payments API (requires authentication)
    console.log('\n3. Testing owner payments API...')
    console.log('Note: This requires authentication token')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testPaymentSystem()
