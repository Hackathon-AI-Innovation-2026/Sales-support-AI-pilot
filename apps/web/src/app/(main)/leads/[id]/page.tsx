"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/axios"
import { Button } from "@/components/ui/button"
import { CustomerProfileCard } from "@/components/leads/CustomerProfileCard"
import { LeadScoreCard } from "@/components/leads/LeadScoreCard"
import { RecommendedProductCard } from "@/components/leads/RecommendedProductCard"
import { NextBestActionCard } from "@/components/leads/NextBestActionCard"
import { InteractionTimeline } from "@/components/leads/InteractionTimeline"
import { SalesTaskList } from "@/components/leads/SalesTaskList"
import AICopilotPanel from "@/components/copilot/AICopilotPanel"
import { CardSkeleton, TableSkeleton } from "@/components/common/Skeleton"
import { ArrowLeft, UserCheck } from "lucide-react"
import Link from "next/link"

export default function LeadDetailPage() {
  const params = useParams()
  const id = params?.id as string

  // State to manage the active tab in the AI Copilot Panel
  const [activeTab, setActiveTab] = React.useState("email")

  // Query 1: Fetch lead details (includes latest score, recommendations, actions, and tasks)
  const { data: lead, isLoading: isLeadLoading } = useQuery({
    queryKey: ["leads", id],
    queryFn: () => api.get(`/leads/${id}`).then((res) => res.data),
    enabled: !!id,
  })

  const customerId = lead?.customerId

  // Query 2: Fetch full customer details (includes owned products and timeline interactions)
  const { data: customer, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["customers", customerId],
    queryFn: () => api.get(`/customers/${customerId}`).then((res) => res.data),
    enabled: !!customerId,
  })

  const isLoading = isLeadLoading || (!!customerId && isCustomerLoading)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" disabled className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="space-y-1">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="h-3 w-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <CardSkeleton count={2} />
          </div>
          <div>
            <TableSkeleton rows={4} cols={3} />
          </div>
          <div className="space-y-6">
            <CardSkeleton count={2} />
          </div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Không tìm thấy Cơ hội bán hàng (Lead)</h2>
        <p className="text-sm text-muted-foreground">Lead này có thể đã bị xóa hoặc không tồn tại.</p>
        <Link href="/leads">
          <Button className="bg-primary text-white text-xs font-semibold cursor-pointer h-9 px-4 rounded-lg border-0">
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    )
  }

  // Get the latest score from the lead relation array
  const latestScore = lead.scores && lead.scores.length > 0 ? lead.scores[0] : null

  // Get the latest product recommendation
  const latestRecommendation =
    lead.recommendations && lead.recommendations.length > 0 ? lead.recommendations[0] : null

  // Get the latest recommended action (Next Best Action)
  const latestAction = lead.actions && lead.actions.length > 0 ? lead.actions[0] : null

  const tasks = lead.tasks || []
  const interactions = customer?.interactions || []

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/55 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/leads">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg cursor-pointer border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <UserCheck className="w-5.5 h-5.5 text-primary" />
              Chi tiết Cơ hội Bán hàng
            </h1>
            <p className="text-muted-foreground text-xs font-medium">
              Lead ID: <span className="font-mono text-[10px] bg-muted/65 px-1 py-0.5 rounded">{lead.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout (3 columns on desktop, single stack on mobile) */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Left Column: Customer Profile + AI Scoring + Recommendation */}
        <div className="space-y-6 flex flex-col">
          <CustomerProfileCard customer={customer || lead.customer} />
          
          <LeadScoreCard leadId={lead.id} latestScore={latestScore} />
          
          <RecommendedProductCard
            recommendation={latestRecommendation}
            onGenerateEmailClick={() => setActiveTab("email")}
          />
          
          <NextBestActionCard action={latestAction} />
        </div>

        {/* Middle Column: Grouped Interaction Timeline */}
        <div className="flex flex-col h-full">
          <InteractionTimeline interactions={interactions} />
        </div>

        {/* Right Column: AI Copilot Panel + Action tasks list */}
        <div className="space-y-6 flex flex-col">
          <AICopilotPanel
            leadId={lead.id}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            interestedProduct={lead.interestedProduct}
          />
          
          <SalesTaskList leadId={lead.id} tasks={tasks} />
        </div>
      </div>
    </div>
  )
}
