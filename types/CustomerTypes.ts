import { Registration } from "./RegistrationTypes";

// Định nghĩa interface cho dữ liệu từ Supabase
export interface SupabaseCustomer {
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
    trangthai: string;
    buoithi: {
      thoigian: string;
      thongtinchungchi: {
        tencc: string;
      };
    };
  }[];
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