"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Phone, Mail, Calendar, CheckSquare, Square, Plus, Loader2 } from "lucide-react"
import dayjs from "dayjs"

interface Task {
  id: string
  taskType: "CALL" | "EMAIL" | "MEETING"
  status: "TODO" | "IN_PROGRESS" | "DONE" | "FAILED"
  dueDate: string | null
  note: string | null
}

interface SalesTaskListProps {
  leadId: string
  tasks: Task[]
}

const taskIcons = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
}

const taskTypeLabels = {
  CALL: "Gọi điện",
  EMAIL: "Gửi Email",
  MEETING: "Hẹn gặp",
}

const taskSchema = z.object({
  taskType: z.enum(["CALL", "EMAIL", "MEETING"]),
  dueDate: z.string().min(1, "Vui lòng chọn thời gian hạn chót"),
  note: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

export function SalesTaskList({ leadId, tasks }: SalesTaskListProps) {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskType: "CALL",
      dueDate: "",
      note: "",
    },
  })

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!dialogOpen) {
      reset()
    }
  }, [dialogOpen, reset])

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      setTogglingId(id)
      const nextStatus = currentStatus === "DONE" ? "TODO" : "DONE"
      await api.put(`/tasks/${id}`, { status: nextStatus })
      toast.success(nextStatus === "DONE" ? "Đã hoàn thành công việc!" : "Đã mở lại công việc.")
      // Invalidate queries to reload data
      await queryClient.invalidateQueries({ queryKey: ["leads", leadId] })
      await queryClient.invalidateQueries({ queryKey: ["tasks"] })
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Không thể cập nhật trạng thái công việc."
      toast.error(errMsg)
    } finally {
      setTogglingId(null)
    }
  }

  const onSubmit = async (values: TaskFormValues) => {
    try {
      setIsSubmitting(true)
      await api.post("/tasks", {
        leadId,
        taskType: values.taskType,
        dueDate: new Date(values.dueDate).toISOString(),
        note: values.note,
      })
      toast.success("Thêm công việc mới thành công!")
      await queryClient.invalidateQueries({ queryKey: ["leads", leadId] })
      await queryClient.invalidateQueries({ queryKey: ["tasks"] })
      setDialogOpen(false)
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Thêm công việc thất bại. Vui lòng thử lại!"
      toast.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const pendingTasks = tasks.filter((t) => t.status !== "DONE")
  const completedTasks = tasks.filter((t) => t.status === "DONE")

  return (
    <Card className="bg-card border-border shadow-sm flex flex-col min-h-[300px]">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50 space-y-0">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">Danh sách Công việc</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Các nhiệm vụ chăm sóc lead hiện tại
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer h-8 px-2.5 rounded-lg flex items-center gap-1 border-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm
        </Button>
      </CardHeader>
      <CardContent className="pt-4 flex-1 space-y-4">
        {/* Pending Tasks */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Cần thực hiện ({pendingTasks.length})
          </span>
          {pendingTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground italic pl-1">Không có công việc tồn đọng</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map((task) => {
                const Icon = taskIcons[task.taskType] || CheckSquare
                const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < Date.now()
                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-3 p-2.5 border border-border/60 rounded-lg hover:bg-muted/15 transition-all"
                  >
                    <div className="flex gap-2.5 items-start">
                      <button
                        onClick={() => handleToggleStatus(task.id, task.status)}
                        disabled={togglingId === task.id}
                        className="text-muted-foreground hover:text-foreground mt-0.5 cursor-pointer disabled:opacity-50"
                      >
                        {togglingId === task.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground leading-none">
                          <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{taskTypeLabels[task.taskType]}</span>
                        </div>
                        {task.note && <p className="text-[11px] text-muted-foreground leading-relaxed pl-5 font-medium">{task.note}</p>}
                        {task.dueDate && (
                          <span className={`text-[9px] font-bold block pl-5 ${isOverdue ? "text-red-500" : "text-amber-500"}`}>
                            Hạn chót: {dayjs(task.dueDate).format("DD/MM/YYYY HH:mm")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Đã hoàn thành ({completedTasks.length})
            </span>
            <div className="space-y-2">
              {completedTasks.map((task) => {
                const Icon = taskIcons[task.taskType] || CheckSquare
                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-3 p-2 border border-border/40 bg-muted/10 rounded-lg opacity-70"
                  >
                    <div className="flex gap-2.5 items-start">
                      <button
                        onClick={() => handleToggleStatus(task.id, task.status)}
                        disabled={togglingId === task.id}
                        className="text-green-500 hover:text-zinc-500 mt-0.5 cursor-pointer disabled:opacity-50"
                      >
                        {togglingId === task.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckSquare className="w-4 h-4" />
                        )}
                      </button>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 line-through leading-none">
                          <Icon className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                          <span>{taskTypeLabels[task.taskType]}</span>
                        </div>
                        {task.note && <p className="text-[11px] text-zinc-400 line-through pl-5 font-medium">{task.note}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground">Thêm công việc chăm sóc</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Tạo nhiệm vụ liên hệ hoặc làm việc với khách hàng này.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Task Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Loại công việc</label>
              <Controller
                name="taskType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(val) => field.onChange(val || "CALL")}>
                    <SelectTrigger className="bg-muted/20 border-border text-xs focus:ring-1 focus:ring-primary rounded-lg">
                      <SelectValue placeholder="Chọn loại công việc" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-xs">
                      <SelectItem value="CALL">Gọi điện (CALL)</SelectItem>
                      <SelectItem value="EMAIL">Gửi Email (EMAIL)</SelectItem>
                      <SelectItem value="MEETING">Hẹn gặp mặt (MEETING)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Thời gian hạn chót</label>
              <Input
                type="datetime-local"
                {...register("dueDate")}
                className="bg-muted/20 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary rounded-lg"
              />
              {errors.dueDate && (
                <p className="text-[11px] text-red-400 font-semibold pl-1">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Ghi chú chi tiết</label>
              <Textarea
                {...register("note")}
                placeholder="Ghi chú nội dung cần tư vấn hoặc chuẩn bị tài liệu..."
                className="bg-muted/20 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary rounded-lg min-h-[80px]"
              />
            </div>

            <DialogFooter className="pt-3 flex flex-row justify-end gap-2 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
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
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu công việc"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
