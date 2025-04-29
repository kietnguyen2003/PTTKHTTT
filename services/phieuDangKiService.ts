// services/examExtensionService.ts
import { supabase } from "@/lib/supabase/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ExamExtensionFormData, ExamTicket, SupabaseRegistrationForm } from "@/types/ExamTypes";
import { RegistrationForm } from "@/types/RegistrationTypes";

// Đếm số lần gia hạn của một phiếu dự thi
export async function getExtensionCount(ticketId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("phieudangkigiahan") // Viết thường
      .select("*", { count: "exact", head: true })
      .eq("maphieuduthi", ticketId); // Viết thường

    if (error) throw error;

    return count || 0;
  } catch (error: any) {
    throw new Error(`Không thể đếm số lần gia hạn: ${error.message || "Lỗi không xác định"}`);
  }
}

// Tạo phiếu gia hạn
export async function createExtension({
  ticketId,
  customerId,
  newExamSessionId,
  reason,
  otherReason,
  staffId,
  specialCase,
}: ExamExtensionFormData): Promise<void> {
  const extensionId = uuidv4();
  const finalReason = reason === "other" ? otherReason : reason;

  // Kiểm tra số lần gia hạn
  const extensionCount = await getExtensionCount(ticketId);
  if (extensionCount >= 2) {
    throw new Error("Số lần gia hạn đã đạt tối đa (2 lần). Không thể tạo thêm phiếu gia hạn.");
  }

  // Tạo phiếu gia hạn
  const { error } = await supabase.from("phieudangkigiahan").insert({
    maphieu: extensionId,
    makh: customerId,
    maphieuduthi: ticketId,
    langiahan: extensionCount + 1,
    nguoilapphieu: staffId,
    buoithimoi: newExamSessionId, // Lưu trực tiếp mabuoithi vào cột buoithimoi
    truonghopdacbiet: specialCase,
    trangthai: "Chờ duyệt",
  });

  if (error) {
    throw new Error(`Không thể tạo phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
  }

  toast.success(`Đã tạo phiếu gia hạn ${extensionId} thành công!`);
}
// Hàm lấy danh sách phiếu đăng ký (phiên bản cơ bản)
export const fetchRegistrationFormsBasic = async (setRegistrationForms: (forms: RegistrationForm[]) => void) => {
  try {
    const { data, error } = await supabase
      .from('phieudangki')
      .select(`
        maphieu,
        ngaydangky,
        trangthai,
        mabuoithi,
        makh,
        buoithi (
          thoigian,
          diadiem,
          macc,
          thongtinchungchi (
            tencc
          )
        ),
        khachhang (
          makh,
          loaikh,
          khachhang_cn (hoten),
          khachhang_dv (tendv)
        )
      `);

    if (error) throw error;

    if (!data || data.length === 0) {
      setRegistrationForms([]);
      return;
    }

    const forms: RegistrationForm[] = data.map((item) => {
      const khachHang = item.khachhang;
      const customerName = khachHang
        ? khachHang.loaikh === 'CaNhan'
          ? khachHang.khachhang_cn?.hoten || 'N/A'
          : khachHang.khachhang_dv?.tendv || 'N/A'
        : 'N/A';

      const customerType = khachHang
        ? khachHang.loaikh === 'CaNhan'
          ? 'Cá nhân'
          : 'Đơn vị'
        : 'N/A';

      return {
        id: item.maphieu,
        customerName,
        customerType,
        examDate: item.buoithi?.thoigian
          ? new Date(item.buoithi.thoigian).toLocaleDateString('vi-VN')
          : 'N/A',
        certificate: item.buoithi?.thongtinchungchi?.tencc || 'N/A',
        status: item.trangthai || 'Chờ duyệt',
        createdAt: item.ngaydangky
          ? new Date(item.ngaydangky).toLocaleDateString('vi-VN')
          : 'N/A',
      };
    });

    setRegistrationForms(forms);
  } catch (error: any) {
    console.error('Error fetching registration forms:', error);
    toast.error(`Không thể tải danh sách phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm cập nhật trạng thái phiếu đăng ký (phiên bản cơ bản)
export const updateRegistrationFormStatusBasic = async (
  id: string,
  newStatus: string,
  setRegistrationForms: (forms: RegistrationForm[]) => void
) => {
  try {
    const { error: updateError } = await supabase
      .from('phieudangki')
      .update({ trangthai: newStatus })
      .eq('maphieu', id);

    if (updateError) throw updateError;

    if (newStatus === 'Đã duyệt') {
      await createExamTickets(id);
    }

    await fetchRegistrationForms(setRegistrationForms);

    toast.success(`Cập nhật trạng thái phiếu đăng ký ${id} thành công!`);
  } catch (error: any) {
    console.error('Error updating registration form status:', error);
    toast.error(`Không thể cập nhật trạng thái phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm xóa phiếu đăng ký
export const deleteRegistrationForm = async (
  id: string,
  setRegistrationForms: (forms: RegistrationForm[]) => void
) => {
  try {
    const { error } = await supabase
      .from('phieudangki')
      .delete()
      .eq('maphieu', id);

    if (error) throw error;

    await fetchRegistrationForms(setRegistrationForms);

    toast.success(`Xóa phiếu đăng ký ${id} thành công!`);
  } catch (error: any) {
    console.error('Error deleting registration form:', error);
    toast.error(`Không thể xóa phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

export const updatePhieuDuThiStatus = async (phieuDuThiId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('phieuduthi')
      .update({ status })
      .eq('maphieu', phieuDuThiId);

    if (error) throw error;
    
    toast.success(`Cập nhật trạng thái phiếu dự thi ${phieuDuThiId} thành công!`);
  } catch (error: any) {
    console.error('Error updating phiếu dự thi status:', error);
    toast.error(`Không thể cập nhật trạng thái phiếu dự thi: ${error.message || "Lỗi không xác định"}`);
  }
};
// Hàm tạo phiếu dự thi (đã sửa để không phụ thuộc vào PhieuDangKiChiTiet)
export const createExamTickets = async (registrationId: string) => {
  try {
    // Lấy thông tin phiếu đăng ký
    const { data: registrationData, error: registrationError } = await supabase
      .from('phieudangki')
      .select(`
        maphieu,
        makh,
        mabuoithi,
        khachhang (
          loaikh
        ),
        buoithi (
          macc
        )
      `)
      .eq('maphieu', registrationId)
      .single();
    console.log("Phieudangki", registrationData);

    if (registrationError || !registrationData) {
      throw new Error(registrationError?.message || 'Không tìm thấy phiếu đăng ký');
    }

    const maKH = registrationData.makh;
    const maBuoiThi = registrationData.mabuoithi;
    const maCC = registrationData.buoithi?.macc;

    if (!maKH || !maBuoiThi || !maCC) {
      throw new Error('Thiếu thông tin cần thiết: MaKH, MaBuoiThi hoặc MaCC không tồn tại');
    }
    // Lấy danh sách thí sinh từ ThongTinThiSinh dựa trên MaKH
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('thongtinthisinh')
      .select(`
        mats,
        hoten
      `)
      .eq('makh', maKH);

    if (candidatesError || !candidatesData) {
      throw new Error(candidatesError?.message || 'Không tìm thấy thí sinh liên quan đến khách hàng');
    }

    if (candidatesData.length === 0) {
      throw new Error('Không có thí sinh nào để tạo phiếu dự thi');
    }

    // Tạo phiếu dự thi cho từng thí sinh
    const examTickets = candidatesData.map((candidate) => ({
      maphieu: `PDT-${uuidv4()}`,
      sobaodanh: `SBD-${uuidv4()}`,
      makh: maKH,
      mats: candidate.mats,
      maphieudangki: registrationId,
      mabuoithi: maBuoiThi,
      macc: maCC,
      maphong: null, // Chưa gán phòng thi, có thể gán sau
    }));

    // Chèn tất cả phiếu dự thi vào bảng PhieuDuThi
    const { error: insertError } = await supabase
      .from('phieuduthi')
      .insert(examTickets);

    if (insertError) {
      throw new Error('Không thể tạo phiếu dự thi: ' + insertError.message);
    }

    toast.success(`Tạo thành công ${examTickets.length} phiếu dự thi!`);
  } catch (error: any) {
    console.error('Error creating exam tickets:', error);
    toast.error(`Không thể tạo phiếu dự thi: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm lấy danh sách phiếu đăng ký
export const fetchRegistrationForms = async (setRegistrationForms: (forms: RegistrationForm[]) => void) => {
  try {
    const { data, error } = await supabase
      .from("phieudangki")
      .select(`
        maphieu,
        ngaydangky,
        trangthai,
        mabuoithi,
        makh,
        buoithi (
          thoigian,
          diadiem,
          macc,
          thongtinchungchi (
            tencc
          )
        ),
        khachhang (
          makh,
          loaikh,
          khachhang_cn (hoten, cccd, email, sdt),
          khachhang_dv (tendv, madv, email, sdt)
        )
      `);

    if (error) throw error;

    if (!data || data.length === 0) {
      setRegistrationForms([]);
      return;
    }

    const forms: RegistrationForm[] = (data as unknown as SupabaseRegistrationForm[]).map((item) => {
      const khachHang = item.khachhang;
      const customerName = khachHang
        ? khachHang.loaikh === "CaNhan"
          ? khachHang.khachhang_cn?.hoten || "N/A"
          : khachHang.khachhang_dv?.tendv || "N/A"
        : "N/A";

      const customerType = khachHang
        ? khachHang.loaikh === "CaNhan"
          ? "Cá nhân"
          : "Đơn vị"
        : "N/A";

      return {
        id: item.maphieu,
        customerName,
        customerType,
        examDate: item.buoithi?.thoigian
          ? new Date(item.buoithi.thoigian).toLocaleDateString("vi-VN")
          : "N/A",
        certificate: item.buoithi?.thongtinchungchi?.tencc || "N/A",
        status: item.trangthai || "Chờ duyệt",
        createdAt: item.ngaydangky
          ? new Date(item.ngaydangky).toLocaleDateString("vi-VN")
          : "N/A",
      };
    });

    setRegistrationForms(forms);
  } catch (error: any) {
    console.error("Error fetching registration forms:", error);
    toast.error(`Không thể tải danh sách phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm cập nhật trạng thái phiếu đăng ký
export const updateRegistrationFormStatus = async (
  id: string,
  newStatus: string,
  setRegistrationForms: (forms: RegistrationForm[]) => void,
  setExamTicketsDialogOpen: (open: boolean) => void,
  setCreatedExamTickets: (tickets: ExamTicket[]) => void
) => {
  try {
    // Cập nhật trạng thái phiếu đăng ký
    const { error: updateError } = await supabase
      .from("phieudangki")
      .update({ trangthai: newStatus })
      .eq("maphieu", id);

    if (updateError) throw updateError;

    // Nếu trạng thái mới là "Đã duyệt", tạo phiếu dự thi và hiển thị pop-up
    if (newStatus === "Đã duyệt") {
      const examTickets = await createExamTickets(id);
      if (examTickets.length > 0) {
        setCreatedExamTickets(examTickets);
        setExamTicketsDialogOpen(true);
      }
    }

    // Tải lại danh sách phiếu đăng ký
    await fetchRegistrationForms(setRegistrationForms);

    toast.success(`Cập nhật trạng thái phiếu đăng ký ${id} thành công!`);
  } catch (error: any) {
    console.error("Error updating registration form status:", error);
    toast.error(`Không thể cập nhật trạng thái phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};