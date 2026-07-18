"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Info } from "lucide-react"
import { api } from "@/lib/api/axios"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface LeadScore {
  score: number
  conversionProbability: number
  topFeatures: any // string[]
}

interface LeadScoreCardProps {
  leadId: string
  latestScore: LeadScore | null
}

const featureLabels: Record<string, string> = {
  Income: "Thu nhập cao & ổn định",
  "Website Visit": "Tương tác tích cực trên website",
  "Loan Inquiry": "Có nhu cầu tìm hiểu vay vốn",
  "Branch Visit": "Đã làm việc tại chi nhánh",
  "Email Click": "Click link tương tác trong email",
  Age: "Độ tuổi nằm trong nhóm tiềm năng",
  Occupation: "Nghề nghiệp có uy tín tín dụng",
  "Salary Account": "Mở tài khoản nhận lương tại SHB",
  "Existing Products": "Đang sử dụng dịch vụ khác của SHB",
  "Call Duration": "Thời lượng gọi điện tư vấn tốt",
  "App Login Frequency": "Tần suất dùng App SHB Mobile cao",
  "Interaction Recency": "Tương tác rất mới gần đây",
}

export function LeadScoreCard({ leadId, latestScore }: LeadScoreCardProps) {
  const queryClient = useQueryClient()
  const [isScoring, setIsScoring] = React.useState(false)

  const handleScore = async () => {
    try {
      setIsScoring(true)
      await api.post(`/leads/${leadId}/score`)
      toast.success("Phân tích lại cơ hội bán hàng thành công!")
      // Invalidate queries to reload details
      await queryClient.invalidateQueries({ queryKey: ["leads", leadId] })
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Lỗi khi chấm điểm AI."
      toast.error(errMsg)
    } finally {
      setIsScoring(false)
    }
  }

  const score = latestScore?.score ?? null
  const probability = latestScore?.conversionProbability ?? null
  const topFeatures = Array.isArray(latestScore?.topFeatures)
    ? latestScore.topFeatures
    : typeof latestScore?.topFeatures === "string"
    ? JSON.parse(latestScore.topFeatures)
    : []

  // Circle SVG metrics
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = score !== null ? circumference - (score / 100) * circumference : circumference

  const getScoreColorClass = (val: number) => {
    if (val >= 80) return "stroke-success"
    if (val >= 60) return "stroke-warning"
    return "stroke-danger"
  }

  const getScoreTextClass = (val: number) => {
    if (val >= 80) return "text-success"
    if (val >= 60) return "text-warning"
    return "text-danger"
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Đánh giá Cơ hội AI (Lead Score)
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Điểm số cơ hội chuyển đổi dự báo từ mô hình máy học
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {score === null ? (
          /* Empty/Unanalyzed State */
          <div className="flex flex-col items-center justify-center text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">Chưa có kết quả phân tích AI</p>
              <p className="text-[10px] text-muted-foreground max-w-[200px] leading-normal">
                Bấm nút phân tích bên dưới để AI tiến hành tính toán điểm chuyển đổi cho lead này.
              </p>
            </div>
            <Button
              onClick={handleScore}
              disabled={isScoring}
              className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer h-9 px-4 rounded-lg flex items-center gap-1.5 border-0"
            >
              {isScoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Phân tích ngay
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Analyzed State */
          <>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* SVG Circular Gauge */}
              <div className="relative flex items-center justify-center w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className="stroke-muted"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  {/* Indicator circle */}
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    className={`transition-all duration-500 ease-out ${getScoreColorClass(score)}`}
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${getScoreTextClass(score)}`}>
                    {score}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                    Điểm AI
                  </span>
                </div>
              </div>

              {/* Conversion probability percentage */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs text-muted-foreground font-semibold">Tỷ lệ chốt thành công</div>
                <div className="text-2xl font-black text-foreground">
                  {probability !== null ? (probability * 100).toFixed(0) : 0}%
                </div>
                <div className="text-[10px] text-muted-foreground font-medium">
                  Tính toán dựa trên hồ sơ khách hàng
                </div>
              </div>
            </div>

            {/* Score Drivers / Top Features */}
            {topFeatures.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground block uppercase tracking-wider">
                  Yếu tố ảnh hưởng chính (Score Drivers)
                </span>
                <ul className="space-y-1.5">
                  {topFeatures.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{featureLabels[feat] || feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Re-analyze Button */}
            <div className="flex justify-end pt-2 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={handleScore}
                disabled={isScoring}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border-border text-xs font-semibold cursor-pointer"
              >
                {isScoring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang chấm điểm...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Chấm điểm lại
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
