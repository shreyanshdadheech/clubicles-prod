"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  label: string
}

const navItems: NavItem[] = [
  { href: '/spaces', label: 'Spaces' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-15 h-15  flex items-center justify-center group-hover:scale-105 transition-transform">
            <img src="/logo.svg" alt="Clubicles Logo" className="w-14 h-14" />
          </div>
          <span className="font-orbitron text-lg font-black tracking-wider text-white hidden sm:inline-block">
            CLUBICLES
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:rounded-full after:transition-all after:duration-300 ${
                  active
                    ? 'text-white after:w-full after:bg-white'
                    : 'text-white/60 hover:text-white after:w-0 hover:after:w-full after:bg-white/60'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <Link href="/signin">
            <Button variant="outline" className="rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-xl bg-white text-black hover:bg-gray-100 hover:scale-[1.03] font-semibold">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 text-white/80 hover:text-white hover:bg-white/10"
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Panel */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl">
          <div className="px-4 py-4 flex flex-col space-y-4">
            {navItems.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium ${active ? 'text-white' : 'text-white/70 hover:text-white'}`}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="pt-2 flex space-x-3">
              <Link href="/signin" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/15">Sign In</Button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setOpen(false)}>
                <Button className="w-full rounded-xl bg-white text-black hover:bg-gray-100 font-semibold">Join</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
