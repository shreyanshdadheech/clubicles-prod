import { VIBGYORCategory, VIBGYORRole } from '@/types'

export const VIBGYOR_CATEGORIES: VIBGYORCategory[] = [
  {
    id: 'VIOLET',
    name: 'VIOLET – Visionaries & Venture Capitalists',
    color: '#8B5CF6', // Violet
    description: 'Visionaries & Venture Capitalists'
  },
  {
    id: 'INDIGO',
    name: 'INDIGO – IT & Industrialists',
    color: '#6366F1', // Indigo
    description: 'IT & Industrialists'
  },
  {
    id: 'BLUE',
    name: 'BLUE – Branding & Marketing',
    color: '#3B82F6', // Blue
    description: 'Branding & Marketing'
  },
  {
    id: 'GREEN',
    name: 'GREEN – Green Footprint & EV',
    color: '#10B981', // Green
    description: 'Green Footprint & EV'
  },
  {
    id: 'YELLOW',
    name: 'YELLOW – Young Entrepreneurs (<23 Years)',
    color: '#F59E0B', // Yellow
    description: 'Young Entrepreneurs (<23 Years)'
  },
  {
    id: 'ORANGE',
    name: 'ORANGE – Oracle of Bharat (Culture & Philosophy)',
    color: '#F97316', // Orange
    description: 'Oracle of Bharat (Culture & Philosophy)'
  },
  {
    id: 'RED',
    name: 'RED – Real Estate & Recreationists',
    color: '#EF4444', // Red
    description: 'Real Estate & Recreationists'
  },
  {
    id: 'GREY',
    name: 'GREY – Nomads (Multi-talented Individuals)',
    color: '#6B7280', // Grey
    description: 'Nomads (Multi-talented Individuals)'
  },
  {
    id: 'WHITE',
    name: 'WHITE – Policy Makers & Health Professionals',
    color: '#F3F4F6', // White
    description: 'Policy Makers & Health Professionals'
  },
  {
    id: 'BLACK',
    name: 'BLACK – Prefer Not to Say',
    color: '#1F2937', // Black
    description: 'Prefer Not to Say'
  }
]

export const getVIBGYORCategory = (role: VIBGYORRole): VIBGYORCategory => {
  return VIBGYOR_CATEGORIES.find(cat => cat.id === role) || VIBGYOR_CATEGORIES[0]
}

export const getVIBGYORColor = (role: VIBGYORRole): string => {
  return getVIBGYORCategory(role).color
}

export const getVIBGYORName = (role: VIBGYORRole): string => {
  return getVIBGYORCategory(role).name
}

// GREY_CATEGORY is now included in VIBGYOR_CATEGORIES
