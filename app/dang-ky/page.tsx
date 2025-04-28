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
import { Customer, fetchIndividualCustomers, fetchOrganizationCustomers } from "@/lib/customerService"
import { DateList, fetchDateList } from "@/lib/dateService"
import { CertificateList, fetchCertificateList, RegistrationData } from "@/lib/certificateService"
import { supabase } from "@/lib/supabase/supabaseClient"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

  const handleSearch = () => {
    const sourceCustomers = customerType === "individual" ? individualCustomers : organizationCustomers
    const filtered = sourceCustomers.filter((customer) =>
      customer.makh.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setSelectedCustomer(filtered[0] || null)
    setSearchPerformed(true)
  }

  const handleSubmit = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!selectedCustomer) {
      toast.error("Vui lòng chọn khách hàng trước khi đăng ký.")
      return
    }

    if (!registrationData) {
      toast.error("Vui lòng điền đầy đủ thông tin đăng ký.")
      return
    }

    if (!registrationData.examId) {
      toast.error("Vui lòng chọn buổi thi.")
      return
    }

    if (!registrationData.certificateId) {
      toast.error("Vui lòng chọn loại chứng chỉ.")
      return
    }

    if (customerType === "individual") {
      if (!registrationData.hoten || !registrationData.dob || !registrationData.gender) {
        toast.error("Vui lòng điền đầy đủ thông tin thí sinh (họ tên, ngày sinh, giới tính).")
        return
      }
    } else {
      if (!registrationData.candidateCount || registrationData.candidateCount <= 0) {
        toast.error("Vui lòng nhập số lượng thí sinh hợp lệ.")
        return
      }
      if (!registrationData.venue) {
        toast.error("Vui lòng nhập địa điểm tổ chức.")
        return
      }

      // Kiểm tra số lượng thí sinh còn lại
      const { data: examData, error: examError } = await supabase
        .from("buoithi")
        .select("soluongthisinh")
        .eq("mabuoithi", registrationData.examId)
        .single()

      if (examError) {
        toast.error("Lỗi kiểm tra sức chứa buổi thi.")
        return
      }

      const { data: registeredData, error: regError } = await supabase
        .from("phieudangkichitiet")
        .select("soluongthisinh")
        .in(
          "maphieu",
          (await supabase
            .from("phieudangki")
            .select("maphieu")
            .eq("mabuoithi", registrationData.examId)
          ).data?.map(p => p.maphieu) || []
        )

      if (regError) {
        toast.error("Lỗi kiểm tra số lượng thí sinh đã đăng ký.")
        return
      }

      const totalRegistered = registeredData.reduce(
        (sum, item) => sum + (item.soluongthisinh || 0),
        0
      )
      const remaining = examData.soluongthisinh - totalRegistered
      if (registrationData.candidateCount > remaining) {
        toast.error(`Số lượng thí sinh vượt quá số chỗ còn lại (${remaining}).`)
        return
      }
    }

    setSubmitting(true)

    try {
      // Kiểm tra xem thí sinh đã đăng ký thi chưa
      const { data: existingRegistration, error: checkRegistrationError } = await supabase
        .from("phieudangki")
        .select(`
          maphieu,
          mabuoithi,
          phieudangkichitiet (
            mats
          )
        `)
        .eq("makh", selectedCustomer.makh)
        .eq("mabuoithi", registrationData.examId)
        .single()

      if (checkRegistrationError && checkRegistrationError.code !== "PGRST116") {
        throw new Error(`Lỗi kiểm tra đăng ký: ${checkRegistrationError.message}`)
      }

      if (existingRegistration) {
        const { data: existingExam, error: checkExamError } = await supabase
          .from("phieuduthi")
          .select("maphieu")
          .eq("makh", selectedCustomer.makh)
          .eq("mabuoithi", registrationData.examId)
          .single()

        if (checkExamError && checkExamError.code !== "PGRST116") {
          throw new Error(`Lỗi kiểm tra phiếu dự thi: ${checkExamError.message}`)
        }

        

        if (existingExam) {
          toast.error("Bạn đã có phiếu dự thi cho buổi thi này.")
          return
        } else {
          toast.error("Bạn đã đăng ký thi cho buổi thi này rồi.")
          return
        }
      }

      // Sinh maphieu
      const maphieu = crypto.randomUUID()
      let mats: string

      if (customerType === "individual") {
        const { data: existingTS, error: checkTSError } = await supabase
          .from("thongtinthisinh")
          .select("mats")
          .eq("makh", selectedCustomer.makh)
          .single()

        if (checkTSError && checkTSError.code !== "PGRST116") {
          throw new Error(`Lỗi kiểm tra thông tin thí sinh: ${checkTSError.message}`)
        }

        if (existingTS) {
          mats = existingTS.mats
        } else {
          const { data: tsData, error: tsError } = await supabase
            .rpc("generate_mats")
            .single()

          if (tsError) throw new Error(`Lỗi sinh mã thí sinh: ${tsError.message}`)
          mats = tsData as string

          const { error: insertTsError } = await supabase
            .from("thongtinthisinh")
            .insert({
              mats: mats,
              makh: selectedCustomer.makh,
              hoten: registrationData.hoten,
              ngaysinh: registrationData.dob,
              gioitinh: registrationData.gender === "male" ? "Nam" : "Nữ",
            })

          if (insertTsError) throw new Error(`Lỗi thêm thông tin thí sinh: ${insertTsError.message}`)
        }
      } else {
        const { data: tsData, error: tsError } = await supabase
          .rpc("generate_mats")
          .single()

        if (tsError) throw new Error(`Lỗi sinh mã thí sinh: ${tsError.message}`)
        mats = tsData as string

        const { error: insertTsError } = await supabase
          .from("thongtinthisinh")
          .insert({
            mats: mats,
            makh: selectedCustomer.makh,
            hoten: `Tổ chức: ${selectedCustomer.tendv}`,
          })

        if (insertTsError) throw new Error(`Lỗi thêm thông tin thí sinh: ${insertTsError.message}`)
      }

      const { error: phieuError } = await supabase
        .from("phieudangki")
        .insert({
          maphieu: maphieu,
          makh: selectedCustomer.makh,
          mabuoithi: registrationData.examId,
          ngaydangky: new Date().toISOString(),
        })

      if (phieuError) throw new Error(`Lỗi thêm phiếu đăng ký: ${phieuError.message}`)

      const { error: chiTietError } = await supabase
        .from("phieudangkichitiet")
        .insert({
          maphieu: maphieu,
          mats: mats,
          soluongthisinh: customerType === "organization" ? registrationData.candidateCount : null,
          diadiemtochuc: customerType === "organization" ? registrationData.venue : null,
        })

      if (chiTietError) throw new Error(`Lỗi thêm chi tiết phiếu đăng ký: ${chiTietError.message}`)

      // Cập nhật soluongthisinh trong buoithi (chỉ cho DonVi)
      if (customerType === "organization" && registrationData.candidateCount) {
        const { data: examData, error: examError } = await supabase
          .from("buoithi")
          .select("soluongthisinh")
          .eq("mabuoithi", registrationData.examId)
          .single()

        if (examError) throw new Error(`Lỗi lấy thông tin buổi thi: ${examError.message}`)

        const newSoluong = examData.soluongthisinh - registrationData.candidateCount
        if (newSoluong < 0) {
          throw new Error("Số lượng thí sinh còn lại không đủ.")
        }

        const { error: updateError } = await supabase
          .from("buoithi")
          .update({ soluongthisinh: newSoluong })
          .eq("mabuoithi", registrationData.examId)

        if (updateError) throw new Error(`Lỗi cập nhật số lượng thí sinh: ${updateError.message}`)
      }

      toast.success("Lập phiếu đăng ký thành công!", {
        description: `Phiếu đăng ký đã được tạo với mã: ${maphieu}`,
      })
    } catch (error: any) {
      console.error("Error submitting registration:", error)
      toast.error(`Lập phiếu đăng ký thất bại: ${error.message || "Vui lòng thử lại"}`)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchIndividualCustomers(setIndividualCustomers),
          fetchOrganizationCustomers(setOrganizationCustomers),
          fetchDateList(setDateList),
          fetchCertificateList(setCertificateList),
        ])
      } catch (error: any) {
        console.error("Error fetching data:", error)
        toast.error(`Không thể tải dữ liệu: ${error.message || "Lỗi không xác định"}`)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    console.log("Individual Customers:", individualCustomers)
    console.log("Organization Customers:", organizationCustomers)
    console.log("Date List:", dateList)
    console.log("Certificate List:", certificateList)
  }, [individualCustomers, organizationCustomers, dateList, certificateList])

  // In page.tsx, update the return section to conditionally render the CandidateForm and ConfirmationTable
// only when a customer is selected

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
                  <Label htmlFor="customerId">Mã khách hàng</Label>
                  <div className="flex gap-2">
                    <Input
                      id="customerId"
                      placeholder="Nhập hoặc tra cứu mã khách hàng"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleSearch} size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {selectedCustomer ? (
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
              ) : (
                searchPerformed && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Không tìm thấy</AlertTitle>
                    <AlertDescription>
                      Không tìm thấy khách hàng với thông tin đã nhập. Vui lòng kiểm tra lại.
                    </AlertDescription>
                  </Alert>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Only show these sections when a customer is selected */}
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
)
}