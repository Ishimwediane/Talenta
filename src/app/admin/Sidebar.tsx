"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BarChart3,
  TrendingUp,
  Search,
  DollarSign,
  User,
  ChevronDown,
  Book,
  Mic2,
  Shield,
} from "lucide-react"

const links = [
  { href: "/dashboard", label: "Dashboards", icon: BarChart3 },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin", label: "Admin Panel", icon: Shield },
  { href: "/admin/books", label: "Books", icon: Book },
  { href: "/podcasts", label: "Podcasts", icon: Mic2 },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/sales", label: "Sales", icon: DollarSign },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">Tal</span>
          </div>
          <span className="font-semibold text-gray-900">Talenta</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback>BA</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Brooklyn Alice</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} passHref legacyBehavior>
              <Button
    variant={isActive ? "default" : "ghost"}
    className="w-full justify-start gap-3"
  >
    <Icon className="w-4 h-4" />
    {label}
  </Button>
            </Link>
          )
        })}

        {/* You can keep other sections below if needed */}
        <div className="pt-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">PAGES</p>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600">
            <span className="w-4 h-4 flex items-center justify-center text-xs">📄</span>
            Pages
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600">
            <User className="w-4 h-4" />
            Account
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600">
            <span className="w-4 h-4 flex items-center justify-center text-xs">⚡</span>
            Applications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600">
            <span className="w-4 h-4 flex items-center justify-center text-xs">🛒</span>
            Ecommerce
          </Button>
        </div>
      </nav>
    </div>
  )
}
