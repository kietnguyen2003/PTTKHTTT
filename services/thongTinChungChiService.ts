
// services/thongTinChungChiService.ts
import { CertificateList } from "@/types/CertificateTypes";
import { supabase } from "../lib/supabase/supabaseClient";
import { toast } from "sonner";

export async function fetchCertificateList(setCertificateList: (certificates: CertificateList[]) => void) {
  try {
    const { data, error } = await supabase
      .from("thongtinchungchi")
      .select(`
        macc,
        tencc,
        thoigianthi,
        giatien
      `)
      .order("tencc", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      toast.info("Không có chứng chỉ nào được tìm thấy.");
      setCertificateList([]);
      return;
    }

    const certificates: CertificateList[] = data.map((item) => ({
      macc: item.macc,
      tencc: item.tencc,
      thoigianthi: item.thoigianthi,
      giatien: item.giatien,
    }));

    console.log("Fetched certificate list:", certificates);
    setCertificateList(certificates);
  } catch (error: any) {
    console.error("Error fetching certificate list:", error.message || error);
    toast.error(`Không thể tải danh sách chứng chỉ: ${error.message || "Lỗi không xác định"}`);
  }
}