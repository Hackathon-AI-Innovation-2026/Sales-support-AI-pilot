"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Copy, Check, RotateCw, History, FileText, ChevronDown } from "lucide-react"
import { api } from "@/lib/api/axios"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import dayjs from "dayjs"

interface EmailGeneratorProps {
  leadId: string
  defaultProduct: string | null
}

interface GeneratedContent {
  id: string
  type: string
  prompt: string | null
  content: string // JSON string for EMAIL
  createdAt: string
}

const PRODUCTS = [
  "Thẻ tín dụng SHB Visa Platinum",
  "Gói vay kinh doanh siêu tốc",
  "Gói vay mua ô tô SHB Car",
  "Gói vay mua nhà SHB Home",
  "Gửi tiết kiệm lãi suất bậc thang"
]

export default function EmailGenerator({ leadId, defaultProduct }: EmailGeneratorProps) {
  // Set selected product. If defaultProduct is not null, try to match or append it.
  const [selectedProduct, setSelectedProduct] = React.useState<string>(() => {
    if (defaultProduct && PRODUCTS.includes(defaultProduct)) {
      return defaultProduct
    }
    return PRODUCTS[0]
  })

  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [copiedSubject, setCopiedSubject] = React.useState(false)
  const [copiedBody, setCopiedBody] = React.useState(false)
  const [copiedAll, setCopiedAll] = React.useState(false)
  const [showHistory, setShowHistory] = React.useState(false)

  // Fetch email history for this lead
  const { data: historyData = [], refetch: refetchHistory } = useQuery<GeneratedContent[]>({
    queryKey: ["leads", leadId, "generated-content", "EMAIL"],
    queryFn: () => api.get(`/leads/${leadId}/generated-content`, { params: { type: "EMAIL" } }).then((res) => res.data),
    enabled: !!leadId,
  })

  // Set the product if defaultProduct changes and is valid
  React.useEffect(() => {
    if (defaultProduct) {
      setSelectedProduct(defaultProduct)
    }
  }, [defaultProduct])

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      setCopiedSubject(false)
      setCopiedBody(false)
      setCopiedAll(false)
      
      const res = await api.post("/ai/generate-email", {
        leadId,
        productName: selectedProduct
      })
      
      const generated = res.data as GeneratedContent
      const parsedContent = JSON.parse(generated.content)
      setSubject(parsedContent.subject || "")
      setBody(parsedContent.body || "")
      
      toast.success("Tạo Email chào hàng thành công!")
      // Invalidate history to fetch new record
      await refetchHistory()
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Không thể tạo email bằng AI. Vui lòng kiểm tra lại dịch vụ."
      toast.error(errMsg)
    } finally {
      setIsGenerating(false)
    }
  }

  const loadHistoryItem = (item: GeneratedContent) => {
    try {
      const parsed = JSON.parse(item.content)
      setSubject(parsed.subject || "")
      setBody(parsed.body || "")
      
      // Attempt to extract product name from prompt if possible, or just keep selected
      if (item.prompt) {
        const match = PRODUCTS.find(p => item.prompt?.includes(p))
        if (match) setSelectedProduct(match)
      }
      
      toast.info("Đã tải lại email từ lịch sử nháp")
      setShowHistory(false)
    } catch (e) {
      toast.error("Không thể đọc định dạng email trong lịch sử")
    }
  }

  const handleCopy = async (text: string, type: "subject" | "body" | "all") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "subject") {
        setCopiedSubject(true)
        setTimeout(() => setCopiedSubject(false), 2000)
        toast.success("Đã copy tiêu đề thư!")
      } else if (type === "body") {
        setCopiedBody(true)
        setTimeout(() => setCopiedBody(false), 2000)
        toast.success("Đã copy nội dung thư!")
      } else {
        setCopiedAll(true)
        setTimeout(() => setCopiedAll(false), 2000)
        toast.success("Đã copy toàn bộ email!")
      }
    } catch (err) {
      toast.error("Lỗi sao chép văn bản.")
    }
  }

  const formattedAllText = `Subject: ${subject}\n\n${body}`

  return (
    <div className="flex flex-col flex-1 gap-4">
      {/* Product Selection and Action Button */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <Select value={selectedProduct} onValueChange={(val) => setSelectedProduct(val || "")} disabled={isGenerating}>
            <SelectTrigger className="w-full bg-background border-border text-xs rounded-lg h-9">
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {PRODUCTS.map((prod) => (
                <SelectItem key={prod} value={prod} className="text-xs">
                  {prod}
                </SelectItem>
              ))}
              {defaultProduct && !PRODUCTS.includes(defaultProduct) && (
                <SelectItem value={defaultProduct} className="text-xs">
                  {defaultProduct} (Khuyến nghị)
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer h-9 px-4 rounded-lg flex items-center justify-center gap-1.5 border-0 shadow-sm"
        >
          {isGenerating ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Mail className="w-3.5 h-3.5" />
              Tạo Email AI
            </>
          )}
        </Button>
      </div>

      {/* Editor Surface */}
      {subject || body ? (
        <div className="flex flex-col flex-1 border border-border/60 bg-muted/5 rounded-xl overflow-hidden shadow-inner p-3.5 gap-3.5">
          {/* Subject Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Tiêu đề email (Subject)
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(subject, "subject")}
                className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted"
                title="Copy tiêu đề"
              >
                {copiedSubject ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Nhập tiêu đề..."
              className="bg-background border-border text-xs rounded-md h-8 font-semibold text-foreground"
            />
          </div>

          {/* Body Field */}
          <div className="flex-1 flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Nội dung email (Body)
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCopy(body, "body")}
                className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted"
                title="Copy nội dung"
              >
                {copiedBody ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Nội dung chào hàng được sinh bởi AI..."
              className="flex-1 min-h-[160px] bg-background border-border text-xs rounded-md p-3 font-medium leading-relaxed resize-none text-foreground"
            />
          </div>

          {/* Action Toolbar */}
          <div className="flex justify-between items-center pt-2.5 border-t border-border/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="border-border hover:bg-muted text-xs font-semibold cursor-pointer h-8 px-3 rounded-lg flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCw className="w-3 h-3" />
              Tạo lại
            </Button>
            
            <Button
              size="sm"
              onClick={() => handleCopy(formattedAllText, "all")}
              className="bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 text-xs font-bold cursor-pointer h-8 px-3.5 rounded-lg flex items-center gap-1"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy toàn bộ thư
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/10 border border-dashed border-border rounded-xl min-h-[220px]">
          <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
            <Mail className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-foreground">Trình tạo Email AI chào hàng</p>
          <p className="text-[10px] text-muted-foreground max-w-[240px] mt-1 leading-normal font-medium">
            Chọn sản phẩm bạn muốn giới thiệu và nhấn nút tạo để sinh email chào hàng cá nhân hóa chuyên nghiệp.
          </p>
        </div>
      )}

      {/* History Log Section */}
      {historyData.length > 0 && (
        <div className="border border-border/50 rounded-lg overflow-hidden bg-muted/5">
          <Button
            variant="ghost"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full justify-between hover:bg-muted/50 px-3 py-2 text-xs font-bold text-foreground cursor-pointer h-9 rounded-none"
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-muted-foreground" />
              Lịch sử email đã tạo ({historyData.length})
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${showHistory ? "rotate-180" : ""}`} />
          </Button>

          {showHistory && (
            <div className="border-t border-border/50 divide-y divide-border/40 max-h-[160px] overflow-y-auto">
              {historyData.map((item) => {
                let parsedSubject = "Email chào hàng"
                try {
                  const p = JSON.parse(item.content)
                  parsedSubject = p.subject || parsedSubject
                } catch (_) {}

                return (
                  <div
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className="p-2.5 hover:bg-muted/40 cursor-pointer flex justify-between items-start transition-colors duration-150"
                  >
                    <div className="min-w-0 flex gap-2 items-start">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-[11px] font-bold text-foreground truncate leading-snug">{parsedSubject}</p>
                        <p className="text-[9px] text-muted-foreground font-mono">
                          {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded shrink-0">
                      Tải lại
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
