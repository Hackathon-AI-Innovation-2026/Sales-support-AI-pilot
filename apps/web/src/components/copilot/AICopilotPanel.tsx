"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Mail, MessageSquare, Mic } from "lucide-react"

import EmailGenerator from "./EmailGenerator"
import PitchGenerator from "./PitchGenerator"
import ChatInterface from "./ChatInterface"

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
    <Card className="bg-card border-border shadow-md flex flex-col h-full min-h-[500px] lg:min-h-[600px] relative overflow-hidden">
      {/* Visual glowing aura behind panel */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-tr from-amber-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-border/50 flex-shrink-0">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          AI Copilot Panel
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Trợ lý AI hỗ trợ tự động soạn email, kịch bản và tư vấn bán hàng
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col overflow-y-auto min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 bg-muted/30 border border-border/55 p-1 rounded-lg text-xs font-semibold select-none mb-4 flex-shrink-0">
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

          {/* Email Tab */}
          <TabsContent value="email" className="flex-1 flex flex-col mt-0">
            <EmailGenerator leadId={leadId} defaultProduct={interestedProduct} />
          </TabsContent>

          {/* Pitch Tab */}
          <TabsContent value="pitch" className="flex-1 flex flex-col mt-0">
            <PitchGenerator leadId={leadId} defaultProduct={interestedProduct} />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 min-h-[400px] lg:min-h-[500px]">
            <ChatInterface leadId={leadId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
