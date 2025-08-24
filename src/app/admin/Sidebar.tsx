"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
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
  Settings,
  MoreVertical,
} from "lucide-react"

const links = [
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin", label: "Admin Panel", icon: Shield },
  { href: "/admin/books", label: "Books", icon: Book },
  { href: "/admin/audio", label: "Audios", icon: Mic2 },
]

interface DashboardSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function DashboardSidebar({ isCollapsed, onToggleCollapse }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu)
  }

  return (
    <div className={`sidebar bg-white shadow-sm border-r fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo and Toggle Button */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">Tal</span>
            </div>
            {!isCollapsed && <span className="font-semibold text-gray-900">Talenta</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1 h-8 w-8"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
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
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Brooklyn Alice</p>
              </div>
            )}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="p-1 h-6 w-6"
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            )}
          </div>
          
          {/* Profile Dropdown Menu */}
          {showProfileMenu && !isCollapsed && (
            <div className="mt-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => router.push('/admin/profile')}
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-sm"
                onClick={() => router.push('/admin/settings')}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href} passHref legacyBehavior>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`justify-start gap-3 ${
                    isCollapsed ? 'w-10 h-10 p-0' : 'w-full'
                  }`}
                  title={isCollapsed ? label : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {!isCollapsed && label}
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
          className={`justify-start gap-3 text-red-600 ${
            isCollapsed ? 'w-10 h-10 p-0' : 'w-full'
          }`}
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
}
