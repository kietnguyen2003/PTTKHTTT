// services/ketQuaThiService.ts
import { ChungChiStatus } from "@/types/ExamResultTypes";
import { supabase } from "../lib/supabase/supabaseClient";

export const saveExamResults = async (
  soBaoDanh: string,
  score: number,
  nguoiCham: string,
  giamThi: string,
  trangThai: ChungChiStatus
) => {
  try {
    // Kiểm tra kết quả thi đã tồn tại chưa
    const { data: existing } = await supabase
      .from("ketquathi")
      .select("mabaithi")
      .eq("sobaodanh", soBaoDanh)
      .single();
    if (existing) {
      throw new Error("Kết quả thi cho số báo danh này đã tồn tại.");
    }

    // Thêm vào bảng ketquathi
    const { error: ketQuaError } = await supabase.from("ketquathi").insert([
      {
        mabaithi: `KQT${Date.now()}`,
        sobaodanh: soBaoDanh,
        diemthi: score,
        nguoicham: nguoiCham,
        giamthi: giamThi,
      },
    ]);

    if (ketQuaError) throw ketQuaError;

    // Lấy macc từ bảng phieuduthi
    const { data: phieuDuThi, error: phieuError } = await supabase
      .from("phieuduthi")
      .select("macc")
      .eq("sobaodanh", soBaoDanh)
      .single();

    if (phieuError || !phieuDuThi) throw new Error("Không tìm thấy phiếu dự thi.");

    // Thêm vào bảng bangtinh
    const { error: bangTinhError } = await supabase.from("bangtinh").insert([
      {
        sobaodanh: soBaoDanh,
        diemthi: score,
        macc: phieuDuThi.macc,
        ngaycap: new Date().toISOString(),
        nguoinhap: "NV001",
        trangthai: trangThai,
      },
    ]);

    if (bangTinhError) throw bangTinhError;

    return true;
  } catch (error: any) {
    console.error("Error saving results:", error);
    throw new Error("Lỗi khi lưu kết quả thi: " + error.message);
  }
};