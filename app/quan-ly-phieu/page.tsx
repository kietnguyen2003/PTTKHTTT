import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, FileText, Eye, Pencil, Trash2 } from "lucide-react"

export default function QuanLyPhieuPage() {
  // Mock data for registration forms
  const registrationForms = [
    {
      id: "PDK001",
      customerName: "Nguyễn Văn A",
      customerType: "Cá nhân",
      examDate: "15/05/2025",
      certificate: "Chứng chỉ Tiếng Anh B1",
      status: "Đã duyệt",
      createdAt: "10/04/2025",
    },
    {
      id: "PDK002",
      customerName: "Công ty XYZ",
      customerType: "Đơn vị",
      examDate: "16/05/2025",
      certificate: "Chứng chỉ Tin học cơ bản",
      status: "Chờ duyệt",
      createdAt: "11/04/2025",
    },
    {
      id: "PDK003",
      customerName: "Trần Thị B",
      customerType: "Cá nhân",
      examDate: "15/05/2025",
      certificate: "Chứng chỉ Tiếng Anh B2",
      status: "Đã duyệt",
      createdAt: "12/04/2025",
    },
    {
      id: "PDK004",
      customerName: "Lê Văn C",
      customerType: "Cá nhân",
      examDate: "17/05/2025",
      certificate: "Chứng chỉ Tin học nâng cao",
      status: "Đã duyệt",
      createdAt: "13/04/2025",
    },
    {
      id: "PDK005",
      customerName: "Công ty ABC",
      customerType: "Đơn vị",
      examDate: "18/05/2025",
      certificate: "Chứng chỉ Tiếng Anh B1",
      status: "Chờ duyệt",
      createdAt: "14/04/2025",
    },
  ]

  // Mock data for extension forms
  const extensionForms = [
    {
      id: "PGH001",
      customerName: "Nguyễn Văn A",
      examTicket: "PDT001",
      oldDate: "15/05/2025",
      newDate: "22/05/2025",
      reason: "Bệnh tật",
      status: "Đã duyệt",
      createdAt: "12/04/2025",
    },
    {
      id: "PGH002",
      customerName: "Trần Thị B",
      examTicket: "PDT003",
      oldDate: "15/05/2025",
      newDate: "22/05/2025",
      reason: "Tang sự",
      status: "Chờ duyệt",
      createdAt: "13/04/2025",
    },
    {
      id: "PGH003",
      customerName: "Lê Văn C",
      examTicket: "PDT004",
      oldDate: "17/05/2025",
      newDate: "24/05/2025",
      reason: "Tai nạn",
      status: "Đã duyệt",
      createdAt: "14/04/2025",
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản Lý Phiếu</h1>
      </div>

      <Tabs defaultValue="registration">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registration">Phiếu đăng ký</TabsTrigger>
          <TabsTrigger value="extension">Phiếu gia hạn</TabsTrigger>
        </TabsList>

        <TabsContent value="registration" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Danh sách phiếu đăng ký</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Tìm kiếm phiếu đăng ký..." className="w-full pl-8 md:w-[300px]" />
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
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Xuất báo cáo
                </Button>
              </div>

              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã phiếu</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Loại KH</TableHead>
                      <TableHead>Ngày thi</TableHead>
                      <TableHead>Chứng chỉ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrationForms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="font-medium">{form.id}</TableCell>
                        <TableCell>{form.customerName}</TableCell>
                        <TableCell>{form.customerType}</TableCell>
                        <TableCell>{form.examDate}</TableCell>
                        <TableCell>{form.certificate}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              form.status === "Đã duyệt"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {form.status}
                          </span>
                        </TableCell>
                        <TableCell>{form.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
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
        </TabsContent>

        <TabsContent value="extension" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Danh sách phiếu gia hạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Tìm kiếm phiếu gia hạn..." className="w-full pl-8 md:w-[300px]" />
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
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Xuất báo cáo
                </Button>
              </div>

              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã phiếu</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Mã phiếu dự thi</TableHead>
                      <TableHead>Ngày thi cũ</TableHead>
                      <TableHead>Ngày thi mới</TableHead>
                      <TableHead>Lý do</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extensionForms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="font-medium">{form.id}</TableCell>
                        <TableCell>{form.customerName}</TableCell>
                        <TableCell>{form.examTicket}</TableCell>
                        <TableCell>{form.oldDate}</TableCell>
                        <TableCell>{form.newDate}</TableCell>
                        <TableCell>{form.reason}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              form.status === "Đã duyệt"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {form.status}
                          </span>
                        </TableCell>
                        <TableCell>{form.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
