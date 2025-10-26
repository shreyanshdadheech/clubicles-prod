#!/bin/bash

# Clubicles Setup Script
# This script helps set up the Clubicles development environment

echo "🏢 Setting up Clubicles - Co-working Space Platform"
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating environment file..."
    cp .env.example .env.local
    echo "📝 Please update .env.local with your Supabase and Razorpay credentials"
    echo ""
    echo "Required environment variables:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- NEXT_PUBLIC_RAZORPAY_KEY_ID"
    echo "- RAZORPAY_KEY_SECRET"
    echo ""
else
    echo "✅ Environment file already exists"
fi

# Display setup instructions
echo ""
echo "🚀 Setup completed! Next steps:"
echo ""
echo "1. Configure your environment variables in .env.local"
echo ""
echo "2. Set up Supabase:"
echo "   - Create a new project at https://supabase.com"
echo "   - Run the SQL schema from 'supabase-schema.sql'"
echo "   - Configure authentication settings"
echo ""
echo "3. Set up Razorpay:"
echo "   - Create an account at https://razorpay.com"
echo "   - Get your API keys from the dashboard"
echo "   - Configure webhook URLs"
echo ""
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "5. Visit http://localhost:3000 to see your application"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo ""
echo "Happy coding! 🎉"
