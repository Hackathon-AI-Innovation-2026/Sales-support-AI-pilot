"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, MailOpen, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { api } from "@/lib/api/axios"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface ProductRecommendation {
  id: string
  productName: string
  confidence: number
  reason: string | null
}

interface RecommendedProductCardProps {
  leadId: string
  recommendation: ProductRecommendation | null
  onGenerateEmailClick: () => void
}

export function RecommendedProductCard({
  leadId,
  recommendation,
  onGenerateEmailClick,
}: RecommendedProductCardProps) {
  const queryClient = useQueryClient()
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true)
      await api.post(`/leads/${leadId}/recommend-product`)
      toast.success("Đã phân tích và tạo khuyến nghị sản phẩm thành công!")
      await queryClient.invalidateQueries({ queryKey: ["leads", leadId] })
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Lỗi khi phân tích sản phẩm khuyến nghị."
      toast.error(errMsg)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!recommendation) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Target className="w-4 h-4 text-primary" />
            Sản phẩm Khuyến nghị AI
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sản phẩm tài chính phù hợp nhất dựa trên phân tích nhu cầu
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center pb-6 space-y-4">
          <AlertCircle className="w-7 h-7 text-muted-foreground/60" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">Chưa có khuyến nghị sản phẩm</p>
            <p className="text-[10px] text-muted-foreground max-w-[200px] leading-normal">
              Bấm nút bên dưới để AI phân tích hồ sơ và gợi ý sản phẩm phù hợp nhất cho khách hàng.
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
                <Target className="w-4 h-4" />
                Phân tích sản phẩm
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Format confidence as percentage (e.g. 0.85 -> 85%)
  const formattedConfidence = (recommendation.confidence * 100).toFixed(0) + "%"

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Target className="w-4 h-4 text-primary" />
            Sản phẩm Khuyến nghị AI
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
            Độ tin cậy: {formattedConfidence}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Sản phẩm tài chính phù hợp nhất dựa trên phân tích nhu cầu
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Product Details */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Sản phẩm đề xuất
          </span>
          <div className="text-sm font-bold text-foreground bg-primary/5 border border-primary/15 p-2.5 rounded-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {recommendation.productName}
          </div>
        </div>

        {/* Rationale Reason */}
        {recommendation.reason && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Cơ sở khuyến nghị (Lý do)
            </span>
            <p className="text-xs text-foreground font-semibold leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-2 border-t border-border/50 flex gap-2">
          <Button
            onClick={onGenerateEmailClick}
            className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer h-9 px-4 rounded-lg flex items-center justify-center gap-1.5 border-0"
          >
            <MailOpen className="w-4 h-4" />
            Soạn Email chào hàng
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            title="Phân tích lại"
            className="h-9 w-9 rounded-lg border-border shrink-0 cursor-pointer"
          >
            {isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
