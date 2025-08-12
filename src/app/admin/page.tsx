import { DashboardNavbar } from "@/app/admin/Navbar"
import  AnalyticsDashboard  from "@/app/admin/analytics/page"
import { MetricsCards } from "@/app/admin/metrics/page"

export default function AnalyticsPage() {
  return (
    <>
      
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Check the sales, value and bounce rate by country.</p>
        </div>
        <AnalyticsDashboard />
        <MetricsCards />
      </main>
    </>
  )
}
