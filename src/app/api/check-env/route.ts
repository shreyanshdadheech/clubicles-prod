import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
    
    // Check service role key format
    const isServiceRoleKey = serviceRoleKey?.startsWith('eyJ') && serviceRoleKey?.includes('service_role')
    const isAnonKey = anonKey?.startsWith('eyJ') && anonKey?.includes('anon')
    
    return NextResponse.json({
      success: true,
      data: {
        environment: {
          hasUrl: !!supabaseUrl,
          hasServiceKey: !!serviceRoleKey,
          hasAnonKey: !!anonKey,
          url: supabaseUrl,
          serviceKeyPrefix: serviceRoleKey?.substring(0, 30) + '...',
          anonKeyPrefix: anonKey?.substring(0, 30) + '...',
          serviceKeyFormat: isServiceRoleKey,
          anonKeyFormat: isAnonKey
        },
        issues: {
          serviceKeyInvalid: !isServiceRoleKey,
          anonKeyInvalid: !isAnonKey,
          missingUrl: !supabaseUrl,
          missingServiceKey: !serviceRoleKey,
          missingAnonKey: !anonKey
        },
        guidance: {
          serviceKey: isServiceRoleKey ? '✅ Correct format' : '❌ Should start with "eyJ" and contain "service_role"',
          anonKey: isAnonKey ? '✅ Correct format' : '❌ Should start with "eyJ" and contain "anon"',
          url: supabaseUrl ? '✅ Present' : '❌ Missing NEXT_PUBLIC_SUPABASE_URL'
        }
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

