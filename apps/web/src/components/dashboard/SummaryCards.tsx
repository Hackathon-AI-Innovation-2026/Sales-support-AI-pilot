import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Percent, CheckSquare } from "lucide-react"

interface SummaryCardsProps {
  totalLeads: number
  wonThisMonth: number
  conversionRate: number
  activeTasks: number
}

export function SummaryCards({
  totalLeads,
  wonThisMonth,
  conversionRate,
  activeTasks,
}: SummaryCardsProps) {
  // Format conversion rate as percentage (e.g. 0.7143 -> 71.4%)
  const formattedRate = (conversionRate * 100).toFixed(1) + "%"

  const cards = [
    {
      title: "Total Active Leads",
      value: totalLeads,
      description: "Leads currently in pipeline",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Won This Month",
      value: wonThisMonth,
      description: "Successful conversions",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Conversion Rate",
      value: formattedRate,
      description: "Based on last 30 days",
      icon: Percent,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Active Tasks Today",
      value: activeTasks,
      description: "Tasks pending action",
      icon: CheckSquare,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <Card key={i} className="bg-card border-border shadow-sm overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {card.value}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                {card.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
