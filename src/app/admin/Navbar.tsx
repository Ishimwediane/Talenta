"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Bell, Settings, User, Menu } from "lucide-react"

export function DashboardNavbar() {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Pages</span>
            <span>/</span>
            <span className="text-gray-900">Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search here" className="pl-10 w-64" />
          </div>
          <Button variant="ghost" size="sm">
            <User className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
              11
            </Badge>
          </Button>
        </div>
      </div>
    </header>
  )
}
