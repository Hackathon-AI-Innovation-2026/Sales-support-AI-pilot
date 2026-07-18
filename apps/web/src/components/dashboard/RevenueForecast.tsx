"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Landmark } from "lucide-react"

interface ForecastDetail {
  leadId: string
  customerName: string
  interestedProduct: string | null
  value: number
  probability: number
  forecast: number
}

interface RevenueForecastProps {
  totalForecast: number
  details: ForecastDetail[]
}

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + " tỷ"
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(0) + " tr"
  }
  return value.toLocaleString("vi-VN") + " ₫"
}

export function RevenueForecast({ totalForecast, details }: RevenueForecastProps) {
  // Sort details by forecast value and take top 5 for neat representation
  const topDetails = [...details]
    .sort((a, b) => b.forecast - a.forecast)
    .slice(0, 5)

  const chartData = topDetails.map((item) => ({
    name: item.customerName,
    "Dự báo": item.forecast,
    "Giá trị gốc": item.value,
  }))

  return (
    <Card className="bg-card border-border shadow-sm col-span-3">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-base font-bold text-foreground">Dự báo Doanh thu</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Giá trị dự báo từ các lead trong giai đoạn Đàm phán (weighted by AI probability)
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <Landmark className="w-5 h-5" />
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tổng dự báo</span>
            <span className="text-sm font-extrabold">{formatCurrency(totalForecast)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full mt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
              Không có lead nào trong giai đoạn đàm phán
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                <XAxis
                  type="number"
                  tickFormatter={formatCurrency}
                  className="fill-muted-foreground text-[10px] font-medium"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  className="fill-muted-foreground text-[10px] font-medium"
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value || 0)), "Dự báo"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                />
                <Bar dataKey="Dự báo" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} maxBarSize={25} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
