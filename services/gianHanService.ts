// services/examExtensionService.ts
import { supabase } from "@/lib/supabase/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ExamExtensionFormData } from "@/types/ExamTypes";

// Đếm số lần gia hạn của một phiếu dự thi
export async function getExtensionCount(ticketId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("PhieuDangKiGiaHan")
      .select("*", { count: "exact", head: true })
      .eq("MaPhieuDuThi", ticketId);

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
  const { error } = await supabase.from("PhieuDangKiGiaHan").insert({
    MaPhieu: extensionId,
    MaKH: customerId,
    MaPhieuDuThi: ticketId,
    LanGiaHan: extensionCount + 1,
    NguoiLapPhieu: staffId,
    BuoiThiMoi: newExamSessionId, // Lưu trực tiếp MaBuoiThi vào cột BuoiThiMoi
    TruongHopDacBiet: specialCase,
    TrangThai: "Chờ duyệt",
  });
  console.log(error);
  if (error) {
    throw new Error(`Không thể tạo phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
  }

  toast.success(`Đã tạo phiếu gia hạn ${extensionId} thành công!`);
}