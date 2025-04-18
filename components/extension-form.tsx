"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function ExtensionForm() {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherReason, setOtherReason] = useState("")

  // Mock data for exam schedules
  const examSchedules = [
    {
      id: "BT010",
      time: "09:00 - 11:00, 25/05/2025",
      location: "Phòng 101, Tòa nhà A",
    },
    {
      id: "BT011",
      time: "14:00 - 16:00, 25/05/2025",
      location: "Phòng 102, Tòa nhà A",
    },
    {
      id: "BT012",
      time: "09:00 - 11:00, 26/05/2025",
      location: "Phòng 201, Tòa nhà B",
    },
  ]

  // Mock data for staff
  const staffMembers = [
    { id: "NV001", name: "Trần Văn B" },
    { id: "NV002", name: "Lê Thị C" },
    { id: "NV003", name: "Phạm Văn D" },
  ]

  const reasons = [
    { id: "illness", label: "Bệnh tật" },
    { id: "accident", label: "Tai nạn" },
    { id: "funeral", label: "Tang sự" },
    { id: "other", label: "Khác" },
  ]

  const handleReasonChange = (reasonId: string) => {
    if (selectedReason === reasonId) {
      setSelectedReason(null)
    } else {
      setSelectedReason(reasonId)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Lập phiếu gia hạn</h2>

      <div className="space-y-2">
        <Label>Lý do gia hạn</Label>
        <div className="grid gap-2 md:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.id} className="flex items-center space-x-2">
              <Checkbox
                id={reason.id}
                checked={selectedReason === reason.id}
                onCheckedChange={() => handleReasonChange(reason.id)}
              />
              <Label htmlFor={reason.id} className="cursor-pointer">
                {reason.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedReason === "other" && (
        <div className="space-y-2">
          <Label htmlFor="otherReason">Lý do khác</Label>
          <Textarea
            id="otherReason"
            placeholder="Nhập lý do gia hạn khác"
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newExamTime">Thời gian thi mới</Label>
        <Select>
          <SelectTrigger id="newExamTime">
            <SelectValue placeholder="Chọn thời gian thi mới" />
          </SelectTrigger>
          <SelectContent>
            {examSchedules.map((schedule) => (
              <SelectItem key={schedule.id} value={schedule.id}>
                {schedule.time} - {schedule.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="staff">Nhân viên lập phiếu</Label>
        <Select>
          <SelectTrigger id="staff">
            <SelectValue placeholder="Chọn nhân viên lập phiếu" />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name} ({staff.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea id="notes" placeholder="Nhập ghi chú (nếu có)" />
      </div>
    </div>
  )
}
