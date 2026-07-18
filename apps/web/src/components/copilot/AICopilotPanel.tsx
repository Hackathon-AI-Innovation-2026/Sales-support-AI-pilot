"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Mail, MessageSquare, Mic } from "lucide-react"

interface AICopilotPanelProps {
  leadId: string
  activeTab: string
  setActiveTab: (tab: string) => void
  interestedProduct: string | null
}

export default function AICopilotPanel({
  leadId,
  activeTab,
  setActiveTab,
  interestedProduct,
}: AICopilotPanelProps) {
  return (
    <Card className="bg-card border-border shadow-md flex flex-col flex-1 relative overflow-hidden">
      {/* Visual glowing aura behind panel */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-amber-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          AI Copilot Panel
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Trợ lý AI hỗ trợ tự động soạn email, kịch bản và tư vấn bán hàng
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 bg-muted/30 border border-border/55 p-1 rounded-lg text-xs font-semibold select-none mb-4">
            <TabsTrigger value="email" className="flex items-center gap-1 cursor-pointer py-1.5 rounded-md">
              <Mail className="w-3.5 h-3.5" />
              Soạn Email
            </TabsTrigger>
            <TabsTrigger value="pitch" className="flex items-center gap-1 cursor-pointer py-1.5 rounded-md">
              <Mic className="w-3.5 h-3.5" />
              Kịch bản
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1 cursor-pointer py-1.5 rounded-md">
              <MessageSquare className="w-3.5 h-3.5" />
              AI Chat
            </TabsTrigger>
          </TabsList>

          {/* Email Tab Placeholder (rich logic in TASK-FE-06) */}
          <TabsContent value="email" className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 bg-muted/10 border border-dashed border-border rounded-xl mt-0">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Mail className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground">Trình tạo Email AI</h3>
              <p className="text-[10px] text-muted-foreground max-w-[220px] leading-normal font-medium">
                Sẵn sàng soạn thảo thư chào hàng sản phẩm{" "}
                <span className="text-primary font-bold">{interestedProduct || "Thẻ Visa Platinum"}</span> cho khách hàng.
              </p>
            </div>
            <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Chờ thiết lập trong TASK-FE-06
            </span>
          </TabsContent>

          {/* Pitch Tab Placeholder */}
          <TabsContent value="pitch" className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 bg-muted/10 border border-dashed border-border rounded-xl mt-0">
            <div className="p-3 rounded-full bg-warning/15 text-warning">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground">Kịch bản Bán hàng (Sales Pitch)</h3>
              <p className="text-[10px] text-muted-foreground max-w-[220px] leading-normal font-medium">
                Sẵn sàng tạo kịch bản gọi điện tư vấn thuyết phục dành riêng cho lead này.
              </p>
            </div>
            <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Chờ thiết lập trong TASK-FE-06
            </span>
          </TabsContent>

          {/* Chat Tab Placeholder */}
          <TabsContent value="chat" className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 bg-muted/10 border border-dashed border-border rounded-xl mt-0">
            <div className="p-3 rounded-full bg-success/10 text-success">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-foreground">Hỏi đáp AI Copilot</h3>
              <p className="text-[10px] text-muted-foreground max-w-[220px] leading-normal font-medium">
                Trò chuyện trực tiếp để đặt câu hỏi về danh mục sản phẩm và chính sách vay SHB.
              </p>
            </div>
            <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Chờ thiết lập trong TASK-FE-06
            </span>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
