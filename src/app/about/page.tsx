'use client'

import React from 'react'
import { Users, MapPin, Shield, Award, Heart, Zap, Star, Target, Globe, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { SharedNavigation } from '@/components/shared/navigation'

const values = [
	{
		icon: Users,
		title: 'Community First',
		description:
			'We believe in building meaningful connections and fostering collaboration among professionals.',
		gradient: 'from-blue-500 to-purple-600',
	},
	{
		icon: Shield,
		title: 'Trust & Security',
		description: 'Your safety and security are our top priorities. All our spaces are monitored 24/7.',
		gradient: 'from-green-500 to-emerald-600',
	},
	{
		icon: Zap,
		title: 'Innovation',
		description:
			'We\'re constantly evolving to provide the best workspace experience with cutting-edge amenities.',
		gradient: 'from-yellow-500 to-orange-600',
	},
	{
		icon: Heart,
		title: 'Quality Experience',
		description:
			'Every detail matters to us. From coffee quality to ergonomic furniture, we care about your comfort.',
		gradient: 'from-pink-500 to-red-600',
	},
]

const stats = [
	{ number: '50+', label: 'Cities', icon: Globe },
	{ number: '500+', label: 'Premium Spaces', icon: MapPin },
	{ number: '10K+', label: 'Happy Members', icon: Users },
	{ number: '4.9★', label: 'Average Rating', icon: Star },
]

const team = [
	{
		name: 'Bharath IPNOTEC',
		role: 'CEO & Founder',
		description:
			'Visionary entrepreneur with 15+ years of experience in workplace innovation and technology. Leading India\'s co-working revolution.',
		gradient: 'from-purple-500 to-blue-600',
		isFounder: true,
	},
	{
		name: 'Rohit Patel',
		role: 'CTO',
		description:
			'Ex-Google engineer passionate about building scalable platforms and cutting-edge technology solutions.',
		gradient: 'from-blue-500 to-cyan-600',
	},
	{
		name: 'Anjali Singh',
		role: 'Head of Operations',
		description:
			'Operations expert ensuring seamless experiences across all locations with military precision.',
		gradient: 'from-green-500 to-teal-600',
	},
	{
		name: 'Arjun Kumar',
		role: 'Head of Design',
		description:
			'Award-winning architect designing inspiring workspaces that blend aesthetics with functionality.',
		gradient: 'from-orange-500 to-red-600',
	},
]

const milestones = [
	{
		year: '2025',
		title: 'Company Founded',
		description:
			'Bharath IPNOTEC launched Clubicles with the first premium co-working space in Bangalore',
		icon: Lightbulb,
	},
	{
		year: '2026',
		title: 'Multi-city Expansion',
		description: 'Expanded to Mumbai, Delhi, and Pune with revolutionary workspace designs',
		icon: Globe,
	},
	{
		year: '2027',
		title: 'Series A Funding',
		description: 'Raised ₹50 crores to accelerate growth and technology innovation',
		icon: Target,
	},
	{
		year: '2028',
		title: 'National Presence',
		description: 'Reached 25 cities with 200+ premium spaces across India',
		icon: MapPin,
	},
	{
		year: '2029',
		title: 'Market Leader',
		description: 'Achieved 50+ cities, 500+ spaces, serving 10K+ professionals daily',
		icon: Award,
	},
]

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
			<SharedNavigation />
			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,120,255,0.15),transparent_60%)]" />
				<div className="max-w-6xl mx-auto px-4 pt-24 pb-20">
					<div className="text-center space-y-8">
						<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
							<span className="block bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">Building The Future</span>
							<span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Of Work In India</span>
						</h1>
						<p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed">
							Since 2020 Clubicles has grown from a single Bangalore hub to a nationwide network of premium, human‑centered workspaces empowering 10K+ professionals in 50+ cities.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link href="/spaces">
								<Button size="lg" className="rounded-xl bg-white text-black font-semibold hover:scale-[1.03] hover:bg-gray-100">Explore Spaces</Button>
							</Link>
							<Link href="#mission">
								<Button variant="outline" size="lg" className="rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15">Our Mission</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className="px-4 pb-10 -mt-8 relative z-10">
				<div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
					{stats.map(s => (
						<div key={s.label} className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-6 text-center hover:bg-white/10 transition-colors">
							<div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-gradient-to-br from-white to-gray-300 flex items-center justify-center">
								<s.icon className="w-6 h-6 text-black" />
							</div>
							<div className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{s.number}</div>
							<div className="mt-1 text-sm font-medium text-gray-300">{s.label}</div>
						</div>
					))}
				</div>
			</section>

			{/* Mission */}
			<section id="mission" className="px-4 py-24">
				<div className="max-w-4xl mx-auto text-center">
					<div className="space-y-8">
						<h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Our Mission</h2>
						<p className="text-gray-300 leading-relaxed text-lg">We democratize access to premium, ergonomically crafted work habitats— enabling every professional, freelancer and team to plug into environments that accelerate focus, creativity and meaningful connection.</p>
						<p className="text-gray-300 leading-relaxed">Each Clubicles location is intentionally designed: biophilic light balance, acoustic zoning, breathable density, frictionless amenities and a hospitality layer that makes high‑performance feel effortless.</p>
						<Button size="lg" className="rounded-xl bg-white text-black font-semibold hover:bg-gray-100 hover:scale-[1.03]">Join The Movement</Button>
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="px-4 py-20 border-t border-white/10 bg-gradient-to-b from-gray-950 to-black">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-14">
						<h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">Core Values</h2>
						<p className="text-gray-400 text-lg">Principles that shape every design, interaction and decision.</p>
					</div>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{values.map(v => (
							<div key={v.title} className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-white/30 transition-colors">
								<div className={`w-14 h-14 rounded-xl mb-5 flex items-center justify-center bg-gradient-to-br ${v.gradient}`}>
									<v.icon className="w-7 h-7 text-white" />
								</div>
								<h3 className="text-lg font-semibold mb-3 tracking-tight">{v.title}</h3>
								<p className="text-sm text-gray-300 leading-relaxed">{v.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Founder */}
			<section id="founder" className="px-4 py-24">
				<div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm p-10 md:p-14">
					<div className="grid md:grid-cols-3 gap-10 items-center">
						<div className="md:col-span-1">
							<div className="w-56 h-56 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
								<div className="absolute inset-0 bg-black/20" />
								<img src="/about.png" alt="Bharath IPNOTEC" className="w-full h-full object-cover" />
							</div>
						</div>
						<div className="md:col-span-2 space-y-6">
							<h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Bharath IPNOTEC</h3>
							<p className="text-gray-300 leading-relaxed">Visionary entrepreneur with 15+ years shaping workplace innovation. Driving India’s co‑working transformation through intentional design, technology integration and hospitality‑grade service systems.</p>
							<p className="text-gray-300 leading-relaxed">Under his leadership Clubicles scaled to 500+ premium environments nationwide redefining what professionals expect from where they work.</p>
							<div className="flex flex-wrap gap-3 pt-2">
								<span className="px-5 py-2 rounded-xl bg-white/10 border border-white/15 text-sm">15+ Years</span>
								<span className="px-5 py-2 rounded-xl bg-white/10 border border-white/15 text-sm">500+ Spaces</span>
								<span className="px-5 py-2 rounded-xl bg-white/10 border border-white/15 text-sm">10K+ Members</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Timeline */}
			<section className="px-4 py-20 bg-gradient-to-b from-black to-gray-950 border-t border-white/10">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-4xl md:text-5xl font-bold mb-14 bg-gradient-to-r from-white via-white/85 to-white/60 bg-clip-text text-transparent text-center">Milestones</h2>
					<div className="space-y-6">
						{milestones.map(m => (
							<div key={m.year} className="flex flex-col md:flex-row md:items-center gap-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8 hover:border-white/25 transition-colors">
								<div className="flex items-center gap-6 w-full md:w-auto">
									<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white to-gray-300 flex items-center justify-center">
										<m.icon className="w-8 h-8 text-black" />
									</div>
									<div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{m.year}</div>
								</div>
								<div className="flex-1">
									<h3 className="text-xl font-semibold mb-2 tracking-tight">{m.title}</h3>
									<p className="text-gray-300 text-sm md:text-base leading-relaxed">{m.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="px-4 py-24">
				<div className="max-w-5xl mx-auto text-center rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] backdrop-blur-md p-14">
					<h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight bg-gradient-to-r from-white via-white/85 to-white/60 bg-clip-text text-transparent">Ready To Work Better?</h2>
					<p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">Join thousands already upgrading their daily flow with thoughtfully engineered environments, vibrant community energy and measurable productivity uplift.</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Link href="/signup">
							<Button size="lg" className="rounded-xl bg-white text-black font-semibold hover:bg-gray-100 hover:scale-[1.03]">Get Started</Button>
						</Link>
						<Link href="/pricing">
							<Button variant="outline" size="lg" className="rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15">View Pricing</Button>
						</Link>
						<Link href="/contact">
							<Button variant="outline" size="lg" className="rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15">Contact Team</Button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	)
}
