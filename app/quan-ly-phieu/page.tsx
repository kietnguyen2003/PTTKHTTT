'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import {
  fetchRegistrationForms,
  updateRegistrationFormStatus,
  deleteRegistrationForm,
  updateRegistrationFormStatusBasic,
} from "@/services/phieuDangKiService";
import {
  fetchExtensionForms,
  updateExtensionFormStatus,
  deleteExtensionForm,
} from "@/services/phieuDangKiGiaHanService";
import {
  fetchPhieuDuThi,
  updatePhieuDuThiStatusBasic,
  deletePhieuDuThi,
} from "@/services/phieuDuThiService";
import { RegistrationForm, ExtensionForm } from '@/types/RegistrationTypes';
import { PhieuDuThi } from '@/types/ExamResultTypes';

export default function QuanLyPhieuPage() {
  const [registrationForms, setRegistrationForms] = useState<RegistrationForm[]>([]);
  const [extensionForms, setExtensionForms] = useState<ExtensionForm[]>([]);
  const [phieuDuThiList, setPhieuDuThiList] = useState<PhieuDuThi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRegistrationForm, setSelectedRegistrationForm] = useState<RegistrationForm | null>(null);
  const [selectedExtensionForm, setSelectedExtensionForm] = useState<ExtensionForm | null>(null);
  const [selectedPhieuDuThi, setSelectedPhieuDuThi] = useState<PhieuDuThi | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [editingFormType, setEditingFormType] = useState<'registration' | 'extension' | 'phieuduthi' | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [deletingFormType, setDeletingFormType] = useState<'registration' | 'extension' | 'phieuduthi' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchRegistrationForms(setRegistrationForms),
          fetchExtensionForms(setExtensionForms),
          fetchPhieuDuThi(setPhieuDuThiList, 'all'),
        ]);
      } catch (error: any) {
        console.error('Error fetching forms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedRegistrationForm(null);
    setSelectedExtensionForm(null);
    setSelectedPhieuDuThi(null);
  };

  const handleViewRegistrationForm = (form: RegistrationForm) => {
    setSelectedRegistrationForm(form);
    setViewDialogOpen(true);
  };

  const handleViewExtensionForm = (form: ExtensionForm) => {
    setSelectedExtensionForm(form);
    setViewDialogOpen(true);
  };

  const handleViewPhieuDuThi = (phieu: PhieuDuThi) => {
    setSelectedPhieuDuThi(phieu);
    setViewDialogOpen(true);
  };

  const handleOpenEditDialog = (id: string, type: 'registration' | 'extension' | 'phieuduthi', currentStatus: string) => {
    setEditingFormId(id);
    setEditingFormType(type);
    setNewStatus(currentStatus);
    setEditDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!editingFormId || !editingFormType) return;

    if (editingFormType === 'registration') {
      await updateRegistrationFormStatusBasic(editingFormId, newStatus, setRegistrationForms);
    } else if (editingFormType === 'extension') {
      await updateExtensionFormStatus(editingFormId, newStatus, setExtensionForms);
    } else if (editingFormType === 'phieuduthi') {
      await updatePhieuDuThiStatusBasic(editingFormId, newStatus, setPhieuDuThiList);
    }

    setEditDialogOpen(false);
    setEditingFormId(null);
    setEditingFormType(null);
    setNewStatus('');
  };

  const handleOpenDeleteDialog = (id: string, type: 'registration' | 'extension' | 'phieuduthi') => {
    setDeletingFormId(id);
    setDeletingFormType(type);
    setDeleteDialogOpen(true);
  };

  const handleDeleteForm = async () => {
    if (!deletingFormId || !deletingFormType) return;

    if (deletingFormType === 'registration') {
      await deleteRegistrationForm(deletingFormId, setRegistrationForms);
    } else if (deletingFormType === 'extension') {
      await deleteExtensionForm(deletingFormId, setExtensionForms);
    } else if (deletingFormType === 'phieuduthi') {
      await deletePhieuDuThi(deletingFormId, setPhieuDuThiList);
    }

    setDeleteDialogOpen(false);
    setDeletingFormId(null);
    setDeletingFormType(null);
  };

  const filterForms = <T extends RegistrationForm | ExtensionForm | PhieuDuThi>(forms: T[]) => {
    return forms.filter((form) => {
      const customerName =
        'customerName' in form
          ? form.customerName
          : (form as PhieuDuThi).khachhang?.thongtinthsinh?.hoten ||
            (form as PhieuDuThi).khachhang?.khachhang_cn?.hoten ||
            'N/A';
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'approved' && form.status === 'Đã duyệt') ||
        (filterStatus === 'pending' && form.status === 'Chờ duyệt') ||
        (filterStatus === 'rejected' && form.status === 'Từ chối') ||
        (filterStatus === 'chua_thi' && form.status === 'chua_thi') ||
        (filterStatus === 'da_Thi' && form.status === 'da_thi');
      return matchesSearch && matchesFilter;
    });
  };

  const filteredRegistrationForms = filterForms(registrationForms);
  const filteredExtensionForms = filterForms(extensionForms);
  const filteredPhieuDuThi = filterForms(phieuDuThiList);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản Lý Phiếu</h1>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <Tabs defaultValue="registration">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="registration">Phiếu đăng ký</TabsTrigger>
            <TabsTrigger value="extension">Phiếu gia hạn</TabsTrigger>
            <TabsTrigger value="phieuduthi">Phiếu dự thi</TabsTrigger>
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

          <TabsContent value="phieuduthi" className="space-y-4 pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Danh sách phiếu dự thi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Tìm kiếm phiếu dự thi..."
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
                        <SelectItem value="chua_thi">Chưa thi</SelectItem>
                        <SelectItem value="da_thi">Đã thi</SelectItem>
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
                        <TableHead>Số báo danh</TableHead>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Chứng chỉ</TableHead>
                        <TableHead>Ngày thi</TableHead>
                        <TableHead>Địa điểm</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPhieuDuThi.length > 0 ? (
                        filteredPhieuDuThi.map((phieu) => (
                          <TableRow key={phieu.maphieu}>
                            <TableCell className="font-medium">{phieu.maphieu}</TableCell>
                            <TableCell>{phieu.sobaodanh}</TableCell>
                            <TableCell>
                              {phieu.khachhang?.thongtinthisinh?.hoten ||
                                phieu.khachhang?.khachhang_cn?.hoten ||
                                'N/A'}
                            </TableCell>
                            <TableCell>{phieu.thongtinchungchi.tencc}</TableCell>
                            <TableCell>{new Date(phieu.thoigian).toLocaleString("vi-VN")}</TableCell>
                            <TableCell>{phieu.diadiem}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  phieu.status === 'chua_thi'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {phieu.status === 'chua_thi' ? 'Chưa thi' : 'Đã thi'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewPhieuDuThi(phieu)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditDialog(phieu.maphieu, 'phieuduthi', phieu.status)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDeleteDialog(phieu.maphieu, 'phieuduthi')}
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
                            Không có phiếu dự thi nào
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRegistrationForm
                ? 'Chi tiết phiếu đăng ký'
                : selectedExtensionForm
                ? 'Chi tiết phiếu gia hạn'
                : 'Chi tiết phiếu dự thi'}
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
            ) : selectedPhieuDuThi ? (
              <>
                <div>
                  <strong>Mã phiếu:</strong> {selectedPhieuDuThi.maphieu}
                </div>
                <div>
                  <strong>Số báo danh:</strong> {selectedPhieuDuThi.sobaodanh}
                </div>
                <div>
                  <strong>Họ tên:</strong>{' '}
                  {selectedPhieuDuThi.khachhang?.thongtinthsinh?.hoten ||
                    selectedPhieuDuThi.khachhang?.khachhang_cn?.hoten ||
                    'N/A'}
                </div>
                <div>
                  <strong>Chứng chỉ:</strong> {selectedPhieuDuThi.thongtinchungchi.tencc}
                </div>
                <div>
                  <strong>Ngày thi:</strong> {new Date(selectedPhieuDuThi.thoigian).toLocaleString("vi-VN")}
                </div>
                <div>
                  <strong>Địa điểm:</strong> {selectedPhieuDuThi.diadiem}
                </div>
                <div>
                  <strong>Trạng thái:</strong> {selectedPhieuDuThi.status === 'chua_thi' ? 'Chưa thi' : 'Đã thi'}
                </div>
                <div>
                  <strong>Ngày tạo:</strong> {selectedPhieuDuThi.createdAt}
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={handleCloseViewDialog}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {editingFormType === 'phieuduthi' ? (
                    <>
                      <SelectItem value="chua_thi">Chưa thi</SelectItem>
                      <SelectItem value="da_thi">Đã thi</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
                      <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
                      <SelectItem value="Từ chối">Từ chối</SelectItem>
                    </>
                  )}
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