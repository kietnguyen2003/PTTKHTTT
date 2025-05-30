'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, Filter, UserPlus, Eye, Pencil, Trash2, Users, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CustomerForm from '@/components/customer-form';
import { supabase } from '@/lib/supabase/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Customer } from '@/types/CustomerTypes';
import { fetchIndividualCustomers, fetchOrganizationCustomers } from '@/services/khachHangService';

// Hàm xác định trạng thái tổng hợp của khách hàng
const getCustomerStatus = (registrations: any[]): string => {
  console.log("registrations:", registrations);
  if (registrations.length === 0) return 'Chưa đăng ký';
  if (registrations.some((reg) => reg.trangthai === 'Đã duyệt')) return 'Đã duyệt';
  if (registrations.some((reg) => reg.trangthai === 'Chờ duyệt')) return 'Chờ duyệt';
  return 'Từ chối';
};

// Hàm cập nhật trạng thái phiếu đăng ký
const updateRegistrationFormStatus = async (id: string, newStatus: string) => {
  try {
    const { error } = await supabase
      .from('phieudangki')
      .update({ trangthai: newStatus })
      .eq('maphieu', id);

    if (error) throw error;

    toast({ 
      title: 'Thành công', 
      description: `Cập nhật trạng thái phiếu đăng ký ${id} thành công!` 
    });
  } catch (error: any) {
    console.error('Error updating registration form status:', error);
    toast({
      title: 'Lỗi',
      description: `Không thể cập nhật trạng thái phiếu đăng ký: ${error.message || "Lỗi không xác định"}`,
      variant: 'destructive',
    });
  }
};

export default function QuanLyKhachHangPage() {
  const [individualCustomers, setIndividualCustomers] = useState<Customer[]>([]);
  const [organizationCustomers, setOrganizationCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refresh, setRefresh] = useState(0);

  // State cho dialog duyệt trạng thái
  const [editStatusDialogOpen, setEditStatusDialogOpen] = useState(false);
  const [editingRegistrationId, setEditingRegistrationId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const handleRefresh = () => {
    setRefresh((prev) => prev + 1);
  };

  const handleDeleteCustomer = async (makh: string) => {
    try {
      // Xóa các phiếu đăng ký chi tiết liên quan
      const { data: phieuData, error: fetchPhieuError } = await supabase
        .from('phieudangki')
        .select('maphieu')
        .eq('makh', makh);

      if (fetchPhieuError) throw fetchPhieuError;

      const phieuIds = phieuData?.map(p => p.maphieu) || [];
      if (phieuIds.length > 0) {
        const { error: deleteChiTietError } = await supabase
          .from('phieudangkichitiet')
          .delete()
          .in('maphieu', phieuIds);

        if (deleteChiTietError) throw deleteChiTietError;

        // Xóa các phiếu đăng ký
        const { error: deletePhieuError } = await supabase
          .from('phieudangki')
          .delete()
          .eq('makh', makh);

        if (deletePhieuError) throw deletePhieuError;
      }

      // Xóa thông tin thí sinh
      const { error: deleteThiSinhError } = await supabase
        .from('thongtinthisinh')
        .delete()
        .eq('makh', makh);

      if (deleteThiSinhError) throw deleteThiSinhError;

      // Xóa khách hàng
      const { error: deleteKhachHangError } = await supabase
        .from('khachhang')
        .delete()
        .eq('makh', makh);

      if (deleteKhachHangError) throw deleteKhachHangError;

      // Cập nhật UI
      setIndividualCustomers((prev) => prev.filter((c) => c.makh !== makh));
      setOrganizationCustomers((prev) => prev.filter((c) => c.makh !== makh));
      
      toast({ 
        title: 'Thành công', 
        description: 'Đã xóa khách hàng và các phiếu đăng ký liên quan' 
      });
    } catch (error: any) {
      console.error('Error deleting customer:', error.message);
      toast({
        title: 'Lỗi',
        description: `Không thể xóa khách hàng: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    console.log("customer", customer);
    setShowCustomerDetails(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditForm(true);
  };

  // Hàm mở dialog duyệt trạng thái
  const handleOpenEditStatusDialog = (registrationId: string, currentStatus: string) => {
    setEditingRegistrationId(registrationId);
    setNewStatus(currentStatus);
    setEditStatusDialogOpen(true);
  };

  // Hàm lưu trạng thái mới
  const handleSaveStatus = async () => {
    if (!editingRegistrationId) return;

    await updateRegistrationFormStatus(editingRegistrationId, newStatus);

    // Cập nhật trạng thái trong selectedCustomer
    setSelectedCustomer((prev) => {
      if (!prev) return prev;
      const updatedRegistrations = prev.registrations.map((reg) =>
        reg.maphieu === editingRegistrationId ? { ...reg, trangthai: newStatus } : reg
      );
      return { ...prev, registrations: updatedRegistrations };
    });

    // Cập nhật danh sách khách hàng để phản ánh thay đổi trạng thái tổng hợp
    setIndividualCustomers((prev) =>
      prev.map((customer) =>
        customer.makh === selectedCustomer?.makh
          ? {
              ...customer,
              registrations: customer.registrations.map((reg) =>
                reg.maphieu === editingRegistrationId ? { ...reg, trangthai: newStatus } : reg
              ),
            }
          : customer
      )
    );
    setOrganizationCustomers((prev) =>
      prev.map((customer) =>
        customer.makh === selectedCustomer?.makh
          ? {
              ...customer,
              registrations: customer.registrations.map((reg) =>
                reg.maphieu === editingRegistrationId ? { ...reg, trangthai: newStatus } : reg
              ),
            }
          : customer
      )
    );

    setEditStatusDialogOpen(false);
    setEditingRegistrationId(null);
    setNewStatus('');
  };

  const filterCustomers = (customers: Customer[]) => {
    return customers.filter((customer) => {
      const matchesSearch =
        (customer.hoten || customer.tendv || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.makh.includes(searchTerm);
      
      const customerStatus = getCustomerStatus(customer.registrations);
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'approved' && customerStatus === 'Đã duyệt') ||
        (filterStatus === 'pending' && customerStatus === 'Chờ duyệt') ||
        (filterStatus === 'rejected' && customerStatus === 'Từ chối') ||
        (filterStatus === 'not-registered' && customerStatus === 'Chưa đăng ký');
      
      return matchesSearch && matchesFilter;
    });
  };

  const filteredIndividualCustomers = filterCustomers(individualCustomers);
  const filteredOrganizationCustomers = filterCustomers(organizationCustomers);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchIndividualCustomers(setIndividualCustomers);
        await fetchOrganizationCustomers(setOrganizationCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast({ title: 'Lỗi', description: 'Không thể tải danh sách khách hàng', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refresh]);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản Lý Khách Hàng</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Đăng ký khách hàng mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Đăng ký người dùng mới</DialogTitle>
            </DialogHeader>
            <CustomerForm onSuccess={handleRefresh} />
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
                        <SelectItem value="approved">Đã duyệt</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
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
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Số lượng đăng ký</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIndividualCustomers.length > 0 ? (
                        filteredIndividualCustomers.map((customer, index) => {
                          const customerStatus = getCustomerStatus(customer.registrations);
                          console.log("customer:", customer);
                          return (
                            <TableRow
                              key={customer.makh || `individual-${index}`}
                              className="cursor-pointer hover:bg-muted"
                            >
                              <TableCell className="font-medium">{customer.makh}</TableCell>
                              <TableCell>{customer.hoten || 'N/A'}</TableCell>
                              <TableCell>{customer.cccd || 'N/A'}</TableCell>
                              <TableCell>{customer.email || 'N/A'}</TableCell>
                              <TableCell>{customer.sdt || 'N/A'}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    customerStatus === 'Đã duyệt'
                                      ? 'bg-green-100 text-green-800'
                                      : customerStatus === 'Chờ duyệt'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : customerStatus === 'Từ chối'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {customerStatus}
                                </span>
                              </TableCell>
                              <TableCell>{customer.registrations.length}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewCustomer(customer)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditCustomer(customer)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleConfirmDelete(customer)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            Không có khách hàng cá nhân nào
                          </TableCell>
                        </TableRow>
                      )}
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
                        <SelectItem value="approved">Đã duyệt</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="rejected">Từ chối</SelectItem>
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
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Số lượng đăng ký</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrganizationCustomers.length > 0 ? (
                        filteredOrganizationCustomers.map((customer, index) => {
                          const customerStatus = getCustomerStatus(customer.registrations);
                          return (
                            <TableRow
                              key={customer.makh || `organization-${index}`}
                              className="cursor-pointer hover:bg-muted"
                            >
                              <TableCell className="font-medium">{customer.makh}</TableCell>
                              <TableCell>{customer.tendv || 'N/A'}</TableCell>
                              <TableCell>{customer.madv || 'N/A'}</TableCell>
                              <TableCell>{customer.email || 'N/A'}</TableCell>
                              <TableCell>{customer.sdt || 'N/A'}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    customerStatus === 'Đã duyệt'
                                      ? 'bg-green-100 text-green-800'
                                      : customerStatus === 'Chờ duyệt'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : customerStatus === 'Từ chối'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {customerStatus}
                                </span>
                              </TableCell>
                              <TableCell>{customer.registrations.length}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewCustomer(customer)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditCustomer(customer)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleConfirmDelete(customer)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            Không có khách hàng đơn vị nào
                          </TableCell>
                        </TableRow>
                      )}
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
                      <p className="text-lg font-semibold">{selectedCustomer.makh}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Loại khách hàng</p>
                      <p className="text-lg font-semibold">
                        {selectedCustomer.loaikh === 'CaNhan' ? 'Cá nhân' : 'Đơn vị'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {selectedCustomer.loaikh === 'CaNhan' ? 'Họ tên' : 'Tên đơn vị'}
                      </p>
                      <p className="text-lg font-semibold">
                        {selectedCustomer.loaikh === 'CaNhan' ? selectedCustomer.hoten || 'N/A' : selectedCustomer.tendv || 'N/A'}
                      </p>
                    </div>
                    {selectedCustomer.loaikh === 'CaNhan' ? (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">CCCD</p>
                          <p className="text-lg font-semibold">{selectedCustomer.cccd || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p className="text-lg font-semibold">{selectedCustomer.email || 'N/A'}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mã đơn vị</p>
                        <p className="text-lg font-semibold">{selectedCustomer.madv || 'N/A'}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                      <p className="text-lg font-semibold">{selectedCustomer.sdt || 'N/A'}</p>
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
                            <TableHead className="text-right">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCustomer.registrations.map((registration) => (
                            <TableRow key={registration.maphieu}>
                              <TableCell className="font-medium">{registration.maphieu}</TableCell>
                              <TableCell>{new Date(registration.ngaythi).toLocaleDateString()}</TableCell>
                              <TableCell>{registration.tencc}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    registration.trangthai === 'Đã duyệt'
                                      ? 'bg-green-100 text-green-800'
                                      : registration.trangthai === 'Chờ duyệt'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {registration.trangthai}
                                </span>
                              </TableCell>
                              <TableCell>{new Date(registration.ngaydangky).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditStatusDialog(registration.maphieu, registration.trangthai)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </TableCell>
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

      {/* Edit Customer Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              initialData={{
                makh: selectedCustomer.makh,
                loaikh: selectedCustomer.loaikh,
                hoten: selectedCustomer.hoten,
                cccd: selectedCustomer.cccd,
                email: selectedCustomer.email,
                sdt: selectedCustomer.sdt,
                diachi: selectedCustomer.diachi,
                tendv: selectedCustomer.tendv,
                madv: selectedCustomer.madv,
              }}
              onSuccess={() => {
                handleRefresh();
                setShowEditForm(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa khách hàng</DialogTitle>
            <DialogDescription>
              {customerToDelete && (
                <>
                  Bạn có chắc chắn muốn xóa khách hàng{" "}
                  <span className="font-semibold">
                    {customerToDelete.loaikh === 'CaNhan' ? customerToDelete.hoten : customerToDelete.tendv}
                  </span>{" "}
                  (Mã: {customerToDelete.makh}) không? Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu liên quan.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (customerToDelete) {
                  handleDeleteCustomer(customerToDelete.makh);
                }
                setShowDeleteConfirm(false);
                setCustomerToDelete(null);
              }}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog duyệt trạng thái */}
      <Dialog open={editStatusDialogOpen} onOpenChange={setEditStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt trạng thái phiếu đăng ký</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <strong>Mã phiếu:</strong> {editingRegistrationId}
            </div>
            <div>
              <strong>Trạng thái mới:</strong>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
                  <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
                  <SelectItem value="Từ chối">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStatusDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveStatus}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}