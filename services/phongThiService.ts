// services/examRoomService.ts
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "sonner";
import { ExamRoom, UnassignedCandidate, SupabaseExamRoom, SupabaseExamTicket, RoomFormData } from "@/types/ExamRoomTypes";

// Helper function: Định dạng dữ liệu từ Supabase thành ExamRoom
const formatExamRoom = (room: any): ExamRoom => ({
  maphong: room.maphong,
  tenphong: room.tenphong,
  toanha: room.toanha,
  succhua: room.succhua,
  trangthai: room.trangthai,
  ghichu: room.ghichu || "",
  soThiSinhHienTai: room.phieuduthi?.length || 0,
  thiSinh: (room.phieuduthi || []).map((pdt: any) => ({
    soBaoDanh: pdt.sobaodanh,
    hoTen:
      pdt.khachhang?.thongtinthisinh?.[0]?.hoten ||
      pdt.khachhang?.khachhang_cn?.hoten || // khachhang_cn là object, không phải mảng
      "Không có tên",
    loaiChungChi: pdt.thongtinchungchi?.tencc || "Không xác định",
  })),
});

// Helper function: Định dạng dữ liệu từ Supabase thành UnassignedCandidate
const formatUnassignedCandidate = (pdt: any): UnassignedCandidate => ({
  sobaodanh: pdt.sobaodanh,
  hoten:
    pdt.khachhang?.thongtinthisinh?.[0]?.hoten ||
    pdt.khachhang?.khachhang_cn?.hoten ||
    "Không có tên",
  tencc: pdt.thongtinchungchi?.tencc || "Không xác định",
  thoiGian: "",
});

// Lấy danh sách phòng thi
export const fetchExamRooms = async (setExamRooms: (rooms: ExamRoom[]) => void) => {
  try {
    const { data: roomsData, error: roomsError } = await supabase
      .from("phongthi")
      .select(`
        maphong,
        tenphong,
        toanha,
        succhua,
        trangthai,
        ghichu,
        phieuduthi (
          sobaodanh,
          khachhang:makh (
            thongtinthisinh (hoten),
            khachhang_cn (hoten)
          ),
          thongtinchungchi:macc (tencc)
        )
      `);

    if (roomsError) throw roomsError;

    const formattedRooms: ExamRoom[] = roomsData.map(formatExamRoom);
    setExamRooms(formattedRooms);
  } catch (error: any) {
    console.error("Error fetching exam rooms:", error);
    throw new Error(`Không thể tải danh sách phòng thi: ${error.message || "Lỗi không xác định"}`);
  }
};

// Lấy danh sách thí sinh chưa phân phòng
export const fetchUnassignedCandidates = async (
  setUnassignedCandidates: (candidates: UnassignedCandidate[]) => void,
) => {
  try {
    const { data: unassignedData, error: unassignedError } = await supabase
      .from("phieuduthi")
      .select(`
        sobaodanh,
        khachhang:makh (
          thongtinthisinh (hoten),
          khachhang_cn (hoten)
        ),
        thongtinchungchi:macc (tencc)
      `)
      .is("maphong", null);

    if (unassignedError) throw unassignedError;
    console.log("UnassignedData", unassignedData);
    const formattedUnassigned: UnassignedCandidate[] = unassignedData.map(formatUnassignedCandidate);
    setUnassignedCandidates(formattedUnassigned);
  } catch (error: any) {
    console.error("Error fetching unassigned candidates:", error);
    throw new Error(`Không thể tải danh sách thí sinh chưa phân phòng: ${error.message || "Lỗi không xác định"}`);
  }
};

// Thêm hoặc cập nhật phòng thi
export const saveExamRoom = async (
  roomData: RoomFormData,
  isUpdate: boolean,
  setExamRooms: (rooms: ExamRoom[]) => void,
) => {
  try {
    const capacity = Number.parseInt(roomData.succhua);
    if (isNaN(capacity) || capacity <= 0) {
      throw new Error("Sức chứa phải là số dương");
    }

    if (isUpdate) {
      const { error } = await supabase
        .from("phongthi")
        .update({
          tenphong: roomData.tenphong,
          toanha: roomData.toanha,
          succhua: capacity,
          trangthai: roomData.trangthai,
          ghichu: roomData.ghichu,
        })
        .eq("maphong", roomData.maphong);

      if (error) throw error;
      toast.success(`Đã cập nhật phòng thi ${roomData.maphong} thành công!`);
    } else {
      const { error } = await supabase.from("phongthi").insert([
        {
          maphong: roomData.maphong,
          tenphong: roomData.tenphong,
          toanha: roomData.toanha,
          succhua: capacity,
          trangthai: roomData.trangthai,
          ghichu: roomData.ghichu,
        },
      ]);

      if (error) throw error;
      toast.success(`Đã tạo phòng thi ${roomData.maphong} thành công!`);
    }

    // Refresh rooms
    await fetchExamRooms(setExamRooms);
  } catch (error: any) {
    console.error("Error saving exam room:", error);
    toast.error(`Không thể lưu phòng thi: ${error.message || "Lỗi không xác định"}`);
  }
};

// Xóa phòng thi
export const deleteExamRoom = async (
  room: ExamRoom,
  setExamRooms: (rooms: ExamRoom[]) => void,
) => {
  try {
    if (room.soThiSinhHienTai > 0) {
      throw new Error("Không thể xóa phòng thi đã có thí sinh. Vui lòng chuyển thí sinh sang phòng khác trước.");
    }

    const { error } = await supabase.from("phongthi").delete().eq("maphong", room.maphong);
    if (error) throw error;

    toast.success(`Đã xóa phòng thi ${room.tenphong} thành công!`);
    await fetchExamRooms(setExamRooms);
  } catch (error: any) {
    console.error("Error deleting exam room:", error);
    toast.error(`Không thể xóa phòng thi: ${error.message || "Lỗi không xác định"}`);
  }
};

// Phân phòng cho thí sinh
export const assignCandidateToRoom = async (
  sobaodanh: string,
  maphong: string,
  examRooms: ExamRoom[],
  setExamRooms: (rooms: ExamRoom[]) => void,
  setUnassignedCandidates: (candidates: UnassignedCandidate[]) => void,
) => {
  try {
    const room = examRooms.find((r) => r.maphong === maphong);
    if (!room) throw new Error("Không tìm thấy phòng thi");

    if (room.soThiSinhHienTai >= room.succhua) {
      throw new Error("Phòng thi đã đầy. Không thể thêm thí sinh.");
    }

    const { error } = await supabase
      .from("phieuduthi")
      .update({ maphong })
      .eq("sobaodanh", sobaodanh);

    if (error) throw error;

    toast.success("Đã phân phòng cho thí sinh thành công!");
    await fetchExamRooms(setExamRooms);
    await fetchUnassignedCandidates(setUnassignedCandidates);
  } catch (error: any) {
    console.error("Error assigning candidate:", error);
    toast.error(`Không thể phân phòng: ${error.message || "Lỗi không xác định"}`);
  }
};

// Chuyển thí sinh ra khỏi phòng (đưa về danh sách chưa phân phòng)
export const removeCandidateFromRoom = async (
  sobaodanh: string,
  setExamRooms: (rooms: ExamRoom[]) => void,
  setUnassignedCandidates: (candidates: UnassignedCandidate[]) => void,
) => {
  try {
    const { error } = await supabase
      .from("phieuduthi")
      .update({ maphong: null })
      .eq("sobaodanh", sobaodanh);

    if (error) throw error;

    toast.success("Đã chuyển thí sinh sang danh sách chưa phân phòng!");
    await fetchExamRooms(setExamRooms);
    await fetchUnassignedCandidates(setUnassignedCandidates);
  } catch (error: any) {
    console.error("Error removing candidate:", error);
    toast.error(`Không thể chuyển thí sinh: ${error.message || "Lỗi không xác định"}`);
  }
};

// Cập nhật trạng thái phòng thi (bảo trì/sẵn sàng)
export const updateRoomStatus = async (
  maphong: string,
  newStatus: "available" | "maintenance",
  setSelectedRoom: (room: ExamRoom | null) => void,
  currentRoom: ExamRoom,
) => {
  try {
    const { error } = await supabase
      .from("phongthi")
      .update({ trangthai: newStatus })
      .eq("maphong", maphong);

    if (error) throw error;

    setSelectedRoom({ ...currentRoom, trangthai: newStatus });
    toast.success(
      newStatus === "maintenance"
        ? `Đã đánh dấu phòng ${maphong} đang bảo trì!`
        : `Đã kết thúc bảo trì phòng ${maphong}!`,
    );
  } catch (error: any) {
    console.error("Error updating room status:", error);
    toast.error(`Không thể cập nhật trạng thái phòng: ${error.message || "Lỗi không xác định"}`);
  }
};