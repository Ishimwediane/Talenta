"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Bell, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"

export function DashboardNavbar() {
  const router = useRouter()
  const { user } = useUser()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const searchQuery = formData.get('search') as string
    if (searchQuery.trim()) {
      // You can implement search functionality here
      console.log('Searching for:', searchQuery)
    }
  }

  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Pages</span>
            <span>/</span>
            <span className="text-gray-900">Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              name="search"
              placeholder="Search here" 
              className="pl-10 w-64" 
            />
          </form>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/admin/profile')}
            title="Profile"
          >
            <User className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/admin/settings')}
            title="Settings"
          >
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
