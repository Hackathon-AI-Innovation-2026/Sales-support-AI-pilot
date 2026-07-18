"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const mockData = [
  { name: "Tuần 1", "Tỷ lệ đạt": 62, "Mục tiêu": 65 },
  { name: "Tuần 2", "Tỷ lệ đạt": 64, "Mục tiêu": 65 },
  { name: "Tuần 3", "Tỷ lệ đạt": 69, "Mục tiêu": 65 },
  { name: "Tuần 4", "Tỷ lệ đạt": 71, "Mục tiêu": 65 },
]

export function ConversionTrend() {
  return (
    <Card className="bg-card border-border shadow-sm col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-bold text-foreground">Xu hướng Chuyển đổi Tuần</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Biến động tỷ lệ chốt deal thành công hàng tuần so với mục tiêu đề ra
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                formatter={(value: any) => [`${value}%`]}
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              />
              <Line
                type="monotone"
                dataKey="Tỷ lệ đạt"
                stroke="hsl(221, 83%, 53%)"
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Mục tiêu"
                stroke="hsl(0, 84%, 60%)"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
