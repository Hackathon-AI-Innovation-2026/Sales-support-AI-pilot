"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/provider/AuthProvider"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Mail, Sparkles, Loader2, AlertCircle } from "lucide-react"

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải chứa ít nhất 6 ký tự"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setError(null)
      setIsSubmitting(true)
      await login(values.email, values.password)
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0d1527] overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-4 relative z-10">
        <Card className="border border-white/10 bg-white/5 backdrop-blur-lg shadow-2xl text-white">
          <CardHeader className="text-center space-y-2 pb-6 border-b border-white/5">
            {/* Branding Logo */}
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 shadow-lg mb-2">
              <span className="text-white font-extrabold text-2xl">S</span>
            </div>
            
            <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              SHB Copilot
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs uppercase tracking-widest font-semibold">
              Hệ thống Hỗ trợ Bán hàng AI
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-500/15 border border-red-500/35 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Email Nhân viên</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="example@shb.com.vn"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg text-sm transition-all duration-200"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-400 font-medium pl-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </span>
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg text-sm transition-all duration-200"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-400 font-medium pl-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all duration-200 mt-2 cursor-pointer flex items-center justify-center gap-2 border-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
