"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, PlusCircle, AlertCircle, Shield, Briefcase, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { TableSkeleton } from "@/components/common/Skeleton"

interface Customer {
  id: string
  fullName: string
  email: string
  phone: string
  city: string
  income: number | null
  occupation: string | null
  salaryAccount: boolean
  _count?: {
    products: number
    leads: number
  }
}

interface CustomerTableProps {
  customers: Customer[]
  isLoading: boolean
  meta: {
    page: number
    limit: number
    total: number
  }
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onViewClick: (customerId: string) => void
  onCreateLeadClick: (customerId: string) => void
}

export default function CustomerTable({
  customers,
  isLoading,
  meta,
  onPageChange,
  onLimitChange,
  onViewClick,
  onCreateLeadClick,
}: CustomerTableProps) {
  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A"
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val)
  }

  // Pagination bounds calculation
  const totalPages = Math.ceil(meta.total / meta.limit) || 1
  const startItem = (meta.page - 1) * meta.limit + 1
  const endItem = Math.min(meta.page * meta.limit, meta.total)

  if (isLoading) {
    return <TableSkeleton rows={6} cols={6} />
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b border-border/60">
              <TableHead className="text-xs font-bold text-muted-foreground p-4">Khách hàng</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground p-4">Thành phố</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground p-4">Thu nhập</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground p-4">Tài khoản SHB</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground p-4 text-center">Sản phẩm</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground p-4 text-center">Cơ hội</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground p-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground space-y-1">
                    <AlertCircle className="size-6 text-muted-foreground/60" />
                    <p className="text-xs font-bold text-foreground">Không tìm thấy khách hàng nào</p>
                    <p className="text-[10px] text-muted-foreground max-w-[240px] leading-normal font-medium">
                      Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại bộ lọc để tìm được hồ sơ phù hợp.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((cust) => (
                <TableRow key={cust.id} className="hover:bg-muted/15 transition-colors">
                  <TableCell className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => onViewClick(cust.id)}>
                        {cust.fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{cust.email} · {cust.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                      <MapPin className="size-3.5 text-muted-foreground/75 shrink-0" />
                      {cust.city}
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                      <Briefcase className="size-3.5 text-muted-foreground/75 shrink-0" />
                      {formatCurrency(cust.income)}
                    </div>
                  </TableCell>
                  <TableCell className="p-4">
                    {cust.salaryAccount ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border border-emerald-500/15 font-bold text-[9px] py-0.5 gap-0.5">
                        <Shield className="size-2.5 shrink-0" />
                        Nhận lương
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/80 font-semibold pl-1">Thường</span>
                    )}
                  </TableCell>
                  <TableCell className="p-4 text-center font-bold text-xs text-foreground">
                    {cust._count?.products || 0}
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    {cust._count?.leads && cust._count.leads > 0 ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border border-primary/15 font-bold text-[10px]">
                        {cust._count.leads} cơ hội
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60 font-medium">0</span>
                    )}
                  </TableCell>
                  <TableCell className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewClick(cust.id)}
                        className="border-border hover:bg-muted text-[10px] font-semibold cursor-pointer h-7 px-2.5 rounded-lg flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="size-3" />
                        Xem
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => onCreateLeadClick(cust.id)}
                        className="bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 text-[10px] font-bold cursor-pointer h-7 px-2.5 rounded-lg flex items-center gap-1"
                      >
                        <PlusCircle className="size-3" />
                        Tạo Cơ hội
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {meta.total > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-1 select-none">
          {/* Item ranges & limit selector */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
            <span>
              Hiển thị từ <b className="text-foreground font-bold">{startItem}</b> đến <b className="text-foreground font-bold">{endItem}</b> trong tổng số <b className="text-foreground font-bold">{meta.total}</b> khách hàng
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              Số dòng:
              <Select value={meta.limit.toString()} onValueChange={(val) => onLimitChange(parseInt(val || "10"))}>
                <SelectTrigger className="w-16 bg-background border-border text-xs rounded-lg h-7.5 py-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-xs min-w-0 w-16">
                  <SelectItem value="5" className="text-xs">5</SelectItem>
                  <SelectItem value="10" className="text-xs">10</SelectItem>
                  <SelectItem value="20" className="text-xs">20</SelectItem>
                  <SelectItem value="50" className="text-xs">50</SelectItem>
                </SelectContent>
              </Select>
            </span>
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(meta.page - 1)}
              disabled={meta.page <= 1}
              className="h-8 w-8 rounded-lg border-border cursor-pointer hover:bg-muted text-muted-foreground"
            >
              <ChevronLeft className="size-4" />
            </Button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              // Basic truncation if many pages, but simple array works for normal ranges
              if (totalPages > 5 && Math.abs(p - meta.page) > 1 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) {
                  return <span key={p} className="text-[11px] text-muted-foreground px-1 select-none">...</span>
                }
                return null
              }

              return (
                <Button
                  key={p}
                  onClick={() => onPageChange(p)}
                  variant={meta.page === p ? "default" : "outline"}
                  className={`h-8 w-8 rounded-lg cursor-pointer text-xs font-bold ${
                    meta.page === p 
                      ? "bg-primary border-primary hover:bg-primary-dark text-white border-0 shadow-sm"
                      : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(meta.page + 1)}
              disabled={meta.page >= totalPages}
              className="h-8 w-8 rounded-lg border-border cursor-pointer hover:bg-muted text-muted-foreground"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
