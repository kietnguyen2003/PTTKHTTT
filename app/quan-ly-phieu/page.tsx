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
import { v4 as uuidv4 } from 'uuid';

// interface cho phiếu đăng ký
interface RegistrationForm {
  id: string;
  customerName: string;
  customerType: string;
  examDate: string;
  certificate: string;
  status: string;
  createdAt: string;
}

// interface cho phiếu gia hạn
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

// hàm lấy danh sách phiếu đăng ký
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

// hàm lấy danh sách phiếu gia hạn
const fetchExtensionForms = async (setExtensionForms: (forms: ExtensionForm[]) => void) => {
  try {
    const { data, error } = await supabase
      .from('phieudangkigiahan')
      .select(`
        maphieu,
        makh,
        maphieuduthi,
        truonghopdacbiet,
        trangthai,
        created_at,
        khachhang (
          loaikh,
          khachhang_cn (hoten),
          khachhang_dv (tendv)
        ),
        phieuduthi (
          maphieu,
          thoigian
        ),
        buoithi (
          thoigian,
          diadiem,
          macc,
          thongtinchungchi (
            tencc)
        )
      `);

    if (error){
      console.log("Error: ", error);
      throw error;
    }

    if (!data || data.length === 0) {
      setExtensionForms([]);
      return;
    }
    console.log("Data: ", data);

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
        newDate: item.buoithi.thoigian
          ? new Date(item.buoithi.thoigian).toLocaleDateString('vi-VN')
          : 'N/A',
        reason: item.truonghopdacbiet ? 'Trường hợp đặc biệt' : 'Không có lý do đặc biệt',
        status: item.trangthai || 'Chờ duyệt',
        createdAt: item.created_at
          ? new Date(item.created_at).toLocaleDateString('vi-VN')
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

// hàm tạo phiếu dự thi từ phiếu đăng ký
const createExamTickets = async (registrationId: string) => {
  try {
    // lấy thông tin phiếu đăng ký
    const { data: registrationData, error: registrationError } = await supabase
      .from('phieudangki')
      .select(`
        maphieu,
        makh,
        mabuoithi,
        khachhang (
          loaikh
        ),
        buoithi (
          thoigian,
          diadiem,
          macc
        ),
        phieudangkichitiet (
          soluongthisinh
        )
      `)
      .eq('maphieu', registrationId)
      .single();

    if (registrationError || !registrationData) {
      throw new Error(registrationError?.message || 'Không tìm thấy phiếu đăng ký');
    }

    const loaiKh = registrationData.khachhang?.loaikh;
    const maKh = registrationData.makh;
    const maBuoiThi = registrationData.mabuoithi;
    const thoiGian = registrationData.buoithi?.thoigian;
    const diaDiem = registrationData.buoithi?.diadiem;
    const maCc = registrationData.buoithi?.macc;
    const soLuongThiSinh = loaiKh === 'DonVi' ? (registrationData.phieudangkichitiet?.soluongthisinh || 0) : 1;

    // tạo số lượng phiếu dự thi tương ứng
    const examTickets = [];
    for (let i = 0; i < soLuongThiSinh; i++) {
      const ticketId = `PDT${Date.now()}${i}`; // tạo mã phiếu dự thi
      const candidateNumber = `SBD${Date.now()}${i}`; // tạo số báo danh
      examTickets.push({
        maphieu: ticketId,
        sobaodanh: candidateNumber,
        makh: maKh,
        mabuoithi: maBuoiThi,
        macc: maCc,
        thoigian: thoiGian,
        diadiem: diaDiem,
        diemthi: null,
      });
    }

    // chèn các phiếu dự thi vào bảng phieuduthi
    const { error: insertError } = await supabase
      .from('phieuduthi')
      .insert(examTickets);

    if (insertError) {
      throw new Error(insertError.message);
    }

    toast.success(`Đã tạo ${soLuongThiSinh} phiếu dự thi cho phiếu đăng ký ${registrationId}`);
  } catch (error: any) {
    console.error('Error creating exam tickets:', error);
    toast.error(`Không thể tạo phiếu dự thi: ${error.message || "Lỗi không xác định"}`);
  }
};

// hàm cập nhật trạng thái phiếu đăng ký
const updateRegistrationFormStatus = async (id: string, newStatus: string, setRegistrationForms: (forms: RegistrationForm[]) => void) => {
  try {
    // Cập nhật trạng thái phiếu đăng ký
    const { error: updateError } = await supabase
      .from('phieudangki')
      .update({ trangthai: newStatus })
      .eq('maphieu', id);

    if (updateError) throw updateError;

    // Nếu trạng thái mới là "Đã duyệt", tạo phiếu dự thi
    if (newStatus === 'Đã duyệt') {
      await createExamTickets(id);
    }

    // Tải lại danh sách phiếu đăng ký để đảm bảo dữ liệu mới nhất
    await fetchRegistrationForms(setRegistrationForms);

    toast.success(`Cập nhật trạng thái phiếu đăng ký ${id} thành công!`);
  } catch (error: any) {
    console.error('Error updating registration form status:', error);
    toast.error(`Không thể cập nhật trạng thái phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

// Hàm cập nhật trạng thái phiếu gia hạn
const updateExtensionFormStatus = async (id: string, newStatus: string, setExtensionForms: (forms: ExtensionForm[]) => void) => {
  try {
    // Lấy thông tin phiếu gia hạn để tìm maphieuduthi
    const { data: extensionData, error: extensionError } = await supabase
      .from('phieudangkigiahan')
      .select(`
        maphieuduthi,
        buoithimoi,
        buoithi (
          thoigian,
          diadiem
        )
      `)
      .eq('maphieu', id)
      .single();

    if (extensionError || !extensionData) {
      throw new Error(extensionError?.message || 'Không tìm thấy phiếu gia hạn');
    }

    const maPhieuDuThi = extensionData.maphieuduthi;

    // Lấy thông tin phiếu dự thi để tìm makh và mabuoithi
    const { data: examTicketData, error: examTicketError } = await supabase
      .from('phieuduthi')
      .select(`
        makh,
        mabuoithi
      `)
      .eq('maphieu', maPhieuDuThi)
      .single();

    if (examTicketError || !examTicketData) {
      throw new Error(examTicketError?.message || 'Không tìm thấy phiếu dự thi');
    }

    const maKH = examTicketData.makh;
    const maBuoiThiCu = examTicketData.mabuoithi;

    // Kiểm tra trạng thái của phiếu đăng ký liên quan
    const { data: registrationData, error: registrationError } = await supabase
      .from('phieudangki')
      .select('trangthai, maphieu')
      .eq('makh', maKH)
      .eq('mabuoithi', maBuoiThiCu)
      .single();

    if (registrationError || !registrationData) {
      throw new Error(registrationError?.message || 'Không tìm thấy phiếu đăng ký liên quan');
    }

    // Nếu trạng thái phiếu đăng ký chưa phải là "Đã duyệt", thông báo lỗi và dừng cập nhật
    if (registrationData.trangthai !== 'Đã duyệt') {
      toast.error('Cần duyệt phiếu đăng ký');
      return;
    }

    // Cập nhật trạng thái phiếu gia hạn
    const { error: updateError } = await supabase
      .from('phieudangkigiahan')
      .update({ trangthai: newStatus })
      .eq('maphieu', id);

    if (updateError) throw updateError;

    // Nếu trạng thái mới là "Đã duyệt", cập nhật ngày thi mới vào phiếu dự thi
    if (newStatus === 'Đã duyệt') {
      const maBuoiThiMoi = extensionData.buoithimoi;
      const thoiGianMoi = extensionData.buoithi?.thoigian;
      const diaDiemMoi = extensionData.buoithi?.diadiem;

      if (maPhieuDuThi && maBuoiThiMoi && thoiGianMoi && diaDiemMoi) {
        // Cập nhật số lượng thí sinh cho MaBuoiThi cũ (giảm đi 1)
        const { data: oldBuoiThiData, error: oldBuoiThiError } = await supabase
          .from('buoithi')
          .select('soluongthisinh')
          .eq('mabuoithi', maBuoiThiCu)
          .single();

        if (oldBuoiThiError || !oldBuoiThiData) {
          throw new Error('Không tìm thấy buổi thi cũ để cập nhật số lượng thí sinh');
        }

        const newSoLuongOld = (oldBuoiThiData.soluongthisinh || 0) - 1;
        const { error: updateOldBuoiThiError } = await supabase
          .from('buoithi')
          .update({ soluongthisinh: newSoLuongOld })
          .eq('mabuoithi', maBuoiThiCu);

        if (updateOldBuoiThiError) {
          throw new Error('Không thể cập nhật số lượng thí sinh cho buổi thi cũ');
        }

        // Cập nhật số lượng thí sinh cho MaBuoiThi mới (tăng lên 1)
        const { data: newBuoiThiData, error: newBuoiThiError } = await supabase
          .from('buoithi')
          .select('soluongthisinh')
          .eq('mabuoithi', maBuoiThiMoi)
          .single();

        if (newBuoiThiError || !newBuoiThiData) {
          throw new Error('Không tìm thấy buổi thi mới để cập nhật số lượng thí sinh');
        }

        const newSoLuongNew = (newBuoiThiData.soluongthisinh || 0) + 1;
        const { error: updateNewBuoiThiError } = await supabase
          .from('buoithi')
          .update({ soluongthisinh: newSoLuongNew })
          .eq('mabuoithi', maBuoiThiMoi);

        if (updateNewBuoiThiError) {
          throw new Error('Không thể cập nhật số lượng thí sinh cho buổi thi mới');
        }

        // Cập nhật thời gian thi (thoigian), địa điểm (diadiem), và mabuoithi của phiếu dự thi
        const { error: updateExamTicketError } = await supabase
          .from('phieuduthi')
          .update({
            thoigian: thoiGianMoi,
            diadiem: diaDiemMoi,
            mabuoithi: maBuoiThiMoi
          })
          .eq('maphieu', maPhieuDuThi);

        if (updateExamTicketError) {
          console.error('Error updating exam ticket time:', updateExamTicketError);
          throw new Error('Không thể cập nhật thời gian thi của phiếu dự thi');
        }

        toast.success(`Đã cập nhật thời gian thi cho phiếu dự thi ${maPhieuDuThi} thành ${new Date(thoiGianMoi).toLocaleDateString('vi-VN')}`);
      } else {
        throw new Error('Thiếu thông tin để cập nhật: MaPhieuDuThi, MaBuoiThiMoi, ThoiGianMoi hoặc DiaDiemMoi không tồn tại');
      }
    }

    // Tải lại danh sách phiếu gia hạn để cập nhật giao diện
    await fetchExtensionForms(setExtensionForms);

    toast.success(`Cập nhật trạng thái phiếu gia hạn ${id} thành công!`);
  } catch (error: any) {
    console.error('Error updating extension form status:', error);
    toast.error(`Không thể cập nhật trạng thái phiếu gia hạn: ${error.message || "Lỗi không xác định"}`);
  }
};

// hàm xóa phiếu đăng ký
const deleteRegistrationForm = async (id: string, setRegistrationForms: (forms: RegistrationForm[]) => void) => {
  try {
    const { error } = await supabase
      .from('phieudangki')
      .delete()
      .eq('maphieu', id);

    if (error) throw error;

    // tải lại danh sách phiếu đăng ký
    await fetchRegistrationForms(setRegistrationForms);

    toast.success(`Xóa phiếu đăng ký ${id} thành công!`);
  } catch (error: any) {
    console.error('Error deleting registration form:', error);
    toast.error(`Không thể xóa phiếu đăng ký: ${error.message || "Lỗi không xác định"}`);
  }
};

// hàm xóa phiếu gia hạn
const deleteExtensionForm = async (id: string, setExtensionForms: (forms: ExtensionForm[]) => void) => {
  try {
    const { error } = await supabase
      .from('phieudangkigiahan')
      .delete()
      .eq('maphieu', id);

    if (error) throw error;

    // tải lại danh sách phiếu gia hạn
    await fetchExtensionForms(setExtensionForms);

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

  // state cho dialog xem chi tiết
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRegistrationForm, setSelectedRegistrationForm] = useState<RegistrationForm | null>(null);
  const [selectedExtensionForm, setSelectedExtensionForm] = useState<ExtensionForm | null>(null);

  // state cho dialog chỉnh sửa trạng thái
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [editingFormType, setEditingFormType] = useState<'registration' | 'extension' | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  // state cho dialog xác nhận xóa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [deletingFormType, setDeletingFormType] = useState<'registration' | 'extension' | null>(null);

  // lấy dữ liệu khi component mount
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

  // hàm xử lý khi đóng dialog xem chi tiết
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedRegistrationForm(null);
    setSelectedExtensionForm(null);
  };

  // hàm xử lý mở dialog xem chi tiết phiếu đăng ký
  const handleViewRegistrationForm = (form: RegistrationForm) => {
    setSelectedRegistrationForm(form);
    setViewDialogOpen(true);
  };

  // hàm xử lý mở dialog xem chi tiết phiếu gia hạn
  const handleViewExtensionForm = (form: ExtensionForm) => {
    setSelectedExtensionForm(form);
    setViewDialogOpen(true);
  };

  // hàm xử lý mở dialog chỉnh sửa trạng thái
  const handleOpenEditDialog = (id: string, type: 'registration' | 'extension', currentStatus: string) => {
    setEditingFormId(id);
    setEditingFormType(type);
    setNewStatus(currentStatus);
    setEditDialogOpen(true);
  };

  // hàm xử lý lưu trạng thái mới
  const handleSaveStatus = async () => {
    if (!editingFormId || !editingFormType) return;

    if (editingFormType === 'registration') {
      await updateRegistrationFormStatus(editingFormId, newStatus, setRegistrationForms);
    } else if (editingFormType === 'extension') {
      await updateExtensionFormStatus(editingFormId, newStatus, setExtensionForms);
    }

    setEditDialogOpen(false);
    setEditingFormId(null);
    setEditingFormType(null);
    setNewStatus('');
  };

  // hàm xử lý mở dialog xác nhận xóa
  const handleOpenDeleteDialog = (id: string, type: 'registration' | 'extension') => {
    setDeletingFormId(id);
    setDeletingFormType(type);
    setDeleteDialogOpen(true);
  };

  // hàm xử lý xóa phiếu
  const handleDeleteForm = async () => {
    if (!deletingFormId || !deletingFormType) return;

    if (deletingFormType === 'registration') {
      await deleteRegistrationForm(deletingFormId, setRegistrationForms);
    } else if (deletingFormType === 'extension') {
      await deleteExtensionForm(deletingFormId, setExtensionForms);
    }

    setDeleteDialogOpen(false);
    setDeletingFormId(null);
    setDeletingFormType(null);
  };

  // hàm lọc và tìm kiếm
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

      {/* dialog xem chi tiết phiếu */}
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

      {/* dialog chỉnh sửa trạng thái */}
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

      {/* dialog xác nhận xóa */}
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