"use client"

import * as React from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/axios"
import { toast } from "sonner"
import { ScoreBadge } from "./ScoreBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import dayjs from "dayjs"

interface Lead {
  id: string
  interestedProduct: string | null
  latestScore: number | null
  status: string
  createdAt: string
  customer: {
    fullName: string
    email: string
    phone: string
  }
  assignedUser: {
    fullName: string
  } | null
}

interface LeadTableProps {
  leads: Lead[]
  page: number
  setPage: (page: number) => void
  limit: number
  setLimit: (limit: number) => void
  totalCount: number
}

const statusLabels: Record<string, string> = {
  NEW: "Mới tạo",
  CONTACTED: "Đã liên hệ",
  QUALIFIED: "Đạt chuẩn",
  NEGOTIATION: "Đàm phán",
  WON: "Chốt Deal",
  LOST: "Thất bại",
}

const statusColors: Record<string, string> = {
  NEW: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  CONTACTED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  QUALIFIED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  NEGOTIATION: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  WON: "bg-green-500/10 text-green-500 border-green-500/20",
  LOST: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function LeadTable({
  leads,
  page,
  setPage,
  limit,
  setLimit,
  totalCount,
}: LeadTableProps) {
  const queryClient = useQueryClient()
  const [scoringId, setScoringId] = React.useState<string | null>(null)

  const handleScore = async (id: string) => {
    try {
      setScoringId(id)
      await api.post(`/leads/${id}/score`)
      toast.success("Phân tích cơ hội bán hàng thành công!")
      // Invalidate queries to reload details and update the table row
      await queryClient.invalidateQueries({ queryKey: ["leads"] })
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Không thể thực hiện chấm điểm AI lúc này."
      toast.error(errMsg)
    } finally {
      setScoringId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / limit))

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b border-border">
            <tr>
              <th className="p-4 pl-6">Khách hàng</th>
              <th className="p-4 text-center">Điểm AI</th>
              <th className="p-4">Sản phẩm</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4">Phụ trách</th>
              <th className="p-4 text-right pr-6">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">
                  Không tìm thấy cơ hội bán hàng nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-xs">
                        {lead.customer.fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {lead.customer.phone}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      <ScoreBadge score={lead.latestScore} />
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-foreground">
                    {lead.interestedProduct || "Thẻ tín dụng"}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[lead.status] || ""}`}>
                      {statusLabels[lead.status] || lead.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {dayjs(lead.createdAt).format("DD/MM/YYYY")}
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-medium">
                    {lead.assignedUser?.fullName || "Chưa gán"}
                  </td>
                  <td className="p-4 text-right pr-6 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScore(lead.id)}
                      disabled={scoringId === lead.id}
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border-border hover:bg-muted text-xs cursor-pointer"
                    >
                      {scoringId === lead.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Chấm điểm...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Chấm điểm AI
                        </>
                      )}
                    </Button>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-secondary hover:bg-secondary-foreground/10 text-xs font-semibold text-foreground transition-all"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-border bg-muted/20">
        {/* Limit Size Selector */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
          <span>Hiển thị</span>
          <Select value={String(limit)} onValueChange={(val) => { setLimit(Number(val)); setPage(1); }}>
            <SelectTrigger className="w-16 h-8 bg-card border-border rounded-lg text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-xs">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>kết quả mỗi trang</span>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground font-semibold">
            Trang {page} / {totalPages} (Tổng {totalCount} leads)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8 w-8 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 w-8 rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
