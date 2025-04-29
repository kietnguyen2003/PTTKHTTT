import { supabase } from "@/lib/supabase/supabaseClient";
import { StaffMember } from "@/types/MemberTypes";

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