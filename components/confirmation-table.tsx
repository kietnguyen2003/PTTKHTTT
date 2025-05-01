// src/components/confirmation-table.tsx
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase/supabaseClient"
import { RegistrationData } from "@/types/RegistrationTypes";
import { Customer } from "@/types/CustomerTypes";
import { ExamDetails } from "@/types/ExamTypes";
import { CertificateDetails } from "@/types/CertificateTypes";



export default function ConfirmationTable({ 
  registrationData, 
  customer 
}: { 
  registrationData: RegistrationData | null, 
  customer: Customer | null 
}) {
  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [certificate, setCertificate] = useState<CertificateDetails | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (registrationData) {
        // Lấy thông tin lịch thi
        const { data: examData, error: examError } = await supabase
          .from("buoithi")
          .select("mabuoithi, thoigian, diadiem")
          .eq("mabuoithi", registrationData.examId)
          .single();

        if (examError) {
          console.error("Error fetching exam details:", examError);
        } else {
          setExam(examData);
        }

        // Lấy thông tin chứng chỉ
        const { data: certData, error: certError } = await supabase
          .from("thongtinchungchi")
          .select("tencc")
          .eq("macc", registrationData.certificateId)
          .single();

        if (certError) {
          console.error("Error fetching certificate details:", certError);
        } else {
          setCertificate(certData);
        }
      }
    };

    fetchDetails();
  }, [registrationData]);

  if (!registrationData || !customer) {
    return <p className="text-muted-foreground">Vui lòng điền đầy đủ thông tin để xem xác nhận.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Xác nhận thông tin đăng ký</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="bg-muted">
                Thông tin khách hàng
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium w-1/3">Loại khách hàng</TableCell>
              <TableCell>{customer.loaikh === "CaNhan" ? "Cá nhân" : "Đơn vị"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Mã khách hàng</TableCell>
              <TableCell>{customer.makh}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Tên khách hàng</TableCell>
              <TableCell>{customer.loaikh === "CaNhan" ? customer.hoten || "N/A" : customer.tendv || "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Liên hệ</TableCell>
              <TableCell>{customer.sdt || "N/A"}</TableCell>
            </TableRow>
          </TableBody>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="bg-muted">
                Thông tin thí sinh
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Mã thí sinh</TableCell>
              <TableCell>{registrationData.mats}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Họ tên</TableCell>
              <TableCell>{registrationData.hoten}</TableCell>
            </TableRow>
            {customer.loaikh === "CaNhan" && (
              <>
                <TableRow>
                  <TableCell className="font-medium">Ngày sinh</TableCell>
                  <TableCell>{registrationData.dob || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Giới tính</TableCell>
                  <TableCell>{registrationData.gender === "male" ? "Nam" : "Nữ"}</TableCell>
                </TableRow>
              </>
            )}
            {customer.loaikh === "DonVi" && (
              <>
                <TableRow>
                  <TableCell className="font-medium">Số lượng thí sinh</TableCell>
                  <TableCell>{registrationData.candidateCount || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Địa điểm tổ chức</TableCell>
                  <TableCell>{registrationData.venue || "N/A"}</TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="bg-muted">
                Thông tin lịch thi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Mã buổi thi</TableCell>
              <TableCell>{exam?.mabuoithi || "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Thời gian</TableCell>
              <TableCell>{exam?.thoigian || "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Địa điểm</TableCell>
              <TableCell>{exam?.diadiem || "N/A"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Loại chứng chỉ</TableCell>
              <TableCell>{certificate?.tencc || "N/A"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}