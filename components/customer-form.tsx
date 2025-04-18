"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search } from "lucide-react"

export default function CustomerForm() {
  const [customerType, setCustomerType] = useState("individual")

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Thông tin khách hàng</h2>

      <div className="space-y-2">
        <Label>Loại khách hàng</Label>
        <RadioGroup
          defaultValue="individual"
          value={customerType}
          onValueChange={setCustomerType}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual">Cá nhân</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="organization" id="organization" />
            <Label htmlFor="organization">Đơn vị</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerId">Mã khách hàng</Label>
        <div className="flex gap-2">
          <Input id="customerId" placeholder="Nhập hoặc tra cứu mã khách hàng" />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Mã sẽ được tự động tạo nếu là khách hàng mới</p>
      </div>

      {customerType === "individual" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ tên</Label>
            <Input id="fullName" placeholder="Nhập họ tên khách hàng" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idCard">CCCD</Label>
            <Input id="idCard" placeholder="Nhập số CCCD" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Nhập email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input id="phone" placeholder="Nhập số điện thoại" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Tên đơn vị</Label>
            <Input id="orgName" placeholder="Nhập tên đơn vị" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgId">Mã đơn vị</Label>
            <Input id="orgId" placeholder="Nhập mã đơn vị" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgPhone">Số điện thoại</Label>
            <Input id="orgPhone" placeholder="Nhập số điện thoại" />
          </div>
        </div>
      )}
    </div>
  )
}
