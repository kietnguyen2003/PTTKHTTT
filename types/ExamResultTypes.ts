// types/ExamResultTypes.ts
export enum ChungChiStatus {
  ChuaNhan = 'ChuaNhan',
  DaNhan = 'DaNhan',
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

export interface PhieuDuThi {
  maphieu: string;
  sobaodanh: string;
  thoigian: string;
  diadiem: string;
  thongtinchungchi: {
    tencc: string;
  };
  khachhang: {
    thongtinthisinh?: { hoten: string };
    khachhang_cn?: { hoten: string };
  };
  status: string;
}