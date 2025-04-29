"use client"

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExamSchedule } from "@/types/ExamTypes";
import { StaffMember } from "@/types/MemberTypes";
import { fetchExamSchedules } from "@/services/buoiThiService";
import { fetchStaffMembers } from "@/services/nhanVienService";

export default function ExtensionForm({
  onFormChange,
}: {
  onFormChange: (data: {
    selectedreason: string | null;
    otherreason: string;
    newexamid: string | null;
    staffid: string | null;
    notes: string;
    specialcase: boolean;
  }) => void;
}) {
  const [selectedreason, setSelectedReason] = useState<string | null>(null);
  const [otherreason, setOtherReason] = useState("");
  const [newexamid, setNewExamId] = useState<string | null>(null);
  const [staffid, setStaffId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [specialcase, setSpecialCase] = useState(false);
  const [examschedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [staffmembers, setStaffMembers] = useState<StaffMember[]>([]);

  const reasons = [
    { id: "illness", label: "Bệnh tật" },
    { id: "accident", label: "Tai nạn" },
    { id: "funeral", label: "Tang sự" },
    { id: "other", label: "Khác" },
  ];

  useEffect(() => {
    // lấy danh sách buổi thi
    fetchExamSchedules().then(setExamSchedules);
    // lấy danh sách nhân viên
    fetchStaffMembers().then(setStaffMembers);
  }, []);

  useEffect(() => {
    // gửi dữ liệu form lên component cha
    onFormChange({
      selectedreason,
      otherreason,
      newexamid,
      staffid,
      notes,
      specialcase,
    });
  }, [selectedreason, otherreason, newexamid, staffid, notes, specialcase, onFormChange]);

  const handleReasonChange = (reasonid: string) => {
    if (selectedreason === reasonid) {
      setSelectedReason(null);
    } else {
      setSelectedReason(reasonid);
    }
  };

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
                checked={selectedreason === reason.id}
                onCheckedChange={() => handleReasonChange(reason.id)}
              />
              <Label htmlFor={reason.id} className="cursor-pointer">
                {reason.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedreason === "other" && (
        <div className="space-y-2">
          <Label htmlFor="otherreason">Lý do khác</Label>
          <Textarea
            id="otherreason"
            placeholder="Nhập lý do gia hạn khác"
            value={otherreason}
            onChange={(e) => setOtherReason(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="specialcase">Trường hợp đặc biệt</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="specialcase"
            checked={specialcase}
            onCheckedChange={(checked: boolean) => setSpecialCase(checked)}
          />
          <Label htmlFor="specialcase" className="cursor-pointer">
            Đánh dấu nếu đây là trường hợp đặc biệt (bệnh tật, tai nạn, v.v.)
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newexamtime">Thời gian thi mới</Label>
        <Select onValueChange={setNewExamId}>
          <SelectTrigger id="newexamtime">
            <SelectValue placeholder="Chọn thời gian thi mới" />
          </SelectTrigger>
          <SelectContent>
            {examschedules.map((schedule) => (
              <SelectItem key={schedule.id} value={schedule.id}>
                {schedule.time} - {schedule.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="staff">Nhân viên lập phiếu</Label>
        <Select onValueChange={setStaffId}>
          <SelectTrigger id="staff">
            <SelectValue placeholder="Chọn nhân viên lập phiếu" />
          </SelectTrigger>
          <SelectContent>
            {staffmembers.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name} ({staff.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
          placeholder="Nhập ghi chú (nếu có)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}