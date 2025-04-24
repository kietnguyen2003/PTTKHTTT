// lib/customerService.ts
import { supabase } from "./supabase/supabaseClient";

// Định nghĩa interface cho dữ liệu từ Supabase
interface SupabaseCustomer {
  makh: string;
  loaikh: 'CaNhan' | 'DonVi';
  diachi?: string;
  khachhang_cn?: {
    hoten: string;
    cccd?: string;
    email?: string;
    sdt?: string;
  };
  khachhang_dv?: {
    tendv: string;
    madv: string;
    email?: string;
    sdt?: string;
  };
  phieudangki: {
    maphieu: string;
    ngaydangky: string;
    buoithi: {
      thoigian: string;
      thongtinchungchi: {
        tencc: string;
      };
    };
  }[];
}

// Định nghĩa interface (đã có sẵn, giữ nguyên)
export interface Registration {
  maphieu: string;
  ngaythi: string;
  tencc: string;
  trangthai: string;
  ngaydangky: string;
}

export interface Customer {
  makh: string;
  loaikh: 'CaNhan' | 'DonVi';
  diachi?: string;
  hoten?: string;
  cccd?: string;
  email?: string;
  sdt?: string;
  tendv?: string;
  madv?: string;
  registrations: Registration[];
}

export interface CustomerFormProps {
  onSuccess?: () => void;
  initialData?: {
    makh: string;
    loaikh?: 'CaNhan' | 'DonVi';
    hoten?: string;
    cccd?: string;
    email?: string;
    sdt?: string;
    diachi?: string;
    tendv?: string;
    madv?: string;
  };
}

export async function fetchIndividualCustomers(setCustomers: (customers: Customer[]) => void) {
  const { data, error } = await supabase
    .from('khachhang')
    .select(`
      makh,
      loaikh,
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
    .eq('loaikh', 'CaNhan');

  if (error) {
    console.error('Error fetching individual customers:', error.message);
    throw error;
  }

  // Loại bỏ trùng lặp dựa trên makh
  const uniqueData = Array.from(new Map((data as SupabaseCustomer[]).map(item => [item.makh, item])).values());

  const customers: Customer[] = uniqueData.map((item) => ({
    makh: item.makh,
    loaikh: item.loaikh,
    diachi: item.diachi,
    hoten: item.khachhang_cn?.hoten,
    cccd: item.khachhang_cn?.cccd,
    email: item.khachhang_cn?.email,
    sdt: item.khachhang_cn?.sdt,
    tendv: undefined, // Không áp dụng cho khách hàng cá nhân
    madv: undefined, // Không áp dụng cho khách hàng cá nhân
    registrations: item.phieudangki.map((pdk) => ({
      maphieu: pdk.maphieu,
      ngaythi: pdk.buoithi.thoigian,
      tencc: pdk.buoithi.thongtinchungchi.tencc,
      trangthai: 'Đã duyệt', // Có thể thêm logic để xác định trạng thái
      ngaydangky: pdk.ngaydangky,
    })),
  }));

  setCustomers(customers);
}

export async function fetchOrganizationCustomers(setCustomers: (customers: Customer[]) => void) {
  const { data, error } = await supabase
    .from('khachhang')
    .select(`
      makh,
      loaikh,
      diachi,
      khachhang_dv (
        tendv,
        madv,
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
    .eq('loaikh', 'DonVi');

  if (error) {
    console.error('Error fetching organization customers:', error.message);
    throw error;
  }

  // Loại bỏ trùng lặp dựa trên makh
  const uniqueData = Array.from(new Map((data as SupabaseCustomer[]).map(item => [item.makh, item])).values());

  const customers: Customer[] = uniqueData.map((item) => ({
    makh: item.makh,
    loaikh: item.loaikh,
    diachi: item.diachi,
    hoten: undefined, // Không áp dụng cho khách hàng đơn vị
    cccd: undefined, // Không áp dụng cho khách hàng đơn vị
    email: item.khachhang_dv?.email,
    sdt: item.khachhang_dv?.sdt,
    tendv: item.khachhang_dv?.tendv,
    madv: item.khachhang_dv?.madv,
    registrations: item.phieudangki.map((pdk) => ({
      maphieu: pdk.maphieu,
      ngaythi: pdk.buoithi.thoigian,
      tencc: pdk.buoithi.thongtinchungchi.tencc,
      trangthai: 'Đã duyệt',
      ngaydangky: pdk.ngaydangky,
    })),
  }));

  setCustomers(customers);
}