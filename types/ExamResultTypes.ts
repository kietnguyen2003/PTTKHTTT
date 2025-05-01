export enum ChungChiStatus {
  ChuaNhan = "ChuaNhan",
  DaNhan = "DaNhan",
}

export interface CandidateInfo {
  soBaoDanh: string;
  maPhieuDuThi: string;
  hoTen: string;
  loaiChungChi: string;
  thoiGianThi: string;
  diaDiem: string;
}

export interface ResultData {
  diemThi: string;
  nguoiCham: string;
  giamThi: string;
  trangThai: ChungChiStatus;
}

export interface KhachHang {
  thongtinthsinh?: { hoten: string };
  khachhang_cn?: { hoten: string };
}

export interface ThongTinChungChi {
  tencc: string;
}

export interface KetQuaThi {
  diemthi: number;
  nguoicham: string;
  giamthi: string;
}

export interface BangTinh {
  trangthai: string;
}

export interface PhieuDuThi {
  sobaodanh: string;
  maphieu: string;
  status: string;
  thoigian: string;
  diadiem: string;
  thongtinchungchi: ThongTinChungChi;
  khachhang?: KhachHang;
  ketquathi?: KetQuaThi;
  bangtinh?: BangTinh;
}