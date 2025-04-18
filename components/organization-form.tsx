"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function OrganizationForm() {
  const [formData, setFormData] = useState({
    orgId: "",
    orgName: "",
    taxCode: "",
    address: "",
    phone: "",
    email: "",
    contactPerson: "",
    contactPosition: "",
    orgType: "company",
  })

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orgId">Mã đơn vị</Label>
        <div className="flex gap-2">
          <Input
            id="orgId"
            placeholder="Nhập hoặc tra cứu mã đơn vị"
            value={formData.orgId}
            onChange={(e) => handleChange("orgId", e.target.value)}
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Mã sẽ được tự động tạo nếu là đơn vị mới</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="orgType">Loại đơn vị</Label>
        <Select value={formData.orgType} onValueChange={(value) => handleChange("orgType", value)}>
          <SelectTrigger id="orgType">
            <SelectValue placeholder="Chọn loại đơn vị" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">Công ty/Doanh nghiệp</SelectItem>
            <SelectItem value="school">Trường học/Viện nghiên cứu</SelectItem>
            <SelectItem value="government">Cơ quan nhà nước</SelectItem>
            <SelectItem value="ngo">Tổ chức phi chính phủ</SelectItem>
            <SelectItem value="other">Khác</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="orgName">Tên đơn vị</Label>
        <Input
          id="orgName"
          placeholder="Nhập tên đơn vị"
          value={formData.orgName}
          onChange={(e) => handleChange("orgName", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxCode">Mã số thuế</Label>
        <Input
          id="taxCode"
          placeholder="Nhập mã số thuế"
          value={formData.taxCode}
          onChange={(e) => handleChange("taxCode", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Textarea
          id="address"
          placeholder="Nhập địa chỉ đơn vị"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Nhập email liên hệ"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPerson">Người liên hệ</Label>
        <Input
          id="contactPerson"
          placeholder="Nhập tên người liên hệ"
          value={formData.contactPerson}
          onChange={(e) => handleChange("contactPerson", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPosition">Chức vụ</Label>
        <Input
          id="contactPosition"
          placeholder="Nhập chức vụ người liên hệ"
          value={formData.contactPosition}
          onChange={(e) => handleChange("contactPosition", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">Hủy</Button>
        <Button>Đăng ký</Button>
      </div>
    </div>
  )
}
