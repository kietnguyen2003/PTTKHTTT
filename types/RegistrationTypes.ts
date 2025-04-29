// types/RegistrationTypes.ts
export interface RegistrationForm {
  id: string;
  customerName: string;
  customerType: string;
  examDate: string;
  certificate: string;
  status: string;
  createdAt: string;
}


// interface cho phiếu đăng ký
export interface Registration {
  maphieu: string;
  ngaythi: string;
  tencc: string;
  trangthai: string;
  ngaydangky: string;
}

// interface cho phiếu gia hạn
export interface ExtensionForm {
  id: string;
  customerName: string;
  examTicket: string;
  oldDate: string;
  newDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

// interface cho dữ liệu đăng ký
export interface RegistrationData {
  mats: string;
  hoten: string;
  dob: string;
  gender: string;
  candidateCount: number | null;
  venue: string | null;
  certificateId: string;
  examId: string;
}

// interface cho thông tin phiếu dự thi
export interface TicketInfo {
  ticketid: string;
  candidatenumber: string;
  customername: string;
  examid: string;
  examtime: string;
  examlocation: string;
  extensioncount: number;
  customerid: string;
}
