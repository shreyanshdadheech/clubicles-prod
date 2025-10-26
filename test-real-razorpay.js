#!/usr/bin/env node

/**
 * Test Real Razorpay Integration
 * This script tests the payment system with real Razorpay credentials
 */

const Razorpay = require('razorpay')

async function testRealRazorpay() {
  console.log('🧪 Testing Real Razorpay Integration...\n')
  
  try {
    // Test 1: Initialize Razorpay with real credentials
    console.log('1. Testing Razorpay initialization...')
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RGI2uASp6cMe78',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '1p6GROzomzSuL4KtfB464nzz'
    })
    console.log('✅ Razorpay initialized successfully')
    
    // Test 2: Create a test order
    console.log('\n2. Testing order creation...')
    const orderData = {
      amount: 1001, // ₹10.01 in paise
      currency: 'INR',
      receipt: `test_order_${Date.now()}`,
      notes: {
        test: true,
        description: 'Test order for Clubicles'
      }
    }
    
    const order = await razorpay.orders.create(orderData)
    console.log('✅ Order created successfully!')
    console.log('   Order ID:', order.id)
    console.log('   Amount:', order.amount)
    console.log('   Currency:', order.currency)
    console.log('   Status:', order.status)
    
    // Test 3: Fetch order details
    console.log('\n3. Testing order retrieval...')
    const fetchedOrder = await razorpay.orders.fetch(order.id)
    console.log('✅ Order fetched successfully!')
    console.log('   Order ID:', fetchedOrder.id)
    console.log('   Amount:', fetchedOrder.amount)
    console.log('   Status:', fetchedOrder.status)
    
    // Test 4: Test payment API endpoint
    console.log('\n4. Testing payment API endpoint...')
    const response = await fetch('http://localhost:3000/api/payment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        type: 'subscription',
        amount: 1001,
        currency: 'INR',
        plan: 'premium',
        billing_cycle: 'monthly'
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Payment API working!')
      console.log('   Success:', data.success)
      console.log('   Order ID:', data.orderId)
      console.log('   Is Mock:', data.isMock)
      
      if (data.isMock) {
        console.log('⚠️  Warning: Still using mock payments')
        console.log('   This might be due to:')
        console.log('   - Server not restarted after env update')
        console.log('   - Environment variables not loaded')
        console.log('   - API still detecting placeholder values')
      } else {
        console.log('🎉 Real Razorpay integration working!')
      }
    } else {
      console.log('❌ Payment API failed:', response.status)
      const errorText = await response.text()
      console.log('   Error:', errorText)
    }
    
    console.log('\n🎉 Razorpay integration test completed!')
    console.log('\n📋 Next Steps:')
    console.log('1. Restart your development server: npm run dev')
    console.log('2. Go to http://localhost:3000/pricing')
    console.log('3. Click "Choose Premium"')
    console.log('4. You should see the real Razorpay payment popup!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.statusCode === 401) {
      console.log('\n🔧 Authentication Error:')
      console.log('   - Check your Razorpay credentials')
      console.log('   - Ensure Key ID and Secret are correct')
      console.log('   - Verify you\'re using Test mode credentials')
    } else if (error.statusCode === 400) {
      console.log('\n🔧 Bad Request Error:')
      console.log('   - Check order data format')
      console.log('   - Verify amount is in paise (smallest currency unit)')
    } else {
      console.log('\n🔧 General Error:')
      console.log('   - Check your internet connection')
      console.log('   - Verify Razorpay service is accessible')
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Run the test
testRealRazorpay()
