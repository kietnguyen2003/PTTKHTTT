import { supabase } from "./supabase/supabaseClient";
import { v4 as uuidv4 } from 'uuid';

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

// interface cho buổi thi
export interface ExamSchedule {
  id: string;
  time: string;
  location: string;
}

// interface cho nhân viên
export interface StaffMember {
  id: string;
  name: string;
}

// tìm kiếm phiếu dự thi
export async function searchExamTicket(ticketid: string, candidatenumber: string): Promise<TicketInfo | null> {
  const query = supabase
    .from('phieuduthi')
    .select(`
      maphieu,
      sobaodanh,
      makh,
      mabuoithi,
      thoigian,
      diadiem,
      khachhang (
        loaikh,
        khachhang_cn (
          hoten
        ),
        khachhang_dv (
          tendv
        )
      ),
      buoithi (
        mabuoithi,
        thoigian,
        diadiem,
        thongtinchungchi (
          tencc
        )
      )
    `);

  if (ticketid) {
    query.eq('maphieu', ticketid);
  } else if (candidatenumber) {
    query.eq('sobaodanh', candidatenumber);
  } else {
    return null;
  }

  const { data, error } = await query.single();

  if (error || !data) {
    console.error('error searching exam ticket:', error?.message);
    return null;
  }

  // đếm số lần gia hạn
  const { count, error: countError } = await supabase
    .from('phieudangkigiahan')
    .select('maphieu', { count: 'exact' })
    .eq('maphieuduthi', data.maphieu);

  if (countError) {
    console.error('error counting extensions:', countError.message);
    return null;
  }

  return {
    ticketid: data.maphieu,
    candidatenumber: data.sobaodanh || 'N/A',
    customername:
      data.khachhang.loaikh === 'CaNhan'
        ? data.khachhang.khachhang_cn?.hoten ?? 'N/A'
        : data.khachhang.khachhang_dv?.tendv ?? 'N/A',
    examid: data.mabuoithi,
    examtime: new Date(data.thoigian).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
    examlocation: data.diadiem || 'N/A',
    extensioncount: count || 0,
    customerid: data.makh,
  };
}

// lấy danh sách buổi thi
export async function fetchExamSchedules(): Promise<ExamSchedule[]> {
  const { data, error } = await supabase
    .from('buoithi')
    .select(`
      mabuoithi,
      thoigian,
      diadiem,
      thongtinchungchi (
        tencc
      )
    `)
    .eq('trangthai', 'ChuaToChuc');

  if (error) {
    console.error('error fetching exam schedules:', error.message);
    return [];
  }

  return data.map((item) => ({
    id: item.mabuoithi,
    time: new Date(item.thoigian).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
    location: item.diadiem || 'N/A',
  }));
}

// lấy danh sách nhân viên
export async function fetchStaffMembers(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('nhanvien')
    .select('manv, tennv');

  if (error) {
    console.error('error fetching staff members:', error.message);
    return [];
  }

  return data.map((item) => ({
    id: item.manv,
    name: item.tennv,
  }));
}

// lưu phiếu gia hạn
export async function createExtension(
  ticketid: string,
  customerid: string,
  newexamtime: string,
  reason: string,
  otherreason: string,
  staffid: string,
  specialcase: boolean
): Promise<boolean> {
  const extensionid = uuidv4();
  const finalreason = reason === 'other' ? otherreason : reason;

  const { data: newexamdata, error: examerror } = await supabase
    .from('buoithi')
    .select('thoigian')
    .eq('mabuoithi', newexamtime)
    .single();

  if (examerror || !newexamdata) {
    console.error('error fetching new exam time:', examerror?.message);
    return false;
  }

  const { error } = await supabase
    .from('phieudangkigiahan')
    .insert({
      maphieu: extensionid,
      makh: customerid,
      maphieuduthi: ticketid,
      langiahan: (await getextensioncount(ticketid)) + 1,
      nguoilapphieu: staffid,
      ngaythimoi: newexamdata.thoigian,
      truonghopdacbiet: specialcase,
      trangthai: 'Chờ duyệt',
    });

  if (error) {
    console.error('error creating extension:', error.message);
    return false;
  }

  return true;
}

// hàm hỗ trợ để lấy số lần gia hạn hiện tại
async function getextensioncount(ticketid: string): Promise<number> {
  const { count, error } = await supabase
    .from('phieudangkigiahan')
    .select('maphieu', { count: 'exact' })
    .eq('maphieuduthi', ticketid);

  if (error) {
    console.error('error counting extensions:', error.message);
    return 0;
  }

  return count || 0;
}