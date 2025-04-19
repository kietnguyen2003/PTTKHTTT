// src/components/organization-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

interface OrganizationFormProps {
  onSuccess?: () => void;
  initialData?: {
    madv: string;
    tendv: string;
    sdt: string;
    diachi: string;
  };
}

export default function OrganizationForm({ onSuccess, initialData }: OrganizationFormProps) {
  const [formData, setFormData] = useState({
    madv: initialData?.madv || `KH${uuidv4().slice(0, 8)}`,
    tendv: initialData?.tendv || "",
    sdt: initialData?.sdt || "",
    diachi: initialData?.diachi || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        // Cập nhật đơn vị
        const { error: updateDonVi } = await supabase
          .from("donvi")
          .update({ diachi: formData.diachi })
          .eq("madv", formData.madv);

        if (updateDonVi) {
          throw new Error("Không thể cập nhật đơn vị");
        }
      } else {
        // Thêm đơn vị mới
        const { error: insertDonViError } = await supabase.from("donvi").insert({
          madv: formData.madv,
          diachi: formData.diachi,
          tendv: formData.tendv,
          sdt: formData.sdt,
        });

        if (insertDonViError) {
          throw new Error("Không thể thêm đơn vị");
        }
      }

      toast({ title: "Thành công", description: initialData ? "Đã cập nhật đơn vị" : "Đã thêm đơn vị" });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving organization:", error);
      toast({ title: "Lỗi", description: "Không thể lưu đơn vị", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="madv">Mã đơn vị</Label>
        <Input id="madv" value={formData.madv} disabled />
      </div>
      <div>
        <Label htmlFor="tendv">Tên đơn vị</Label>
        <Input
          id="tendv"
          value={formData.tendv}
          onChange={(e) => setFormData({ ...formData, tendv: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="sdt">Số điện thoại</Label>
        <Input
          id="sdt"
          value={formData.sdt}
          onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="diachi">Địa chỉ</Label>
        <Input
          id="diachi"
          value={formData.diachi}
          onChange={(e) => setFormData({ ...formData, diachi: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Đang lưu..." : initialData ? "Cập nhật" : "Thêm đơn vị"}
      </Button>
    </form>
  );
}