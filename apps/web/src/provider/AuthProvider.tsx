"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api, setAccessToken } from "@/lib/api/axios"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  accessToken: string
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [accessToken, setAccessTokenState] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const router = useRouter()

  const login = async (email: string, pass: string) => {
    try {
      setIsLoading(true)
      const response = await api.post("/auth/login", { email, password: pass })
      const { accessToken: token, user: userData } = response.data
      setAccessToken(token)
      setAccessTokenState(token)
      setUser(userData)
      toast.success("Đăng nhập thành công!")

      // Redirect based on user role
      if (userData.role === "MANAGER" || userData.role === "ADMIN") {
        router.push("/dashboard")
      } else {
        router.push("/leads")
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!"
      toast.error(errMsg)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (err) {
      console.error("Logout request failed:", err)
    } finally {
      setAccessToken("")
      setAccessTokenState("")
      setUser(null)
      toast.info("Đã đăng xuất!")
      router.push("/login")
    }
  }

  // Silent refresh on mount to restore session if cookie is present
  React.useEffect(() => {
    const checkAuthSession = async () => {
      try {
        const response = await api.post("/auth/refresh")
        const { accessToken: token, user: userData } = response.data
        setAccessToken(token)
        setAccessTokenState(token)
        setUser(userData)
      } catch (error) {
        // Silent catch: user session doesn't exist or is expired
        setAccessToken("")
        setAccessTokenState("")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuthSession()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
