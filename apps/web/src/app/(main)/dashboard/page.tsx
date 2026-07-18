"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, TrendingUp, Users, CheckSquare } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Nguyễn Văn A. Here is your sales activity overview.</p>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Active Leads
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-[10px] text-green-500 font-semibold mt-1">
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Won This Month
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-[10px] text-green-500 font-semibold mt-1">
              +8% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI Priority Leads
            </CardTitle>
            <Sparkles className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-[10px] text-amber-500 font-semibold mt-1">
              Score ≥ 80 (High priority)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Tasks Today
            </CardTitle>
            <CheckSquare className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-[10px] text-red-500 font-semibold mt-1">
              3 tasks overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area Placeholder */}
      <Card className="p-6 bg-card border-border shadow-sm">
        <h2 className="text-lg font-bold mb-2">Platform Overview & Activity</h2>
        <p className="text-sm text-muted-foreground">
          This dashboard displays simulated banking data. Use the sidebar to navigate between Leads, Customers, and Tasks modules. The AI Copilot engine is online and monitoring system changes.
        </p>
      </Card>
    </div>
  )
}
