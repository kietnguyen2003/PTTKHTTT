"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, Eye, RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function TraCuuLichThiPage() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)

  // Mock data for exams
  const exams: Exam[] = [
    {
      maBuoiThi: "BT001",
      tenChungChi: "Chứng chỉ Tiếng Anh B1",
      thoiGian: "09:00 - 11:00, 15/05/2025",
      diaDiem: "Phòng 101, Tòa nhà A",
      soLuongThiSinh: 28,
      trangThai: "chua-to-chuc",
      sucChua: 30,
      giamThi: "Nguyễn Văn X, Trần Thị Y",
      ghiChu: "Thí sinh cần mang theo CCCD và giấy tờ liên quan",
    },
    {
      maBuoiThi: "BT002",
      tenChungChi: "Chứng chỉ Tin học cơ bản",
      thoiGian: "14:00 - 16:00, 15/05/2025",
      diaDiem: "Phòng 102, Tòa nhà A",
      soLuongThiSinh: 25,
      trangThai: "chua-to-chuc",
      sucChua: 25,
      giamThi: "Lê Văn Z, Phạm Thị W",
      ghiChu: "Thí sinh cần mang theo CCCD",
    },
    {
      maBuoiThi: "BT003",
      tenChungChi: "Chứng chỉ Tiếng Anh B2",
      thoiGian: "09:00 - 11:00, 16/05/2025",
      diaDiem: "Phòng 201, Tòa nhà B",
      soLuongThiSinh: 22,
      trangThai: "chua-to-chuc",
      sucChua: 35,
      giamThi: "Hoàng Văn M, Ngô Thị N",
      ghiChu: "",
    },
    {
      maBuoiThi: "BT004",
      tenChungChi: "Chứng chỉ Tin học nâng cao",
      thoiGian: "14:00 - 16:00, 16/05/2025",
      diaDiem: "Phòng 202, Tòa nhà B",
      soLuongThiSinh: 18,
      trangThai: "chua-to-chuc",
      sucChua: 30,
      giamThi: "Vũ Văn P, Đỗ Thị Q",
      ghiChu: "",
    },
    {
      maBuoiThi: "BT005",
      tenChungChi: "Chứng chỉ Tiếng Anh B1",
      thoiGian: "09:00 - 11:00, 10/04/2025",
      diaDiem: "Phòng 101, Tòa nhà A",
      soLuongThiSinh: 30,
      trangThai: "da-to-chuc",
      sucChua: 30,
      giamThi: "Nguyễn Văn X, Trần Thị Y",
      ghiChu: "",
    },
  ]

  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tra Cứu Lịch Thi</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Bộ lọc tìm kiếm</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="loaiChungChi">Loại chứng chỉ</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="loaiChungChi">
                    <SelectValue placeholder="Chọn loại chứng chỉ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại chứng chỉ</SelectItem>
                    <SelectItem value="tieng-anh-b1">Chứng chỉ Tiếng Anh B1</SelectItem>
                    <SelectItem value="tieng-anh-b2">Chứng chỉ Tiếng Anh B2</SelectItem>
                    <SelectItem value="tin-hoc-co-ban">Chứng chỉ Tin học cơ bản</SelectItem>
                    <SelectItem value="tin-hoc-nang-cao">Chứng chỉ Tin học nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ngayThi">Ngày thi</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="ngayThi" type="date" className="pl-8" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trangThai">Trạng thái</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="trangThai">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Chọn trạng thái" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="chua-to-chuc">Chưa tổ chức</SelectItem>
                    <SelectItem value="da-to-chuc">Đã tổ chức</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Làm mới
              </Button>
              <Button className="gap-2">
                <Search className="h-4 w-4" />
                Tìm kiếm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách lịch thi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã buổi thi</TableHead>
                  <TableHead>Loại chứng chỉ</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead className="text-center">Số lượng thí sinh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.maBuoiThi}>
                    <TableCell className="font-medium">{exam.maBuoiThi}</TableCell>
                    <TableCell>{exam.tenChungChi}</TableCell>
                    <TableCell>{exam.thoiGian}</TableCell>
                    <TableCell>{exam.diaDiem}</TableCell>
                    <TableCell className="text-center">
                      {exam.soLuongThiSinh}/{exam.sucChua}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          exam.trangThai === "chua-to-chuc"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {exam.trangThai === "chua-to-chuc" ? "Chưa tổ chức" : "Đã tổ chức"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleViewExam(exam)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Chi tiết buổi thi</DialogTitle>
                          </DialogHeader>
                          {selectedExam && (
                            <div className="space-y-4">
                              <div className="rounded-md border">
                                <Table>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell className="font-medium w-1/3">Mã buổi thi</TableCell>
                                      <TableCell>{selectedExam.maBuoiThi}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">Loại chứng chỉ</TableCell>
                                      <TableCell>{selectedExam.tenChungChi}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">Thời gian</TableCell>
                                      <TableCell>{selectedExam.thoiGian}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">Địa điểm</TableCell>
                                      <TableCell>{selectedExam.diaDiem}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">Số lượng thí sinh</TableCell>
                                      <TableCell>
                                        {selectedExam.soLuongThiSinh}/{selectedExam.sucChua}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">Trạng thái</TableCell>
                                      <TableCell>
                                        {selectedExam.trangThai === "chua-to-chuc" ? "Chưa tổ chức" : "Đã tổ chức"}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">Giám thị</TableCell>
                                      <TableCell>{selectedExam.giamThi}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">Ghi chú</TableCell>
                                      <TableCell>{selectedExam.ghiChu || "Không có ghi chú"}</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Types
interface Exam {
  maBuoiThi: string
  tenChungChi: string
  thoiGian: string
  diaDiem: string
  soLuongThiSinh: number
  trangThai: string
  sucChua: number
  giamThi: string
  ghiChu: string
}
