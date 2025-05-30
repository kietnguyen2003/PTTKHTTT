import { TicketInfo } from "@/types/RegistrationTypes";
import { supabase } from "../lib/supabase/supabaseClient";
import { PhieuDuThi } from "@/types/ExamResultTypes";

// Lấy danh sách kết quả thi từ bảng ketquathi
export const fetchKetQuaThi = async (
  setKetQuaThiList: (list: PhieuDuThi[]) => void
) => {
  try {
    const query = supabase
      .from("ketquathi")
      .select(`
        sobaodanh,
        diemthi,
        nguoicham,
        giamthi,
        phieuduthi:sobaodanh (
          maphieu,
          status,
          buoithi:mabuoithi (thoigian, diadiem),
          thongtinchungchi:macc (tencc),
          thongtinthsinh:mats (hoten),
          khachhang:makh (
            khachhang_cn (hoten)
          )
        )
      `);

    const { data, error } = await query;

    console.log("Raw ketquathi data:", data);
    if (error) throw error;

    const transformedData: PhieuDuThi[] = (Array.isArray(data) ? data : []).map((item: any) => ({
      sobaodanh: item.sobaodanh,
      maphieu: item.phieuduthi?.maphieu || '',
      status: item.phieuduthi?.status || '',
      thoigian: item.phieuduthi?.buoithi?.thoigian || '',
      diadiem: item.phieuduthi?.buoithi?.diadiem || '',
      thongtinchungchi: {
        tencc: item.phieuduthi?.thongtinchungchi?.tencc || ''
      },
      khachhang: {
        thongtinthsinh: item.phieuduthi?.thongtinthsinh ? { hoten: item.phieuduthi.thongtinthsinh.hoten || 'N/A' } : undefined,
        khachhang_cn: item.phieuduthi?.khachhang?.khachhang_cn ? { hoten: item.phieuduthi.khachhang.khachhang_cn.hoten || 'N/A' } : undefined
      },
      ketquathi: {
        diemthi: item.diemthi || 0,
        nguoicham: item.nguoicham || '',
        giamthi: item.giamthi || ''
      },
      bangtinh: undefined
    }));

    console.log("Transformed ketquathi data:", transformedData);
    setKetQuaThiList(transformedData);
  } catch (error: any) {
    console.error("Error fetching ketquathi:", error.message);
    throw new Error("Lỗi khi tải danh sách kết quả thi: " + error.message);
  }
};

// Lấy danh sách phiếu dự thi
export const fetchPhieuDuThi = async (
  setPhieuDuThiList: (list: PhieuDuThi[]) => void,
  fetchType: 'chua_thi' = 'chua_thi'
) => {
  try {
    let query = supabase
      .from("phieuduthi")
      .select(`
        sobaodanh,
        maphieu,
        status,
        buoithi:mabuoithi (thoigian, diadiem),
        thongtinchungchi:macc (tencc),
        thongtinthsinh:mats (hoten),
        khachhang:makh (
          khachhang_cn (hoten)
        )
      `)
      .eq('status', 'chua_thi');

    const { data, error } = await query;

    console.log("Raw phieuduthi data:", data);
    if (error) throw error;

    const transformedData: PhieuDuThi[] = (Array.isArray(data) ? data : []).map((item: any) => ({
      sobaodanh: item.sobaodanh,
      maphieu: item.maphieu,
      status: item.status,
      thoigian: item.buoithi?.thoigian || '',
      diadiem: item.buoithi?.diadiem || '',
      thongtinchungchi: {
        tencc: item.thongtinchungchi?.tencc || ''
      },
      khachhang: {
        thongtinthsinh: item.thongtinthsinh ? { hoten: item.thongtinthsinh.hoten || 'N/A' } : undefined,
        khachhang_cn: item.khachhang?.khachhang_cn ? { hoten: item.khachhang.khachhang_cn.hoten || 'N/A' } : undefined
      },
      ketquathi: undefined,
      bangtinh: undefined
    }));

    console.log("Transformed phieuduthi data:", transformedData);
    setPhieuDuThiList(transformedData);
  } catch (error: any) {
    console.error("Error fetching phieuduthi:", error.message);
    throw new Error("Lỗi khi tải danh sách phiếu dự thi: " + error.message);
  }
};

// Cập nhật trạng thái phiếu dự thi
export const updatePhieuDuThiStatusBasic = async (
  maphieu: string,
  newStatus: string,
  setPhieuDuThiList: (list: PhieuDuThi[]) => void
) => {
  try {
    const { error } = await supabase
      .from('phieuduthi')
      .update({ status: newStatus })
      .eq('maphieu', maphieu);

    if (error) throw error;

    // Tải lại danh sách phiếu dự thi
    await fetchPhieuDuThi(setPhieuDuThiList, 'chua_thi');
  } catch (error: any) {
    console.error("Error updating phieuduthi status:", error.message);
    throw new Error("Lỗi khi cập nhật trạng thái phiếu dự thi: " + error.message);
  }
};

// Xóa phiếu dự thi
export const deletePhieuDuThi = async (
  maphieu: string,
  setPhieuDuThiList: (list: PhieuDuThi[]) => void
) => {
  try {
    const { error } = await supabase
      .from('phieuduthi')
      .delete()
      .eq('maphieu', maphieu);

    if (error) throw error;

    // Tải lại danh sách phiếu dự thi
    await fetchPhieuDuThi(setPhieuDuThiList, 'chua_thi');
  } catch (error: any) {
    console.error("Error deleting phieuduthi:", error.message);
    throw new Error("Lỗi khi xóa phiếu dự thi: " + error.message);
  }
};

// Tìm kiếm phiếu dự thi
export async function searchExamTicket(ticketid: string, candidatenumber: string): Promise<TicketInfo | null> {
  const query = supabase
    .from('phieuduthi')
    .select(`
      maphieu,
      sobaodanh,
      makh,
      mabuoithi,
      khachhang:makh (
        loaikh,
        khachhang_cn (
          hoten
        ),
        khachhang_dv (
          tendv
        )
      ),
      buoithi:mabuoithi (
        mabuoithi,
        thoigian,
        diadiem,
        thongtinchungchi:macc (
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
  console.log("PhieuDuThi: ", data);

  if (error || !data) {
    console.error('Error searching exam ticket:', error?.message);
    return null;
  }

  // Đếm số lần gia hạn
  const { count, error: countError } = await supabase
    .from('phieudangkigiahan')
    .select('maphieu', { count: 'exact' })
    .eq('maphieuduthi', data.maphieu);

  if (countError) {
    console.error('Error counting extensions:', countError.message);
    return null;
  }

  return {
    ticketid: data.maphieu,
    candidatenumber: data.sobaodanh || 'N/A',
    customername:
      data.khachhang?.loaikh === 'CaNhan'
        ? data.khachhang?.khachhang_cn?.hoten ?? 'N/A'
        : data.khachhang?.khachhang_dv?.tendv ?? 'N/A',
    examid: data.mabuoithi,
    extensioncount: count || 0,
    customerid: data.makh,
    examtime: new Date(data.buoithi?.thoigian).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    examlocation: data.buoithi?.diadiem,
  };
};