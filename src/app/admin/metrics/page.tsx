import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Calendar, DollarSign, Settings } from "lucide-react"

export function MetricsCards() {
  return (
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
  )
}
