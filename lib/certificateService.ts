
import { supabase } from "./supabase/supabaseClient";
import { toast } from "react-toastify";

export interface CertificateList {
  macc: string;
  tencc: string;
  thoigianthi: string;
  giatien: number;
}

export const fetchCertificateList = async (setCertificateList: (customers: CertificateList[]) => void) => {
  try {
    const { data, error } = await supabase
      .from("thongtinchungchi")
      .select(`
        macc,
        tencc,
        thoigianthi,
        giatien
      `);
    console.log("Certificate list data:", data);

    setCertificateList(data || []);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching certificate list:", error);
    toast.error("Không thể tải danh sách chứng chỉ");
    return null;
  }
}