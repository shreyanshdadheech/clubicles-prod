import mockData from '@/data/mock-data.json'
import { getAllCities, getPopularCities } from './indian-cities'

export class DataService {
  // Get all amenities
  static getAmenities(): string[] {
    return mockData.amenities
  }

  // Get business types
  static getBusinessTypes(): string[] {
    return mockData.businessTypes
  }

  // Get cities
  static getCities(): string[] {
    return getAllCities()
  }

  // Get popular cities for hero section
  static getPopularCities(): string[] {
    return getPopularCities()
  }

  // Get space categories  
  static getSpaceCategories(): string[] {
    return mockData.spaceCategories
  }

  // Get bank account types
  static getBankAccountTypes(): string[] {
    return mockData.bankAccountTypes
  }

  // Get payment schedules
  static getPaymentSchedules(): Array<{ value: string, label: string }> {
    return mockData.paymentSchedules
  }

  // Get TDS options
  static getTdsOptions(): Array<{ value: string, label: string }> {
    return mockData.tdsOptions
  }

  // Get popular banks
  static getPopularBanks(): string[] {
    return mockData.popularBanks
  }

  // Get mock spaces
  static getMockSpaces(): any[] {
    return mockData.mockSpaces
  }

  // Get mock owners
  static getMockOwners(): any[] {
    return mockData.mockOwners
  }

  // Get mock bookings
  static getMockBookings(): any[] {
    return mockData.mockBookings
  }

  // Get revenue analytics
  static getRevenueAnalytics(): any {
    return mockData.revenueAnalytics
  }

  // Get admin stats
  static getAdminStats(): any {
    return mockData.adminStats
  }

  // Get space by ID
  static getSpaceById(id: string): any {
    return mockData.mockSpaces.find(space => space.id === id)
  }

  // Get owner by ID
  static getOwnerById(id: string): any {
    return mockData.mockOwners.find(owner => owner.id === id)
  }

  // Get spaces by owner ID
  static getSpacesByOwnerId(ownerId: string): any[] {
    return mockData.mockSpaces.filter(space => space.owner_id === ownerId)
  }

  // Get bookings by space ID
  static getBookingsBySpaceId(spaceId: string): any[] {
    return mockData.mockBookings.filter(booking => booking.space_id === spaceId)
  }

  // Calculate total revenue for owner
  static getOwnerRevenue(ownerId: string): number {
    const ownerSpaces = this.getSpacesByOwnerId(ownerId)
    return ownerSpaces.reduce((total, space) => total + space.revenue, 0)
  }

  // Get total bookings for owner
  static getOwnerBookings(ownerId: string): number {
    const ownerSpaces = this.getSpacesByOwnerId(ownerId)
    return ownerSpaces.reduce((total, space) => total + space.total_bookings, 0)
  }

  // Filter spaces by criteria
  static filterSpaces(filters: {
    city?: string
    minPrice?: number
    maxPrice?: number
    amenities?: string[]
    category?: string
  }): any[] {
    let spaces = mockData.mockSpaces

    if (filters.city) {
      spaces = spaces.filter(space => 
        space.city.toLowerCase().includes(filters.city!.toLowerCase())
      )
    }

    if (filters.minPrice !== undefined) {
      spaces = spaces.filter(space => space.price_per_hour >= filters.minPrice!)
    }

    if (filters.maxPrice !== undefined) {
      spaces = spaces.filter(space => space.price_per_hour <= filters.maxPrice!)
    }

    if (filters.amenities && filters.amenities.length > 0) {
      spaces = spaces.filter(space => 
        filters.amenities!.every(amenity => space.amenities.includes(amenity))
      )
    }

    return spaces
  }

  // Search spaces by query
  static searchSpaces(query: string): any[] {
    if (!query.trim()) return mockData.mockSpaces

    const searchTerm = query.toLowerCase()
    return mockData.mockSpaces.filter(space =>
      space.name.toLowerCase().includes(searchTerm) ||
      space.city.toLowerCase().includes(searchTerm) ||
      space.description.toLowerCase().includes(searchTerm) ||
      space.amenities.some(amenity => amenity.toLowerCase().includes(searchTerm))
    )
  }
}

export default DataService
