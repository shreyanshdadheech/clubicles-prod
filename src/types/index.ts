export interface User {
  id: string;
  auth_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  professional_role?: ProfessionalRole;
  roles: UserRole; // This is now required (not nullable)
  user_role?: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpaceOwnerData {
  id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive: boolean;
  onboardingCompleted: boolean;
  approvalStatus: string;
  premiumPlan: string;
  premiumPaymentsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    city?: string;
  };
  business_info?: {
    businessName: string;
    businessType: string;
    gstNumber?: string;
    panNumber: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessPincode: string;
    verificationStatus: string;
  };
  totalRevenue?: number;
  platformCommission?: number;
  totalTax?: number;
  pendingPayout?: number;
  currentBalance?: number;
  totalWithdrawn?: number;
  spacesCount?: number;
  totalBookings?: number;
}

export type UserRole = 'user' | 'admin' | 'owner' | 'moderator' | 'violet' | 'indigo' | 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'grey' | 'white' | 'black';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  membership_type?: MembershipType;
  professional_role?: ProfessionalRole;
  city?: string;
  premium_plan?: PremiumPlan;
  created_at: string;
  updated_at: string;
}

export type MembershipType = 'grey' | 'professional';
export type PremiumPlan = 'basic' | 'premium';

export type ProfessionalRole = 'violet' | 'indigo' | 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'grey' | 'white' | 'black';

export type VIBGYORRole = 'VIOLET' | 'INDIGO' | 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'GREY' | 'WHITE' | 'BLACK';

export interface VIBGYORCategory {
  id: VIBGYORRole;
  name: string;
  color: string;
  description: string;
}

export interface ProfessionalCategory {
  id: ProfessionalRole;
  name: string;
  color: string;
  description: string;
  detailedDescription: string;
  examples: string[];
}

export interface Space {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  total_seats: number;
  available_seats: number;
  price_per_hour: number;
  price_per_day: number;
  amenities: string[];
  images: string[];
  status: SpaceStatus;
  hygiene_rating?: number; // Overall cleanliness rating out of 5
  restroom_hygiene?: number; // Restroom hygiene rating out of 5
  vibgyorCounts?: Record<ProfessionalRole, number>; // VIBGYOR attendance counters
  rating?: number; // Space rating
  created_at: string;
  updated_at: string;
  owner?: User;
}

export type SpaceStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export interface Booking {
  id: string;
  userId: string;
  spaceId: string;
  startTime: string;
  endTime: string;
  date: string;
  seatsBooked: number;
  baseAmount: number; // Amount before taxes
  taxAmount: number; // Total tax amount
  totalAmount: number; // Final amount including taxes
  ownerPayout: number; // Amount owner receives after tax deductions
  status: BookingStatus;
  paymentId?: string;
  taxes?: BookingTax[]; // Applied taxes
  createdAt: string;
  updatedAt: string;
  user?: User;
  space?: Space;
  
  // Redemption fields
  redemption_code?: string;
  qr_code_data?: string;
  is_redeemed?: boolean;
  redeemed_at?: string;
  redeemed_by?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Payment {
  id: string;
  booking_id: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Review {
  id: string;
  user_id: string;
  space_id: string;
  booking_id: string;
  rating: number; // 1-5 stars
  comment?: string;
  created_at: string;
  user?: User;
  users?: {
    id: string;
    first_name?: string;
    last_name?: string;
    professional_role?: ProfessionalRole;
    avatar_url?: string;
  };
  booking?: Booking;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

export interface SearchFilters {
  city?: string;
  pincode?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalSpaces: number;
  totalUsers: number;
  monthlyGrowth: number;
  recentBookings: Booking[];
  premiumOwners?: number;
  totalTaxCollected?: number;
}

export interface TaxConfiguration {
  id: string;
  name: string; // e.g., "GST", "Service Tax", "Platform Fee"
  percentage: number;
  isEnabled: boolean;
  appliesTo: 'booking' | 'owner_payout' | 'both';
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerFinancials {
  id: string;
  owner_id: string;
  total_revenue: number;
  total_tax_deducted: number;
  net_profit: number;
  pending_payout: number;
  total_bookings: number;
  last_calculated: string;
  tax_breakdown: TaxBreakdown[];
}

export interface TaxBreakdown {
  tax_id: string;
  tax_name: string;
  tax_percentage: number;
  tax_amount: number;
}

export interface BookingTax {
  id: string;
  booking_id: string;
  tax_id: string;
  tax_name: string;
  tax_percentage: number;
  tax_amount: number;
  base_amount: number;
}

export interface AdminAnalytics {
  premium_owners_count: number;
  basic_owners_count: number;
  premium_revenue_percentage: number;
  total_tax_collected: number;
  top_earning_owners: OwnerEarnings[];
  monthly_tax_breakdown: MonthlyTaxData[];
}

export interface OwnerEarnings {
  owner_id: string;
  owner_name: string;
  premium_plan: PremiumPlan;
  total_revenue: number;
  total_tax: number;
  net_earnings: number;
  total_bookings: number;
}

export interface MonthlyTaxData {
  month: string;
  year: number;
  total_tax: number;
  booking_count: number;
}
