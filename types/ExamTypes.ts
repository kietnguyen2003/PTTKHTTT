// types/ExamDetails.ts
export interface ExamDetails {
  mabuoithi: string;
  thoigian: string;
  diadiem: string;
}

// interface cho buổi thi
export interface ExamSchedule {
  id: string;
  time: string;
  location: string;
}

// interface cho phiếu dự thi
export interface ExamTicket {
  maphieu: string;
  sobaodanh: string;
  makh: string;
  mabuoithi: string;
  macc: string;
  thoigian: string;
  diadiem: string;
  diemthi: number | null;
}

export interface SupabaseRegistrationForm {
  maphieu: string;
  ngaydangky: string;
  trangthai: string;
  mabuoithi: string;
  makh: string;
  buoithi: {
    thoigian: string;
    diadiem: string;
    macc: string;
    thongtinchungchi: { tencc: string };
  };
  khachhang: {
    makh: string;
    loaikh: string;
    khachhang_cn: { hoten: string; cccd: string; email: string; sdt: string } | null;
    khachhang_dv: { tendv: string; madv: string; email: string; sdt: string } | null;
  } | null;
}

export interface SupabaseExamExtension {
  maphieu: string;
  makh: string;
  maphieuduthi: string;
  langiahan: number;
  nguoilapphieu: string;
  buoithimoi: string;
  truonghopdacbiet: boolean;
  trangthai: "Chờ duyệt" | "Đã duyệt" | "Từ chối";
  created_at: string;
}

export interface ExamExtensionFormData {
  ticketId: string; // maphieuduthi
  customerId: string; // makh
  newExamSessionId: string; // buoithimoi
  reason: string;
  otherReason: string;
  staffId: string; // nguoilapphieu
  specialCase: boolean; // truonghopdacbiet
}