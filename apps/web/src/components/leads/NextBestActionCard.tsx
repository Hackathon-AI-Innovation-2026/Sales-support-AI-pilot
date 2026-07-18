"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Calendar, Clock, AlertCircle, Compass, Loader2, RefreshCw } from "lucide-react"
import { api } from "@/lib/api/axios"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface RecommendationAction {
  id: string
  action: "CALL" | "EMAIL" | "MEETING" | "WAIT"
  priority: "HIGH" | "MEDIUM" | "LOW"
  reason: string | null
}

interface NextBestActionCardProps {
  leadId: string
  action: RecommendationAction | null
}

const actionLabels: Record<string, string> = {
  CALL: "Gọi điện tư vấn trực tiếp",
  EMAIL: "Gửi email chăm sóc khách hàng",
  MEETING: "Lên lịch hẹn làm việc trực tiếp",
  WAIT: "Tạm thời chờ & theo dõi thêm",
}

const actionIcons = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  WAIT: Clock,
}

const priorityColors = {
  HIGH: "bg-red-500/10 text-red-500 border-red-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  LOW: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
}

const priorityLabels = {
  HIGH: "Ưu tiên cao",
  MEDIUM: "Ưu tiên trung bình",
  LOW: "Ưu tiên thấp",
}

export function NextBestActionCard({ leadId, action }: NextBestActionCardProps) {
  const queryClient = useQueryClient()
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true)
      await api.post(`/leads/${leadId}/next-best-action`)
      toast.success("Đã phân tích và đề xuất hành động tiếp theo thành công!")
      await queryClient.invalidateQueries({ queryKey: ["leads", leadId] })
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Lỗi khi phân tích hành động tiếp theo."
      toast.error(errMsg)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!action) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary" />
            Hành động Tiếp theo (AI Recommendation)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Đề xuất hành động kinh doanh tốt nhất tiếp theo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center pb-6 space-y-4">
          <AlertCircle className="w-7 h-7 text-muted-foreground/60" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">Chưa đề xuất hành động</p>
            <p className="text-[10px] text-muted-foreground max-w-[200px] leading-normal">
              Bấm nút bên dưới để AI phân tích điểm và tương tác, đề xuất hành động tốt nhất tiếp theo.
            </p>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer h-9 px-4 rounded-lg flex items-center gap-1.5 border-0"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                Gợi ý hành động
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const IconComponent = actionIcons[action.action] || Clock

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary" />
            Hành động Tiếp theo (AI Recommendation)
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[action.priority]}`}
          >
            {priorityLabels[action.priority]}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Đề xuất hành động kinh doanh tốt nhất tiếp theo
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Action Type Details */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Hành động đề xuất
          </span>
          <div className="text-sm font-bold text-foreground bg-primary/5 border border-primary/15 p-2.5 rounded-lg flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-primary/15 text-primary">
              <IconComponent className="w-4 h-4" />
            </div>
            {actionLabels[action.action] || action.action}
          </div>
        </div>

        {/* Action Rationale Reason */}
        {action.reason && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Lý do đề xuất (Cơ sở AI)
            </span>
            <p className="text-xs text-foreground font-semibold leading-relaxed">
              {action.reason}
            </p>
          </div>
        )}

        {/* Re-analyze Button */}
        <div className="flex justify-end pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border-border text-xs font-semibold cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Phân tích lại
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
