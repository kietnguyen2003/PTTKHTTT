// src/app/tra-cuu-lich-thi/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar, Eye, RotateCcw, Clock, Plus } from "lucide-react";
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

interface NewExamData {
  tenChungChi: string;
  ngayThi: string;
  gioThi: string;
  diaDiem: string;
  sucChua: string;
  ghiChu: string;
}

export default function TraCuuLichThiPage() {
  const [exams, setExams] = useState<Exam[]>([]);
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

  // Tải dữ liệu khi component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchChungChi(), fetchExams()]);
    };
    loadData();
  }, []);

  // Hàm xử lý xem chi tiết buổi thi
  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam);
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
    </div>
  );
}