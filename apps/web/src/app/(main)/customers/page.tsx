"use client"

import { Card } from "@/components/ui/card"

const mockCustomers = [
  { id: 1, name: "Phạm Văn E", email: "phamvane@example.com", phone: "0901234567", city: "Hanoi", income: "25M VND" },
  { id: 2, name: "Hoàng Thị F", email: "hoangthif@example.com", phone: "0912345678", city: "HCM City", income: "40M VND" },
]

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Access full bank profiles and products owned by each customer.</p>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">City</th>
                <th className="p-4">Monthly Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{cust.name}</td>
                  <td className="p-4 text-muted-foreground">{cust.email}</td>
                  <td className="p-4 text-muted-foreground">{cust.phone}</td>
                  <td className="p-4">{cust.city}</td>
                  <td className="p-4">{cust.income}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
