"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar, Eye, RotateCcw, Clock, Plus, Pencil, Award } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/supabaseClient";
import { toast } from "@/components/ui/use-toast";

// Định nghĩa kiểu dữ liệu cho dữ liệu từ Supabase
interface SupabaseThongTinChungChi {
  macc: string;
  tencc: string | null;
}

interface SupabasePhongThi {
  maphong: string;
  succhua: number | null;
}

interface SupabaseBuoiThi {
  mabuoithi: string;
  macc: string;
  soluongthisinh: number;
  diadiem: string | null;
  thoigian: string | null;
  trangthai: "DaToChuc" | "ChuaToChuc";
  thongtinchungchi: SupabaseThongTinChungChi | null;
  phongthi: SupabasePhongThi[];
}

interface SupabaseKhachHang {
  makh: string;
  loaikh: string;
  khachhang_cn?: { hoten: string };
  khachhang_dv?: { tendv: string };
}

interface SupabasePhieuDuThi {
  maphieu: string;
  sobaodanh: string;
  makh: string;
  mabuoithi: string;
  thoigian: string | null;
  diadiem: string | null;
  khachhang: SupabaseKhachHang | null;
}

interface Exam {
  maBuoiThi: string;
  tenChungChi: string;
  thoiGian: string;
  diaDiem: string;
  soLuongThiSinh: number;
  trangThai: string;
  sucChua: number;
  ghiChu: string;
}

interface ExamTicket {
  maPhieu: string;
  soBaoDanh: string;
  tenKhachHang: string;
  thoiGian: string;
  diaDiem: string;
}

interface NewExamData {
  tenChungChi: string;
  ngayThi: string;
  gioThi: string;
  diaDiem: string;
  sucChua: string;
  ghiChu: string;
}

interface EditExamData {
  ngayThi: string;
  gioThi: string;
  diaDiem: string;
  trangThai: string;
}

interface NewChungChiData {
  tencc: string;
  thoigianthi: number;
  giatien: number;
}

export default function TraCuuLichThiPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examTickets, setExamTickets] = useState<ExamTicket[]>([]);
  const [chungChiList, setChungChiList] = useState<SupabaseThongTinChungChi[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [newExamData, setNewExamData] = useState<NewExamData>({
    tenChungChi: "",
    ngayThi: "",
    gioThi: "",
    diaDiem: "",
    sucChua: "",
    ghiChu: "",
  });
  const [editExamData, setEditExamData] = useState<EditExamData>({
    ngayThi: "",
    gioThi: "",
    diaDiem: "",
    trangThai: "",
  });
  const [newChungChiData, setNewChungChiData] = useState<NewChungChiData>({
    tencc: "",
    thoigianthi: 0,
    giatien: 0,
  });
  const [createChungChiDialogOpen, setCreateChungChiDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterChungChi, setFilterChungChi] = useState("all");
  const [filterNgayThi, setFilterNgayThi] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("all");

  // Hàm lấy danh sách chứng chỉ từ Supabase
  const fetchChungChi = async () => {
    try {
      const { data, error } = await supabase.from("thongtinchungchi").select("macc, tencc");
      if (error) {
        console.error("Supabase error fetching chung chi:", error.message, error.details, error.hint);
        throw error;
      }
      setChungChiList(data || []);
    } catch (error: any) {
      console.error("Error fetching chung chi:", error.message);
      toast({
        title: "Lỗi",
        description: `Không thể tải danh sách chứng chỉ: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Hàm lấy danh sách lịch thi từ Supabase
  const fetchExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("buoithi")
        .select(`
          mabuoithi,
          macc,
          soluongthisinh,
          diadiem,
          thoigian,
          trangthai,
          thongtinchungchi (
            macc,
            tencc
          ),
          phongthi (
            maphong,
            succhua
          )
        `);

      if (error) {
        console.error("Supabase error:", error.message, error.details, error.hint);
        throw error;
      }

      console.log("Supabase exams data:", data);

      const examsData: Exam[] = (data as unknown as SupabaseBuoiThi[]).map((item) => ({
        maBuoiThi: item.mabuoithi,
        tenChungChi: item.thongtinchungchi?.tencc || "Không xác định",
        thoiGian: item.thoigian
          ? new Date(item.thoigian).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Chưa xác định",
        diaDiem: item.diadiem || "Chưa xác định",
        soLuongThiSinh: item.soluongthisinh || 0,
        trangThai: item.trangthai === "DaToChuc" ? "Đã tổ chức" : "Chưa tổ chức",
        sucChua: item.phongthi[0]?.succhua || 0,
        ghiChu: "", // Schema không có trường ghi chú, để trống
      }));

      setExams(examsData);
    } catch (error: any) {
      console.error("Error fetching exams:", error.message, error);
      toast({
        title: "Lỗi",
        description: `Không thể tải danh sách lịch thi: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách phiếu dự thi theo mã buổi thi
  const fetchExamTickets = async (maBuoiThi: string) => {
    try {
      const { data, error } = await supabase
        .from("phieuduthi")
        .select(`
          maphieu,
          sobaodanh,
          makh,
          thoigian,
          diadiem,
          khachhang (
            makh,
            loaikh,
            khachhang_cn (hoten),
            khachhang_dv (tendv)
          )
        `)
        .eq("mabuoithi", maBuoiThi);

      if (error) {
        console.error("Supabase error fetching exam tickets:", error.message, error.details, error.hint);
        throw error;
      }

      const tickets: ExamTicket[] = (data as unknown as SupabasePhieuDuThi[]).map((item) => {
        const khachHang = item.khachhang;
        const tenKhachHang = khachHang
          ? khachHang.loaikh === "CaNhan"
            ? khachHang.khachhang_cn?.hoten || "N/A"
            : khachHang.khachhang_dv?.tendv || "N/A"
          : "N/A";

        return {
          maPhieu: item.maphieu,
          soBaoDanh: item.sobaodanh,
          tenKhachHang,
          thoiGian: item.thoigian
            ? new Date(item.thoigian).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Chưa xác định",
          diaDiem: item.diadiem || "Chưa xác định",
        };
      });

      setExamTickets(tickets);
    } catch (error: any) {
      console.error("Error fetching exam tickets:", error.message);
      toast({
        title: "Lỗi",
        description: `Không thể tải danh sách phiếu dự thi: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Hàm thêm chứng chỉ mới
  const handleAddChungChi = async () => {
    try {
      if (!newChungChiData.tencc.trim()) {
        throw new Error("Vui lòng nhập tên chứng chỉ");
      }

      // Tạo mã chứng chỉ mới
      const newMaChungChi = `CC${Date.now()}`;

      // Lưu chứng chỉ mới vào Supabase
      const { error } = await supabase.from("thongtinchungchi").insert({
        macc: newMaChungChi,
        tencc: newChungChiData.tencc,
        thoigianthi: newChungChiData.thoigianthi,
        giatien: newChungChiData.giatien,
      });

      if (error) {
        throw error;
      }

      toast({ title: "Thành công", description: "Đã tạo chứng chỉ mới" });

      // Cập nhật danh sách chứng chỉ
      await fetchChungChi();

      // Reset form và đóng dialog
      setNewChungChiData({ tencc: "", thoigianthi: 0, giatien: 0 });
      setCreateChungChiDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding chung chi:", error.message);
      toast({
        title: "Lỗi",
        description: `Không thể tạo chứng chỉ: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Hàm xử lý thay đổi input trong form tạo chứng chỉ
  const handleChungChiInputChange = (value: string, field: 'tencc' | 'thoigianthi' | 'giatien') => {
    setNewChungChiData({ ...newChungChiData, [field]: value });
  };

  // Tải dữ liệu khi component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchChungChi(), fetchExams()]);
    };
    loadData();
  }, []);

  // Hàm xử lý xem chi tiết buổi thi
  const handleViewExam = async (exam: Exam) => {
    setSelectedExam(exam);
    await fetchExamTickets(exam.maBuoiThi);
  };

  // Hàm xử lý mở dialog chỉnh sửa
  const handleOpenEditDialog = (exam: Exam) => {
    const thoiGian = new Date(exam.thoiGian.split(", ")[1] + " " + exam.thoiGian.split(", ")[0]);
    setEditExamData({
      ngayThi: thoiGian.toISOString().split("T")[0],
      gioThi: thoiGian.toTimeString().split(" ")[0].substring(0, 5),
      diaDiem: exam.diaDiem,
      trangThai: exam.trangThai === "Đã tổ chức" ? "DaToChuc" : "ChuaToChuc",
    });
    setEditDialogOpen(true);
  };

  // Hàm xử lý thay đổi input trong form chỉnh sửa
  const handleEditInputChange = (field: keyof EditExamData, value: string) => {
    setEditExamData({
      ...editExamData,
      [field]: value,
    });
  };

  // Hàm cập nhật buổi thi
  const handleUpdateExam = async () => {
    if (!selectedExam) return;

    try {
      if (!editExamData.ngayThi || !editExamData.gioThi || !editExamData.diaDiem) {
        throw new Error("Vui lòng nhập đầy đủ ngày thi, giờ thi và địa điểm");
      }

      // Kết hợp ngày và giờ thi
      const thoiGianMoi = new Date(`${editExamData.ngayThi}T${editExamData.gioThi}`);

      // Cập nhật thông tin buổi thi trong bảng buoithi
      const { error: buoiThiError } = await supabase
        .from("buoithi")
        .update({
          thoigian: thoiGianMoi.toISOString(),
          diadiem: editExamData.diaDiem,
          trangthai: editExamData.trangThai as "DaToChuc" | "ChuaToChuc",
        })
        .eq("mabuoithi", selectedExam.maBuoiThi);

      if (buoiThiError) {
        throw buoiThiError;
      }

      // Đồng bộ thời gian và địa điểm với các phiếu dự thi liên quan
      const { error: phieuDuThiError } = await supabase
        .from("phieuduthi")
        .update({
          thoigian: thoiGianMoi.toISOString(),
          diadiem: editExamData.diaDiem,
        })
        .eq("mabuoithi", selectedExam.maBuoiThi);

      if (phieuDuThiError) {
        throw phieuDuThiError;
      }

      toast({ title: "Thành công", description: "Đã cập nhật buổi thi" });

      // Tải lại danh sách lịch thi và phiếu dự thi
      await Promise.all([fetchExams(), fetchExamTickets(selectedExam.maBuoiThi)]);

      // Đóng dialog chỉnh sửa
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating exam:", error.message, error);
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật buổi thi: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Hàm xử lý thay đổi input trong form thêm lịch thi
  const handleInputChange = (field: keyof NewExamData, value: string) => {
    setNewExamData({
      ...newExamData,
      [field]: value,
    });
  };

  // Hàm thêm lịch thi mới
  const handleAddExam = async () => {
    try {
      if (!newExamData.tenChungChi || !newExamData.ngayThi || !newExamData.gioThi || !newExamData.diaDiem) {
        throw new Error("Vui lòng nhập đầy đủ loại chứng chỉ, ngày thi, giờ thi và địa điểm");
      }

      // Tìm mã chứng chỉ dựa trên tên chứng chỉ
      const { data: chungChiData, error: chungChiError } = await supabase
        .from("thongtinchungchi")
        .select("macc")
        .eq("tencc", newExamData.tenChungChi)
        .single();

      if (chungChiError || !chungChiData) {
        throw new Error("Không tìm thấy chứng chỉ phù hợp");
      }

      // Tạo mã buổi thi mới
      const newMaBuoiThi = `BT${Date.now()}`;
      const newMaPhong = `PT${Date.now()}`;

      // Kết hợp ngày và giờ thi
      const thoiGian = new Date(`${newExamData.ngayThi}T${newExamData.gioThi}`);

      // Lưu buổi thi mới vào Supabase
      const { error: buoiThiError } = await supabase.from("buoithi").insert({
        mabuoithi: newMaBuoiThi,
        macc: chungChiData.macc,
        soluongthisinh: 0,
        diadiem: newExamData.diaDiem,
        thoigian: thoiGian.toISOString(),
        trangthai: "ChuaToChuc",
      });

      if (buoiThiError) {
        throw buoiThiError;
      }

      // Lưu phòng thi mới
      const { error: phongThiError } = await supabase.from("phongthi").insert({
        maphong: newMaPhong,
        mabuoithi: newMaBuoiThi,
        succhua: parseInt(newExamData.sucChua) || null,
      });

      if (phongThiError) {
        throw phongThiError;
      }

      toast({ title: "Thành công", description: "Đã thêm lịch thi mới" });

      // Cập nhật danh sách lịch thi
      await fetchExams();

      // Reset form
      setNewExamData({
        tenChungChi: "",
        ngayThi: "",
        gioThi: "",
        diaDiem: "",
        sucChua: "",
        ghiChu: "",
      });
    } catch (error: any) {
      console.error("Error adding exam:", error.message, error);
      toast({
        title: "Lỗi",
        description: `Không thể thêm lịch thi: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Hàm xử lý bộ lọc tìm kiếm
  const filteredExams = exams.filter((exam) => {
    const matchesChungChi =
      filterChungChi === "all" ||
      exam.tenChungChi.toLowerCase().includes(filterChungChi.toLowerCase());
    const matchesNgayThi =
      filterNgayThi === "" ||
      exam.thoiGian.includes(new Date(filterNgayThi).toLocaleDateString("vi-VN"));
    const matchesTrangThai =
      filterTrangThai === "all" ||
      (filterTrangThai === "ChuaToChuc" && exam.trangThai === "Chưa tổ chức") ||
      (filterTrangThai === "DaToChuc" && exam.trangThai === "Đã tổ chức");
    return matchesChungChi && matchesNgayThi && matchesTrangThai;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tra Cứu Lịch Thi</h1>
        <div className="flex gap-2">
          <Dialog open={createChungChiDialogOpen} onOpenChange={setCreateChungChiDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Award className="h-4 w-4" />
                Tạo chứng chỉ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tạo chứng chỉ mới</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tencc">Tên chứng chỉ</Label>
                  <Input
                    id="tencc"
                    placeholder="Nhập tên chứng chỉ (VD: Tiếng Anh B1)"
                    value={newChungChiData.tencc}
                    onChange={(e) => handleChungChiInputChange(e.target.value, 'tencc')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thoigianthi">Thời gian thi</Label>
                  <Input
                    id="thoigianthi"
                    type="number"
                    placeholder="Nhập thời gian thi (VD: 120 phút)"
                    value={newChungChiData.thoigianthi}
                    onChange={(e) => handleChungChiInputChange(e.target.value, 'thoigianthi')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giatien">Giá tiền</Label>
                  <Input
                    id="giatien"
                    type="number"
                    placeholder="Nhập giá tiền (VD: 1000000)"
                    value={newChungChiData.giatien}
                    onChange={(e) => handleChungChiInputChange(e.target.value, 'giatien')}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateChungChiDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddChungChi}>Tạo chứng chỉ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm lịch thi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Thêm lịch thi mới</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tenChungChi">Loại chứng chỉ</Label>
                  <Select
                    value={newExamData.tenChungChi}
                    onValueChange={(value) => handleInputChange("tenChungChi", value)}
                  >
                    <SelectTrigger id="tenChungChi">
                      <SelectValue placeholder="Chọn loại chứng chỉ" />
                    </SelectTrigger>
                    <SelectContent>
                      {chungChiList.length > 0 ? (
                        chungChiList.map((chungChi) => (
                          <SelectItem key={chungChi.macc} value={chungChi.tencc || ""}>
                            {chungChi.tencc || "Không xác định"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Không có chứng chỉ nào
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ngayThi">Ngày thi</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ngayThi"
                        type="date"
                        className="pl-8"
                        value={newExamData.ngayThi}
                        onChange={(e) => handleInputChange("ngayThi", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gioThi">Giờ thi</Label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="gioThi"
                        type="time"
                        className="pl-8"
                        value={newExamData.gioThi}
                        onChange={(e) => handleInputChange("gioThi", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diaDiem">Địa điểm</Label>
                  <Input
                    id="diaDiem"
                    placeholder="Nhập địa điểm tổ chức"
                    value={newExamData.diaDiem}
                    onChange={(e) => handleInputChange("diaDiem", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sucChua">Sức chứa</Label>
                  <Input
                    id="sucChua"
                    type="number"
                    placeholder="Nhập sức chứa phòng thi"
                    value={newExamData.sucChua}
                    onChange={(e) => handleInputChange("sucChua", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ghiChu">Ghi chú</Label>
                  <Textarea
                    id="ghiChu"
                    placeholder="Nhập ghi chú (nếu có)"
                    value={newExamData.ghiChu}
                    onChange={(e) => handleInputChange("ghiChu", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Hủy</Button>
                <Button onClick={handleAddExam}>Thêm lịch thi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Bộ lọc tìm kiếm</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="loaiChungChi">Loại chứng chỉ</Label>
                <Select
                  value={filterChungChi}
                  onValueChange={setFilterChungChi}
                >
                  <SelectTrigger id="loaiChungChi">
                    <SelectValue placeholder="Chọn loại chứng chỉ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại chứng chỉ</SelectItem>
                    {chungChiList.map((chungChi) => (
                      <SelectItem key={chungChi.macc} value={chungChi.tencc || ""}>
                        {chungChi.tencc || "Không xác định"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ngayThi">Ngày thi</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ngayThi"
                    type="date"
                    className="pl-8"
                    value={filterNgayThi}
                    onChange={(e) => setFilterNgayThi(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trangThai">Trạng thái</Label>
                <Select
                  value={filterTrangThai}
                  onValueChange={setFilterTrangThai}
                >
                  <SelectTrigger id="trangThai">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Chọn trạng thái" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="ChuaToChuc">Chưa tổ chức</SelectItem>
                    <SelectItem value="DaToChuc">Đã tổ chức</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setFilterChungChi("all");
                  setFilterNgayThi("");
                  setFilterTrangThai("all");
                }}
              >
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
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : filteredExams.length === 0 ? (
            <p>Không có lịch thi nào phù hợp với bộ lọc</p>
          ) : (
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
                  {filteredExams.map((exam) => (
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
                            exam.trangThai === "Chưa tổ chức"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {exam.trangThai}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleViewExam(exam)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                              <DialogTitle>Chi tiết buổi thi</DialogTitle>
                            </DialogHeader>
                            {selectedExam && (
                              <div className="space-y-6">
                                {/* Thông tin buổi thi */}
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold">Thông tin buổi thi</h3>
                                    <Button
                                      variant="outline"
                                      className="gap-2"
                                      onClick={() => handleOpenEditDialog(selectedExam)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                      Chỉnh sửa
                                    </Button>
                                  </div>
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
                                          <TableCell>{selectedExam.trangThai}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="font-medium">Ghi chú</TableCell>
                                          <TableCell>{selectedExam.ghiChu || "Không có ghi chú"}</TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>

                                {/* Danh sách phiếu dự thi */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-2">Danh sách thí sinh</h3>
                                  {examTickets.length > 0 ? (
                                    <div className="rounded-md border">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Mã phiếu dự thi</TableHead>
                                            <TableHead>Số báo danh</TableHead>
                                            <TableHead>Tên thí sinh</TableHead>
                                            <TableHead>Thời gian</TableHead>
                                            <TableHead>Địa điểm</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {examTickets.map((ticket) => (
                                            <TableRow key={ticket.maPhieu}>
                                              <TableCell className="font-medium">{ticket.maPhieu}</TableCell>
                                              <TableCell>{ticket.soBaoDanh}</TableCell>
                                              <TableCell>{ticket.tenKhachHang}</TableCell>
                                              <TableCell>{ticket.thoiGian}</TableCell>
                                              <TableCell>{ticket.diaDiem}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <p>Không có thí sinh nào đăng ký cho buổi thi này.</p>
                                  )}
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
          )}
        </CardContent>
      </Card>

      {/* Dialog chỉnh sửa buổi thi */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa buổi thi</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editNgayThi">Ngày thi</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="editNgayThi"
                    type="date"
                    className="pl-8"
                    value={editExamData.ngayThi}
                    onChange={(e) => handleEditInputChange("ngayThi", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editGioThi">Giờ thi</Label>
                <div className="relative">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="editGioThi"
                    type="time"
                    className="pl-8"
                    value={editExamData.gioThi}
                    onChange={(e) => handleEditInputChange("gioThi", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDiaDiem">Địa điểm</Label>
              <Input
                id="editDiaDiem"
                placeholder="Nhập địa điểm tổ chức"
                value={editExamData.diaDiem}
                onChange={(e) => handleEditInputChange("diaDiem", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTrangThai">Trạng thái</Label>
              <Select
                value={editExamData.trangThai}
                onValueChange={(value) => handleEditInputChange("trangThai", value)}
              >
                <SelectTrigger id="editTrangThai">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ChuaToChuc">Chưa tổ chức</SelectItem>
                  <SelectItem value="DaToChuc">Đã tổ chức</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateExam}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}