"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

const mockLeads = [
  { id: 1, name: "Nguyễn Văn B", score: 87, product: "Visa Platinum", status: "QUALIFIED", lastAction: "2h ago", assigned: "Sales Agent A" },
  { id: 2, name: "Trần Thị C", score: 72, product: "Auto Loan", status: "CONTACTED", lastAction: "1d ago", assigned: "Sales Agent A" },
  { id: 3, name: "Lê Văn D", score: 45, product: "Home Loan", status: "NEW", lastAction: "3d ago", assigned: "Sales Agent B" },
]

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Manage and track your active sales leads with AI lead scoring.</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">AI Score</th>
                <th className="p-4">Product</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Action</th>
                <th className="p-4">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{lead.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className={lead.score >= 80 ? "text-red-500 font-bold" : lead.score >= 60 ? "text-amber-500 font-bold" : "text-green-500 font-bold"}>
                        {lead.score}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{lead.product}</td>
                  <td className="p-4">
                    <Badge variant={lead.status === "QUALIFIED" ? "default" : "secondary"}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{lead.lastAction}</td>
                  <td className="p-4 text-muted-foreground">{lead.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
