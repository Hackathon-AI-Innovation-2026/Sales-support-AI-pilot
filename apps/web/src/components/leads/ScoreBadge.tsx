import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScoreBadgeProps {
  score: number | null
  className?: string
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground border-border bg-muted/20 font-medium text-xs", className)}>
        Chưa chấm
      </Badge>
    )
  }

  const getStyle = (val: number) => {
    if (val >= 80) {
      return "bg-success/15 text-success border-success/30"
    }
    if (val >= 60) {
      return "bg-warning/15 text-warning border-warning/30"
    }
    return "bg-danger/15 text-danger border-danger/30"
  }

  const getLabel = (val: number) => {
    if (val >= 80) return "Cao"
    if (val >= 60) return "Vừa"
    return "Thấp"
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 font-bold text-xs rounded-full flex items-center gap-1 border transition-all duration-200 select-none",
        getStyle(score),
        className
      )}
    >
      <Sparkles className="w-3 h-3 animate-pulse flex-shrink-0" />
      <span>
        {score} ({getLabel(score)})
      </span>
    </Badge>
  )
}
