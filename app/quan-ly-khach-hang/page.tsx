"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Filter, UserPlus, Eye, Pencil, Trash2, Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CustomerForm from "@/components/customer-form"

export default function QuanLyKhachHangPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)

  // Mock data for individual customers
  const individualCustomers: Customer[] = [
    {
      id: "KH001",
      type: "individual",
      name: "Nguyễn Văn A",
      idCard: "012345678901",
      email: "nguyenvana@example.com",
      phone: "0901234567",
      registrations: [
        {
          id: "PDK001",
          examDate: "15/05/2025",
          certificate: "Chứng chỉ Tiếng Anh B1",
          status: "Đã duyệt",
          createdAt: "10/04/2025",
        },
        {
          id: "PDK005",
          examDate: "22/05/2025",
          certificate: "Chứng chỉ Tin học cơ bản",
          status: "Chờ duyệt",
          createdAt: "15/04/2025",
        },
      ],
    },
    {
      id: "KH002",
      type: "individual",
      name: "Trần Thị B",
      idCard: "012345678902",
      email: "tranthib@example.com",
      phone: "0901234568",
      registrations: [
        {
          id: "PDK003",
          examDate: "15/05/2025",
          certificate: "Chứng chỉ Tiếng Anh B2",
          status: "Đã duyệt",
          createdAt: "12/04/2025",
        },
      ],
    },
    {
      id: "KH003",
      type: "individual",
      name: "Lê Văn C",
      idCard: "012345678903",
      email: "levanc@example.com",
      phone: "0901234569",
      registrations: [
        {
          id: "PDK004",
          examDate: "17/05/2025",
          certificate: "Chứng chỉ Tin học nâng cao",
          status: "Đã duyệt",
          createdAt: "13/04/2025",
        },
      ],
    },
    {
      id: "KH004",
      type: "individual",
      name: "Phạm Thị D",
      idCard: "012345678904",
      email: "phamthid@example.com",
      phone: "0901234570",
      registrations: [],
    },
    {
      id: "KH005",
      type: "individual",
      name: "Hoàng Văn E",
      idCard: "012345678905",
      email: "hoangvane@example.com",
      phone: "0901234571",
      registrations: [],
    },
  ]

  // Mock data for organization customers
  const organizationCustomers: Customer[] = [
    {
      id: "KH006",
      type: "organization",
      name: "Công ty XYZ",
      orgId: "MST12345",
      phone: "0901234572",
      registrations: [
        {
          id: "PDK002",
          examDate: "16/05/2025",
          certificate: "Chứng chỉ Tin học cơ bản",
          status: "Chờ duyệt",
          createdAt: "11/04/2025",
        },
      ],
    },
    {
      id: "KH007",
      type: "organization",
      name: "Công ty ABC",
      orgId: "MST12346",
      phone: "0901234573",
      registrations: [
        {
          id: "PDK006",
          examDate: "18/05/2025",
          certificate: "Chứng chỉ Tiếng Anh B1",
          status: "Chờ duyệt",
          createdAt: "14/04/2025",
        },
      ],
    },
    {
      id: "KH008",
      type: "organization",
      name: "Trường Đại học DEF",
      orgId: "MST12347",
      phone: "0901234574",
      registrations: [],
    },
  ]

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerDetails(true)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản Lý Khách Hàng</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Đăng ký người dùng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Đăng ký người dùng mới</DialogTitle>
            </DialogHeader>
            <CustomerForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="individual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Khách hàng cá nhân</TabsTrigger>
          <TabsTrigger value="organization">Khách hàng đơn vị</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Danh sách khách hàng cá nhân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Tìm kiếm khách hàng..." className="w-full pl-8 md:w-[300px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Trạng thái" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="registered">Đã đăng ký</SelectItem>
                      <SelectItem value="not-registered">Chưa đăng ký</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã KH</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>CCCD</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Số lượng đăng ký</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {individualCustomers.map((customer) => (
                      <TableRow key={customer.id} className="cursor-pointer hover:bg-muted">
                        <TableCell className="font-medium">{customer.id}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.idCard}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.registrations.length}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewCustomer(customer)}>
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

        <TabsContent value="organization" className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Danh sách khách hàng đơn vị</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Tìm kiếm khách hàng..." className="w-full pl-8 md:w-[300px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Trạng thái" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="registered">Đã đăng ký</SelectItem>
                      <SelectItem value="not-registered">Chưa đăng ký</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã KH</TableHead>
                      <TableHead>Tên đơn vị</TableHead>
                      <TableHead>Mã đơn vị</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Số lượng đăng ký</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizationCustomers.map((customer) => (
                      <TableRow key={customer.id} className="cursor-pointer hover:bg-muted">
                        <TableCell className="font-medium">{customer.id}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.orgId}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.registrations.length}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleViewCustomer(customer)}>
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

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Thông tin khách hàng</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Mã khách hàng</p>
                      <p className="text-lg font-semibold">{selectedCustomer.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Loại khách hàng</p>
                      <p className="text-lg font-semibold">
                        {selectedCustomer.type === "individual" ? "Cá nhân" : "Đơn vị"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {selectedCustomer.type === "individual" ? "Họ tên" : "Tên đơn vị"}
                      </p>
                      <p className="text-lg font-semibold">{selectedCustomer.name}</p>
                    </div>
                    {selectedCustomer.type === "individual" ? (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">CCCD</p>
                          <p className="text-lg font-semibold">{selectedCustomer.idCard}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p className="text-lg font-semibold">{selectedCustomer.email}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mã đơn vị</p>
                        <p className="text-lg font-semibold">{selectedCustomer.orgId}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                      <p className="text-lg font-semibold">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Lịch sử đăng ký</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Users className="h-4 w-4" />
                      Đăng ký mới
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCustomer.registrations.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã phiếu</TableHead>
                            <TableHead>Ngày thi</TableHead>
                            <TableHead>Chứng chỉ</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày đăng ký</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCustomer.registrations.map((registration) => (
                            <TableRow key={registration.id}>
                              <TableCell className="font-medium">{registration.id}</TableCell>
                              <TableCell>{registration.examDate}</TableCell>
                              <TableCell>{registration.certificate}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    registration.status === "Đã duyệt"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {registration.status}
                                </span>
                              </TableCell>
                              <TableCell>{registration.createdAt}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-muted-foreground">Khách hàng chưa có đăng ký nào</p>
                      <Button variant="outline" className="mt-4 gap-2">
                        <Users className="h-4 w-4" />
                        Đăng ký mới
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Types
interface Registration {
  id: string
  examDate: string
  certificate: string
  status: string
  createdAt: string
}

interface Customer {
  id: string
  type: "individual" | "organization"
  name: string
  phone: string
  idCard?: string
  email?: string
  orgId?: string
  registrations: Registration[]
}
