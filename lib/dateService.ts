
import { set } from "date-fns";
import { supabase } from "./supabase/supabaseClient";
import { toast } from "react-toastify";

export interface DateList {
  mabuoithi: string;
  macc: string;
  soluongthisinh: number;
  diadiem: string;
  thoigian: string;
  trangthai: string;
}

export const fetchDateList = async ( setDateList: (customers: DateList[]) => void ) => {
  try {
    const { data, error } = await supabase
      .from("buoithi")
      .select(`
        mabuoithi,
        macc,
        soluongthisinh,
        diadiem,
        thoigian,
        trangthai
      `);
    console.log("Date list data:", data);

    setDateList(data || []);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching date list:", error);
    toast.error("Không thể tải danh sách lịch thi");
    return null;
  }
}