"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FilterX, Users } from "lucide-react"

interface LeadFiltersProps {
  search: string
  setSearch: (val: string) => void
  status: string
  setStatus: (val: string) => void
  minScore: string
  setMinScore: (val: string) => void
  maxScore: string
  setMaxScore: (val: string) => void
  onlyMine: boolean
  setOnlyMine: (val: boolean) => void
  onCreateClick: () => void
  onClearFilters: () => void
}

export function LeadFilters({
  search,
  setSearch,
  status,
  setStatus,
  minScore,
  setMinScore,
  maxScore,
  setMaxScore,
  onlyMine,
  setOnlyMine,
  onCreateClick,
  onClearFilters,
}: LeadFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên khách hàng..."
            className="pl-9 bg-muted/20 border-border focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-sm"
          />
        </div>

        {/* Right Side: Create Button */}
        <Button
          onClick={onCreateClick}
          className="bg-primary hover:bg-primary-dark text-white font-semibold flex items-center gap-1.5 cursor-pointer rounded-lg self-end md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tạo Lead mới
        </Button>
      </div>

      {/* Row 2: Filters */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50">
        {/* Status Filter */}
        <div className="w-[160px]">
          <Select value={status} onValueChange={(val) => setStatus(val || "ALL")}>
            <SelectTrigger className="bg-muted/20 border-border rounded-lg text-xs font-semibold h-9 focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-xs">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="NEW">Mới tạo</SelectItem>
              <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
              <SelectItem value="QUALIFIED">Đạt chuẩn</SelectItem>
              <SelectItem value="NEGOTIATION">Đàm phán</SelectItem>
              <SelectItem value="WON">Chốt Deal</SelectItem>
              <SelectItem value="LOST">Thất bại</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Score Range Filters */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            placeholder="Điểm từ"
            min={0}
            max={100}
            className="w-[90px] h-9 bg-muted/20 border-border rounded-lg text-xs font-medium text-center focus-visible:ring-1 focus-visible:ring-primary"
          />
          <span className="text-muted-foreground text-xs font-semibold">—</span>
          <Input
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            placeholder="đến"
            min={0}
            max={100}
            className="w-[90px] h-9 bg-muted/20 border-border rounded-lg text-xs font-medium text-center focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        {/* Toggle Assign to Me */}
        <button
          onClick={() => setOnlyMine(!onlyMine)}
          className={`flex items-center gap-1.5 h-9 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            onlyMine
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-border bg-muted/10 text-muted-foreground hover:bg-muted/20"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Lead của tôi
        </button>

        {/* Clear Filters Button */}
        {(search || status !== "ALL" || minScore || maxScore || onlyMine) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  )
}
