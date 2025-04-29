"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CandidateForm from "@/components/candidate-form"
import ConfirmationTable from "@/components/confirmation-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { supabase } from "@/lib/supabase/supabaseClient"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Customer } from "@/types/CustomerTypes"
import { RegistrationData } from "@/types/RegistrationTypes"
import { DateList } from "@/types/DateTypes"
import { CertificateList } from "@/types/CertificateTypes"
import { fetchIndividualCustomers, fetchOrganizationCustomers } from "@/services/khachHangService"
import { fetchDateList } from "@/services/buoiThiService"
import { fetchCertificateList } from "@/services/thongTinChungChiService"

export default function DangKyPage() {
  const [individualCustomers, setIndividualCustomers] = useState<Customer[]>([])
  const [organizationCustomers, setOrganizationCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [customerType, setCustomerType] = useState("individual")
  const [dateList, setDateList] = useState<DateList[]>([])
  const [certificateList, setCertificateList] = useState<CertificateList[]>([])
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [searchResults, setSearchResults] = useState<Customer[]>([])

  const handleSearch = () => {
    const sourceCustomers = customerType === "individual" ? individualCustomers : organizationCustomers;
    const filtered = sourceCustomers.filter((customer) => {
      if (customerType === "individual") {
        return customer.hoten?.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return customer.tendv?.toLowerCase().includes(searchTerm.toLowerCase());
      }
    });

    setSearchResults(filtered);
    setSelectedCustomer(null);
    setSearchPerformed(true);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      console.log("Error: Vui lòng chọn khách hàng trước khi đăng ký.");
      return;
    }
  
    if (!registrationData) {
      console.log("Error: Vui lòng điền đầy đủ thông tin đăng ký.");
      return;
    }
  
    if (!registrationData.examId) {
      console.log("Error: Vui lòng chọn buổi thi.");
      return;
    }
  
    if (!registrationData.certificateId) {
      console.log("Error: Vui lòng chọn loại chứng chỉ.");
      return;
    }
  
    // Kiểm tra và sử dụng examId (MaBuoiThi là VARCHAR trong schema)
    const maBuoiThi = registrationData.examId;
    if (!maBuoiThi || typeof maBuoiThi !== "string") {
      console.log("Error: Buổi thi không hợp lệ. Vui lòng chọn lại buổi thi.");
      return;
    }
  
    // Kiểm tra và sử dụng certificateId (MaCC là VARCHAR trong schema)
    const maCC = registrationData.certificateId;
    if (!maCC || typeof maCC !== "string") {
      console.log("Error: Loại chứng chỉ không hợp lệ. Vui lòng chọn lại loại chứng chỉ.");
      return;
    }
  
    if (customerType === "individual") {
      if (!registrationData.hoten || !registrationData.dob || !registrationData.gender) {
        console.log("Error: Vui lòng điền đầy đủ thông tin thí sinh (họ tên, ngày sinh, giới tính).");
        return;
      }
    } else {
      if (!registrationData.candidateCount || registrationData.candidateCount <= 0) {
        console.log("Error: Vui lòng nhập số lượng thí sinh hợp lệ.");
        return;
      }
      if (!registrationData.venue) {
        console.log("Error: Vui lòng nhập địa điểm tổ chức.");
        return;
      }
  
      // Kiểm tra số lượng thí sinh còn lại
      const { data: examData, error: examError } = await supabase
        .from("buoithi")
        .select("soluongthisinh")
        .eq("mabuoithi", maBuoiThi)
        .single();
  
      if (examError) {
        console.log("Error: Lỗi kiểm tra sức chứa buổi thi.", examError);
        return;
      }
  
      // Kiểm tra số lượng thí sinh đã đăng ký từ PhieuDuThi
      const { data: registeredData, error: regError } = await supabase
        .from("phieuduthi")
        .select("maphieu")
        .eq("mabuoithi", maBuoiThi);
  
      if (regError) {
        console.log("Error: Lỗi kiểm tra số lượng thí sinh đã đăng ký.", regError);
        return;
      }
  
      const totalRegistered = registeredData.length;
      const remaining = examData.soluongthisinh - totalRegistered;
      if (registrationData.candidateCount > remaining) {
        console.log(`Error: Số lượng thí sinh vượt quá số chỗ còn lại (${remaining}).`);
        return;
      }
    }
  
    setSubmitting(true);
  
    try {
      // Kiểm tra xem khách hàng đã đăng ký thi chưa
      const { data: existingRegistration, error: checkRegistrationError } = await supabase
        .from("phieudangki")
        .select("maphieu")
        .eq("makh", selectedCustomer.makh)
        .eq("mabuoithi", maBuoiThi)
        .single();
  
      if (checkRegistrationError && checkRegistrationError.code !== "PGRST116") {
        throw new Error(`Lỗi kiểm tra đăng ký: ${checkRegistrationError.message}`);
      }
  
      if (existingRegistration) {
        const { data: existingExam, error: checkExamError } = await supabase
          .from("phieuduthi")
          .select("maphieu")
          .eq("makh", selectedCustomer.makh)
          .eq("mabuoithi", maBuoiThi);
  
        if (checkExamError && checkExamError.code !== "PGRST116") {
          throw new Error(`Lỗi kiểm tra phiếu dự thi: ${checkExamError.message}`);
        }
  
        if (existingExam && existingExam.length > 0) {
          console.log("Error: Bạn đã có phiếu dự thi cho buổi thi này.");
          return;
        } else {
          console.log("Error: Bạn đã đăng ký thi cho buổi thi này rồi.");
          return;
        }
      }
  
      // Sinh MaPhieu dạng chuỗi UUID
      const maPhieu = "PDK" + crypto.randomUUID();
  
      let maTS: string;
      let candidates: { mats: string; makh: string; hoten: string }[] = []; // Khai báo candidates ở phạm vi ngoài
  
      if (customerType === "individual") {
        const { data: existingTS, error: checkTSError } = await supabase
          .from("thongtinthisinh")
          .select("mats")
          .eq("makh", selectedCustomer.makh)
          .single();
  
        if (checkTSError && checkTSError.code !== "PGRST116") {
          throw new Error(`Lỗi kiểm tra thông tin thí sinh: ${checkTSError.message}`);
        }
  
        if (existingTS) {
          maTS = existingTS.mats;
        } else {
          const { data: tsData, error: tsError } = await supabase
            .rpc("generate_mats")
            .single();
  
          if (tsError) throw new Error(`Lỗi sinh mã thí sinh: ${tsError.message}`);
          maTS = tsData as string;
  
          const { error: insertTsError } = await supabase
            .from("thongtinthisinh")
            .insert({
              mats: maTS,
              makh: selectedCustomer.makh,
              hoten: registrationData.hoten,
              ngaysinh: registrationData.dob,
              gioitinh: registrationData.gender === "male" ? "Nam" : "Nữ",
            });
  
          if (insertTsError) throw new Error(`Lỗi thêm thông tin thí sinh: ${insertTsError.message}`);
        }
      } else {
        const candidateCount = registrationData.candidateCount || 0;
        candidates = []; // Gán lại giá trị để TypeScript biết candidates được khởi tạo
  
        for (let i = 0; i < candidateCount; i++) {
          const { data: tsData, error: tsError } = await supabase
            .rpc("generate_mats")
            .single();
  
          if (tsError) throw new Error(`Lỗi sinh mã thí sinh: ${tsError.message}`);
          const newMaTS = tsData as string;
  
          candidates.push({
            mats: newMaTS,
            makh: selectedCustomer.makh,
            hoten: `Thí sinh ${i + 1} - Tổ chức: ${selectedCustomer.tendv}`,
          });
        }
  
        const { error: insertTsError } = await supabase
          .from("thongtinthisinh")
          .insert(candidates);
  
        if (insertTsError) throw new Error(`Lỗi thêm thông tin thí sinh: ${insertTsError.message}`);
  
        maTS = candidates[0].mats; // Lưu MaTS đầu tiên để sử dụng nếu cần
      }
  
      // Thêm phiếu đăng ký
      const { error: phieuError } = await supabase
        .from("phieudangki")
        .insert({
          maphieu: maPhieu,
          makh: selectedCustomer.makh,
          mabuoithi: maBuoiThi,
          ngaydangky: new Date().toISOString(),
        });
  
      if (phieuError) throw new Error(`Lỗi thêm phiếu đăng ký: ${phieuError.message}`);
  
      // Tạo phiếu dự thi (PhieuDuThi) cho từng thí sinh
      if (customerType === "individual") {
        const maPhieuDuThi = crypto.randomUUID();
        const soBaoDanh = `SBD-${crypto.randomUUID().split("-")[0]}`; // Sinh SoBaoDanh dạng chuỗi
  
        const { error: insertPhieuDuThiError } = await supabase
          .from("phieuduthi")
          .insert({
            maphieu: maPhieuDuThi,
            sobaodanh: soBaoDanh,
            makh: selectedCustomer.makh,
            mats: maTS,
            maphieudangki: maPhieu,
            mabuoithi: maBuoiThi,
            macc: maCC, // Sử dụng trực tiếp chuỗi maCC
            maphong: null,
            status: "chua_thi",
          });
  
        if (insertPhieuDuThiError) throw new Error(`Lỗi thêm phiếu dự thi: ${insertPhieuDuThiError.message}`);
      } else {
        const candidateCount = registrationData.candidateCount || 0;
        const phieuDuThiList = [];
  
        for (let i = 0; i < candidateCount; i++) {
          const maPhieuDuThi = crypto.randomUUID();
          const soBaoDanh = `SBD-${crypto.randomUUID().split("-")[0]}`; // Sinh SoBaoDanh dạng chuỗi
  
          phieuDuThiList.push({
            maphieu: maPhieuDuThi,
            sobaodanh: soBaoDanh,
            makh: selectedCustomer.makh,
            mats: candidates[i].mats, // candidates giờ đã được khai báo đúng phạm vi
            maphieudangki: maPhieu,
            mabuoithi: maBuoiThi,
            macc: maCC, // Sử dụng trực tiếp chuỗi maCC
            maphong: null,
          });
        }
  
        const { error: insertPhieuDuThiError } = await supabase
          .from("phieuduthi")
          .insert(phieuDuThiList);
  
        if (insertPhieuDuThiError) throw new Error(`Lỗi thêm phiếu dự thi: ${insertPhieuDuThiError.message}`);
      }
  
      console.log("Success: Lập phiếu đăng ký thành công!", {
        description: `Phiếu đăng ký đã được tạo với mã: ${maPhieu}`,
      });
    } catch (error: any) {
      console.error("Error submitting registration:", error);
      console.error(`Lập phiếu đăng ký thất bại: ${error.message || "Vui lòng thử lại"}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchIndividualCustomers(setIndividualCustomers),
          fetchOrganizationCustomers(setOrganizationCustomers),
          fetchDateList(setDateList),
          fetchCertificateList(setCertificateList),
        ]);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(`Không thể tải dữ liệu: ${error.message || "Lỗi không xác định"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log("Individual Customers:", individualCustomers);
    console.log("Organization Customers:", organizationCustomers);
    console.log("Date List:", dateList);
    console.log("Certificate List:", certificateList);
  }, [individualCustomers, organizationCustomers, dateList, certificateList]);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lập Phiếu Đăng Ký Kiểm Tra</h1>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Chọn khách hàng</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerType">Loại khách hàng</Label>
                    <Select value={customerType} onValueChange={setCustomerType}>
                      <SelectTrigger id="customerType">
                        <SelectValue placeholder="Chọn loại khách hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Cá nhân</SelectItem>
                        <SelectItem value="organization">Đơn vị</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerId">Tìm kiếm khách hàng</Label>
                    <div className="flex gap-2">
                      <Input
                        id="customerId"
                        placeholder={customerType === "individual" ? "Nhập tên khách hàng" : "Nhập tên đơn vị"}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline" onClick={handleSearch} size="icon">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {searchResults.length > 0 && (
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-2">Kết quả tìm kiếm:</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.map((customer) => (
                        <div
                          key={customer.makh}
                          className="p-2 rounded hover:bg-accent cursor-pointer flex justify-between items-center"
                          onClick={() => handleSelectCustomer(customer)}
                        >
                          <div>
                            <p className="font-medium">
                              {customerType === "individual" ? customer.hoten : customer.tendv}
                            </p>
                            <p className="text-sm text-muted-foreground">Mã: {customer.makh}</p>
                          </div>
                          <Button variant="ghost" size="sm">Chọn</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchPerformed && searchResults.length === 0 && !selectedCustomer && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Không tìm thấy</AlertTitle>
                    <AlertDescription>
                      Không tìm thấy khách hàng với thông tin đã nhập. Vui lòng kiểm tra lại.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedCustomer && (
                  <div className="rounded-md border p-4 bg-muted/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mã khách hàng</p>
                        <p className="font-medium">{selectedCustomer.makh}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Loại khách hàng</p>
                        <p className="font-medium">
                          {selectedCustomer.loaikh === "CaNhan" ? "Cá nhân" : "Đơn vị"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {selectedCustomer.loaikh === "CaNhan" ? "Họ tên" : "Tên đơn vị"}
                        </p>
                        <p className="font-medium">
                          {selectedCustomer.loaikh === "CaNhan"
                            ? selectedCustomer.hoten || "N/A"
                            : selectedCustomer.tendv || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                        <p className="font-medium">{selectedCustomer.sdt || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedCustomer && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <CandidateForm
                    selectedCustomer={selectedCustomer}
                    dateList={dateList}
                    certificateList={certificateList}
                    setRegistrationData={setRegistrationData}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <ConfirmationTable registrationData={registrationData} customer={selectedCustomer} />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRegistrationData(null)}>
                  Làm mới
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setRegistrationData(null);
                    setSearchResults([]);
                    setSearchPerformed(false);
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Đang xử lý..." : "Lập phiếu đăng ký"}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}