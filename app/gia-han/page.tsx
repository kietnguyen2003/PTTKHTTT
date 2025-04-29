"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ExamTicketSearch from "@/components/exam-ticket-search";
import ExtensionForm from "@/components/extension-form";
import { toast } from "@/components/ui/use-toast";
import { TicketInfo } from "@/types/RegistrationTypes";
import { createExtension } from "@/services/phieuDangKiGiaHanService";
export default function GiaHanPage() {
  const [ticketinfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [formdata, setFormData] = useState<{
    selectedreason: string | null;
    otherreason: string;
    newexamid: string | null;
    staffid: string | null;
    notes: string;
    specialcase: boolean;
  }>({
    selectedreason: null,
    otherreason: "",
    newexamid: null,
    staffid: null,
    notes: "",
    specialcase: false,
  });

  const handleCheckConditions = () => {
    if (!ticketinfo) {
      toast({
        title: "Lỗi",
        description: "Vui lòng tra cứu phiếu dự thi trước.",
        variant: "destructive",
      });
      return;
    }

    if (ticketinfo.extensioncount >= 2) {
      toast({
        title: "Không thể gia hạn",
        description: "Thí sinh đã sử dụng tối đa số lần gia hạn cho phép (2 lần).",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Hợp lệ",
        description: `Thí sinh có thể gia hạn. Số lần gia hạn hiện tại: ${ticketinfo.extensioncount}.`,
      });
    }
  };

  const handleCreateExtension = async () => {
    if (!ticketinfo) {
      toast({
        title: "Lỗi",
        description: "Vui lòng tra cứu phiếu dự thi trước.",
        variant: "destructive",
      });
      return;
    }

    if (ticketinfo.extensioncount >= 2) {
      toast({
        title: "Không thể gia hạn",
        description: "Thí sinh đã sử dụng tối đa số lần gia hạn cho phép (2 lần).",
        variant: "destructive",
      });
      return;
    }

    if (!formdata.selectedreason || !formdata.newexamid || !formdata.staffid) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin: lý do gia hạn, thời gian thi mới, và nhân viên lập phiếu.",
        variant: "destructive",
      });
      return;
    }

    if (formdata.selectedreason === "other" && !formdata.otherreason) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do khác.",
        variant: "destructive",
      });
      return;
    }

    const success = await createExtension(
      ticketinfo.ticketid,
      ticketinfo.customerid,
      formdata.newexamid,
      formdata.selectedreason,
      formdata.otherreason,
      formdata.staffid,
      formdata.specialcase
    );

    if (success) {
      toast({
        title: "Thành công",
        description: "Đã lập phiếu gia hạn thành công!",
      });
      // reset form
      setTicketInfo(null);
      setFormData({
        selectedreason: null,
        otherreason: "",
        newexamid: null,
        staffid: null,
        notes: "",
        specialcase: false,
      });
    } else {
      toast({
        title: "Lỗi",
        description: "Không thể lập phiếu gia hạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setTicketInfo(null);
    setFormData({
      selectedreason: null,
      otherreason: "",
      newexamid: null,
      staffid: null,
      notes: "",
      specialcase: false,
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gia Hạn Thời Gian Thi</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ExamTicketSearch onTicketFound={setTicketInfo} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ExtensionForm onFormChange={setFormData} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleCancel}>
          Hủy
        </Button>
        <Button variant="outline" onClick={handleCheckConditions}>
          Kiểm tra điều kiện gia hạn
        </Button>
        <Button onClick={handleCreateExtension}>Lập phiếu gia hạn</Button>
      </div>
    </div>
  );
}