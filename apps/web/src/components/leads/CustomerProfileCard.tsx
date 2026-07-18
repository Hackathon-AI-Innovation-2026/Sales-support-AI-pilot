import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Briefcase, DollarSign, User } from "lucide-react"

interface CustomerProduct {
  id: string
  productType: string
  status: string
}

interface Customer {
  fullName: string
  email: string | null
  phone: string | null
  age: number | null
  occupation: string | null
  income: number | null
  city: string | null
  products?: CustomerProduct[]
}

interface CustomerProfileCardProps {
  customer: Customer
}

const productLabels: Record<string, string> = {
  CREDIT_CARD: "Thẻ tín dụng",
  LOAN: "Vay vốn",
  SAVING: "Tiết kiệm",
  INSURANCE: "Bảo hiểm",
  INVESTMENT: "Đầu tư",
}

const productColors: Record<string, string> = {
  CREDIT_CARD: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LOAN: "bg-red-500/10 text-red-500 border-red-500/20",
  SAVING: "bg-green-500/10 text-green-500 border-green-500/20",
  INSURANCE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  INVESTMENT: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase()
  }

  const formatIncome = (income: number | null) => {
    if (!income) return "Không có thông tin"
    return income.toLocaleString("vi-VN") + " ₫/tháng"
  }

  const ownedProducts = customer.products || []

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-border/50">
        <Avatar className="w-12 h-12 border border-border">
          <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-sm">
            {getInitials(customer.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold text-foreground">{customer.fullName}</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Khách hàng cá nhân
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Contact Info */}
        <div className="space-y-2 text-xs">
          {customer.phone && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-foreground font-medium">{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="w-3.5 h-3.5 flex-shrink-0 truncate" />
              <span className="text-foreground font-medium truncate">{customer.email}</span>
            </div>
          )}
        </div>

        {/* Demographic details */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50 text-[11px]">
          <div className="space-y-1 text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold">
              <User className="w-3 h-3" /> Tuổi
            </span>
            <span className="text-foreground font-medium block">
              {customer.age ? `${customer.age} tuổi` : "Chưa cập nhật"}
            </span>
          </div>

          <div className="space-y-1 text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold">
              <MapPin className="w-3 h-3" /> Thành phố
            </span>
            <span className="text-foreground font-medium block">
              {customer.city || "Chưa cập nhật"}
            </span>
          </div>

          <div className="space-y-1 text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold">
              <Briefcase className="w-3 h-3" /> Nghề nghiệp
            </span>
            <span className="text-foreground font-medium block truncate max-w-[120px]">
              {customer.occupation || "Chưa cập nhật"}
            </span>
          </div>

          <div className="space-y-1 text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold">
              <DollarSign className="w-3 h-3" /> Thu nhập
            </span>
            <span className="text-foreground font-medium block">
              {customer.income ? formatIncome(customer.income) : "Chưa cập nhật"}
            </span>
          </div>
        </div>

        {/* Owned Products */}
        <div className="pt-3 border-t border-border/50 space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground block uppercase tracking-wider">
            Sản phẩm đang sở hữu
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ownedProducts.length === 0 ? (
              <span className="text-[11px] text-muted-foreground italic">
                Chưa sở hữu sản phẩm nào tại SHB
              </span>
            ) : (
              ownedProducts.map((p) => (
                <Badge
                  key={p.id}
                  variant="outline"
                  className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                    productColors[p.productType] || ""
                  }`}
                >
                  {productLabels[p.productType] || p.productType}
                </Badge>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
