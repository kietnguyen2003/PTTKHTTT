'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Filter, FileText, Eye, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "sonner";

// Interface cho phiếu đăng ký
interface RegistrationForm {
  id: string;
  customerName: string;
  customerType: string;
  examDate: string;
  certificate: string;
  status: string;
  createdAt: string;
}

// Interface cho phiếu gia hạn
interface ExtensionForm {
  id: string;
  customerName: string;
  examTicket: string;
  oldDate: string;
  newDate: string;
  reason: string;
  status: string;
  createdAt: string;
}

// Hàm lấy danh sách phiếu đăng ký
const fetchRegistrationForms = async (setRegistrationForms: (forms: RegistrationForm[]) => void) => {
  try {
    const { data, error } = await supabase
      .from('phieudangki')
      .select(`
        maphieu,
        ngaydangky,
        trangthai,
        mabuoithi,
        makh,
        buoithi (
          thoigian,
          diadiem,
          macc,
          thongtinchungchi (
            tencc
          )
        ),
        khachhang (
          makh,
          loaikh,
          khachhang_cn (hoten),
          khachhang_dv (tendv)
        )
      `);

    if (error) throw error;

    if (!data || data.length === 0) {
      setRegistrationForms([]);
      return;
    }

    const forms: RegistrationForm[] = data.map((item) => {
      const khachHang = item.khachhang;
      const customerName = khachHang
        ? khachHang.loaikh === 'CaNhan'
          ? khachHang.khachhang_cn?.hoten || 'N/A'
          : khachHang.khachhang_dv?.tendv || 'N/A'
        : 'N/A';

      const customerType = khachHang
        ? khachHang.loaikh === 'CaNhan'
          ? 'Cá nhân'
          : 'Đơn vị'
        : 'N/A';

      return {
        id: item.maphieu,
        customerName,
        customerType,
        examDate: item.buoithi?.thoigian
          ? new Date(item.buoithi.thoigian).toLocaleDateString('vi-VN')
          : 'N/A',
        certificate: item.buoithi?.thongtinchungchi?.tencc || 'N/A',
        status: item.trangthai || 'Chờ duyệt',
        createdAt: item.ngaydangky
          ? new Date(item.ngaydangky).toLocaleDateString('vi-VN')
          : 'N/A',
      };
    });

    setRegistrationForms(forms);
  } catch (error: any) {
    console.error('Error fetching registration forms:', error);
    toast.error(`Không thể tải danh sách phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm lấy danh sách phiếu gia hạn
const fetchExtensionForms = async (setExtensionForms: (forms: ExtensionForm[]) => void) => {
  try {
    const { data, error } = await supabase
      .from('phieudangkigiahan')
      .select(`
        maphieu,
        makh,
        maphieuduthi,
        ngaythimoi,
        truonghopdacbiet,
        trangthai,
        khachhang (
          loaikh,
          khachhang_cn (hoten),
          khachhang_dv (tendv)
        ),
        phieuduthi (
          maphieu,
          thoigian
        )
      `);

    if (error) throw error;

    if (!data || data.length === 0) {
      setExtensionForms([]);
      return;
    }

    const forms: ExtensionForm[] = data.map((item) => {
      const khachHang = item.khachhang;
      const customerName = khachHang
        ? khachHang.loaikh === 'CaNhan'
          ? khachHang.khachhang_cn?.hoten || 'N/A'
          : khachHang.khachhang_dv?.tendv || 'N/A'
        : 'N/A';

      return {
        id: item.maphieu,
        customerName,
        examTicket: item.maphieuduthi || 'N/A',
        oldDate: item.phieuduthi?.thoigian
          ? new Date(item.phieuduthi.thoigian).toLocaleDateString('vi-VN')
          : 'N/A',
        newDate: item.ngaythimoi
          ? new Date(item.ngaythimoi).toLocaleDateString('vi-VN')
          : 'N/A',
        reason: item.truonghopdacbiet ? 'Trường hợp đặc biệt' : 'Không có lý do đặc biệt',
        status: item.trangthai || 'Chờ duyệt',
        createdAt: item.ngaythimoi
          ? new Date(item.ngaythimoi).toLocaleDateString('vi-VN')
          : 'N/A',
      };
    });

    setExtensionForms(forms);
  } catch (error: any) {
    console.error('Error fetching extension forms:', error);
    if (error.code === 'PGRST200' && error.message.includes('Could not find a relationship')) {
      toast.error('Không thể tìm thấy mối quan hệ giữa bảng phieudangkigiahan và khachhang. Vui lòng kiểm tra cơ sở dữ liệu.');
    } else {
      toast.error(`Không thể tải danh sách phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
    }
  }
};

// Hàm cập nhật trạng thái phiếu đăng ký
const updateRegistrationFormStatus = async (id: string, newStatus: string) => {
  try {
    const { error } = await supabase
      .from('phieudangki')
      .update({ trangthai: newStatus })
      .eq('maphieu', id);

    if (error) throw error;

    toast.success(`Cập nhật trạng thái phiếu đăng ký ${id} thành công!`);
  } catch (error: any) {
    console.error('Error updating registration form status:', error);
    toast.error(`Không thể cập nhật trạng thái phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm cập nhật trạng thái phiếu gia hạn
const updateExtensionFormStatus = async (id: string, newStatus: string) => {
  try {
    const { error } = await supabase
      .from('phieudangkigiahan')
      .update({ trangthai: newStatus })
      .eq('maphieu', id);

    if (error) throw error;

    toast.success(`Cập nhật trạng thái phiếu gia hạn ${id} thành công!`);
  } catch (error: any) {
    console.error('Error updating extension form status:', error);
    toast.error(`Không thể cập nhật trạng thái phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm xóa phiếu đăng ký
const deleteRegistrationForm = async (id: string) => {
  try {
    const { error } = await supabase
      .from('phieudangki')
      .delete()
      .eq('maphieu', id);

    if (error) throw error;

    toast.success(`Xóa phiếu đăng ký ${id} thành công!`);
  } catch (error: any) {
    console.error('Error deleting registration form:', error);
    toast.error(`Không thể xóa phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm xóa phiếu gia hạn
const deleteExtensionForm = async (id: string) => {
  try {
    const { error } = await supabase
      .from('phieudangkigiahan')
      .delete()
      .eq('maphieu', id);

    if (error) throw error;

    toast.success(`Xóa phiếu gia hạn ${id} thành công!`);
  } catch (error: any) {
    console.error('Error deleting extension form:', error);
    toast.error(`Không thể xóa phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
  }
};

export default function QuanLyPhieuPage() {
  const [registrationForms, setRegistrationForms] = useState<RegistrationForm[]>([]);
  const [extensionForms, setExtensionForms] = useState<ExtensionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State cho dialog xem chi tiết
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRegistrationForm, setSelectedRegistrationForm] = useState<RegistrationForm | null>(null);
  const [selectedExtensionForm, setSelectedExtensionForm] = useState<ExtensionForm | null>(null);

  // State cho dialog chỉnh sửa trạng thái
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [editingFormType, setEditingFormType] = useState<'registration' | 'extension' | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  // State cho dialog xác nhận xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [deletingFormType, setDeletingFormType] = useState<'registration' | 'extension' | null>(null);

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchRegistrationForms(setRegistrationForms),
          fetchExtensionForms(setExtensionForms),
        ]);
      } catch (error: any) {
        console.error('Error fetching forms:', error);
        toast.error(`Không thể tải dữ liệu: ${error.message || "Lỗi không xác định"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hàm xử lý khi đóng dialog xem chi tiết
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedRegistrationForm(null);
    setSelectedExtensionForm(null);
  };

  // Hàm xử lý mở dialog xem chi tiết phiếu đăng ký
  const handleViewRegistrationForm = (form: RegistrationForm) => {
    setSelectedRegistrationForm(form);
    setViewDialogOpen(true);
  };

  // Hàm xử lý mở dialog xem chi tiết phiếu gia hạn
  const handleViewExtensionForm = (form: ExtensionForm) => {
    setSelectedExtensionForm(form);
    setViewDialogOpen(true);
  };

  // Hàm xử lý mở dialog chỉnh sửa trạng thái
  const handleOpenEditDialog = (id: string, type: 'registration' | 'extension', currentStatus: string) => {
    setEditingFormId(id);
    setEditingFormType(type);
    setNewStatus(currentStatus);
    setEditDialogOpen(true);
  };

  // Hàm xử lý lưu trạng thái mới
  const handleSaveStatus = async () => {
    if (!editingFormId || !editingFormType) return;

    if (editingFormType === 'registration') {
      await updateRegistrationFormStatus(editingFormId, newStatus);
      // Cập nhật danh sách phiếu đăng ký
      setRegistrationForms((prev) =>
        prev.map((form) =>
          form.id === editingFormId ? { ...form, status: newStatus } : form
        )
      );
    } else if (editingFormType === 'extension') {
      await updateExtensionFormStatus(editingFormId, newStatus);
      // Cập nhật danh sách phiếu gia hạn
      setExtensionForms((prev) =>
        prev.map((form) =>
          form.id === editingFormId ? { ...form, status: newStatus } : form
        )
      );
    }

    setEditDialogOpen(false);
    setEditingFormId(null);
    setEditingFormType(null);
    setNewStatus('');
  };

  // Hàm xử lý mở dialog xác nhận xóa
  const handleOpenDeleteDialog = (id: string, type: 'registration' | 'extension') => {
    setDeletingFormId(id);
    setDeletingFormType(type);
    setDeleteDialogOpen(true);
  };

  // Hàm xử lý xóa phiếu
  const handleDeleteForm = async () => {
    if (!deletingFormId || !deletingFormType) return;

    if (deletingFormType === 'registration') {
      await deleteRegistrationForm(deletingFormId);
      // Cập nhật danh sách phiếu đăng ký
      setRegistrationForms((prev) => prev.filter((form) => form.id !== deletingFormId));
    } else if (deletingFormType === 'extension') {
      await deleteExtensionForm(deletingFormId);
      // Cập nhật danh sách phiếu gia hạn
      setExtensionForms((prev) => prev.filter((form) => form.id !== deletingFormId));
    }

    setDeleteDialogOpen(false);
    setDeletingFormId(null);
    setDeletingFormType(null);
  };

  // Hàm lọc và tìm kiếm
  const filterForms = <T extends RegistrationForm | ExtensionForm>(forms: T[]) => {
    return forms.filter((form) => {
      const matchesSearch =
        form.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'approved' && form.status === 'Đã duyệt') ||
        (filterStatus === 'pending' && form.status === 'Chờ duyệt') ||
        (filterStatus === 'rejected' && form.status === 'Từ chối');
      return matchesSearch && matchesFilter;
    });
  };

  const filteredRegistrationForms = filterForms(registrationForms);
  const filteredExtensionForms = filterForms(extensionForms);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản Lý Phiếu</h1>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
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
                      <Input
                        type="search"
                        placeholder="Tìm kiếm phiếu đăng ký..."
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
                      {filteredRegistrationForms.length > 0 ? (
                        filteredRegistrationForms.map((form) => (
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
                                    : form.status === "Chờ duyệt"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {form.status}
                              </span>
                            </TableCell>
                            <TableCell>{form.createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewRegistrationForm(form)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditDialog(form.id, 'registration', form.status)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDeleteDialog(form.id, 'registration')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            Không có phiếu đăng ký nào
                          </TableCell>
                        </TableRow>
                      )}
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
                      <Input
                        type="search"
                        placeholder="Tìm kiếm phiếu gia hạn..."
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
                      {filteredExtensionForms.length > 0 ? (
                        filteredExtensionForms.map((form) => (
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
                                    : form.status === "Chờ duyệt"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {form.status}
                              </span>
                            </TableCell>
                            <TableCell>{form.createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewExtensionForm(form)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditDialog(form.id, 'extension', form.status)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDeleteDialog(form.id, 'extension')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">
                            Không có phiếu gia hạn nào
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

      {/* Dialog xem chi tiết phiếu */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRegistrationForm ? 'Chi tiết phiếu đăng ký' : 'Chi tiết phiếu gia hạn'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRegistrationForm ? (
              <>
                <div>
                  <strong>Mã phiếu:</strong> {selectedRegistrationForm.id}
                </div>
                <div>
                  <strong>Khách hàng:</strong> {selectedRegistrationForm.customerName}
                </div>
                <div>
                  <strong>Loại khách hàng:</strong> {selectedRegistrationForm.customerType}
                </div>
                <div>
                  <strong>Ngày thi:</strong> {selectedRegistrationForm.examDate}
                </div>
                <div>
                  <strong>Chứng chỉ:</strong> {selectedRegistrationForm.certificate}
                </div>
                <div>
                  <strong>Trạng thái:</strong> {selectedRegistrationForm.status}
                </div>
                <div>
                  <strong>Ngày tạo:</strong> {selectedRegistrationForm.createdAt}
                </div>
              </>
            ) : selectedExtensionForm ? (
              <>
                <div>
                  <strong>Mã phiếu:</strong> {selectedExtensionForm.id}
                </div>
                <div>
                  <strong>Khách hàng:</strong> {selectedExtensionForm.customerName}
                </div>
                <div>
                  <strong>Mã phiếu dự thi:</strong> {selectedExtensionForm.examTicket}
                </div>
                <div>
                  <strong>Ngày thi cũ:</strong> {selectedExtensionForm.oldDate}
                </div>
                <div>
                  <strong>Ngày thi mới:</strong> {selectedExtensionForm.newDate}
                </div>
                <div>
                  <strong>Lý do:</strong> {selectedExtensionForm.reason}
                </div>
                <div>
                  <strong>Trạng thái:</strong> {selectedExtensionForm.status}
                </div>
                <div>
                  <strong>Ngày tạo:</strong> {selectedExtensionForm.createdAt}
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseViewDialog}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa trạng thái */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa trạng thái</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <strong>Mã phiếu:</strong> {editingFormId}
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
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveStatus}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiếu {deletingFormId}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteForm}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}