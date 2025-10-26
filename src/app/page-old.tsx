'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trophy, Target, Crown, Star, Clock } from 'lucide-react'

// Mock icons for now - you can replace with lucide-react when installed
const MapPin = ({ className }: { className?: string }) => <div className={className}>📍</div>
const Search = ({ className }: { className?: string }) => <div className={className}>🔍</div>
const Calendar = ({ className }: { className?: string }) => <div className={className}>📅</div>
const Users = ({ className }: { className?: string }) => <div className={className}>👥</div>
const Wifi = ({ className }: { className?: string }) => <div className={className}>📶</div>
const Coffee = ({ className }: { className?: string }) => <div className={className}>☕</div>
const Car = ({ className }: { className?: string }) => <div className={className}>🚗</div>
const Shield = ({ className }: { className?: string }) => <div className={className}>🛡️</div>

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const features = [
    {
      icon: MapPin,
      title: 'Multiple Locations',
      description: 'Find co-working spaces across major cities in India'
    },
    {
      icon: Calendar,
      title: 'Flexible Booking',
      description: 'Book by the hour, day, or month based on your needs'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join the VIBGYOR membership for exclusive benefits'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with Razorpay'
    }
  ]

  const amenities = [
    { icon: Wifi, name: 'High-Speed WiFi' },
    { icon: Coffee, name: 'Complimentary Coffee' },
    { icon: Car, name: 'Parking Available' },
    { icon: Users, name: 'Meeting Rooms' }
  ]

  return (
    <div className="min-h-screen bg-black text-cricket-orange">
      {/* Navigation */}
      <nav className="glass-dark border-b border-cricket-orange/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-cricket-orange animate-cricket-bounce" />
              <span className="text-2xl font-cricket font-bold cricket-title">Clubicles</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-cricket-gold transition-colors">Features</a>
              <a href="#spaces" className="hover:text-cricket-gold transition-colors">Spaces</a>
              <a href="#pricing" className="hover:text-cricket-gold transition-colors">Pricing</a>
              <a href="#about" className="hover:text-cricket-gold transition-colors">About</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hover:bg-cricket-orange/10">Sign In</Button>
              <Button variant="cricket">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center cricket-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cricket-blue/90 via-cricket-orange/80 to-cricket-green/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-4 h-4 bg-cricket-gold rounded-full animate-float"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-cricket-orange rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-cricket-blue rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-60 right-1/3 w-5 h-5 bg-cricket-green rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="cricket-title mb-6">
            Your Championship 
            <span className="block">Co-working Space</span>
          </h1>
          <p className="cricket-subtitle mb-8 max-w-2xl mx-auto">
            Book premium co-working spaces across India with the precision of a perfect cricket shot. 
            Find your winning workspace today! 🏏
          </p>
          
          {/* Search Bar */}
          <div className="glass-card max-w-2xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Where do you want to work?" 
                  className="w-full px-4 py-3 bg-black/50 border border-cricket-orange/30 rounded-lg text-cricket-white placeholder-cricket-white/60 focus:border-cricket-orange focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-black/50 border border-cricket-orange/30 rounded-lg text-cricket-white focus:border-cricket-orange focus:outline-none"
                />
              </div>
              <Button variant="cricket" size="lg">
                <Target className="w-5 h-5 mr-2" />
                Find Spaces
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="cricket-stat">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-cricket-gold" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm">Premium Spaces</div>
            </div>
            <div className="cricket-stat">
              <Users className="w-8 h-8 mx-auto mb-2 text-cricket-blue" />
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm">Happy Members</div>
            </div>
            <div className="cricket-stat">
              <Crown className="w-8 h-8 mx-auto mb-2 text-cricket-gold" />
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm">Cities</div>
            </div>
            <div className="cricket-stat">
              <Star className="w-8 h-8 mx-auto mb-2 text-cricket-orange" />
              <div className="text-2xl font-bold">4.9★</div>
              <div className="text-sm">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="cricket-title text-4xl mb-4">Championship Features</h2>
            <p className="cricket-subtitle max-w-2xl mx-auto">
              Experience world-class amenities designed for champions like you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="cricket-feature">
              <CardHeader>
                <Trophy className="w-12 h-12 text-cricket-gold mb-4" />
                <CardTitle>Premium Locations</CardTitle>
                <CardDescription>
                  Play at the best venues across major Indian cities
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cricket-feature">
              <CardHeader>
                <Wifi className="w-12 h-12 text-cricket-blue mb-4" />
                <CardTitle>High-Speed WiFi</CardTitle>
                <CardDescription>
                  Lightning-fast internet as quick as Bumrah's bowling
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cricket-feature">
              <CardHeader>
                <Coffee className="w-12 h-12 text-cricket-orange mb-4" />
                <CardTitle>Refreshment Zone</CardTitle>
                <CardDescription>
                  Fuel up like Kohli with premium coffee and snacks
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cricket-feature">
              <CardHeader>
                <Shield className="w-12 h-12 text-cricket-green mb-4" />
                <CardTitle>Secure Access</CardTitle>
                <CardDescription>
                  24/7 security as reliable as Dhoni's keeping
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cricket-feature">
              <CardHeader>
                <Car className="w-12 h-12 text-cricket-gold mb-4" />
                <CardTitle>Parking Available</CardTitle>
                <CardDescription>
                  Convenient parking for your victory ride
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cricket-feature">
              <CardHeader>
                <Clock className="w-12 h-12 text-cricket-orange mb-4" />
                <CardTitle>24/7 Access</CardTitle>
                <CardDescription>
                  Work anytime, just like cricket never sleeps
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 cricket-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="cricket-title text-4xl mb-6">Ready to Hit a Six?</h2>
          <p className="cricket-subtitle text-xl mb-8">
            Join thousands of champions who chose Clubicles for their workspace needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="cricket" size="lg" className="text-lg px-8 py-4">
              <Trophy className="w-6 h-6 mr-2" />
              Start Your Innings
            </Button>
            <Button variant="glass" size="lg" className="text-lg px-8 py-4">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-dark border-t border-cricket-orange/20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="h-8 w-8 text-cricket-orange animate-cricket-bounce" />
            <span className="text-2xl font-cricket font-bold cricket-title">Clubicles</span>
          </div>
          <p className="text-cricket-white/70 mb-6">
            Your championship co-working space platform
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <a href="#" className="hover:text-cricket-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cricket-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cricket-gold transition-colors">Contact</a>
          </div>
          <div className="mt-8 pt-8 border-t border-cricket-orange/20">
            <p className="text-cricket-white/50 text-sm">
              © 2025 Clubicles. Powered by champions, for champions. 🏏
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
