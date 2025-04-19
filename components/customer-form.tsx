// src/components/customer-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "@/components/ui/use-toast";

interface CustomerFormProps {
  onSuccess?: () => void;
  initialData?: {
    makh: string;
    loaikh?: "CaNhan" | "DonVi";
    hoten?: string;
    cccd?: string;
    email?: string;
    sdt?: string;
    diachi?: string;
    tendv?: string;
    madv?: string;
  };
}

export default function CustomerForm({ onSuccess, initialData }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    makh: initialData?.makh || "",
    loaikh: initialData?.loaikh || ("CaNhan" as "CaNhan" | "DonVi"),
    hoten: initialData?.hoten || "",
    cccd: initialData?.cccd || "",
    email: initialData?.email || "",
    sdt: initialData?.sdt || "",
    diachi: initialData?.diachi || "",
    tendv: initialData?.tendv || "",
    madv: initialData?.madv || "",
  });
  const [loading, setLoading] = useState(false);

  // Hàm tạo makh mới
  const generatemakh = async () => {
    const { data, error } = await supabase
      .from("khachhang")
      .select("makh")
      .order("makh", { ascending: false })
      .limit(1);
    if (error) {
      console.error("Error fetching last makh:", error.message);
      console.error("Error generating makh:", error);
      return `KH${Date.now()}`;
    }
    const lastmakh = data?.[0]?.makh || "KH000";
    const number = parseInt(lastmakh.replace("KH", "")) + 1;
    return `KH${number.toString().padStart(3, "0")}`;
  };

  // Tạo makh khi thêm mới
  useEffect(() => {
    if (!initialData) {
      generatemakh().then((newmakh) => {
        setFormData((prev) => ({ ...prev, makh: newmakh }));
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        // Cập nhật khách hàng
        const { error: updateKhachHangError } = await supabase
          .from("KhachHang")
          .update({ diachi: formData.diachi })
          .eq("makh", formData.makh);

        if (formData.loaikh === "CaNhan") {
          const { error: updateKhachHangCNError } = await supabase
            .from("khachhang_cn")
            .update({
              hoten: formData.hoten,
              cccd: formData.cccd || null,
              email: formData.email || null,
              sdt: formData.sdt || null,
            })
            .eq("makh", formData.makh);

          if (updateKhachHangError || updateKhachHangCNError) {
            throw new Error("Không thể cập nhật khách hàng cá nhân");
          }
        } else {
          const { error: updateKhachHangDVError } = await supabase
            .from("khachhang_dv")
            .update({
              tendv: formData.tendv,
              madv: formData.madv,
              sdt: formData.sdt || null,
              email: formData.email || null,
            })
            .eq("makh", formData.makh);

          if (updateKhachHangError || updateKhachHangDVError) {
            throw new Error("Không thể cập nhật khách hàng đơn vị");
          }
        }
      } else {
        // Thêm khách hàng mới
        const { error: insertKhachHangError } = await supabase.from("khachhang").insert({
          makh: formData.makh,
          loaikh: formData.loaikh,
          diachi: formData.diachi || null,
        });

        if (formData.loaikh === "CaNhan") {
          const { error: insertKhachHangCNError } = await supabase.from("khachhang_cn").insert({
            makh: formData.makh,
            hoten: formData.hoten,
            cccd: formData.cccd || null,
            email: formData.email || null,
            sdt: formData.sdt || null,
          });

          if (insertKhachHangError || insertKhachHangCNError) {
            console.error("Error inserting customer:", insertKhachHangError || insertKhachHangCNError);
            throw new Error("Không thể thêm khách hàng cá nhân");
          }
        } else {
          const { error: insertKhachHangDVError } = await supabase.from("khachhang_dv").insert({
            makh: formData.makh,
            tendv: formData.tendv,
            madv: formData.madv,
            sdt: formData.sdt || null,
            email: formData.email || null,
          });

          if (insertKhachHangError || insertKhachHangDVError) {
            console.error("Error inserting customer:", insertKhachHangError || insertKhachHangDVError);
            throw new Error("Không thể thêm khách hàng đơn vị");
          }
        }
      }

      toast({ title: "Thành công", description: initialData ? "Đã cập nhật khách hàng" : "Đã thêm khách hàng" });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast({ title: "Lỗi", description: `Không thể lưu khách hàng: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="makh">Mã khách hàng</Label>
        <Input id="makh" value={formData.makh} disabled />
      </div>
      <div>
        <Label htmlFor="loaikh">Loại khách hàng</Label>
        <Select
          value={formData.loaikh}
          onValueChange={(value) => setFormData({ ...formData, loaikh: value as "CaNhan" | "DonVi" })}
          disabled={!!initialData} // Không cho phép thay đổi loaikh khi cập nhật
        >
          <SelectTrigger id="loaikh">
            <SelectValue placeholder="Chọn loại khách hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CaNhan">Cá nhân</SelectItem>
            <SelectItem value="DonVi">Đơn vị</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.loaikh === "CaNhan" ? (
        <>
          <div>
            <Label htmlFor="hoten">Họ tên</Label>
            <Input
              id="hoten"
              value={formData.hoten}
              onChange={(e) => setFormData({ ...formData, hoten: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="cccd">cccd</Label>
            <Input
              id="cccd"
              value={formData.cccd}
              onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
        </>
      ) : (
        <>
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
            <Label htmlFor="madv">Mã đơn vị</Label>
            <Input
              id="madv"
              value={formData.madv}
              onChange={(e) => setFormData({ ...formData, madv: e.target.value })}
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </>
      )}
      <div>
        <Label htmlFor="diachi">Địa chỉ</Label>
        <Input
          id="diachi"
          value={formData.diachi}
          onChange={(e) => setFormData({ ...formData, diachi: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Đang lưu..." : initialData ? "Cập nhật" : "Thêm khách hàng"}
      </Button>
    </form>
  );
}