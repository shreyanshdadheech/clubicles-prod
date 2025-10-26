// Removed Supabase import - using Prisma instead

export interface OwnerSpace {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  totalBookings: number;
  total_seats: number;
  available_seats: number;
  revenue: number;
  rating: number;
  hourlyRate: number;
  dailyRate: number;
  images: string[];
  fullAddress: string;
  companyName: string;
  contactNumber: string;
  pincode: string;
  latitude: number;
  longitude: number;
  amenities: string[];
}

export interface OwnerBooking {
  id: string;
  spaceName: string;
  customerName: string;
  date: string;
  time: string;
  duration: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

export interface OwnerDashboardData {
  owner: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    membershipType: string;
    premiumPlan: string;
  };
  businessInfo: {
    id: string;
    businessName: string;
    gstNumber: string;
    panNumber: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    businessType: string;
    verificationStatus: string;
  } | null;
  paymentInfo: {
    id: string;
    bankAccountNumber: string;
    bankIfscCode: string;
    bankAccountHolderName: string;
    bankName: string;
    upiId: string;
  } | null;
  spaces: OwnerSpace[];
  recentBookings: OwnerBooking[];
  analytics: {
    totalRevenue: number;
    totalBookings: number;
    activeSpaces: number;
    currentBalance: number;
    totalEarned: number;
    pendingAmount: number;
  };
  businessBalance: {
    currentBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    pendingAmount: number;
    commissionDeducted: number;
    taxDeducted: number;
    lastPayoutDate: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  needsOnboarding?: boolean;
}

export interface OwnerFinancialData {
  id: string;
  owner_id: string;
  total_revenue: number;
  total_tax_deducted: number;
  net_profit: number;
  pending_payout: number;
  total_bookings: number;
  last_calculated: string;
  tax_breakdown: Array<{
    tax_id: string;
    tax_name: string;
    tax_percentage: number;
    tax_amount: number;
  }>;
  recent_bookings: Array<{
    id: string;
    user_id: string;
    space_id: string;
    start_time: string;
    end_time: string;
    date: string;
    seats_booked: number;
    base_amount: number;
    tax_amount: number;
    total_amount: number;
    owner_payout: number;
    status: string;
    payment_id: string;
    created_at: string;
    updated_at: string;
  }>;
  business_balance: {
    current_balance: number;
    total_earned: number;
    pending_amount: number;
  };
}

export interface OwnerAnalyticsData {
  monthlyRevenue: number[];
  bookingTrends: number[];
  customerSatisfaction: number;
  occupancyRate: number;
  averageBookingDuration: number;
  peakHours: {
    start: string;
    end: string;
  };
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  monthlyBreakdown: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  recentTrends: {
    revenueGrowth: number;
    bookingGrowth: number;
  };
}

export class OwnerDataService {
  private static async getCurrentOwner(providedUser?: any) {
    // Use provided user if available, otherwise try to get from API
    if (!providedUser) {
      // Try to get user info from API instead of throwing error
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          return userData.user;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      
      // If we can't get user data, return null instead of throwing error
      return null;
    }
    const user = providedUser;

    // Get owner info via API call
    const response = await fetch('/api/owner/approval-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch owner information');
    }

    const data = await response.json();
    
    if (!data.success || !data.owner) {
      // Return empty data instead of throwing error
      return {
        id: providedUser?.id || '',
        email: providedUser?.email || '',
        firstName: providedUser?.firstName || '',
        lastName: providedUser?.lastName || '',
        membershipType: 'basic',
        premiumPlan: 'basic'
      };
    }

    return data.owner;
  }

  static async getDashboardData(providedUser?: any): Promise<OwnerDashboardData> {
    try {
      const response = await fetch('/api/owner/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Return empty dashboard data instead of throwing error
        return {
          owner: {
            id: providedUser?.id || '',
            email: providedUser?.email || '',
            firstName: providedUser?.firstName || '',
            lastName: providedUser?.lastName || '',
            membershipType: 'basic',
            premiumPlan: 'basic'
          },
          businessInfo: null,
          paymentInfo: null,
          spaces: [],
          recentBookings: [],
          analytics: {
            totalRevenue: 0,
            totalBookings: 0,
            activeSpaces: 0,
            currentBalance: 0,
            totalEarned: 0,
            pendingAmount: 0
          },
          businessBalance: null,
          needsOnboarding: true
        };
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return empty dashboard data instead of throwing error
      return {
        owner: {
          id: providedUser?.id || '',
          email: providedUser?.email || '',
          firstName: providedUser?.firstName || '',
          lastName: providedUser?.lastName || '',
          membershipType: 'basic',
          premiumPlan: 'basic'
        },
        businessInfo: null,
        paymentInfo: null,
        spaces: [],
        recentBookings: [],
        analytics: {
          totalRevenue: 0,
          totalBookings: 0,
          activeSpaces: 0,
          currentBalance: 0,
          totalEarned: 0,
          pendingAmount: 0
        },
        businessBalance: null,
        needsOnboarding: true
      };
    }
  }

  static async getFinancialData(providedUser?: any): Promise<OwnerFinancialData> {
    try {
      const response = await fetch('/api/owner/financial', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Return empty financial data instead of throwing error
        return {
          id: providedUser?.id || '',
          owner_id: providedUser?.id || '',
          total_revenue: 0,
          total_tax_deducted: 0,
          net_profit: 0,
          pending_payout: 0,
          total_bookings: 0,
          last_calculated: new Date().toISOString(),
          tax_breakdown: [],
          recent_bookings: [],
          business_balance: {
            current_balance: 0,
            total_earned: 0,
            pending_amount: 0
          }
        };
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching financial data:', error);
      // Return empty financial data instead of throwing error
      return {
        id: providedUser?.id || '',
        owner_id: providedUser?.id || '',
        total_revenue: 0,
        total_tax_deducted: 0,
        net_profit: 0,
        pending_payout: 0,
        total_bookings: 0,
        last_calculated: new Date().toISOString(),
        tax_breakdown: [],
        recent_bookings: [],
        business_balance: {
          current_balance: 0,
          total_earned: 0,
          pending_amount: 0
        }
      };
    }
  }

  static async getAnalyticsData(providedUser?: any): Promise<OwnerAnalyticsData> {
    try {
      const owner = await this.getCurrentOwner(providedUser);
      
      // If no owner data available, return empty analytics
      if (!owner) {
        return {
          monthlyRevenue: [0, 0, 0, 0, 0, 0],
          bookingTrends: [0, 0, 0, 0, 0, 0],
          customerSatisfaction: 0,
          occupancyRate: 0,
          averageBookingDuration: 0,
          peakHours: {
            start: '09:00',
            end: '17:00'
          },
          totalBookings: 0,
          completedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          monthlyBreakdown: [],
          recentTrends: {
            revenueGrowth: 0,
            bookingGrowth: 0
          }
        };
      }
      
      const response = await fetch(`/api/owner/analytics`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Return empty analytics data instead of throwing error
        return {
          monthlyRevenue: [],
          bookingTrends: [],
          customerSatisfaction: 0,
          occupancyRate: 0,
          averageBookingDuration: 0,
          peakHours: {
            start: '09:00',
            end: '17:00'
          },
          totalBookings: 0,
          completedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          monthlyBreakdown: [],
          recentTrends: {
            revenueGrowth: 0,
            bookingGrowth: 0
          }
        };
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Return empty analytics data instead of throwing error
      return {
        monthlyRevenue: [],
        bookingTrends: [],
        customerSatisfaction: 0,
        occupancyRate: 0,
        averageBookingDuration: 0,
        peakHours: {
          start: '09:00',
          end: '17:00'
        },
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        monthlyBreakdown: [],
        recentTrends: {
          revenueGrowth: 0,
          bookingGrowth: 0
        }
      };
    }
  }

  // Static methods to maintain compatibility with existing code
  static getAmenities(): string[] {
    return [
      "WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Printer", "Scanner",
      "Reception", "Security", "Kitchen", "Lounge", "Terrace", "Event Space",
      "Whiteboard", "Natural Light", "Design Tools", "Print Station", "Game Zone",
      "Cafeteria", "Library", "Phone Booth", "Video Conferencing", "Projector",
      "Lockers", "Mail Handling", "Concierge", "Cleaning Service", "24/7 Access",
      "CCTV", "Fire Safety", "Backup Power", "Elevator", "Disability Access",
      "Bike Parking", "Shower Facility"
    ];
  }

  static getBusinessTypes(): string[] {
    return [
      "Private Limited", "Public Limited", "Partnership", "Limited Liability Partnership (LLP)",
      "Sole Proprietorship", "One Person Company (OPC)", "Section 8 Company",
      "Producer Company", "Unlimited Company", "Foreign Company"
    ];
  }

  static getCities(): string[] {
    return [
      "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Ahmedabad",
      "Kolkata", "Gurgaon", "Noida", "Jaipur", "Kochi", "Indore", "Coimbatore",
      "Chandigarh", "Lucknow", "Bhopal", "Visakhapatnam", "Nagpur", "Surat",
      "Vadodara", "Thiruvananthapuram", "Mysuru", "Mangaluru", "Nashik"
    ];
  }

  static getSpaceCategories(): string[] {
    return [
      "Coworking Space", "Private Office", "Meeting Room", "Conference Hall",
      "Hot Desk", "Dedicated Desk", "Virtual Office", "Event Space",
      "Training Room", "Creative Studio", "Tech Lab", "Maker Space"
    ];
  }

  static getBankAccountTypes(): string[] {
    return ["Savings Account", "Current Account", "Business Account", "Corporate Account"];
  }

  static getPaymentSchedules(): Array<{ value: string, label: string }> {
    return [
      { value: "weekly", label: "Weekly (Every Monday)" },
      { value: "biweekly", label: "Bi-weekly (1st & 15th)" },
      { value: "monthly", label: "Monthly (1st of month)" }
    ];
  }

  static getTdsOptions(): Array<{ value: string, label: string }> {
    return [
      { value: "0", label: "No TDS" },
      { value: "1", label: "1% TDS" },
      { value: "2", label: "2% TDS" }
    ];
  }

  static getPopularBanks(): string[] {
    return [
      "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank",
      "Bank of Baroda", "Canara Bank", "Union Bank of India", "IndusInd Bank", "Kotak Mahindra Bank"
    ];
  }
}

export default OwnerDataService;