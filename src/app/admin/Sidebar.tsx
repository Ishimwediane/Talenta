"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  LogOut,
} from "lucide-react"

const links = [
  
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin", label: "Admin Panel", icon: Shield },
  { href: "/admin/books", label: "Books", icon: Book },
  { href: "/admin/audio", label: "Audios", icon: Book },
 
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    // Example logout logic (adapt to your auth)
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <div className="w-54 bg-white shadow-sm border-r fixed top-0 left-0 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">Tal</span>
          </div>
          <span className="font-semibold text-gray-900">Talenta</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
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

        
        </nav>
      </div>

      {/* Logout button pinned at bottom */}
      <div className="p-4 border-t flex-shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
