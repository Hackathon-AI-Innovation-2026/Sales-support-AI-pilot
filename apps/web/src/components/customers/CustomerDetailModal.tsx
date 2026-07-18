"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/axios"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  User, Mail, Phone, MapPin, Briefcase, DollarSign, Calendar, ShieldCheck, 
  Loader2, Sparkles, MessageSquare, PhoneCall, MailOpen, AlertCircle, PlusCircle
} from "lucide-react"
import dayjs from "dayjs"

interface CustomerDetailModalProps {
  customerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateLeadClick: (customerId: string) => void
}

export default function CustomerDetailModal({
  customerId,
  open,
  onOpenChange,
  onCreateLeadClick,
}: CustomerDetailModalProps) {
  // Query details when modal opens and customerId is set
  const { data, isLoading } = useQuery({
    queryKey: ["customers", customerId],
    queryFn: () => api.get(`/customers/${customerId}`).then((res) => res.data),
    enabled: open && !!customerId,
  })

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val)
  }

  const getInteractionIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "CALL":
        return <PhoneCall className="size-3.5 text-blue-500" />
      case "EMAIL":
        return <MailOpen className="size-3.5 text-purple-500" />
      case "MEETING":
        return <MessageSquare className="size-3.5 text-emerald-500" />
      default:
        return <MessageSquare className="size-3.5 text-muted-foreground" />
    }
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "bg-success/10 text-success border-success/20"
    if (score >= 60) return "bg-warning/10 text-warning border-warning/20"
    return "bg-danger/10 text-danger border-danger/20"
  }

  const getLeadStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px]">Mới (NEW)</Badge>
      case "CONTACTED":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">Đã liên hệ (CONTACTED)</Badge>
      case "QUALIFIED":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">Đạt chuẩn (QUALIFIED)</Badge>
      case "WON":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">Thành công (WON)</Badge>
      case "LOST":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px]">Thất bại (LOST)</Badge>
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-4xl rounded-xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="pb-3 border-b border-border/55">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
            <User className="size-5 text-primary" />
            Hồ sơ Chi tiết Khách hàng
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Thông tin cá nhân, sản phẩm đang sử dụng và lịch sử tương tác tại hệ thống ngân hàng SHB.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
        ) : !data ? (
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center">
            <AlertCircle className="size-8 text-muted-foreground mb-2" />
            <p className="text-sm font-semibold">Không tìm thấy thông tin khách hàng</p>
          </div>
        ) : (
          <div className="flex-1 grid gap-6 md:grid-cols-3 items-start overflow-y-auto pt-4 pr-1">
            {/* Left Column: Personal Profile */}
            <div className="md:col-span-1 space-y-4">
              <Card className="bg-muted/10 border-border shadow-sm">
                <CardContent className="pt-5 space-y-4">
                  <div className="text-center pb-2">
                    <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold border border-primary/20 select-none">
                      {data.customer.fullName.split(" ").pop()?.charAt(0) || "U"}
                    </div>
                    <h3 className="text-sm font-bold text-foreground mt-3">{data.customer.fullName}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{data.customer.id}</p>
                  </div>

                  <Separator className="bg-border/60" />

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Mail className="size-3.5 shrink-0" />
                      <span className="text-foreground font-medium truncate">{data.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Phone className="size-3.5 shrink-0" />
                      <span className="text-foreground font-medium">{data.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="text-foreground font-medium">{data.customer.city}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Briefcase className="size-3.5 shrink-0" />
                      <span className="text-foreground font-medium">{data.customer.occupation || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <DollarSign className="size-3.5 shrink-0" />
                      <span className="text-foreground font-medium">{formatCurrency(data.customer.income)}/tháng</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Calendar className="size-3.5 shrink-0" />
                      <span className="text-foreground font-medium">{data.customer.age} tuổi · {data.customer.gender === "MALE" ? "Nam" : "Nữ"}</span>
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  <div className="pt-1">
                    {data.customer.salaryAccount ? (
                      <Badge className="w-full bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 justify-center py-1 font-bold text-[10px] gap-1">
                        <ShieldCheck className="size-3.5" />
                        Nhận lương qua SHB
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-full justify-center border-border/80 text-muted-foreground py-1 text-[10px]">
                        Tài khoản thường
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Tabbed View (Owned Products, Interactions, Active Lead) */}
            <div className="md:col-span-2 flex flex-col h-full">
              <Tabs defaultValue="products" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3 bg-muted/40 border border-border/55 p-1 rounded-lg text-xs font-semibold mb-4 select-none shrink-0">
                  <TabsTrigger value="products" className="cursor-pointer py-1.5 rounded-md">
                    Sản phẩm sở hữu ({data.products.length})
                  </TabsTrigger>
                  <TabsTrigger value="interactions" className="cursor-pointer py-1.5 rounded-md">
                    Lịch sử tương tác ({data.interactions.length})
                  </TabsTrigger>
                  <TabsTrigger value="lead" className="cursor-pointer py-1.5 rounded-md">
                    Cơ hội bán hàng
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Products Owned */}
                <TabsContent value="products" className="flex-1 overflow-y-auto mt-0 min-h-[220px]">
                  {data.products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-1">
                      <ShieldCheck className="size-6 text-muted-foreground/60 mx-auto" />
                      <p className="text-xs font-semibold">Chưa sở hữu sản phẩm nào</p>
                    </div>
                  ) : (
                    <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/5">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 font-bold">
                          <tr>
                            <th className="p-3">Tên sản phẩm</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3">Ngày mở</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {data.products.map((prod: any) => (
                            <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-3 font-bold text-foreground">{prod.productName}</td>
                              <td className="p-3">
                                {prod.status === "ACTIVE" ? (
                                  <Badge className="bg-success/15 hover:bg-success/15 text-success border-success/10 font-bold text-[9px]">ACTIVE</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-[9px]">INACTIVE</Badge>
                                )}
                              </td>
                              <td className="p-3 text-muted-foreground font-medium">
                                {prod.openedAt ? dayjs(prod.openedAt).format("DD/MM/YYYY") : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Interactions Timeline */}
                <TabsContent value="interactions" className="flex-1 overflow-y-auto mt-0 min-h-[220px]">
                  {data.interactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-1">
                      <MessageSquare className="size-6 text-muted-foreground/60 mx-auto" />
                      <p className="text-xs font-semibold">Chưa có nhật ký tương tác</p>
                    </div>
                  ) : (
                    <div className="relative border-l border-border/70 ml-2.5 space-y-5 py-2 pl-4">
                      {data.interactions.map((inter: any) => (
                        <div key={inter.id} className="relative">
                          {/* Timeline Dot Indicator */}
                          <span className="absolute -left-[23.5px] top-1 mt-0.5 bg-background border border-border size-4 rounded-full flex items-center justify-center shadow-sm shrink-0">
                            {getInteractionIcon(inter.interactionType)}
                          </span>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-foreground bg-muted/65 px-1.5 py-0.5 rounded uppercase">
                                {inter.interactionType}
                              </span>
                              <span className="text-[9px] text-muted-foreground font-mono">
                                {dayjs(inter.occurredAt).format("DD/MM/YYYY HH:mm")}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/85 font-medium leading-relaxed bg-muted/15 border border-border/30 p-2 rounded-lg">
                              {inter.notes}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Current Active Lead */}
                <TabsContent value="lead" className="flex-1 overflow-y-auto mt-0 min-h-[220px]">
                  {data.lead ? (
                    <div className="space-y-4">
                      <div className="border border-border/60 bg-muted/5 rounded-xl p-4 space-y-3.5">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Trạng thái bán hàng</span>
                            <div className="mt-1">{getLeadStatusBadge(data.lead.status)}</div>
                          </div>
                          {data.lead.score !== null && (
                            <div className="text-right">
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">Điểm AI tiềm năng</span>
                              <Badge className={`text-xs font-bold border justify-center ${getLeadScoreColor(data.lead.score)}`}>
                                <Sparkles className="size-3 mr-1 animate-pulse" />
                                {data.lead.score}/100
                              </Badge>
                            </div>
                          )}
                        </div>

                        <Separator className="bg-border/40" />
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Lead ID:</span>
                          <span className="font-mono text-[10px] bg-muted/65 px-1.5 py-0.5 rounded">{data.lead.id}</span>
                        </div>

                        <div className="pt-2">
                          <a href={`/leads/${data.lead.id}`}>
                            <Button className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-bold h-9 rounded-lg border-0 cursor-pointer flex items-center justify-center">
                              Xem Chi tiết Cơ hội & AI Copilot
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl min-h-[180px]">
                      <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                        <PlusCircle className="size-5" />
                      </div>
                      <p className="text-xs font-bold text-foreground">Không có Cơ hội bán hàng (Lead) đang hoạt động</p>
                      <p className="text-[10px] text-muted-foreground max-w-[260px] mt-1 leading-normal font-medium mb-4">
                        Khách hàng này hiện chưa được khởi tạo cơ hội bán hàng nào trong hệ thống.
                      </p>
                      <Button
                        onClick={() => {
                          onOpenChange(false)
                          onCreateLeadClick(data.customer.id)
                        }}
                        className="bg-primary hover:bg-primary-dark text-white text-xs font-bold h-9 px-4 rounded-lg border-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <PlusCircle className="size-4" />
                        Khởi tạo Cơ hội Bán hàng
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
