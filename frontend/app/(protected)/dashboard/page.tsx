import { Dashboard } from "@/components/dashboard"
import { DashboardGreeting } from "@/components/dashboard-greeting"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  return (
    <>
      <SiteHeader siteName="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <DashboardGreeting />
            <div className="px-4 lg:px-6">
              <Dashboard />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
