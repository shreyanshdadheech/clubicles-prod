'use client'

import { CalendarBooking } from "@/components/calendar-booking"
import { Space, User, UserProfile } from "@/types"

// Mock data for demo
const mockSpace: Space = {
  id: "space-1",
  owner_id: "owner-1",
  name: "Modern Co-Working Space",
  description: "A beautiful modern space perfect for meetings and focused work",
  address: "123 Business District",
  city: "Mumbai",
  pincode: "400001",
  latitude: 19.0760,
  longitude: 72.8777,
  total_seats: 50,
  available_seats: 25,
  price_per_hour: 180,
  price_per_day: 1500,
  amenities: ["WiFi", "Projector", "Whiteboard", "Coffee", "AC"],
  images: ["/placeholder-space.jpg"],
  status: "approved",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}

const mockUser: User = {
  id: "user-1",
  auth_id: "user-1",
  email: "demo@example.com",
  first_name: "Demo",
  last_name: "User",
  phone: "+91 9876543210",
  city: "Mumbai",
  professional_role: "violet",
  roles: "user",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}

export default function CalendarDemoPage() {
  const handleBookingSelect = (bookingData: any) => {
    console.log("Booking selected:", bookingData)
    alert(`Booking selected for ${bookingData.date.toDateString()} from ${bookingData.startTime} to ${bookingData.endTime || 'end of day'} - Total: ₹${bookingData.totalAmount}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Calendar Booking Demo</h1>
          <p className="text-muted-foreground">
            Showcasing the enhanced calendar booking component with real-time availability,
            booking type selection, and seamless integration.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Full-featured version */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Full-Featured Calendar</h2>
            <p className="text-sm text-muted-foreground">
              Complete booking interface with space details, booking type selection, and seat management.
            </p>
            <CalendarBooking
              space={mockSpace}
              user={mockUser}
              onBookingSelect={handleBookingSelect}
              compact={false}
            />
          </div>

          {/* Compact version */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Compact Calendar</h2>
            <p className="text-sm text-muted-foreground">
              Simplified interface for quick bookings, perfect for embedded use or mobile views.
            </p>
            <CalendarBooking
              space={mockSpace}
              user={mockUser}
              onBookingSelect={handleBookingSelect}
              compact={true}
            />
          </div>

          {/* Basic version without space/user */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Calendar</h2>
            <p className="text-sm text-muted-foreground">
              Minimal calendar for general use without space-specific features.
            </p>
            <CalendarBooking
              onBookingSelect={handleBookingSelect}
            />
          </div>
        </div>

        {/* Features List */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Enhanced Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">📅 Smart Scheduling</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time availability checking</li>
                <li>• Automatic booking conflict detection</li>
                <li>• 30-minute time slot intervals</li>
                <li>• Past date prevention</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">💰 Flexible Pricing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hourly and daily booking options</li>
                <li>• Dynamic price calculation</li>
                <li>• Multi-seat booking support</li>
                <li>• Real-time total updates</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">🎨 Modern UI/UX</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Responsive design (mobile-friendly)</li>
                <li>• Compact and full-featured modes</li>
                <li>• Accessible time slot selection</li>
                <li>• Clear booking summaries</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">🔗 Seamless Integration</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• TypeScript type safety</li>
                <li>• Supabase backend integration</li>
                <li>• Callback-based booking flow</li>
                <li>• Error handling and loading states</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
