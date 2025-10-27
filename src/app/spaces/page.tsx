"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProfessionalBadge } from "@/components/ui/professional-selector"
import { Search, MapPin, Wifi, Coffee, Car, Users, Star, Filter, Calendar, Eye, Navigation, Sparkles } from "lucide-react"
import type { Space, ProfessionalRole } from "@/types"
import { PROFESSIONAL_CATEGORIES, getProfessionalCategory } from "@/lib/professional-categories"
import { calculateDistance, getCurrentLocation, getCityCoordinates, extractLocationFromSearch, getNearestCity, type Coordinates } from "@/lib/location-utils"
import Link from "next/link"
import { SharedNavigation } from "@/components/shared/navigation"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

// Extend Space locally with vibgyor attendance counts and rating
type SpaceWithAttendance = Space & { 
  vibgyorCounts: Record<ProfessionalRole, number>
  rating: number
}

// Extended space type with additional display data
interface ExtendedSpace extends Space {
  vibgyorCounts: Record<ProfessionalRole, number>;
  rating: number;
  distance?: number; // Distance from user location in km
}

const mockSpaces: ExtendedSpace[] = [
  {
    id: "1",
    owner_id: "owner1",
    name: "TechHub Co-working BKC",
    description:
      "Premium workspace in the heart of Mumbai's business district. Perfect for tech professionals and startups.",
    address: "Bandra Kurla Complex, Mumbai",
    city: "Mumbai",
    pincode: "400051",
    latitude: 19.0554,
    longitude: 72.8390,
    total_seats: 50,
    available_seats: 35,
    price_per_hour: 150,
    price_per_day: 1200,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Printer", "Premium Showers"],
    images: [],
    status: "approved",
    hygiene_rating: 4.8,
    restroom_hygiene: 4.9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 12,
      indigo: 1,
      blue: 1,
      green: 1,
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.8,
  },
  {
    id: "2",
    owner_id: "owner2",
    name: "Creative Studio Koregaon",
    description:
      "Inspiring workspace for creative professionals. Open layout with natural light and artistic ambiance.",
    address: "Koregaon Park, Pune",
    city: "Pune",
    pincode: "411001",
    latitude: 18.5362,
    longitude: 73.8962,
    total_seats: 30,
    available_seats: 22,
    price_per_hour: 120,
    price_per_day: 950,
    amenities: ["WiFi", "Design Tools", "Print Station", "Coffee", "AC"],
    images: [],
    status: "approved",
    hygiene_rating: 4.6,
    restroom_hygiene: 4.7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 8,  // Industrial focused space
      blue: 0,
      green: 0,
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.6,
  },
  {
    id: "3",
    owner_id: "owner3",
    name: "Business Hub Cyber City",
    description:
      "Professional workspace ideal for business meetings and corporate work. Modern facilities and prime location.",
    address: "Cyber City, Gurgaon",
    city: "Gurgaon",
    pincode: "122002",
    latitude: 28.4595,
    longitude: 77.0266,
    total_seats: 80,
    available_seats: 60,
    price_per_hour: 200,
    price_per_day: 1500,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Reception", "Security"],
    images: [],
    status: "approved",
    hygiene_rating: 4.9,
    restroom_hygiene: 4.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 1,
      indigo: 1,
      blue: 18,  // Business focused space
      green: 0,
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.9,
  },
  {
    id: "4",
    owner_id: "owner4",
    name: "Bengaluru Tech Park",
    description:
      "Modern co-working space in the Silicon Valley of India. Perfect for tech startups and IT professionals.",
    address: "Electronic City, Bengaluru",
    city: "Bengaluru",
    pincode: "560100",
    latitude: 12.8457,
    longitude: 77.6632,
    total_seats: 120,
    available_seats: 85,
    price_per_hour: 180,
    price_per_day: 1400,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Printer", "Game Zone", "Cafeteria"],
    images: [],
    status: "approved",
    hygiene_rating: 4.7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 1,
      indigo: 1,
      blue: 1,
      green: 32,  // Growth focused space
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.7,
  },
  {
    id: "5",
    owner_id: "owner5",
    name: "InnoSpace Whitefield",
    description:
      "Premium workspace in Whitefield with state-of-the-art facilities. Ideal for multinational companies.",
    address: "Whitefield, Bengaluru",
    city: "Bengaluru",
    pincode: "560066",
    latitude: 12.9698,
    longitude: 77.7500,
    total_seats: 90,
    available_seats: 65,
    price_per_hour: 160,
    price_per_day: 1300,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Cafeteria", "Reception", "Premium Showers"],
    images: [],
    status: "approved",
    hygiene_rating: 4.5,
    restroom_hygiene: 4.3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 0,
      blue: 0,
      green: 0,
      yellow: 25,  // Young Entrepreneurs focused space
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.5,
  },
  {
    id: "6",
    owner_id: "owner6",
    name: "Chennai IT Hub",
    description:
      "Professional workspace in the IT corridor of Chennai. Perfect for software companies and freelancers.",
    address: "OMR, Chennai",
    city: "Chennai",
    pincode: "600096",
    latitude: 18.5204,
    longitude: 73.8567,
    total_seats: 75,
    available_seats: 50,
    price_per_hour: 140,
    price_per_day: 1100,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Printer", "Lounge"],
    images: [],
    status: "approved",
    hygiene_rating: 4.4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 0,
      blue: 0,
      green: 0,
      yellow: 0,
      orange: 25,  // O - Operations focused space
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.4,
  },
  {
    id: "7",
    owner_id: "owner7",
    name: "Hyderabad Cyberabad Hub",
    description:
      "Modern workspace in HITEC City with excellent connectivity. Great for tech companies and startups.",
    address: "HITEC City, Hyderabad",
    city: "Hyderabad",
    pincode: "500081",
    latitude: 22.5726,
    longitude: 88.3639,
    total_seats: 100,
    available_seats: 70,
    price_per_hour: 170,
    price_per_day: 1350,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Cafeteria", "Event Space"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 0,
      blue: 0,
      green: 0,
      yellow: 0,
      orange: 0,
      red: 30,  // Researchers focused space
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.3,
    hygiene_rating: 4.8,  // High hygiene rating
    restroom_hygiene: 4.95,  // Highest restroom hygiene rating
  },
  {
    id: "8",
    owner_id: "owner8",
    name: "Delhi CP Business Center",
    description:
      "Prime workspace in Connaught Place with premium amenities. Perfect for business meetings and corporate work.",
    address: "Connaught Place, New Delhi",
    city: "Delhi",
    pincode: "110001",
    latitude: 28.6139,
    longitude: 77.2090,
    total_seats: 60,
    available_seats: 40,
    price_per_hour: 220,
    price_per_day: 1800,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Reception", "Security", "Lounge"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 8,  // All VIBGYOR categories represented
      indigo: 6,
      blue: 5,
      green: 7,
      yellow: 4,
      orange: 5,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.2,
  },
  {
    id: "9",
    owner_id: "owner9",
    name: "Ahmedabad Innovation Hub",
    description:
      "Creative workspace promoting innovation and collaboration. Great for startups and small businesses.",
    address: "Satellite, Ahmedabad",
    city: "Ahmedabad",
    pincode: "380015",
    latitude: 13.0827,
    longitude: 80.2707,
    total_seats: 45,
    available_seats: 30,
    price_per_hour: 110,
    price_per_day: 900,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Kitchen"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 10,  // V & I dominant space
      indigo: 5,
      blue: 0,
      green: 0,
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.1,
  },
  {
    id: "10",
    owner_id: "owner10",
    name: "Kolkata Tech Tower",
    description:
      "Modern workspace in the cultural capital of India. Perfect for creative professionals and tech startups.",
    address: "Salt Lake, Kolkata",
    city: "Kolkata",
    pincode: "700091",
    latitude: 26.9124,
    longitude: 75.7873,
    total_seats: 70,
    available_seats: 45,
    price_per_hour: 130,
    price_per_day: 1050,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Cafeteria", "Library"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 0,
      blue: 15,  // B & Y dominant space
      green: 0,
      yellow: 10,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 4.0,
  },
  {
    id: "11",
    owner_id: "owner11",
    name: "Mumbai Andheri Tech Park",
    description:
      "Spacious co-working facility in Andheri East. Perfect for teams and individual professionals.",
    address: "Andheri East, Mumbai",
    city: "Mumbai",
    pincode: "400059",
    total_seats: 85,
    available_seats: 60,
    price_per_hour: 140,
    price_per_day: 1150,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Printer", "Reception"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 3,  // G & O dominant space
      indigo: 2,
      blue: 0,
      green: 12,
      yellow: 0,
      orange: 8,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.9,
  },
  {
    id: "12",
    owner_id: "owner12",
    name: "Pune Hinjewadi IT Hub",
    description:
      "State-of-the-art workspace in Pune's IT capital. Excellent facilities for software professionals.",
    address: "Hinjewadi, Pune",
    city: "Pune",
    pincode: "411057",
    latitude: 18.5918,
    longitude: 73.7394,
    total_seats: 110,
    available_seats: 80,
    price_per_hour: 155,
    price_per_day: 1250,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Cafeteria", "Game Zone", "Terrace"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 5,  // I & R dominant space
      blue: 0,
      green: 0,
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.8,
  },
  {
    id: "13",
    owner_id: "owner13",
    name: "Noida Sector 62 Tech Center",
    description:
      "Modern workspace in the heart of Noida's tech hub. Perfect for IT companies and digital agencies.",
    address: "Sector 62, Noida",
    city: "Noida",
    pincode: "201309",
    total_seats: 95,
    available_seats: 70,
    price_per_hour: 165,
    price_per_day: 1320,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Cafeteria", "Security"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 6,  // V & G dual focus space
      indigo: 0,
      blue: 0,
      green: 19,
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.7,
  },
  {
    id: "14",
    owner_id: "owner14",
    name: "Jaipur Innovation Park",
    description:
      "Creative workspace in the Pink City. Great for startups, freelancers, and creative professionals.",
    address: "Malviya Nagar, Jaipur",
    city: "Jaipur",
    pincode: "302017",
    total_seats: 55,
    available_seats: 40,
    price_per_hour: 125,
    price_per_day: 1000,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Kitchen", "Terrace"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 0,
      blue: 12,  // B & O dual focus space
      green: 0,
      yellow: 0,
      orange: 18,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.6,
  },
  {
    id: "15",
    owner_id: "owner15",
    name: "Kochi Marine Drive Hub",
    description:
      "Premium workspace with scenic views in God's Own Country. Perfect for tech startups and digital nomads.",
    address: "Marine Drive, Kochi",
    city: "Kochi",
    pincode: "682031",
    total_seats: 65,
    available_seats: 45,
    price_per_hour: 135,
    price_per_day: 1080,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Cafeteria", "Lounge"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 0,
      blue: 0,
      green: 0,
      yellow: 20,  // Y dominant space
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.5,
  },
  {
    id: "16",
    owner_id: "owner16",
    name: "Indore Business Park",
    description:
      "Professional workspace in the commercial capital of Madhya Pradesh. Great for business and trade.",
    address: "Vijay Nagar, Indore",
    city: "Indore",
    pincode: "452010",
    total_seats: 50,
    available_seats: 35,
    price_per_hour: 115,
    price_per_day: 920,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Reception"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 15,  // I dominant space
      blue: 0,
      green: 0,
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.4,
  },
  {
    id: "17",
    owner_id: "owner17",
    name: "Coimbatore Tech Valley",
    description:
      "Modern workspace in the textile city with growing IT presence. Perfect for manufacturing and tech firms.",
    address: "Peelamedu, Coimbatore",
    city: "Coimbatore",
    pincode: "641004",
    total_seats: 40,
    available_seats: 25,
    price_per_hour: 105,
    price_per_day: 840,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Kitchen"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 10,  // I & O dual focus space
      blue: 0,
      green: 0,
      yellow: 0,
      orange: 5,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.3,
  },
  {
    id: "18",
    owner_id: "owner18",
    name: "Chandigarh City Center",
    description:
      "Beautiful workspace in the planned city of India. Perfect for government and private sector professionals.",
    address: "Sector 17, Chandigarh",
    city: "Chandigarh",
    pincode: "160017",
    total_seats: 60,
    available_seats: 42,
    price_per_hour: 145,
    price_per_day: 1160,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Cafeteria", "Garden"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 5,  // Balanced with G & Y focus
      indigo: 0,
      blue: 0,
      green: 8,
      yellow: 5,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.2,
  },
  {
    id: "19",
    owner_id: "owner19",
    name: "Lucknow Heritage Hub",
    description:
      "Traditional meets modern workspace in the city of Nawabs. Great for professionals and entrepreneurs.",
    address: "Gomti Nagar, Lucknow",
    city: "Lucknow",
    pincode: "226010",
    total_seats: 45,
    available_seats: 30,
    price_per_hour: 110,
    price_per_day: 880,
    amenities: ["WiFi", "Coffee", "Meeting Rooms", "Parking", "AC", "Reception"],
    images: [],
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vibgyorCounts: {
      violet: 0,
      indigo: 0,
      blue: 8,  // B & R dual focus space
      green: 0,
      yellow: 0,
      orange: 0,
      red: 0,
      grey: 0,
      white: 0,
      black: 0,
    },
    rating: 3.1,
  },
]

const POPULAR_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Kolkata",
  "Gurgaon", "Noida", "Jaipur", "Kochi", "Indore", "Coimbatore", "Chandigarh", "Lucknow"
]

const AMENITIES_LIST = [
  "WiFi",
  "Coffee",
  "Meeting Rooms",
  "Parking",
  "AC",
  "Printer",
  "Reception",
  "Security",
  "Kitchen",
  "Lounge",
  "Terrace",
  "Event Space",
]

function SpacesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [spaces, setSpaces] = useState<ExtendedSpace[]>([])
  const [filteredSpaces, setFilteredSpaces] = useState<ExtendedSpace[]>([])
  const [displayedSpaces, setDisplayedSpaces] = useState<ExtendedSpace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedProfessionalRole, setSelectedProfessionalRole] = useState<ProfessionalRole | "">("")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 })
  const [distanceRange, setDistanceRange] = useState({ min: 0, max: 160 })
  const [showFilters, setShowFilters] = useState(false)
  const [availabilityDate, setAvailabilityDate] = useState("")
  
  // Location-based states
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [userCurrentCity, setUserCurrentCity] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocationLoading, setIsLocationLoading] = useState(false)

  // Pagination and sorting states
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low-high' | 'price-high-low' | 'availability' | 'hygiene' | 'distance'>('recommended')
  const itemsPerPage = 4

  // Function to load real spaces from API
  const loadSpaces = async () => {
    try {
      setIsLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (selectedCity) params.append('city', selectedCity)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/spaces?${params.toString()}`)
      const result = await response.json()
      
      
      if (response.ok && result.success) {
        // Transform API data to match frontend ExtendedSpace format
        const transformedSpaces: ExtendedSpace[] = result.spaces.map((space: any) => ({
          ...space,
          // Use real vibgyor counts from database
          vibgyorCounts: space.vibgyorCounts || {
            violet: 0,
            indigo: 0,
            blue: 0,
            green: 0,
            yellow: 0,
            orange: 0,
            red: 0,
            grey: 0,
            white: 0,
            black: 0,
          } as Record<ProfessionalRole, number>,
          // Ensure rating is set
          rating: space.rating || 0
        }))
        
        setSpaces(transformedSpaces)
        setFilteredSpaces(transformedSpaces)
      } else {
        console.error('Failed to load spaces:', result.error)
        setSpaces([])
        setFilteredSpaces([])
      }
    } catch (error) {
      console.error('Error loading spaces:', error)
      setSpaces([])
      setFilteredSpaces([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load spaces on component mount
  useEffect(() => {
    loadSpaces()
  }, [])

  // Reload spaces when filters change
  useEffect(() => {
    loadSpaces()
  }, [selectedCity, searchQuery])

  // Get user's current location
  useEffect(() => {
    const getLocation = async () => {
      if (sortBy === 'distance') {
        setIsLocationLoading(true)
        try {
          const location = await getCurrentLocation()
          setUserLocation(location)
          
          // Get the nearest city for location sorting
          const nearestCity = getNearestCity(location)
          setUserCurrentCity(nearestCity)
          
          setLocationError(null)
        } catch (error) {
          setLocationError(error instanceof Error ? error.message : 'Failed to get location')
        } finally {
          setIsLocationLoading(false)
        }
      }
    }
    getLocation()
  }, [sortBy])

  // Update authentication state when user changes
  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  const handleBookSpace = (spaceId: string, bookingParams: URLSearchParams) => {
    if (!isAuthenticated) {
      // Redirect to signin with return URL
      const returnUrl = `/spaces/${spaceId}/book?${bookingParams.toString()}`
      router.push(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }
    
    // If authenticated, proceed to booking
    router.push(`/spaces/${spaceId}/book?${bookingParams.toString()}`)
  }

  // Handle URL parameters from homepage search
  useEffect(() => {
    const cityParam = searchParams.get('city')
    const searchParam = searchParams.get('search')
    const sortParam = searchParams.get('sort')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    if (cityParam) {
      setSelectedCity(cityParam)
    }
    if (searchParam) {
      setSearchQuery(searchParam)
    }
    
    // Handle distance/location parameters
    if (sortParam === 'distance') {
      setSortBy('distance')
      if (lat && lng) {
        setUserLocation({ latitude: parseFloat(lat), longitude: parseFloat(lng) })
        // Get city from coordinates (simplified - you might want to reverse geocode)
        getCurrentLocation().then(location => {
          const nearestCity = getNearestCity(location)
          setUserCurrentCity(nearestCity)
          setLocationError(null)
        }).catch(() => {
          // Use provided coordinates as fallback
        })
      }
    }
  }, [searchParams])

  // Apply filters
  useEffect(() => {
    let filtered = spaces

    // Search query filter (only applied if not already filtered by API)
    // Note: API already filters by searchQuery, so this is a client-side safety check
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter((space) => {
        // Search in name, description, address, pincode
        const matchesText = 
          space.name.toLowerCase().includes(searchLower) ||
          space.description.toLowerCase().includes(searchLower) ||
          space.address.toLowerCase().includes(searchLower) ||
          space.pincode.toLowerCase().includes(searchLower)
        
        // Search in amenities
        const matchesAmenities = space.amenities.some(amenity => 
          amenity.toLowerCase().includes(searchLower)
        )
        
        // Also search in city
        const matchesCity = space.city.toLowerCase().includes(searchLower)
        
        return matchesText || matchesAmenities || matchesCity
      })
    }

    // City filter
    if (selectedCity && selectedCity !== '') {
      filtered = filtered.filter((space) => 
        space.city.toLowerCase() === selectedCity.toLowerCase()
      )
    }

    // Price range filter
    filtered = filtered.filter(
      (space) => space.price_per_hour >= priceRange.min && space.price_per_hour <= priceRange.max,
    )

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter((space) => selectedAmenities.every((amenity) => space.amenities.includes(amenity)))
    }

    // VIBGYOR role filter (spaces that cater to specific professional categories)
    if (selectedProfessionalRole) {
      filtered = filtered.filter((space) => {
        // Filter spaces that have a significant presence from the selected VIBGYOR category
        // Show spaces where the selected category has at least 3 members OR is the dominant category
        const selectedCategoryCount = space.vibgyorCounts[selectedProfessionalRole]
        const totalMembers = Object.values(space.vibgyorCounts).reduce((sum, count) => sum + count, 0)
        const maxCategoryCount = Math.max(...Object.values(space.vibgyorCounts))
        
        // If no members in any category, show all spaces (no filtering)
        if (totalMembers === 0) {
          return true
        }
        
        // Show space if:
        // 1. Selected category has 3+ members, OR
        // 2. Selected category is the dominant category (highest count), OR
        // 3. Selected category represents at least 20% of the space
        return selectedCategoryCount >= 3 || 
               selectedCategoryCount === maxCategoryCount || 
               (totalMembers > 0 && selectedCategoryCount / totalMembers >= 0.2)
      })
    }

    // Calculate distances for all spaces if user location is available
    if (userLocation) {
      filtered = filtered.map(space => ({
        ...space,
        distance: space.latitude && space.longitude 
          ? calculateDistance(
              userLocation,
              { latitude: space.latitude, longitude: space.longitude }
            )
          : undefined
      }))

      // Distance range filter (only apply if user location is available)
      filtered = filtered.filter((space) => {
        if (space.distance === undefined) return true; // Include spaces without coordinates
        return space.distance >= distanceRange.min && space.distance <= distanceRange.max;
      })
    }

    setFilteredSpaces(filtered)
    setCurrentPage(1) // Reset pagination when filters change
  }, [spaces, searchQuery, selectedCity, selectedProfessionalRole, selectedAmenities, priceRange, availabilityDate, userLocation, distanceRange])

  // Apply sorting and pagination
  useEffect(() => {
    let sorted = [...filteredSpaces]

    // Apply sorting
    switch (sortBy) {
      case 'recommended':
        sorted = sorted.sort((a, b) => b.rating - a.rating) // Highest rating first
        break
      case 'price-low-high':
        sorted = sorted.sort((a, b) => a.price_per_hour - b.price_per_hour)
        break
      case 'price-high-low':
        sorted = sorted.sort((a, b) => b.price_per_hour - a.price_per_hour)
        break
      case 'availability':
        sorted = sorted.sort((a, b) => b.available_seats - a.available_seats) // Most available first
        break
      case 'hygiene':
        sorted = sorted.sort((a, b) => (b.restroom_hygiene || 0) - (a.restroom_hygiene || 0)) // Highest restroom hygiene rating first
        break
      case 'distance':
        sorted = sorted.sort((a, b) => {
          // First prioritize spaces in user's current city
          if (userCurrentCity) {
            const aInCurrentCity = a.city === userCurrentCity
            const bInCurrentCity = b.city === userCurrentCity
            
            if (aInCurrentCity && !bInCurrentCity) return -1
            if (!aInCurrentCity && bInCurrentCity) return 1
          }
          
          // Then sort by actual distance
          return (a.distance || 0) - (b.distance || 0)
        })
        break
      default:
        break
    }

    // Apply pagination - show only first few items based on current page
    const endIndex = currentPage * itemsPerPage
    const paginated = sorted.slice(0, endIndex)
    
    setDisplayedSpaces(paginated)
  }, [filteredSpaces, sortBy, currentPage, userLocation])

  // Reset pagination when sorting changes
  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy])

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  const hasMoreSpaces = displayedSpaces.length < filteredSpaces.length

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCity("")
    setSelectedProfessionalRole("")
    setSelectedAmenities([])
    setPriceRange({ min: 0, max: 2000 })
    setAvailabilityDate("")
    setCurrentPage(1)
    setSortBy('recommended')
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "WiFi":
        return <Wifi className="h-4 w-4" />
      case "Coffee":
        return <Coffee className="h-4 w-4" />
      case "Parking":
        return <Car className="h-4 w-4" />
      case "Meeting Rooms":
        return <Users className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <SharedNavigation />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-10">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight bg-gradient-to-r from-white via-white/85 to-white/60 bg-clip-text text-transparent">
              Discover High‑Performance Workspaces
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Search, filter and book premium ergonomic environments engineered for focus, collaboration and flow across
              India.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setShowFilters((s) => !s)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                <Filter className="h-4 w-4" /> {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              <button onClick={clearFilters} className="text-sm text-white/60 hover:text-white transition-colors">
                Reset
              </button>
            </div>
          </div>
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Search by name, area, pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className={`${showFilters ? "block" : "hidden lg:block"} lg:col-span-1 space-y-6`}>
            <Card className="rounded-3xl border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base font-semibold text-white">
                  Filters <span className="text-xs font-medium text-white/60">Refine results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-7">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide font-medium text-white/80">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      const newCity = e.target.value
                      setSelectedCity(newCity)
                      // Clear search query when city changes to avoid conflicts
                      if (newCity) {
                        setSearchQuery('')
                      }
                    }}
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="" className="bg-gray-800 text-white">All Cities</option>
                    {POPULAR_CITIES.map((c) => (
                      <option key={c} className="bg-gray-800 text-white" value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Distance Range Filter - Show when distance sorting is active */}
                {sortBy === 'distance' && userLocation && (
                  <div className="space-y-3">
                    <label className="text-xs uppercase tracking-wide font-medium text-white/60">
                      Distance Range (km)
                    </label>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span>{distanceRange.min}</span>
                      <div className="flex-1 h-px bg-white/10" />
                      <span>{distanceRange.max >= 160 ? '160+' : distanceRange.max}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="160"
                      value={distanceRange.min}
                      onChange={(e) => setDistanceRange((d) => ({ ...d, min: Number.parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="160"
                      value={distanceRange.max}
                      onChange={(e) => setDistanceRange((d) => ({ ...d, max: Number.parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wide font-medium text-white/80">
                    Professional Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedProfessionalRole("")}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        selectedProfessionalRole === "" 
                          ? "bg-white text-black" 
                          : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      All
                    </button>
                    {PROFESSIONAL_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedProfessionalRole(category.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          selectedProfessionalRole === category.id 
                            ? "bg-white text-black" 
                            : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs uppercase tracking-wide font-medium text-white/60">
                    Price Range (₹/hr)
                  </label>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span>{priceRange.min}</span>
                    <div className="flex-1 h-px bg-white/10" />
                    <span>{priceRange.max}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange((p) => ({ ...p, min: Number.parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange((p) => ({ ...p, max: Number.parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide font-medium text-white/60">Amenities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES_LIST.slice(0, 8).map((a) => (
                      <button
                        key={a}
                        onClick={() => handleAmenityToggle(a)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${selectedAmenities.includes(a) ? "bg-white text-black border-white" : "bg-white/5 border-white/15 hover:bg-white/10 text-white/80"}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wide font-medium text-white/60">Date</label>
                  <Input
                    type="date"
                    value={availabilityDate}
                    onChange={(e) => setAvailabilityDate(e.target.value)}
                    className="rounded-xl bg-white/10 border-white/20 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {filteredSpaces.length} Spaces{" "}
                  {selectedCity && <span className="text-white/60">in {selectedCity}</span>}
                </h2>
                {selectedProfessionalRole && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-white/50">Showing spaces with</span>
                    <ProfessionalBadge role={selectedProfessionalRole} size="sm" />
                    <span className="text-xs text-white/50">professionals</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/50">Sort</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-lg bg-white/10 border border-white/20 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="recommended" className="bg-gray-800 text-white">Recommended</option>
                  <option value="price-low-high" className="bg-gray-800 text-white">Price: Low to High</option>
                  <option value="price-high-low" className="bg-gray-800 text-white">Price: High to Low</option>
                  <option value="availability" className="bg-gray-800 text-white">Availability</option>
                  <option value="hygiene" className="bg-gray-800 text-white">Hygiene Factor</option>
                  <option value="distance" className="bg-gray-800 text-white">Distance</option>
                </select>
                {/* Location status indicator */}
                {sortBy === 'distance' && (
                  <div className="text-xs text-white/70">
                    {isLocationLoading && (
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin"></div>
                        Getting location...
                      </span>
                    )}
                    {locationError && (
                      <span className="text-red-400">Location unavailable</span>
                    )}
                    {userLocation && !isLocationLoading && (
                      <span className="text-green-400">Location detected</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse h-72 rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : displayedSpaces.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-dashed border-white/20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No spaces match</h3>
                <p className="text-white/60 mb-6">Adjust filters or broaden your search.</p>
                <Button onClick={clearFilters} variant="outline" className="rounded-xl border-white/30 bg-transparent">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {displayedSpaces.map((space) => {
                  const occupied = space.total_seats - space.available_seats
                  const roleEntries = Object.entries(space.vibgyorCounts).filter(([_, c]) => c > 0) as [
                    ProfessionalRole,
                    number,
                  ][]
                  const totalFromCounts = roleEntries.reduce((s, [, c]) => s + c, 0)
                  // If mock counts mismatch, fallback to occupied for percentage basis
                  const basis = totalFromCounts || occupied
                  return (
                    <Card
                      key={space.id}
                      className="group rounded-3xl border-white/20 bg-white/10 backdrop-blur-md overflow-hidden hover:border-white/30 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => window.open(`/spaces/${space.id}`, '_blank')}
                    >
                      <CardContent className="p-7 space-y-6">
                        {/* Header */}
                        <div className="flex pt-7 items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <h3 className="text-xl font-semibold leading-tight tracking-tight text-white">
                              {space.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-300 gap-2">
                              <MapPin className="h-4 w-4 text-cyan-400" />
                              <span>{space.address}</span>
                            </div>
                            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{space.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400 text-black border border-emerald-300 shadow">
                              {space.available_seats} free
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-yellow-400/90 px-2 py-1 border border-yellow-300 shadow-sm">
                              <Star className="h-3 w-3 text-yellow-900 fill-current" />
                              <span className="text-xs font-medium text-yellow-900">{space.rating}</span>
                            </div>
                          </div>
                        </div>

                        {/* VIBGYOR attendance bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-300">
                            <span className="font-medium tracking-wide">People here now</span>
                            <span>
                              {occupied} / {space.total_seats} seated
                            </span>
                          </div>
                          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10 border border-white/20">
                            <div className="absolute inset-0 flex">
                              {roleEntries.map(([role, count]) => {
                                const pct = (count / basis) * 100
                                const cat = getProfessionalCategory(role)
                                return (
                                  <div
                                    key={role}
                                    style={{ width: pct + "%", backgroundColor: cat.color }}
                                    className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                                  />
                                )
                              })}
                              {roleEntries.length === 0 && <div className="w-full h-full bg-white/5" />}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {roleEntries.slice(0, 6).map(([role, count]) => {
                              const cat = getProfessionalCategory(role)
                              return (
                                <span
                                  key={role}
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium bg-white/10 border border-white/20"
                                  style={{ boxShadow: `0 0 0 1px ${cat.color}40` }}
                                >
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                  <span className="text-white/90">{cat.name}</span>
                                  <span className="text-white/70">{count}</span>
                                </span>
                              )
                            })}
                            {roleEntries.length > 6 && (
                              <span className="text-[10px] px-2 py-1 rounded-md bg-white/10 border border-white/20 text-white/70">
                                +{roleEntries.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                          {space.amenities.slice(0, 5).map((a) => (
                            <div
                              key={a}
                              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/90"
                            >
                              {getAmenityIcon(a)}
                              <span>{a}</span>
                            </div>
                          ))}
                          {space.amenities.length > 5 && (
                            <div className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white/70">
                              +{space.amenities.length - 5}
                            </div>
                          )}
                        </div>

                        {/* Pricing & capacity */}
                        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-white/20 bg-white/5 p-4">
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Price / hr</div>
                            <div className="text-lg font-semibold text-white">₹{space.price_per_hour}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Price / day</div>
                            <div className="text-lg font-semibold text-white">₹{space.price_per_day}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Capacity</div>
                            <div className="text-lg font-semibold text-white">{space.total_seats}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
                          <div className="flex-1">
                            <Button 
                              className="w-full rounded-xl bg-white text-black font-semibold hover:bg-gray-100 hover:scale-[1.02] active:scale-100 transition-transform"
                              onClick={() => handleBookSpace(space.id, new URLSearchParams({
                                name: space.name,
                                address: space.address,
                                city: space.city,
                                pincode: space.pincode,
                                hourlyRate: space.price_per_hour.toString(),
                                dailyRate: space.price_per_day.toString(),
                                totalSeats: space.total_seats.toString(),
                                availableSeats: space.available_seats.toString(),
                                amenities: space.amenities.join(','),
                                rating: space.rating.toString()
                              }))}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Book
                            </Button>
                          </div>
                          <Link href={`/spaces/${space.id}`}>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl border-white/30 hover:bg-white/10 bg-white/5 text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {hasMoreSpaces && (
              <div className="text-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-white/30 hover:bg-white/10 bg-transparent text-white hover:text-white"
                >
                  Load More ({filteredSpaces.length - displayedSpaces.length} remaining)
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function SpacesPage() {
  return (
    <Suspense fallback={<div>Loading spaces...</div>}>
      <SpacesPageContent />
    </Suspense>
  )
}
