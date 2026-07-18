"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Phone, Mail, MapPin, Globe, Smartphone, HelpCircle, FileText } from "lucide-react"
import dayjs from "dayjs"

interface Interaction {
  id: string
  interactionType: string
  occurredAt: string
  metadata: any // JSON
}

interface InteractionTimelineProps {
  interactions: Interaction[]
}

const interactionLabels: Record<string, string> = {
  EMAIL_OPEN: "Mở Email",
  EMAIL_CLICK: "Click Link Email",
  CALL: "Cuộc gọi tư vấn",
  BRANCH_VISIT: "Gặp tại chi nhánh",
  WEBSITE_VISIT: "Ghé thăm website",
  APP_LOGIN: "Đăng nhập App",
  LOAN_INQUIRY: "Yêu cầu vay vốn",
}

const interactionIcons: Record<string, any> = {
  EMAIL_OPEN: Mail,
  EMAIL_CLICK: FileText,
  CALL: Phone,
  BRANCH_VISIT: MapPin,
  WEBSITE_VISIT: Globe,
  APP_LOGIN: Smartphone,
  LOAN_INQUIRY: HelpCircle,
}

const iconColors: Record<string, string> = {
  EMAIL_OPEN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  EMAIL_CLICK: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  CALL: "bg-green-500/10 text-green-500 border-green-500/20",
  BRANCH_VISIT: "bg-red-500/10 text-red-500 border-red-500/20",
  WEBSITE_VISIT: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  APP_LOGIN: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  LOAN_INQUIRY: "bg-amber-500/10 text-amber-500 border-amber-500/20",
}

export function InteractionTimeline({ interactions }: InteractionTimelineProps) {
  // Group interactions by date (YYYY-MM-DD)
  const groupedInteractions = React.useMemo(() => {
    const groups: Record<string, Interaction[]> = {}
    
    // Sort interactions descending
    const sorted = [...interactions].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    )

    sorted.forEach((item) => {
      const dateKey = dayjs(item.occurredAt).format("YYYY-MM-DD")
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
    })

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }))
  }, [interactions])

  // Get details display from metadata based on interaction type
  const renderMetadataDetail = (item: Interaction) => {
    const meta = typeof item.metadata === "string" ? JSON.parse(item.metadata) : item.metadata
    if (!meta) return null

    switch (item.interactionType) {
      case "EMAIL_OPEN":
      case "EMAIL_CLICK":
        return meta.subject ? (
          <span className="italic block mt-1 text-[10px] text-muted-foreground truncate max-w-[280px]">
            Chủ đề: &ldquo;{meta.subject}&rdquo;
          </span>
        ) : null
      case "WEBSITE_VISIT":
        return meta.page ? (
          <span className="block mt-1 text-[10px] text-muted-foreground truncate max-w-[280px]">
            Trang xem: {meta.page} {meta.duration ? `(${meta.duration}s)` : ""}
          </span>
        ) : null
      case "CALL":
        return meta.duration ? (
          <span className="block mt-1 text-[10px] text-muted-foreground">
            Thời lượng: {meta.duration} giây {meta.notes ? `- ${meta.notes}` : ""}
          </span>
        ) : null
      case "LOAN_INQUIRY":
        return meta.amount ? (
          <span className="block mt-1 text-[10px] text-muted-foreground font-semibold">
            Nhu cầu: {Number(meta.amount).toLocaleString("vi-VN")} ₫
          </span>
        ) : null
      default:
        return meta.notes ? (
          <span className="block mt-1 text-[10px] text-muted-foreground truncate">
            Ghi chú: {meta.notes}
          </span>
        ) : null
    }
  }

  return (
    <Card className="bg-card border-border shadow-sm flex-1 flex flex-col min-h-[500px]">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold text-foreground">Lịch sử Tương tác</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Dòng thời gian các điểm chạm tương tác của khách hàng
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 flex-1 overflow-y-auto max-h-[620px] scrollbar-thin">
        {groupedInteractions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground text-xs py-12">
            Không tìm thấy lịch sử tương tác nào
          </div>
        ) : (
          <div className="relative border-l border-border ml-3.5 space-y-6">
            {groupedInteractions.map((group) => (
              <div key={group.date} className="relative pl-6">
                {/* Day header marker */}
                <div className="absolute -left-[29.5px] top-0 bg-background px-1.5 py-0.5 border border-border rounded-full text-[9px] font-bold text-muted-foreground uppercase tracking-wider select-none shadow-sm">
                  {dayjs(group.date).format("DD/MM")}
                </div>

                <div className="space-y-4 pt-4">
                  {group.items.map((item) => {
                    const Icon = interactionIcons[item.interactionType] || HelpCircle
                    return (
                      <div key={item.id} className="relative flex gap-3 text-xs">
                        {/* Dot Icon marker */}
                        <div className={`absolute -left-[35px] top-0 w-[19px] h-[19px] rounded-full border flex items-center justify-center ${iconColors[item.interactionType] || "bg-muted text-muted-foreground"}`}>
                          <Icon className="w-2.5 h-2.5" />
                        </div>

                        {/* Text Detail card */}
                        <div className="flex-1 bg-muted/20 border border-border/40 p-2.5 rounded-lg">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold text-foreground text-xs leading-none">
                              {interactionLabels[item.interactionType] || item.interactionType}
                            </span>
                            <span className="text-[9px] text-zinc-400 font-bold tracking-tight">
                              {dayjs(item.occurredAt).format("HH:mm")}
                            </span>
                          </div>
                          {renderMetadataDetail(item)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
