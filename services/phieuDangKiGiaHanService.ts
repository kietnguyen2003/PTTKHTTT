import { supabase } from "../lib/supabase/supabaseClient";
import { toast } from "sonner";
import { ExtensionForm } from "@/types/RegistrationTypes";
import { SupabaseExamExtension } from "@/types/ExamTypes";

// Hàm lấy danh sách phiếu gia hạn
export const fetchExtensionForms = async (setExtensionForms: (forms: ExtensionForm[]) => void) => {
  try {
    const { data, error } = await supabase
      .from('phieudangkigiahan')
      .select(`
        maphieu,
        makh,
        maphieuduthi,
        truonghopdacbiet,
        trangthai,
        created_at,
        khachhang (
          loaikh,
          khachhang_cn (hoten),
          khachhang_dv (tendv)
        ),
        phieuduthi (
          maphieu,
          mabuoithi,
          buoithi (
            thoigian,
            diadiem,
            macc,
            thongtinchungchi (
              tencc
            )
          )
        ),
        buoithimoi (
          mabuoithi,
          thoigian,
          diadiem,
          macc,
          thongtinchungchi (
            tencc
          )
        )
      `);

    if (error) {
      console.log("Error: ", error);
      throw error;
    }

    if (!data || data.length === 0) {
      setExtensionForms([]);
      return;
    }
    console.log("Data: ", data);

    const forms: ExtensionForm[] = data.map((item) => {
      const khachHang = item.khachhang;
      const customerName = khachHang
        ? khachHang.loaikh === 'CaNhan'
          ? khachHang.khachhang_cn?.hoten || 'N/A'
          : khachHang.khachhang_dv?.tendv || 'N/A'
        : 'N/A';

      return {
        id: item.maphieu,
        customerName,
        examTicket: item.maphieuduthi || 'N/A',
        oldDate: item.phieuduthi?.buoithi?.thoigian
          ? new Date(item.phieuduthi.buoithi.thoigian).toLocaleDateString('vi-VN')
          : 'N/A',
        newDate: item.buoithimoi?.thoigian
          ? new Date(item.buoithimoi.thoigian).toLocaleDateString('vi-VN')
          : 'N/A',
        reason: item.truonghopdacbiet ? 'Trường hợp đặc biệt' : 'Không có lý do đặc biệt',
        status: item.trangthai || 'Chờ duyệt',
        createdAt: item.created_at
          ? new Date(item.created_at).toLocaleDateString('vi-VN')
          : 'N/A',
      };
    });

    setExtensionForms(forms);
  } catch (error: any) {
    console.error('Error fetching extension forms:', error);
    if (error.code === 'PGRST200' && error.message.includes('Could not find a relationship')) {
      toast.error('Không thể tìm thấy mối quan hệ giữa bảng phieudangkigiahan và khachhang. Vui lòng kiểm tra cơ sở dữ liệu.');
    } else {
      toast.error(`Không thể tải danh sách phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
    }
  }
};

// Hàm cập nhật trạng thái phiếu gia hạn
export const updateExtensionFormStatus = async (
  id: string,
  newStatus: string,
  setExtensionForms: (forms: ExtensionForm[]) => void
) => {
  try {
    // Lấy thông tin phiếu gia hạn và buổi thi mới
    const { data: extensionData, error: extensionError } = await supabase
      .from('phieudangkigiahan')
      .select(`
        maphieuduthi,
        buoithimoi,
        buoithimoi:buoithimoi (
          mabuoithi,
          thoigian,
          diadiem
        )
      `)
      .eq('maphieu', id)
      .single();

    if (extensionError || !extensionData) {
      throw new Error(extensionError?.message || 'Không tìm thấy phiếu gia hạn');
    }

    const maPhieuDuThi = extensionData.maphieuduthi;

    // Lấy thông tin phiếu dự thi
    const { data: examTicketData, error: examTicketError } = await supabase
      .from('phieuduthi')
      .select(`
        makh,
        mabuoithi
      `)
      .eq('maphieu', maPhieuDuThi)
      .single();

    if (examTicketError || !examTicketData) {
      throw new Error(examTicketError?.message || 'Không tìm thấy phiếu dự thi');
    }

    const maKH = examTicketData.makh;
    const maBuoiThiCu = examTicketData.mabuoithi;

    // Kiểm tra trạng thái phiếu đăng ký
    const { data: registrationData, error: registrationError } = await supabase
      .from('phieudangki')
      .select('trangthai, maphieu')
      .eq('makh', maKH)
      .eq('mabuoithi', maBuoiThiCu)
      .single();

    if (registrationError || !registrationData) {
      throw new Error(registrationError?.message || 'Không tìm thấy phiếu đăng ký liên quan');
    }

    if (registrationData.trangthai !== 'Đã duyệt') {
      toast.error('Cần duyệt phiếu đăng ký');
      return;
    }

    // Cập nhật trạng thái phiếu gia hạn
    const { error: updateError } = await supabase
      .from('phieudangkigiahan')
      .update({ trangthai: newStatus })
      .eq('maphieu', id);

    if (updateError) throw updateError;

    // Nếu trạng thái là "Đã duyệt", cập nhật buổi thi mới cho phiếu dự thi
    if (newStatus === 'Đã duyệt') {
      const maBuoiThiMoi = extensionData.buoithimoi.mabuoithi;
      const thoiGianMoi = extensionData.buoithimoi?.thoigian;
      const diaDiemMoi = extensionData.buoithimoi?.diadiem;

      if (maPhieuDuThi && maBuoiThiMoi) {
        // Cập nhật MaBuoiThi trong PhieuDuThi
        const { error: updateExamTicketError } = await supabase
          .from('phieuduthi')
          .update({
            mabuoithi: maBuoiThiMoi,
          })
          .eq('maphieu', maPhieuDuThi);

        if (updateExamTicketError) {
          console.error('Error updating exam ticket:', updateExamTicketError);
          throw new Error('Không thể cập nhật buổi thi của phiếu dự thi');
        }

        toast.success(`Đã cập nhật buổi thi cho phiếu dự thi ${maPhieuDuThi} thành ${new Date(thoiGianMoi).toLocaleDateString('vi-VN')}`);
      } else {
        throw new Error('Thiếu thông tin để cập nhật: MaPhieuDuThi hoặc MaBuoiThiMoi không tồn tại');
      }
    }

    // Cập nhật lại danh sách phiếu gia hạn
    await fetchExtensionForms(setExtensionForms);

    toast.success(`Cập nhật trạng thái phiếu gia hạn ${id} thành công!`);
  } catch (error: any) {
    console.error('Error updating extension form status:', error);
    toast.error(`Không thể cập nhật trạng thái phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm xóa phiếu gia hạn
export const deleteExtensionForm = async (
  id: string,
  setExtensionForms: (forms: ExtensionForm[]) => void
) => {
  try {
    const { error } = await supabase
      .from('phieudangkigiahan')
      .delete()
      .eq('maphieu', id);

    if (error) throw error;

    await fetchExtensionForms(setExtensionForms);

    toast.success(`Xóa phiếu gia hạn ${id} thành công!`);
  } catch (error: any) {
    console.error('Error deleting extension form:', error);
    toast.error(`Không thể xóa phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm lấy danh sách phiếu gia hạn với chi tiết đầy đủ
export const fetchExtensionFormsWithDetails = async (setExtensionForms: (forms: ExtensionForm[]) => void) => {
  try {
    const { data, error } = await supabase
      .from("phieudangkigiahan")
      .select(`
        maphieu,
        makh,
        maphieuduthi,
        truonghopdacbiet,
        trangthai,
        created_at,
        khachhang (
          makh,
          loaikh,
          khachhang_cn (hoten, cccd, email, sdt),
          khachhang_dv (tendv, madv, email, sdt)
        ),
        phieuduthi (
          maphieu,
          mabuoithi,
          buoithi (
            thoigian,
            diadiem,
            macc,
            thongtinchungchi (
              tencc
            )
          )
        ),
        buoithimoi (
          mabuoithi,
          thoigian,
          diadiem,
          macc,
          thongtinchungchi (
            tencc
          )
        )
      `);

    if (error) {
      console.log("Error: ", error);
      throw error;
    }

    if (!data || data.length === 0) {
      setExtensionForms([]);
      return;
    }

    const forms: ExtensionForm[] = (data as unknown as SupabaseExamExtension[]).map((item) => {
      const khachHang = item.khachhang;
      const customerName = khachHang
        ? khachHang.loaikh === "CaNhan"
          ? khachHang.khachhang_cn?.hoten || "N/A"
          : khachHang.khachhang_dv?.tendv || "N/A"
        : "N/A";

      return {
        id: item.maphieu,
        customerName,
        examTicket: item.maphieuduthi || "N/A",
        oldDate: item.phieuduthi?.buoithi?.thoigian
          ? new Date(item.phieuduthi.buoithi.thoigian).toLocaleDateString("vi-VN")
          : "N/A",
        newDate: item.buoithimoi?.thoigian
          ? new Date(item.buoithimoi.thoigian).toLocaleDateString("vi-VN")
          : "N/A",
        reason: item.truonghopdacbiet ? "Trường hợp đặc biệt" : "Không có lý do đặc biệt",
        status: item.trangthai || "Chờ duyệt",
        createdAt: item.created_at
          ? new Date(item.created_at).toLocaleDateString("vi-VN")
          : "N/A",
      };
    });

    setExtensionForms(forms);
  } catch (error: any) {
    console.error("Error fetching extension forms:", error);
    toast.error(`Không thể tải danh sách phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
  }
};