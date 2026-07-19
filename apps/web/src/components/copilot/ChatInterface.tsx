"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles, User, Search, ChevronDown, ChevronUp } from "lucide-react"
import { api, getAccessToken } from "@/lib/api/axios"
import { toast } from "sonner"
import dayjs from "dayjs"

interface ChatInterfaceProps {
  leadId: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatInterface({ leadId }: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Chào bạn! Tôi là AI Copilot của SHB. Tôi có thể hỗ trợ gì cho bạn trong việc tư vấn sản phẩm tài chính và chăm sóc cơ hội bán hàng này?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = React.useState("")
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [showSources, setShowSources] = React.useState(false)
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isStreaming) return

    const userMessageText = inputValue.trim()
    setInputValue("")

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: userMessageText,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)

    // Add temporary empty assistant message that will be populated by stream
    const assistantMessageId = Math.random().toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date()
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const token = getAccessToken()
      const response = await fetch(`${api.defaults.baseURL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMessageText,
          leadId,
          // Map to ChatMessageDto structure (keep last 10 turns)
          conversationHistory: messages
            .filter((m) => m.id !== "init")
            .slice(-10)
            .map((m) => ({
              role: m.role,
              content: m.content
            }))
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Không thể tạo kết nối dòng dữ liệu (stream reader)")
      }

      const decoder = new TextDecoder()
      let accumulatedText = ""
      let done = false
      let buffer = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        
        if (value) {
          buffer += decoder.decode(value, { stream: !done })
          const parts = buffer.split("\n\n")
          buffer = parts.pop() || "" // Keep incomplete part in buffer
          
          for (const part of parts) {
            const trimmed = part.trim()
            if (!trimmed) continue
            
            // SSE format lines
            const lines = trimmed.split("\n")
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6).trim()
                if (dataStr === "[DONE]") {
                  done = true
                  break
                }
                
                try {
                  const parsed = JSON.parse(dataStr)
                  if (parsed.token) {
                    accumulatedText += parsed.token
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: accumulatedText }
                          : msg
                      )
                    )
                  } else if (parsed.error) {
                    toast.error(parsed.error)
                  }
                } catch (e) {
                  // Ignore JSON parse errors on partial streams
                }
              }
            }
          }
        }
      }
    } catch (error: any) {
      toast.error("Lỗi khi kết nối với AI: " + error.message)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "Xin lỗi, hiện tại tôi không thể kết nối tới dịch vụ AI Copilot của SHB. Vui lòng thử lại sau." }
            : msg
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-[450px] lg:h-[550px] xl:h-[600px] border border-border/55 bg-muted/5 rounded-xl overflow-hidden shadow-inner">
      {/* Scrollable messages container */}
      <ScrollArea className="flex-1 p-4 space-y-4">
        <div className="flex flex-col gap-4">
          {messages.map((message) => {
            const isUser = message.role === "user"
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? "self-end flex-row-reverse" : "self-start flex-row"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`size-8 rounded-full flex items-center justify-center shrink-0 border select-none ${
                    isUser
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  }`}
                >
                  {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5">
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-background border border-border/60 text-foreground rounded-tl-none"
                    }`}
                  >
                    {message.content === "" && isStreaming ? (
                      /* Typing Bouncing Indicator */
                      <div className="flex items-center gap-1.5 py-1">
                        <div className="size-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                        <div className="size-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                        <div className="size-2 rounded-full bg-amber-500 animate-bounce" />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  <span className={`text-[10px] text-muted-foreground/75 font-mono px-1 block ${isUser ? "text-right" : "text-left"}`}>
                    {message.role === "user" ? "Sales" : "SHB AI"} · {dayjs(message.timestamp).format("HH:mm")}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* RAG Sources Section (mock/indicator matching collection schema) */}
      <div className="px-3 pb-1.5 border-t border-border/10">
        <button
          onClick={() => setShowSources(!showSources)}
          className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 py-1.5 select-none"
        >
          <Search className="size-3 text-primary" />
          <span>Tìm kiếm RAG Knowledge Base</span>
          {showSources ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>

        {showSources && (
          <div className="flex gap-1.5 pb-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <span className="bg-primary/5 text-primary border border-primary/10 text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
              product_catalog
            </span>
            <span className="bg-primary/5 text-primary border border-primary/10 text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
              faq_shb
            </span>
            <span className="bg-primary/5 text-primary border border-primary/10 text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
              sales_policy
            </span>
          </div>
        )}
      </div>

      {/* Chat Input form */}
      <form onSubmit={handleSend} className="p-3 border-t border-border/55 bg-background flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isStreaming ? "AI đang trả lời..." : "Hỏi AI về chính sách vay, thẻ SHB..."}
          disabled={isStreaming}
          className="flex-1 bg-muted/20 border-border text-xs rounded-lg h-9"
        />
        <Button
          type="submit"
          disabled={!inputValue.trim() || isStreaming}
          className="bg-primary hover:bg-primary-dark text-white rounded-lg size-9 cursor-pointer border-0 flex items-center justify-center p-0"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}
