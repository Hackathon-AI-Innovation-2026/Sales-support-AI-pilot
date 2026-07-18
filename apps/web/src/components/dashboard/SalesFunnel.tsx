"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface FunnelStage {
  stage: string
  count: number
}

interface SalesFunnelProps {
  data: FunnelStage[]
}

const stageLabels: Record<string, string> = {
  NEW: "Mới tạo",
  CONTACTED: "Đã liên hệ",
  QUALIFIED: "Đạt chuẩn",
  NEGOTIATION: "Đàm phán",
  WON: "Chốt Deal",
  LOST: "Thất bại",
}

const colors = [
  "hsl(221, 83%, 53%)", // Primary Blue - NEW
  "hsl(221, 83%, 45%)", // Darker Blue - CONTACTED
  "hsl(200, 80%, 50%)", // Light Blue - QUALIFIED
  "hsl(38, 92%, 50%)",  // Amber/Gold - NEGOTIATION
  "hsl(142, 71%, 45%)", // Green - WON
  "hsl(0, 84%, 60%)",   // Red - LOST
]

export function SalesFunnel({ data }: SalesFunnelProps) {
  // Map stage codes to human-readable Vietnamese labels
  const chartData = data.map((item) => ({
    name: stageLabels[item.stage] || item.stage,
    "Số lượng": item.count,
  }))

  return (
    <Card className="bg-card border-border shadow-sm col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Phân tích Phễu Bán hàng</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Số lượng lead phân chia theo từng giai đoạn trong pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis
                dataKey="name"
                className="fill-muted-foreground text-[10px] font-medium"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="fill-muted-foreground text-[10px] font-medium"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                  fontSize: "12px",
                }}
                cursor={{ fill: "var(--muted)", opacity: 0.15 }}
              />
              <Bar dataKey="Số lượng" radius={[4, 4, 0, 0]} maxBarSize={45}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
