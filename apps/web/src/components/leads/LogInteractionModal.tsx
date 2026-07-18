"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/axios"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

const logInteractionSchema = z.object({
  interactionType: z.string().min(1, "Vui lòng chọn loại tương tác"),
  note: z.string().min(5, "Nội dung ghi chú phải có ít nhất 5 ký tự"),
  outcome: z.string().optional(),
})

type LogInteractionFormValues = z.infer<typeof logInteractionSchema>

interface LogInteractionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  leadId?: string
}

export function LogInteractionModal({ open, onOpenChange, customerId, leadId }: LogInteractionModalProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LogInteractionFormValues>({
    resolver: zodResolver(logInteractionSchema),
    defaultValues: {
      interactionType: "CALL",
      note: "",
      outcome: "INTERESTED",
    },
  })

  // Reset form when closed
  React.useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (values: LogInteractionFormValues) => {
    try {
      setIsSubmitting(true)
      const payload = {
        ...values,
        leadId,
      }
      await api.post(`/customers/${customerId}/interactions/log`, payload)
      toast.success("Đã ghi nhận tương tác & tự động cập nhật đề xuất (NBA) mới!")
      
      // Invalidate queries to reload detail page info
      if (leadId) {
        await queryClient.invalidateQueries({ queryKey: ["leads", leadId] })
      }
      await queryClient.invalidateQueries({ queryKey: ["customers", customerId] })
      
      onOpenChange(false)
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Ghi nhận tương tác thất bại. Vui lòng thử lại!"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">Ghi chú tương tác khách hàng</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lưu lại nội dung cuộc thảo luận với khách hàng để cập nhật trạng thái và tự động tính toán lại Next Best Action.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Interaction Type Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Hình thức tương tác</label>
            <Controller
              name="interactionType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-muted/20 border-border text-xs focus:ring-1 focus:ring-primary rounded-lg">
                    <SelectValue placeholder="Chọn hình thức tương tác" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-xs">
                    <SelectItem value="CALL">Cuộc gọi (CALL)</SelectItem>
                    <SelectItem value="EMAIL">Gửi Email (EMAIL)</SelectItem>
                    <SelectItem value="MEETING">Gặp mặt (MEETING)</SelectItem>
                    <SelectItem value="BRANCH_VISIT">Đến chi nhánh (BRANCH_VISIT)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.interactionType && (
              <p className="text-[11px] text-red-400 font-semibold pl-1">
                {errors.interactionType.message}
              </p>
            )}
          </div>

          {/* Outcome Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Kết quả / Phản hồi</label>
            <Controller
              name="outcome"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-muted/20 border-border text-xs focus:ring-1 focus:ring-primary rounded-lg">
                    <SelectValue placeholder="Chọn kết quả tương tác" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-xs">
                    <SelectItem value="INTERESTED">Quan tâm (INTERESTED)</SelectItem>
                    <SelectItem value="FOLLOW_UP">Cần liên hệ lại (FOLLOW_UP)</SelectItem>
                    <SelectItem value="NOT_INTERESTED">Không quan tâm (NOT_INTERESTED)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Chi tiết cuộc hội thoại</label>
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Nhập nội dung tương tác (ví dụ: Khách hàng đồng ý mở thẻ và muốn tìm hiểu thêm về biểu phí thường niên...)"
                  className="bg-muted/20 border-border text-xs focus:ring-1 focus:ring-primary rounded-lg min-h-[100px]"
                />
              )}
            />
            {errors.note && (
              <p className="text-[11px] text-red-400 font-semibold pl-1">
                {errors.note.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs border-border hover:bg-muted/50 rounded-lg cursor-pointer h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer h-9 px-4 border-0 flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Lưu & Cập nhật NBA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
