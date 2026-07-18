"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/axios"
import CustomerTable from "@/components/customers/CustomerTable"
import CustomerDetailModal from "@/components/customers/CustomerDetailModal"
import { CreateLeadModal } from "@/components/leads/CreateLeadModal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, RefreshCw, Landmark, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CustomersPage() {
  // Filter States
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [city, setCity] = React.useState("ALL")
  const [minIncome, setMinIncome] = React.useState("ALL")
  
  // Pagination States
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  // Modals States
  const [detailModalOpen, setDetailModalOpen] = React.useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string | null>(null)
  
  const [createLeadOpen, setCreateLeadOpen] = React.useState(false)
  const [leadCustomerId, setLeadCustomerId] = React.useState<string | undefined>(undefined)

  // Debounce search query to reduce API load
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to first page
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  // Reset page when filter changes
  const handleCityChange = (val: string) => {
    setCity(val)
    setPage(1)
  }

  const handleIncomeChange = (val: string) => {
    setMinIncome(val)
    setPage(1)
  }

  // Construct query params
  const queryParams = React.useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit,
    }
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim()
    }
    if (city !== "ALL") {
      params.city = city
    }
    if (minIncome !== "ALL") {
      params.minIncome = parseInt(minIncome)
    }
    return params
  }, [page, limit, debouncedSearch, city, minIncome])

  // Fetch customers data via React Query
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["customers-list", queryParams],
    queryFn: () => api.get("/customers", { params: queryParams }).then((res) => res.data),
  })

  // Handlers
  const handleViewCustomer = (id: string) => {
    setSelectedCustomerId(id)
    setDetailModalOpen(true)
  }

  const handleCreateLead = (id: string) => {
    setLeadCustomerId(id)
    setCreateLeadOpen(true)
  }

  const customers = data?.data || []
  const meta = data?.meta || { page: 1, limit: 10, total: 0 }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/55 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
            <Users className="w-5.5 h-5.5 text-primary" />
            Danh sách Khách hàng
          </h1>
          <p className="text-muted-foreground text-xs font-medium">
            Truy cập thông tin chi tiết hồ sơ khách hàng và các sản phẩm tài chính sở hữu tại SHB.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="border-border hover:bg-muted text-xs font-semibold cursor-pointer h-9 px-3 rounded-lg flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 items-center">
        {/* Full-text search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            className="pl-9 bg-card border-border text-xs rounded-lg h-9 w-full"
          />
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-lg h-9 px-2">
          <Landmark className="size-3.5 text-muted-foreground shrink-0" />
          <Select value={city} onValueChange={(val) => handleCityChange(val || "ALL")}>
            <SelectTrigger className="border-0 bg-transparent text-xs p-0 focus:ring-0 shadow-none h-auto w-full select-none cursor-pointer">
              <SelectValue placeholder="Thành phố" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-xs">
              <SelectItem value="ALL">Tất cả thành phố</SelectItem>
              <SelectItem value="Hanoi">Hà Nội</SelectItem>
              <SelectItem value="HCM City">TP. Hồ Chí Minh</SelectItem>
              <SelectItem value="Danang">Đà Nẵng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Min Income Filter */}
        <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-lg h-9 px-2">
          <Filter className="size-3.5 text-muted-foreground shrink-0" />
          <Select value={minIncome} onValueChange={(val) => handleIncomeChange(val || "ALL")}>
            <SelectTrigger className="border-0 bg-transparent text-xs p-0 focus:ring-0 shadow-none h-auto w-full select-none cursor-pointer">
              <SelectValue placeholder="Thu nhập tối thiểu" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-xs">
              <SelectItem value="ALL">Mọi mức thu nhập</SelectItem>
              <SelectItem value="15000000">Từ 15 triệu VND</SelectItem>
              <SelectItem value="30000000">Từ 30 triệu VND</SelectItem>
              <SelectItem value="50000000">Từ 50 triệu VND</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Customers Table */}
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        meta={meta}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onViewClick={handleViewCustomer}
        onCreateLeadClick={handleCreateLead}
      />

      {/* Modals Mounting */}
      <CustomerDetailModal
        customerId={selectedCustomerId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onCreateLeadClick={handleCreateLead}
      />

      <CreateLeadModal
        open={createLeadOpen}
        onOpenChange={setCreateLeadOpen}
        initialCustomerId={leadCustomerId}
      />
    </div>
  )
}
