import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

interface Lead {
  id: string
  interestedProduct: string | null
  latestScore: number | null
  customer: {
    id: string
    fullName: string
    email: string
    phone: string
  }
}

interface HotLeadsTableProps {
  leads: Lead[]
}

export function HotLeadsTable({ leads }: HotLeadsTableProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 text-green-500 border-green-500/20"
    if (score >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    return "bg-red-500/10 text-red-500 border-red-500/20"
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "High"
    if (score >= 60) return "Medium"
    return "Low"
  };

  return (
    <Card className="bg-card border-border shadow-sm col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold text-foreground">Top Cơ hội Bán hàng (Hot Leads)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Danh sách leads có điểm AI đánh giá cao nhất cần ưu tiên tiếp cận
          </CardDescription>
        </div>
        <Link
          href="/leads"
          className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1.5 transition-colors"
        >
          Xem tất cả
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-t border-border">
            <thead className="bg-muted/30 text-muted-foreground text-xs font-semibold border-b border-border">
              <tr>
                <th className="p-3.5 pl-6">Khách hàng</th>
                <th className="p-3.5">Sản phẩm</th>
                <th className="p-3.5 text-center">Điểm AI</th>
                <th className="p-3.5 text-right pr-6">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-xs">
                    Không có lead phù hợp nào
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/10 transition-colors">
                    <td className="p-3.5 pl-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">
                          {lead.customer.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {lead.customer.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-xs text-foreground">
                      {lead.interestedProduct || "Thẻ tín dụng"}
                    </td>
                    <td className="p-3.5 text-center">
                      {lead.latestScore !== null ? (
                        <div className="inline-flex items-center gap-1.5">
                          <Badge variant="outline" className={`px-2 py-0.5 font-bold text-[10px] rounded-full flex items-center gap-1 border ${getScoreColor(lead.latestScore)}`}>
                            <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                            {lead.latestScore} ({getScoreText(lead.latestScore)})
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Chưa tính</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right pr-6">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center justify-center h-7 px-3 rounded-md bg-secondary hover:bg-secondary-foreground/10 text-xs font-medium text-foreground transition-all"
                      >
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
