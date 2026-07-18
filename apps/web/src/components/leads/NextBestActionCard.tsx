import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, Calendar, Clock, AlertCircle, Compass } from "lucide-react"

interface RecommendationAction {
  id: string
  action: "CALL" | "EMAIL" | "MEETING" | "WAIT"
  priority: "HIGH" | "MEDIUM" | "LOW"
  reason: string | null
}

interface NextBestActionCardProps {
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

export function NextBestActionCard({ action }: NextBestActionCardProps) {
  if (!action) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary" />
            Hành động Tiếp theo (AI Recommendation)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center pb-6">
          <AlertCircle className="w-7 h-7 text-muted-foreground/60 mb-2" />
          <p className="text-xs font-semibold text-foreground">Chưa đề xuất hành động</p>
          <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1 leading-normal">
            Hành động tiếp theo được AI đề xuất tự động sau khi phân tích điểm và các tương tác gần đây.
          </p>
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
          <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[action.priority]}`}>
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
      </CardContent>
    </Card>
  )
}
