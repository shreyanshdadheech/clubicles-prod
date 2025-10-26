import { ProfessionalCategory, ProfessionalRole } from '@/types'

export const PROFESSIONAL_CATEGORIES: ProfessionalCategory[] = [
  {
    id: 'violet',
    name: 'VIOLET – Visionaries & Venture Capitalists',
    color: '#8F00F0',
    description: 'Visionaries & Venture Capitalists',
    detailedDescription: 'The creators and investors shaping the future through innovation, capital, and strategic vision.',
    examples: [
      'A venture capitalist funding a green mobility startup.',
      'A serial entrepreneur with multiple successful exits.',
      'A visionary leader building futuristic smart cities.'
    ]
  },
  {
    id: 'indigo',
    name: 'INDIGO – IT & Industrialists',
    color: '#0070B0',
    description: 'IT & Industrialists',
    detailedDescription: 'Builders of technology-driven ecosystems and large-scale industries.',
    examples: [
      'A software architect developing AI-driven enterprise platforms.',
      'An industrialist leading an automotive manufacturing unit.',
      'A tech founder scaling an IoT & automation startup.'
    ]
  },
  {
    id: 'blue',
    name: 'BLUE – Branding & Marketing',
    color: '#00B0F0',
    description: 'Branding & Marketing',
    detailedDescription: 'The creative strategists who shape identity, visibility, and influence.',
    examples: [
      'A brand consultant managing corporate rebranding campaigns.',
      'A digital marketer growing businesses through social media & SEO.',
      'A creative director designing global advertising campaigns.'
    ]
  },
  {
    id: 'green',
    name: 'GREEN – Green Footprint & EV',
    color: '#45DE10',
    description: 'Green Footprint & EV',
    detailedDescription: 'Champions of sustainability, clean energy, and electric mobility.',
    examples: [
      'A founder of an EV charging startup.',
      'An NGO leader promoting carbon-neutral living.',
      'A sustainability officer driving green initiatives in corporates.'
    ]
  },
  {
    id: 'yellow',
    name: 'YELLOW – Young Entrepreneurs (<23 Years)',
    color: '#FFF000',
    description: 'Young Entrepreneurs',
    detailedDescription: 'Bright youth leaders innovating at the earliest stage of their careers.',
    examples: [
      'A college student running an edtech platform.',
      'A teen innovator designing a robotics solution.',
      'A youth entrepreneur starting a clothing brand online.'
    ]
  },
  {
    id: 'orange',
    name: 'ORANGE – Oracle of Bharat (Culture & Philosophy)',
    color: '#FF6900',
    description: 'Oracle of Bharat',
    detailedDescription: 'Keepers of wisdom, heritage, and philosophy rooted in Bharat\'s culture.',
    examples: [
      'A philosopher publishing modern interpretations of ancient texts.',
      'A cultural entrepreneur reviving handlooms & traditional crafts.',
      'A Sanskrit scholar digitizing Vedic knowledge.'
    ]
  },
  {
    id: 'red',
    name: 'RED – Real Estate & Recreationists',
    color: '#FF000F',
    description: 'Real Estate & Recreationists',
    detailedDescription: 'The drivers of urban development, lifestyle spaces, and leisure experiences.',
    examples: [
      'A real estate developer building sustainable housing projects.',
      'A resort founder creating eco-tourism experiences.',
      'A sports entrepreneur running a luxury fitness chain.'
    ]
  },
  {
    id: 'grey',
    name: 'GREY – Nomads (Multi-talented Individuals)',
    color: '#707070',
    description: 'Nomads (Multi-talented)',
    detailedDescription: 'Dynamic professionals with hybrid careers and diverse skill sets.',
    examples: [
      'A digital nomad working across continents.',
      'A multi-disciplinary artist blending music & technology.',
      'A consultant with expertise in multiple industries.'
    ]
  },
  {
    id: 'white',
    name: 'WHITE – Policy Makers & Health Professionals',
    color: '#FFFFFF',
    description: 'Policy Makers & Health Professionals',
    detailedDescription: 'Guardians of governance, social structure, and public well-being.',
    examples: [
      'A policy advisor drafting state-level startup incentives.',
      'A healthcare innovator launching AI-driven diagnostic tools.',
      'A doctor leading a rural telemedicine initiative.'
    ]
  },
  {
    id: 'black',
    name: 'BLACK – Prefer Not to Say',
    color: '#000000',
    description: 'Prefer Not to Say',
    detailedDescription: 'Individuals who choose to remain anonymous or undefined within categories.',
    examples: [
      'A stealth founder working on a confidential project.',
    ]
  }
]

export const getProfessionalCategory = (role: ProfessionalRole): ProfessionalCategory => {
  return PROFESSIONAL_CATEGORIES.find(cat => cat.id === role) || PROFESSIONAL_CATEGORIES[0]
}

export const getProfessionalColor = (role: ProfessionalRole): string => {
  return getProfessionalCategory(role).color
}

export const getProfessionalName = (role: ProfessionalRole): string => {
  return getProfessionalCategory(role).name
}
