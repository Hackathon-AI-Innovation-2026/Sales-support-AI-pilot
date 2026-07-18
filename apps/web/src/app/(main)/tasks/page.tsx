"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, Phone, Mail, Calendar } from "lucide-react"

const mockTasks = [
  { id: 1, type: "CALL", title: "Call Nguyễn Văn B", desc: "Follow up about Visa Platinum card application", due: "Today, 14:00", icon: Phone },
  { id: 2, type: "EMAIL", title: "Send email to Trần Thị C", desc: "Offer Auto Loan options and promotion details", due: "Tomorrow, 09:00", icon: Mail },
  { id: 3, type: "MEETING", title: "Review Home Loan proposal with Manager", desc: "Align with risk assessment criteria", due: "July 20, 10:30", icon: Calendar },
]

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">Manage and track your active sales tasks and calendar appointments.</p>
      </div>

      <div className="space-y-3">
        {mockTasks.map((task) => {
          const Icon = task.icon
          return (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{task.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.desc}</p>
                  <span className="text-[10px] text-amber-500 font-medium block mt-1">
                    Due: {task.due}
                  </span>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all duration-200">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                Mark Done
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
