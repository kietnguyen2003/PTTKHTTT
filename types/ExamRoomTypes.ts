// types/ExamRoomTypes.ts

// Kiểu dữ liệu từ bảng `phongthi` của Supabase
export interface SupabaseExamRoom {
  maphong: string;
  tenphong: string;
  toanha: string;
  succhua: number;
  trangthai: "available" | "full" | "maintenance";
  ghichu: string | null;
  phieuduthi: SupabaseExamTicket[];
}

// Kiểu dữ liệu từ bảng `phieuduthi` của Supabase
export interface SupabaseExamTicket {
  sobaodanh: string;
  maphong: string | null;
  khachhang: {
    thongtinthisinh: { hoten: string } | null;
    khachhang_cn: { hoten: string } | null;
  };
  thongtinchungchi: { tencc: string };
}

// Interface cho thí sinh trong phòng thi
export interface Candidate {
  soBaoDanh: string;
  hoTen: string;
  loaiChungChi: string;
}

// Interface cho phòng thi
export interface ExamRoom {
  maphong: string;
  tenphong: string;
  toanha: string;
  succhua: number;
  soThiSinhHienTai: number;
  trangthai: "available" | "full" | "maintenance";
  ghichu: string;
  thiSinh: Candidate[];
}

// Interface cho form thêm/sửa phòng thi
export interface RoomFormData {
  maphong: string;
  tenphong: string;
  toanha: string;
  succhua: string;
  trangthai: "available" | "full" | "maintenance";
  ghichu: string;
}

// Interface cho thí sinh chưa phân phòng
export interface UnassignedCandidate {
  sobaodanh: string;
  hoten: string;
  tencc: string;
  thoiGian: string;
}