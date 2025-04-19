// lib/customerService.ts

import { supabase } from "./supabase/supabaseClient";
import { toast } from "react-toastify";

// Định nghĩa interface
export interface Registration {
  id: string;
  examDate: string;
  certificate: string;
  status: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  type: "individual" | "organization";
  name: string;
  phone: string;
  idCard?: string;
  email?: string;
  orgId?: string;
  registrations: Registration[];
}

// Hàm lấy khách hàng cá nhân
export const fetchIndividualCustomers = async (setCustomers: (customers: Customer[]) => void) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("khachhang")
      .select(`
        makh,
        diachi,
        khachhang_cn (
          hoten,
          cccd,
          email,
          sdt
        ),
        phieudangki (
          maphieu,
          ngaydangky,
          buoithi (
            thoigian,
            thongtinchungchi (
              tencc
            )
          )
        )
      `)
      .eq("loaikh", "CaNhan");

    if (error) throw error;

    const customers: Customer[] = data.map((item: any) => ({
      id: item.makh,
      type: "individual",
      name: item.khachhang_cn?.hoten || "",
      idCard: item.khachhang_cn?.cccd || "",
      email: item.khachhang_cn?.email || "",
      phone: item.khachhang_cn?.sdt || "",
      registrations: item.phieudangki.map((reg: any) => ({
        id: reg.maphieu,
        examDate: reg.buoithi?.thoigian ? new Date(reg.buoithi.thoigian).toLocaleDateString("vi-VN") : "Chưa xác định",
        certificate: reg.buoithi?.thongtinchungchi?.tencc || "Không có",
        status: reg.ngaydangky ? "Đã duyệt" : "Chờ duyệt",
        createdAt: reg.ngaydangky ? new Date(reg.ngaydangky).toLocaleDateString("vi-VN") : "Chưa đăng ký",
      })),
    }));

    setCustomers(customers);
  } catch (error: any) {
    console.error("Error fetching individual customers:", error.message, error);
    toast.error(`Không thể tải danh sách khách hàng cá nhân: ${error.message}`);
  }
};

// Hàm lấy khách hàng đơn vị
export const fetchOrganizationCustomers = async (setCustomers: (customers: Customer[]) => void) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("khachhang")
      .select(`
        makh,
        diachi,
        khachhang_dv (
          tendv,
          madv,
          sdt,
          email
        ),
        phieudangki (
          maphieu,
          ngaydangky,
          buoithi (
            thoigian,
            thongtinchungchi (
              tencc
            )
          )
        )
      `)
      .eq("loaikh", "DonVi");

    if (error) throw error;

    const customers: Customer[] = data.map((item: any) => ({
      id: item.makh,
      type: "organization",
      name: item.khachhang_dv?.tendv || "",
      orgId: item.khachhang_dv?.madv || "",
      phone: item.khachhang_dv?.sdt || "",
      email: item.khachhang_dv?.email || "",
      registrations: item.phieudangki.map((reg: any) => ({
        id: reg.maphieu,
        examDate: reg.buoithi?.thoigian ? new Date(reg.buoithi.thoigian).toLocaleDateString("vi-VN") : "Chưa xác định",
        certificate: reg.buoithi?.thongtinchungchi?.tencc || "Không có",
        status: reg.ngaydangky ? "Đã duyệt" : "Chờ duyệt",
        createdAt: reg.ngaydangky ? new Date(reg.ngaydangky).toLocaleDateString("vi-VN") : "Chưa đăng ký",
      })),
    }));

    setCustomers(customers);
  } catch (error: any) {
    console.error("Error fetching organization customers:", error.message, error);
    toast.error(`Không thể tải danh sách khách hàng đơn vị: ${error.message}`);
  }
};
