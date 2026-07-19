"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/axios"
import { useAuth } from "@/provider/AuthProvider"
import { LeadFilters } from "@/components/leads/LeadFilters"
import { LeadTable } from "@/components/leads/LeadTable"
import { CreateLeadModal } from "@/components/leads/CreateLeadModal"
import { TableSkeleton } from "@/components/common/Skeleton"
import { Users } from "lucide-react"

export default function LeadsPage() {
  const { user } = useAuth()

  // State management for filters and pagination
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("ALL")
  const [minScore, setMinScore] = React.useState("")
  const [maxScore, setMaxScore] = React.useState("")
  const [onlyMine, setOnlyMine] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [createModalOpen, setCreateModalOpen] = React.useState(false)

  // Construct request parameters for the backend API
  // Always sort by score descending (highest to lowest)
  const params: Record<string, any> = {
    page,
    limit,
    sortBy: "score",
    sortOrder: "desc",
  }
  if (status !== "ALL") params.status = status
  if (minScore) params.minScore = Number(minScore)
  if (maxScore) params.maxScore = Number(maxScore)
  if (onlyMine && user) params.assignedTo = user.id

  // Fetch leads with react-query
  const { data, isLoading } = useQuery({
    queryKey: ["leads", page, limit, status, minScore, maxScore, onlyMine],
    queryFn: () => api.get("/leads", { params }).then((res) => res.data),
    keepPreviousData: true, // keeps previous data in view while loading new pages
  } as any)

  const handleClearFilters = () => {
    setSearch("")
    setStatus("ALL")
    setMinScore("")
    setMaxScore("")
    setOnlyMine(false)
    setPage(1)
  }

  const leads = (data as any)?.data || []
  const totalCount = (data as any)?.meta?.total || 0

  // Client-side search filtering by customer name
  const filteredLeads = leads.filter((lead: any) => {
    if (!search) return true
    return lead.customer.fullName.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Quản lý Cơ hội Bán hàng (Leads)
        </h1>
        <p className="text-muted-foreground text-sm">
          Tiếp cận, đánh giá điểm AI và theo dõi trạng thái các lead tài chính
        </p>
      </div>

      {/* Filter Row */}
      <LeadFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        minScore={minScore}
        setMinScore={setMinScore}
        maxScore={maxScore}
        setMaxScore={setMaxScore}
        onlyMine={onlyMine}
        setOnlyMine={setOnlyMine}
        onCreateClick={() => setCreateModalOpen(true)}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      {isLoading ? (
        <TableSkeleton rows={limit} cols={6} />
      ) : (
        <LeadTable
          leads={filteredLeads}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalCount={totalCount}
        />
      )}

      {/* Create Modal */}
      <CreateLeadModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  )
}
