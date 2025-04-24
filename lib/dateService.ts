// lib/dateService.ts
import { supabase } from "./supabase/supabaseClient";
import { toast } from "sonner";

export interface DateList {
  mabuoithi: string;
  thoigian: string;
  diadiem: string;
  soluongthisinh: number;
  trangthai: string;
}

export async function fetchDateList(setDateList: (dates: DateList[]) => void) {
  try {
    const { data, error } = await supabase
      .from("buoithi")
      .select(`
        mabuoithi,
        thoigian,
        diadiem,
        soluongthisinh,
        trangthai
      `)
      .order("thoigian", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      toast.info("Không có lịch thi nào được tìm thấy.");
      setDateList([]);
      return;
    }

    const dates: DateList[] = data.map((item) => ({
      mabuoithi: item.mabuoithi,
      thoigian: new Date(item.thoigian).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      diadiem: item.diadiem,
      soluongthisinh: item.soluongthisinh,
      trangthai: item.trangthai,
    }));

    console.log("Fetched date list:", dates); // Sửa cách log để hiển thị dữ liệu rõ ràng
    setDateList(dates);
  } catch (error: any) {
    console.error("Error fetching date list:", error.message || error);
    toast.error(`Không thể tải danh sách lịch thi: ${error.message || "Lỗi không xác định"}`);
  }
}