"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
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
import { Loader2 } from "lucide-react"

const createLeadSchema = z.object({
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  interestedProduct: z.string().min(1, "Vui lòng chọn sản phẩm quan tâm"),
  status: z.string(),
})

type CreateLeadFormValues = z.infer<typeof createLeadSchema>

interface CreateLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const products = [
  "Visa Platinum",
  "Classic Card",
  "Auto Loan",
  "Home Loan",
  "Savings",
  "Investment",
  "Insurance",
]

export function CreateLeadModal({ open, onOpenChange }: CreateLeadModalProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Fetch customers list for selection (limit to 100 for drop-down)
  const { data: customersData, isLoading: isCustomersLoading } = useQuery({
    queryKey: ["customers-dropdown"],
    queryFn: () => api.get("/customers?limit=100").then((res) => res.data.data),
    enabled: open, // Only query when modal is open
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      customerId: "",
      interestedProduct: "",
      status: "NEW",
    },
  })

  // Reset form when closed or opened
  React.useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (values: CreateLeadFormValues) => {
    try {
      setIsSubmitting(true)
      await api.post("/leads", values)
      toast.success("Tạo cơ hội bán hàng (Lead) mới thành công!")
      
      // Invalidate leads query cache to reload list
      await queryClient.invalidateQueries({ queryKey: ["leads"] })
      onOpenChange(false)
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Tạo lead thất bại. Vui lòng thử lại!"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">Tạo Cơ hội Bán hàng (Lead)</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Chọn khách hàng và sản phẩm quan tâm để khởi tạo một cơ hội bán hàng mới.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Khách hàng</label>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isCustomersLoading}
                >
                  <SelectTrigger className="bg-muted/20 border-border text-xs focus:ring-1 focus:ring-primary rounded-lg">
                    <SelectValue placeholder={isCustomersLoading ? "Đang tải danh sách..." : "Chọn khách hàng"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-xs max-h-[220px]">
                    {customersData?.map((cust: any) => (
                      <SelectItem key={cust.id} value={cust.id}>
                        {cust.fullName} ({cust.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customerId && (
              <p className="text-[11px] text-red-400 font-semibold pl-1">
                {errors.customerId.message}
              </p>
            )}
          </div>

          {/* Product Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Sản phẩm quan tâm</label>
            <Controller
              name="interestedProduct"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-muted/20 border-border text-xs focus:ring-1 focus:ring-primary rounded-lg">
                    <SelectValue placeholder="Chọn sản phẩm tài chính" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-xs">
                    {products.map((prod) => (
                      <SelectItem key={prod} value={prod}>
                        {prod}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.interestedProduct && (
              <p className="text-[11px] text-red-400 font-semibold pl-1">
                {errors.interestedProduct.message}
              </p>
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Trạng thái khởi tạo</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-muted/20 border-border text-xs focus:ring-1 focus:ring-primary rounded-lg">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-xs">
                    <SelectItem value="NEW">Mới tạo (NEW)</SelectItem>
                    <SelectItem value="CONTACTED">Đã liên hệ (CONTACTED)</SelectItem>
                    <SelectItem value="QUALIFIED">Đạt tiêu chuẩn (QUALIFIED)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="pt-4 flex flex-row justify-end gap-2 border-t border-border/50">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold cursor-pointer h-9 px-4 rounded-lg"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer h-9 px-4 rounded-lg flex items-center gap-1.5 border-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thông tin"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
