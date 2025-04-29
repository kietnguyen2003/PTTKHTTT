"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, AlertCircle } from "lucide-react"

import { supabase } from "@/lib/supabase/supabaseClient"
import { toast } from "sonner"
import { CertificateList } from "@/types/CertificateTypes"
import { DateList } from "@/types/DateTypes"
import { Customer } from "@/types/CustomerTypes"
import { RegistrationData } from "@/types/RegistrationTypes"

interface CandidateFormProps {
  selectedCustomer: Customer | null
  dateList: DateList[]
  certificateList: CertificateList[]
  setRegistrationData: (data: RegistrationData) => void
}

export default function CandidateForm({
  selectedCustomer,
  dateList,
  certificateList,
  setRegistrationData,
}: CandidateFormProps) {
  const [showIndividualForm, setShowIndividualForm] = useState(true)
  const [formData, setFormData] = useState<RegistrationData>({
    mats: "",
    hoten: "",
    dob: "",
    gender: "",
    candidateCount: null,
    venue: null,
    certificateId: "",
    examId: "",
  })
  const [filteredDateList, setFilteredDateList] = useState<DateList[]>([])
  const [loadingDates, setLoadingDates] = useState(false)

  // Đồng bộ form khi thay đổi selectedCustomer
  useEffect(() => {
    if (selectedCustomer) {
      setShowIndividualForm(selectedCustomer.loaikh === "CaNhan")
      setFormData((prev) => ({
        ...prev,
        hoten: selectedCustomer.loaikh === "CaNhan" ? selectedCustomer.hoten || "" : selectedCustomer.tendv || "",
      }))
      setRegistrationData({
        ...formData,
        hoten: selectedCustomer.loaikh === "CaNhan" ? selectedCustomer.hoten || "" : selectedCustomer.tendv || "",
      })
    }
  }, [selectedCustomer])

  // Lọc lịch thi khi thay đổi certificateId
  useEffect(() => {
    if (formData.certificateId) {
      const fetchFilteredDateList = async () => {
        setLoadingDates(true)
        try {
          const { data, error } = await supabase
            .from("buoithi")
            .select(`
              mabuoithi,
              thoigian,
              diadiem,
              soluongthisinh,
              trangthai,
              macc
            `)
            .eq("macc", formData.certificateId)
            .eq("trangthai", "ChuaToChuc")
            .order("thoigian", { ascending: true })

          if (error) {
            throw new Error(`Lỗi tải lịch thi: ${error.message}`)
          }

          const formattedDates: DateList[] = data.map((item) => ({
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
          }))

          setFilteredDateList(formattedDates)
          if (formattedDates.length === 0) {
            toast.info("Không có lịch thi nào cho chứng chỉ đã chọn.")
          }
        } catch (error: any) {
          toast.error(error.message)
          setFilteredDateList([])
        } finally {
          setLoadingDates(false)
        }
      }

      fetchFilteredDateList()
    } else {
      setFilteredDateList(dateList)
    }
  }, [formData.certificateId, dateList])

  // Xử lý thay đổi input
  const handleInputChange = async (field: keyof RegistrationData, value: string | number | null) => {
    let error = null

    if (field === "dob" && value) {
      const dobDate = new Date(value as string)
      const today = new Date()
      if (isNaN(dobDate.getTime()) || dobDate > today) {
        error = "Ngày sinh không hợp lệ."
      }
    }

    if (field === "candidateCount" && value !== null && !showIndividualForm) {
      const count = Number(value)
      if (count <= 0) {
        error = "Số lượng thí sinh phải lớn hơn 0."
      } else if (formData.examId) {
        // Lấy sức chứa tối đa của buổi thi
        const { data: examData, error: examError } = await supabase
          .from("buoithi")
          .select("soluongthisinh")
          .eq("mabuoithi", formData.examId)
          .single()

        if (examError) {
          error = "Lỗi kiểm tra sức chứa buổi thi."
        } else {
          // Lấy tổng số lượng thí sinh đã đăng ký
          const { data: registeredData, error: regError } = await supabase
            .from("phieudangkichitiet")
            .select("soluongthisinh")
            .in(
              "maphieu",
              await supabase
                .from("phieudangki")
                .select("maphieu")
                .eq("mabuoithi", formData.examId)
                .then(result => result.data?.map(row => row.maphieu) || [])
            )

          if (regError) {
            error = "Lỗi kiểm tra số lượng thí sinh đã đăng ký."
          } else {
            const totalRegistered = registeredData.reduce(
              (sum, item) => sum + (item.soluongthisinh || 0),
              0
            )
            const remaining = examData.soluongthisinh - totalRegistered
            if (count > remaining) {
              error = `Số lượng thí sinh vượt quá số chỗ còn lại (${remaining}).`
            }
          }
        }
      }
    }

    if (field === "venue" && !value && !showIndividualForm) {
      error = "Địa điểm tổ chức không được để trống."
    }

    if (error) {
      toast.error(error)
      return
    }

    const updatedFormData = { ...formData, [field]: value }
    setFormData(updatedFormData)
    setRegistrationData(updatedFormData)
  }

  // Xử lý kiểm tra lịch thi
  const handleCheckSchedule = async () => {
    if (!formData.certificateId) {
      toast.error("Vui lòng chọn loại chứng chỉ trước.")
      return
    }

    setLoadingDates(true)
    try {
      const { data, error } = await supabase
        .from("buoithi")
        .select(`
          mabuoithi,
          thoigian,
          diadiem,
          soluongthisinh,
          trangthai,
          macc
        `)
        .eq("macc", formData.certificateId)
        .eq("trangthai", "ChuaToChuc")
        .order("thoigian", { ascending: true })

      if (error) {
        throw new Error(`Lỗi kiểm tra lịch thi: ${error.message}`)
      }

      const formattedDates: DateList[] = data.map((item) => ({
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
      }))

      setFilteredDateList(formattedDates)
      toast.success("Đã làm mới lịch thi.")
      if (formattedDates.length === 0) {
        toast.info("Không có lịch thi nào cho chứng chỉ đã chọn.")
      }
    } catch (error: any) {
      toast.error(error.message)
      setFilteredDateList([])
    } finally {
      setLoadingDates(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Thông tin thí sinh và lịch thi</h2>

      {showIndividualForm ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hoten">Họ tên</Label>
            <Input
              value={formData.hoten}
              id="hoten"
              onChange={(e) => handleInputChange("hoten", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Ngày sinh</Label>
            <div className="relative">
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange("dob", e.target.value)}
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateCount">Số lượng thí sinh</Label>
            <Input
              id="candidateCount"
              type="number"
              min="1"
              placeholder="Nhập số lượng thí sinh"
              value={formData.candidateCount || ""}
              onChange={(e) => handleInputChange("candidateCount", parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Địa điểm tổ chức</Label>
            <Input
              id="venue"
              placeholder="Nhập địa điểm tổ chức"
              value={formData.venue || ""}
              onChange={(e) => handleInputChange("venue", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="certificateType">Loại chứng chỉ</Label>
        <Select
          value={formData.certificateId}
          onValueChange={(value) => handleInputChange("certificateId", value)}
        >
          <SelectTrigger id="certificateType">
            <SelectValue placeholder="Chọn loại chứng chỉ" />
          </SelectTrigger>
          <SelectContent>
            {certificateList.length > 0 ? (
              certificateList.map((certificate) => (
                <SelectItem key={certificate.macc} value={certificate.macc}>
                  {certificate.tencc}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                Không có chứng chỉ nào
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Lịch thi</Label>
          <Button variant="outline" size="sm" className="h-8" onClick={handleCheckSchedule}>
            Kiểm tra lịch thi
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Mã buổi</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead className="w-[100px] text-center">Số lượng</TableHead>
                <TableHead className="w-[100px] text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDates ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Đang tải lịch thi...
                  </TableCell>
                </TableRow>
              ) : filteredDateList.length > 0 ? (
                filteredDateList.map((schedule) => (
                  <TableRow
                    key={schedule.mabuoithi}
                    className={`cursor-pointer hover:bg-muted ${formData.examId === schedule.mabuoithi ? "bg-muted" : ""}`}
                    onClick={() => handleInputChange("examId", schedule.mabuoithi)}
                  >
                    <TableCell className="font-medium">{schedule.mabuoithi}</TableCell>
                    <TableCell>{schedule.thoigian}</TableCell>
                    <TableCell>{schedule.diadiem}</TableCell>
                    <TableCell className="text-center">{schedule.soluongthisinh}</TableCell>
                    <TableCell className="text-center">{schedule.trangthai}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    {formData.certificateId
                      ? "Không có lịch thi nào cho chứng chỉ đã chọn."
                      : "Vui lòng chọn loại chứng chỉ để xem lịch thi."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
