import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Search,
  Bell,
  Settings,
  User,
  Menu,
  ChevronDown,
} from "lucide-react"

export default function AnalyticsDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
     

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
      

        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Check the sales, value and bounce rate by country.</p>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Website Views */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Website Views</CardTitle>
                <CardDescription>Last Campaign Performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-center gap-2">
                  {[45, 40, 25, 30, 50, 55, 65].map((height, index) => (
                    <div
                      key={index}
                      className="bg-green-500 rounded-t-sm flex-1 max-w-8"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                  <span>S</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>campaign sent 2 days ago</span>
                </div>
              </CardContent>
            </Card>

            {/* Daily Sales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Daily Sales</CardTitle>
                <CardDescription>
                  <span className="text-green-600 font-medium">(+15%)</span> increase in today sales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      points="20,120 40,100 60,80 80,90 100,70 120,60 140,80 160,90 180,70 200,60 220,50 240,40 260,30 280,20"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>J</span>
                  <span>F</span>
                  <span>M</span>
                  <span>A</span>
                  <span>M</span>
                  <span>J</span>
                  <span>J</span>
                  <span>A</span>
                  <span>S</span>
                  <span>O</span>
                  <span>N</span>
                  <span>D</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>updated 4 min ago</span>
                </div>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Completed Tasks</CardTitle>
                <CardDescription>Last Campaign Performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 150">
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      points="20,130 60,120 100,100 140,80 180,60 220,40 260,20"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Apr</span>
                  <span>Jun</span>
                  <span>Aug</span>
                  <span>Oct</span>
                  <span>Dec</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>just updated</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">281</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Today's Users</p>
                    <p className="text-2xl font-bold text-gray-900">2,300</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">$34,000</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Followers</p>
                    <p className="text-2xl font-bold text-gray-900">+2,910</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
