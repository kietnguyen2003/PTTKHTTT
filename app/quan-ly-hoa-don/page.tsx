"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Plus, Eye, Pencil, Trash2, Save, RotateCcw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function QuanLyHoaDonPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<InvoiceFormData>({
    maPhieu: "",
    maKhachHang: "",
    tongTien: "",
    giamGia: "0",
    trangThai: "chua-thanh-toan",
    nhanVien: "",
  })

  // Mock data for invoices
  const invoices: Invoice[] = [
    {
      maHoaDon: "HD001",
      maKhachHang: "KH001",
      tenKhachHang: "Nguyễn Văn A",
      ngayLap: "15/04/2025",
      tongTien: "1,500,000",
      trangThai: "da-thanh-toan",
    },
    {
      maHoaDon: "HD002",
      maKhachHang: "KH002",
      tenKhachHang: "Trần Thị B",
      ngayLap: "16/04/2025",
      tongTien: "1,200,000",
      trangThai: "chua-thanh-toan",
    },
    {
      maHoaDon: "HD003",
      maKhachHang: "KH006",
      tenKhachHang: "Công ty XYZ",
      ngayLap: "17/04/2025",
      tongTien: "5,000,000",
      trangThai: "chua-thanh-toan",
    },
    {
      maHoaDon: "HD004",
      maKhachHang: "KH003",
      tenKhachHang: "Lê Văn C",
      ngayLap: "17/04/2025",
      tongTien: "1,500,000",
      trangThai: "huy",
    },
    {
      maHoaDon: "HD005",
      maKhachHang: "KH007",
      tenKhachHang: "Công ty ABC",
      ngayLap: "18/04/2025",
      tongTien: "4,500,000",
      trangThai: "da-thanh-toan",
    },
  ]

  // Mock data for registration forms
  const registrationForms = [
    { maPhieu: "PDK001", maKhachHang: "KH001", tenKhachHang: "Nguyễn Văn A", loaiPhieu: "Đăng ký" },
    { maPhieu: "PDK002", maKhachHang: "KH006", tenKhachHang: "Công ty XYZ", loaiPhieu: "Đăng ký" },
    { maPhieu: "PDK003", maKhachHang: "KH002", tenKhachHang: "Trần Thị B", loaiPhieu: "Đăng ký" },
    { maPhieu: "PGH001", maKhachHang: "KH001", tenKhachHang: "Nguyễn Văn A", loaiPhieu: "Gia hạn" },
    { maPhieu: "PGH002", maKhachHang: "KH003", tenKhachHang: "Lê Văn C", loaiPhieu: "Gia hạn" },
  ]

  // Mock data for staff
  const staffMembers = [
    { maNV: "NV001", tenNV: "Trần Văn B" },
    { maNV: "NV002", tenNV: "Lê Thị C" },
    { maNV: "NV003", tenNV: "Phạm Văn D" },
  ]

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsEditing(true)
    // In a real application, you would fetch the invoice details from the server
    setFormData({
      maPhieu: "PDK001", // Mock data
      maKhachHang: invoice.maKhachHang,
      tongTien: invoice.tongTien.replace(/,/g, ""),
      giamGia: "0", // Mock data
      trangThai: invoice.trangThai,
      nhanVien: "NV001", // Mock data
    })
  }

  const handleCreateNewInvoice = () => {
    setSelectedInvoice(null)
    setIsEditing(true)
    setFormData({
      maPhieu: "",
      maKhachHang: "",
      tongTien: "",
      giamGia: "0",
      trangThai: "chua-thanh-toan",
      nhanVien: "",
    })
  }

  const handleSaveInvoice = () => {
    // Validate form
    if (!formData.maPhieu || !formData.maKhachHang || !formData.tongTien || !formData.nhanVien) {
      alert("Vui lòng điền đầy đủ thông tin")
      return
    }

    // Check if total amount is valid
    const totalAmount = Number.parseFloat(formData.tongTien)
    if (isNaN(totalAmount) || totalAmount <= 0) {
      alert("Tổng tiền phải là số dương")
      return
    }

    // call API to save the invoice
    alert(selectedInvoice ? "Đã cập nhật hóa đơn thành công!" : "Đã tạo hóa đơn mới thành công!")
    setIsEditing(false)
    setSelectedInvoice(null)
  }

  const handleDeleteInvoice = () => {
    if (!selectedInvoice) return

    if (selectedInvoice.trangThai !== "huy") {
      alert("Chỉ có thể xóa hóa đơn có trạng thái 'Hủy'")
      return
    }

    // call API to delete the invoice
    alert("Đã xóa hóa đơn thành công!")
    setIsEditing(false)
    setSelectedInvoice(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedInvoice(null)
  }

  const handleSelectRegistrationForm = (form: any) => {
    setFormData({
      ...formData,
      maPhieu: form.maPhieu,
      maKhachHang: form.maKhachHang,
      // call API to get the total amount based on the form type
      tongTien: form.loaiPhieu === "Đăng ký" ? "1500000" : "500000",
    })
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Quản Lý Hóa Đơn</h1>
        <Button onClick={handleCreateNewInvoice} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo hóa đơn mới
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Danh sách hóa đơn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Tìm kiếm hóa đơn..." className="w-full pl-8" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Trạng thái" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="chua-thanh-toan">Chưa thanh toán</SelectItem>
                      <SelectItem value="da-thanh-toan">Đã thanh toán</SelectItem>
                      <SelectItem value="huy">Hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã HĐ</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Ngày lập</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.maHoaDon}>
                        <TableCell className="font-medium">{invoice.maHoaDon}</TableCell>
                        <TableCell>
                          {invoice.maKhachHang} - {invoice.tenKhachHang}
                        </TableCell>
                        <TableCell>{invoice.ngayLap}</TableCell>
                        <TableCell>{invoice.tongTien} VNĐ</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              invoice.trangThai === "da-thanh-toan"
                                ? "bg-green-100 text-green-800"
                                : invoice.trangThai === "chua-thanh-toan"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {invoice.trangThai === "da-thanh-toan"
                              ? "Đã thanh toán"
                              : invoice.trangThai === "chua-thanh-toan"
                                ? "Chưa thanh toán"
                                : "Hủy"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={invoice.trangThai !== "huy"}
                              onClick={() => {
                                setSelectedInvoice(invoice)
                                handleDeleteInvoice()
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{selectedInvoice ? "Chi tiết hóa đơn" : "Tạo hóa đơn mới"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <Tabs defaultValue="registration">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="registration">Phiếu đăng ký</TabsTrigger>
                      <TabsTrigger value="extension">Phiếu gia hạn</TabsTrigger>
                    </TabsList>
                    <TabsContent value="registration" className="space-y-4 pt-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mã phiếu</TableHead>
                              <TableHead>Khách hàng</TableHead>
                              <TableHead className="text-right">Chọn</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {registrationForms
                              .filter((form) => form.loaiPhieu === "Đăng ký")
                              .map((form) => (
                                <TableRow key={form.maPhieu}>
                                  <TableCell className="font-medium">{form.maPhieu}</TableCell>
                                  <TableCell>
                                    {form.maKhachHang} - {form.tenKhachHang}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSelectRegistrationForm(form)}
                                    >
                                      Chọn
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    <TabsContent value="extension" className="space-y-4 pt-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Mã phiếu</TableHead>
                              <TableHead>Khách hàng</TableHead>
                              <TableHead className="text-right">Chọn</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {registrationForms
                              .filter((form) => form.loaiPhieu === "Gia hạn")
                              .map((form) => (
                                <TableRow key={form.maPhieu}>
                                  <TableCell className="font-medium">{form.maPhieu}</TableCell>
                                  <TableCell>
                                    {form.maKhachHang} - {form.tenKhachHang}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSelectRegistrationForm(form)}
                                    >
                                      Chọn
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-2">
                    <Label htmlFor="maPhieu">Mã phiếu liên quan</Label>
                    <Input
                      id="maPhieu"
                      value={formData.maPhieu}
                      onChange={(e) => setFormData({ ...formData, maPhieu: e.target.value })}
                      placeholder="Chọn phiếu từ danh sách trên"
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maKhachHang">Mã khách hàng</Label>
                    <Input
                      id="maKhachHang"
                      value={formData.maKhachHang}
                      onChange={(e) => setFormData({ ...formData, maKhachHang: e.target.value })}
                      placeholder="Mã khách hàng sẽ được điền tự động khi chọn phiếu"
                      readOnly
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tongTien">Tổng tiền (VNĐ)</Label>
                      <Input
                        id="tongTien"
                        value={formData.tongTien}
                        onChange={(e) => setFormData({ ...formData, tongTien: e.target.value })}
                        placeholder="Nhập tổng tiền"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="giamGia">Giảm giá (VNĐ)</Label>
                      <Input
                        id="giamGia"
                        value={formData.giamGia}
                        onChange={(e) => setFormData({ ...formData, giamGia: e.target.value })}
                        placeholder="Nhập số tiền giảm giá"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="trangThai">Trạng thái</Label>
                      <Select
                        value={formData.trangThai}
                        onValueChange={(value) => setFormData({ ...formData, trangThai: value })}
                      >
                        <SelectTrigger id="trangThai">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chua-thanh-toan">Chưa thanh toán</SelectItem>
                          <SelectItem value="da-thanh-toan">Đã thanh toán</SelectItem>
                          <SelectItem value="huy">Hủy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nhanVien">Nhân viên lập hóa đơn</Label>
                      <Select
                        value={formData.nhanVien}
                        onValueChange={(value) => setFormData({ ...formData, nhanVien: value })}
                      >
                        <SelectTrigger id="nhanVien">
                          <SelectValue placeholder="Chọn nhân viên" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.maNV} value={staff.maNV}>
                              {staff.tenNV} ({staff.maNV})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleCancel} className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Hủy
                    </Button>
                    <Button onClick={handleSaveInvoice} className="gap-2">
                      <Save className="h-4 w-4" />
                      {selectedInvoice ? "Cập nhật hóa đơn" : "Tạo hóa đơn"}
                    </Button>
                    {selectedInvoice && selectedInvoice.trangThai === "huy" && (
                      <Button variant="destructive" onClick={handleDeleteInvoice} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Xóa hóa đơn
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-muted-foreground">Chọn một hóa đơn để xem chi tiết hoặc tạo hóa đơn mới</p>
                  <Button variant="outline" onClick={handleCreateNewInvoice} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo hóa đơn mới
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Types
interface Invoice {
  maHoaDon: string
  maKhachHang: string
  tenKhachHang: string
  ngayLap: string
  tongTien: string
  trangThai: string
}

interface InvoiceFormData {
  maPhieu: string
  maKhachHang: string
  tongTien: string
  giamGia: string
  trangThai: string
  nhanVien: string
}
