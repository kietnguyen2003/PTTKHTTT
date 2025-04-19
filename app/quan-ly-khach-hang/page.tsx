// src/app/quan-ly-khach-hang/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, UserPlus, Eye, Pencil, Trash2, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerForm from "@/components/customer-form";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { fetchIndividualCustomers, fetchOrganizationCustomers } from "@/lib/customerService";

export default function QuanLyKhachHangPage() {
  const [individualCustomers, setIndividualCustomers] = useState<Customer[]>([]);
  const [organizationCustomers, setOrganizationCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");



  // Hàm xóa khách hàng
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase.from("khachhang").delete().eq("makh", customerId);
      if (error) throw error;

      setIndividualCustomers((prev) => prev.filter((c) => c.id !== customerId));
      setOrganizationCustomers((prev) => prev.filter((c) => c.id !== customerId));
      toast({ title: "Thành công", description: "Đã xóa khách hàng" });
    } catch (error: any) {
      console.error("Error deleting customer:", error.message, error);
      toast({ title: "Lỗi", description: `Không thể xóa khách hàng: ${error.message}`, variant: "destructive" });
    }
  };

  // Hàm xử lý xem chi tiết khách hàng
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const filterCustomers = (customers: Customer[]) => {
    return customers.filter((customer) => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || customer.id.includes(searchTerm);
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "registered" && customer.registrations.length > 0) ||
        (filterStatus === "not-registered" && customer.registrations.length === 0);
      return matchesSearch && matchesFilter;
    });
  };
  
  const filteredIndividualCustomers = filterCustomers(individualCustomers);
  const filteredOrganizationCustomers = filterCustomers(organizationCustomers);
  

  




  // Tải dữ liệu khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchIndividualCustomers(setIndividualCustomers);
        await fetchOrganizationCustomers(setOrganizationCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast({ title: "Lỗi", description: "Không thể tải danh sách khách hàng", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  

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
            <CustomerForm/>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
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
                      <Input
                        type="search"
                        placeholder="Tìm kiếm khách hàng..."
                        className="w-full pl-8 md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                      {filteredIndividualCustomers.map((customer) => (
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
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCustomer(customer.id)}
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
                      <Input
                        type="search"
                        placeholder="Tìm kiếm khách hàng..."
                        className="w-full pl-8 md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                        <TableHead>Email</TableHead>
                        <TableHead>Số điện thoại</TableHead>
                        <TableHead>Số lượng đăng ký</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrganizationCustomers.map((customer) => (
                        <TableRow key={customer.id} className="cursor-pointer hover:bg-muted">
                          <TableCell className="font-medium">{customer.id}</TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.orgId}</TableCell>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCustomer(customer.id)}
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
          </TabsContent>
        </Tabs>
      )}

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
  );
}

// Types
interface Registration {
  id: string;
  examDate: string;
  certificate: string;
  status: string;
  createdAt: string;
}

interface Customer {
  id: string;
  type: "individual" | "organization";
  name: string;
  phone: string;
  idCard?: string;
  email?: string;
  orgId?: string;
  registrations: Registration[];
}