#!/usr/bin/env node

/**
 * Razorpay Setup Script for Clubicles
 * This script helps you configure Razorpay credentials for real payments
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function setupRazorpay() {
  console.log('🚀 Setting up Razorpay for Clubicles...\n')
  
  console.log('📋 To get your Razorpay credentials:')
  console.log('1. Go to https://dashboard.razorpay.com/')
  console.log('2. Sign up or log in to your account')
  console.log('3. Go to Settings > API Keys')
  console.log('4. Generate API Keys (Test mode for development)')
  console.log('5. Copy your Key ID and Key Secret\n')
  
  try {
    const keyId = await question('Enter your Razorpay Key ID: ')
    const keySecret = await question('Enter your Razorpay Key Secret: ')
    
    if (!keyId || !keySecret) {
      console.log('❌ Both Key ID and Key Secret are required!')
      process.exit(1)
    }
    
    // Update .env file
    const envPath = path.join(__dirname, '.env')
    let envContent = ''
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }
    
    // Update or add Razorpay credentials
    const lines = envContent.split('\n')
    let updated = false
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('NEXT_PUBLIC_RAZORPAY_KEY_ID=')) {
        lines[i] = `NEXT_PUBLIC_RAZORPAY_KEY_ID=${keyId}`
        updated = true
      }
      if (lines[i].startsWith('RAZORPAY_KEY_SECRET=')) {
        lines[i] = `RAZORPAY_KEY_SECRET=${keySecret}`
        updated = true
      }
    }
    
    if (!updated) {
      lines.push(`NEXT_PUBLIC_RAZORPAY_KEY_ID=${keyId}`)
      lines.push(`RAZORPAY_KEY_SECRET=${keySecret}`)
    }
    
    fs.writeFileSync(envPath, lines.join('\n'))
    
    // Also update .env.local
    const envLocalPath = path.join(__dirname, '.env.local')
    let envLocalContent = ''
    
    if (fs.existsSync(envLocalPath)) {
      envLocalContent = fs.readFileSync(envLocalPath, 'utf8')
    }
    
    const localLines = envLocalContent.split('\n')
    let localUpdated = false
    
    for (let i = 0; i < localLines.length; i++) {
      if (localLines[i].startsWith('NEXT_PUBLIC_RAZORPAY_KEY_ID=')) {
        localLines[i] = `NEXT_PUBLIC_RAZORPAY_KEY_ID=${keyId}`
        localUpdated = true
      }
      if (localLines[i].startsWith('RAZORPAY_KEY_SECRET=')) {
        localLines[i] = `RAZORPAY_KEY_SECRET=${keySecret}`
        localUpdated = true
      }
    }
    
    if (!localUpdated) {
      localLines.push(`NEXT_PUBLIC_RAZORPAY_KEY_ID=${keyId}`)
      localLines.push(`RAZORPAY_KEY_SECRET=${keySecret}`)
    }
    
    fs.writeFileSync(envLocalPath, localLines.join('\n'))
    
    console.log('\n✅ Razorpay credentials updated successfully!')
    console.log('📁 Updated files:')
    console.log('   - .env')
    console.log('   - .env.local')
    
    console.log('\n🔄 Please restart your development server:')
    console.log('   npm run dev')
    console.log('   # or')
    console.log('   yarn dev')
    
    console.log('\n🧪 Test your setup:')
    console.log('   1. Go to http://localhost:3000/pricing')
    console.log('   2. Click "Choose Premium"')
    console.log('   3. You should now see the real Razorpay payment popup!')
    
    console.log('\n⚠️  Important Notes:')
    console.log('   - Use TEST mode credentials for development')
    console.log('   - Use LIVE mode credentials for production')
    console.log('   - Never commit real credentials to version control')
    console.log('   - Add .env and .env.local to .gitignore')
    
  } catch (error) {
    console.error('❌ Error setting up Razorpay:', error.message)
  } finally {
    rl.close()
  }
}

// Run the setup
setupRazorpay()
