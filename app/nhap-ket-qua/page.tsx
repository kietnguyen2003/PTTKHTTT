"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Search, AlertCircle, Save, RotateCcw } from "lucide-react"

export default function NhapKetQuaPage() {
  const [searchParams, setSearchParams] = useState({
    soBaoDanh: "",
    maPhieuDuThi: "",
  })
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [candidateFound, setCandidateFound] = useState(false)
  const [resultData, setResultData] = useState({
    diemThi: "",
    nguoiCham: "",
    giamThi: "",
    trangThai: "chua-nhan",
  })

  // Mock data for the candidate information
  const candidateInfo = {
    soBaoDanh: "SBD001",
    maPhieuDuThi: "PDT001",
    hoTen: "Nguyễn Văn A",
    loaiChungChi: "Chứng chỉ Tiếng Anh B1",
    thoiGianThi: "09:00 - 11:00, 20/05/2025",
    diaDiem: "Phòng 201, Tòa nhà A",
  }

  const handleSearch = () => {
    setSearchPerformed(true)
    // Use Api latter
    // For this mock, we'll just check if either field has a value
    if (searchParams.soBaoDanh || searchParams.maPhieuDuThi) {
      setCandidateFound(true)
      // Pre-fill the search fields with mock data
      setSearchParams({
        soBaoDanh: candidateInfo.soBaoDanh,
        maPhieuDuThi: candidateInfo.maPhieuDuThi,
      })
    } else {
      setCandidateFound(false)
    }
  }

  const handleReset = () => {
    setSearchParams({
      soBaoDanh: "",
      maPhieuDuThi: "",
    })
    setResultData({
      diemThi: "",
      nguoiCham: "",
      giamThi: "",
      trangThai: "chua-nhan",
    })
    setSearchPerformed(false)
    setCandidateFound(false)
  }

  const handleSaveResults = () => {
    // Validate score (0-100)
    const score = Number.parseFloat(resultData.diemThi)
    if (isNaN(score) || score < 0 || score > 100) {
      alert("Điểm thi phải là số từ 0 đến 100")
      return
    }

    // Api call to save results
    alert("Đã lưu kết quả thi thành công!")
    handleReset()
  }

  const isScoreValid = () => {
    const score = Number.parseFloat(resultData.diemThi)
    return !isNaN(score) && score >= 0 && score <= 100
  }

  const isFormValid = () => {
    return (
      resultData.diemThi.trim() !== "" &&
      resultData.nguoiCham.trim() !== "" &&
      resultData.giamThi.trim() !== "" &&
      isScoreValid()
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nhập Kết Quả Thi</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tra cứu thí sinh</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="soBaoDanh">Số báo danh</Label>
                <Input
                  id="soBaoDanh"
                  placeholder="Nhập số báo danh"
                  value={searchParams.soBaoDanh}
                  onChange={(e) => setSearchParams({ ...searchParams, soBaoDanh: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maPhieuDuThi">Mã phiếu dự thi</Label>
                <Input
                  id="maPhieuDuThi"
                  placeholder="Nhập mã phiếu dự thi"
                  value={searchParams.maPhieuDuThi}
                  onChange={(e) => setSearchParams({ ...searchParams, maPhieuDuThi: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Tìm kiếm
              </Button>
            </div>

            {searchPerformed && !candidateFound && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Không tìm thấy</AlertTitle>
                <AlertDescription>
                  Không tìm thấy thí sinh với thông tin đã nhập. Vui lòng kiểm tra lại.
                </AlertDescription>
              </Alert>
            )}

            {searchPerformed && candidateFound && (
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Số báo danh</TableCell>
                      <TableCell>{candidateInfo.soBaoDanh}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mã phiếu dự thi</TableCell>
                      <TableCell>{candidateInfo.maPhieuDuThi}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Họ tên thí sinh</TableCell>
                      <TableCell>{candidateInfo.hoTen}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Loại chứng chỉ</TableCell>
                      <TableCell>{candidateInfo.loaiChungChi}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Thời gian thi</TableCell>
                      <TableCell>{candidateInfo.thoiGianThi}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Địa điểm</TableCell>
                      <TableCell>{candidateInfo.diaDiem}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {searchPerformed && candidateFound && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Nhập kết quả thi</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="diemThi">Điểm thi</Label>
                  <Input
                    id="diemThi"
                    placeholder="Nhập điểm thi (0-100)"
                    value={resultData.diemThi}
                    onChange={(e) => setResultData({ ...resultData, diemThi: e.target.value })}
                    className={resultData.diemThi && !isScoreValid() ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {resultData.diemThi && !isScoreValid() && (
                    <p className="text-xs text-red-500">Điểm thi phải là số từ 0 đến 100</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trangThai">Trạng thái chứng chỉ</Label>
                  <Select
                    value={resultData.trangThai}
                    onValueChange={(value) => setResultData({ ...resultData, trangThai: value })}
                  >
                    <SelectTrigger id="trangThai">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chua-nhan">Chưa nhận</SelectItem>
                      <SelectItem value="da-nhan">Đã nhận</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nguoiCham">Người chấm thi</Label>
                  <Input
                    id="nguoiCham"
                    placeholder="Nhập tên người chấm thi"
                    value={resultData.nguoiCham}
                    onChange={(e) => setResultData({ ...resultData, nguoiCham: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giamThi">Giám thị</Label>
                  <Input
                    id="giamThi"
                    placeholder="Nhập tên giám thị"
                    value={resultData.giamThi}
                    onChange={(e) => setResultData({ ...resultData, giamThi: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Hủy
                </Button>
                <Button onClick={handleSaveResults} disabled={!isFormValid()} className="gap-2">
                  <Save className="h-4 w-4" />
                  Lưu kết quả
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
