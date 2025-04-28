"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, Eye, Pencil, Trash2, Building, RotateCcw, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/supabaseClient";

// Types
interface Candidate {
  soBaoDanh: string;
  hoTen: string;
  loaiChungChi: string;
}

interface ExamRoom {
  maphong: string;
  tenphong: string;
  toanha: string;
  succhua: number;
  soThiSinhHienTai: number;
  trangthai: string;
  ghichu: string;
  thiSinh: Candidate[];
}

interface RoomFormData {
  maphong: string;
  tenphong: string;
  toanha: string;
  succhua: string;
  trangthai: string;
  ghichu: string;
}

interface UnassignedCandidate {
  sobaodanh: string;
  hoten: string;
  tencc: string;
}

export default function QuanLyPhongThiPage() {
  const [examRooms, setExamRooms] = useState<ExamRoom[]>([]);
  const [unassignedCandidates, setUnassignedCandidates] = useState<UnassignedCandidate[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ExamRoom | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newRoomData, setNewRoomData] = useState<RoomFormData>({
    maphong: "",
    tenphong: "",
    toanha: "",
    succhua: "",
    trangthai: "available",
    ghichu: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterToaNha, setFilterToaNha] = useState("all");
  const [filterTrangThai, setFilterTrangThai] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exam rooms and unassigned candidates
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch exam rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from("phongthi")
          .select(`
            maphong,
            tenphong,
            toanha,
            succhua,
            trangthai,
            ghichu,
            phieuduthi (
              sobaodanh,
              khachhang:makh (
                thongtinthisinh (hoten),
                khachhang_cn (hoten)
              ),
              thongtinchungchi:macc (tencc)
            )
          `);

        if (roomsError) throw roomsError;

        const formattedRooms: ExamRoom[] = roomsData.map((room) => ({
          maphong: room.maphong,
          tenphong: room.tenphong,
          toanha: room.toanha,
          succhua: room.succhua,
          trangthai: room.trangthai,
          ghichu: room.ghichu || "",
          soThiSinhHienTai: room.phieuduthi.length,
          thiSinh: room.phieuduthi.map((pdt) => ({
            soBaoDanh: pdt.sobaodanh,
            hoTen: pdt.khachhang.thongtinthisinh?.hoten || pdt.khachhang.khachhang_cn?.hoten || "Không có tên",
            loaiChungChi: pdt.thongtinchungchi.tencc,
          })),
        }));
        setExamRooms(formattedRooms);

        // Fetch unassigned candidates
        const { data: unassignedData, error: unassignedError } = await supabase
          .from("phieuduthi")
          .select(`
            sobaodanh,
            khachhang:makh (
              thongtinthisinh (hoten),
              khachhang_cn (hoten)
            ),
            thongtinchungchi:macc (tencc)
          `)
          .is("maphong", null);

        if (unassignedError) throw unassignedError;

        const formattedUnassigned: UnassignedCandidate[] = unassignedData.map((pdt) => ({
          sobaodanh: pdt.sobaodanh,
          hoten: pdt.khachhang.thongtinthisinh?.hoten || pdt.khachhang.khachhang_cn?.hoten || "Không có tên",
          tencc: pdt.thongtinchungchi.tencc,
        }));
        setUnassignedCandidates(formattedUnassigned);
      } catch (err: any) {
        setError("Lỗi khi tải dữ liệu: " + err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleViewRoom = (room: ExamRoom) => {
    setSelectedRoom(room);
    setIsEditing(false);
  };

  const handleEditRoom = (room: ExamRoom) => {
    setSelectedRoom(room);
    setIsEditing(true);
    setNewRoomData({
      maphong: room.maphong,
      tenphong: room.tenphong,
      toanha: room.toanha,
      succhua: room.succhua.toString(),
      trangthai: room.trangthai,
      ghichu: room.ghichu,
    });
  };

  const handleCreateRoom = () => {
    setSelectedRoom(null);
    setIsEditing(true);
    setNewRoomData({
      maphong: "",
      tenphong: "",
      toanha: "",
      succhua: "",
      trangthai: "available",
      ghichu: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewRoomData({
      ...newRoomData,
      [field]: value,
    });
  };

  const handleSaveRoom = async () => {
    // Validate form
    if (!newRoomData.maphong || !newRoomData.tenphong || !newRoomData.toanha || !newRoomData.succhua) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const capacity = Number.parseInt(newRoomData.succhua);
    if (isNaN(capacity) || capacity <= 0) {
      alert("Sức chứa phải là số dương");
      return;
    }

    try {
      if (selectedRoom) {
        // Update existing room
        const { error } = await supabase
          .from("phongthi")
          .update({
            tenphong: newRoomData.tenphong,
            toanha: newRoomData.toanha,
            succhua: capacity,
            trangthai: newRoomData.trangthai,
            ghichu: newRoomData.ghichu,
          })
          .eq("maphong", newRoomData.maphong);

        if (error) throw error;
        alert("Đã cập nhật phòng thi thành công!");
      } else {
        // Create new room
        const { error } = await supabase.from("phongthi").insert([
          {
            maphong: newRoomData.maphong,
            tenphong: newRoomData.tenphong,
            toanha: newRoomData.toanha,
            succhua: capacity,
            trangthai: newRoomData.trangthai,
            ghichu: newRoomData.ghichu,
          },
        ]);

        if (error) throw error;
        alert("Đã tạo phòng thi mới thành công!");
      }

      // Refresh rooms
      const { data } = await supabase
        .from("phongthi")
        .select(`
          maphong,
          tenphong,
          toanha,
          succhua,
          trangthai,
          ghichu,
          phieuduthi (
            sobaodanh,
            khachhang:makh (
              thongtinthisinh (hoten),
              khachhang_cn (hoten)
            ),
            thongtinchungchi:macc (tencc)
          )
        `);
      setExamRooms(
        data.map((room) => ({
          maphong: room.maphong,
          tenphong: room.tenphong,
          toanha: room.toanha,
          succhua: room.succhua,
          trangthai: room.trangthai,
          ghichu: room.ghichu || "",
          soThiSinhHienTai: room.phieuduthi.length,
          thiSinh: room.phieuduthi.map((pdt) => ({
            soBaoDanh: pdt.sobaodanh,
            hoTen: pdt.khachhang.thongtinthisinh?.hoten || pdt.khachhang.khachhang_cn?.hoten || "Không có tên",
            loaiChungChi: pdt.thongtinchungchi.tencc,
          })),
        })),
      );
      setIsEditing(false);
    } catch (err: any) {
      alert("Lỗi khi lưu phòng thi: " + err.message);
      console.error("Error saving room:", err);
    }
  };

  const handleDeleteRoom = async (room: ExamRoom) => {
    if (room.soThiSinhHienTai > 0) {
      alert("Không thể xóa phòng thi đã có thí sinh. Vui lòng chuyển thí sinh sang phòng khác trước.");
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa phòng ${room.tenphong}?`)) {
      try {
        const { error } = await supabase.from("phongthi").delete().eq("maphong", room.maphong);
        if (error) throw error;
        alert("Đã xóa phòng thi thành công!");
        setExamRooms(examRooms.filter((r) => r.maphong !== room.maphong));
      } catch (err: any) {
        alert("Lỗi khi xóa phòng thi: " + err.message);
        console.error("Error deleting room:", err);
      }
    }
  };

  const handleAssignCandidate = async (sobaodanh: string, maphong: string) => {
    const room = examRooms.find((r) => r.maphong === maphong);
    if (!room) return;

    if (room.soThiSinhHienTai >= room.succhua) {
      alert("Phòng thi đã đầy. Không thể thêm thí sinh.");
      return;
    }

    try {
      const { error } = await supabase
        .from("phieuduthi")
        .update({ maphong })
        .eq("sobaodanh", sobaodanh);

      if (error) throw error;

      // Refresh data
      const { data: roomsData } = await supabase
        .from("phongthi")
        .select(`
          maphong,
          tenphong,
          toanha,
          succhua,
          trangthai,
          ghichu,
          phieuduthi (
            sobaodanh,
            khachhang:makh (
              thongtinthisinh (hoten),
              khachhang_cn (hoten)
            ),
            thongtinchungchi:macc (tencc)
          )
        `);
      setExamRooms(
        roomsData.map((r) => ({
          maphong: r.maphong,
          tenphong: r.tenphong,
          toanha: r.toanha,
          succhua: r.succhua,
          trangthai: r.trangthai,
          ghichu: r.ghichu || "",
          soThiSinhHienTai: r.phieuduthi.length,
          thiSinh: r.phieuduthi.map((pdt) => ({
            soBaoDanh: pdt.sobaodanh,
            hoTen: pdt.khachhang.thongtinthisinh?.hoten || pdt.khachhang.khachhang_cn?.hoten || "Không có tên",
            loaiChungChi: pdt.thongtinchungchi.tencc,
          })),
        })),
      );

      const { data: unassignedData } = await supabase
        .from("phieuduthi")
        .select(`
          sobaodanh,
          khachhang:makh (
            thongtinthisinh (hoten),
            khachhang_cn (hoten)
          ),
          thongtinchungchi:macc (tencc)
        `)
        .is("maphong", null);
      setUnassignedCandidates(
        unassignedData.map((pdt) => ({
          sobaodanh: pdt.sobaodanh,
          hoten: pdt.khachhang.thongtinthisinh?.hoten || pdt.khachhang.khachhang_cn?.hoten || "Không có tên",
          tencc: pdt.thongtinchungchi.tencc,
        })),
      );

      alert("Đã phân phòng cho thí sinh thành công!");
    } catch (err: any) {
      alert("Lỗi khi phân phòng: " + err.message);
      console.error("Error assigning candidate:", err);
    }
  };

  const handleRemoveCandidate = async (sobaodanh: string) => {
    if (confirm("Bạn có chắc chắn muốn chuyển thí sinh này sang phòng khác?")) {
      try {
        const { error } = await supabase
          .from("phieuduthi")
          .update({ maphong: null })
          .eq("sobaodanh", sobaodanh);

        if (error) throw error;

        // Refresh data
        const { data: roomsData } = await supabase
          .from("phongthi")
          .select(`
            maphong,
            tenphong,
            toanha,
            succhua,
            trangthai,
            ghichu,
            phieuduthi (
              sobaodanh,
              khachhang:makh (
                thongtinthisinh (hoten),
                khachhang_cn (hoten)
              ),
              thongtinchungchi:macc (tencc)
            )
          `);
        setExamRooms(
          roomsData.map((r) => ({
            maphong: r.maphong,
            tenphong: r.tenphong,
            toanha: r.toanha,
            succhua: r.succhua,
            trangthai: r.trangthai,
            ghichu: r.ghichu || "",
            soThiSinhHienTai: r.phieuduthi.length,
            thiSinh: r.phieuduthi.map((pdt) => ({
              soBaoDanh: pdt.sobaodanh,
              hoTen: pdt.khachhang.thongtinthisinh?.hoten || pdt.khachhang.khachhang_cn?.hoten || "Không có tên",
              loaiChungChi: pdt.thongtinchungchi.tencc,
            })),
          })),
        );

        const { data: unassignedData } = await supabase
          .from("phieuduthi")
          .select(`
            sobaodanh,
            khachhang:makh (
              thongtinthisinh (hoten),
              khachhang_cn (hoten)
            ),
            thongtinchungchi:macc (tencc)
          `)
          .is("maphong", null);
        setUnassignedCandidates(
          unassignedData.map((pdt) => ({
            sobaodanh: pdt.sobaodanh,
            hoten: pdt.khachhang.thongtinthisinh?.hoten || pdt.khachhang.khachhang_cn?.hoten || "Không có tên",
            tencc: pdt.thongtinchungchi.tencc,
          })),
        );

        alert("Đã chuyển thí sinh sang danh sách chưa phân phòng!");
      } catch (err: any) {
        alert("Lỗi khi chuyển thí sinh: " + err.message);
        console.error("Error removing candidate:", err);
      }
    }
  };

  const getRoomStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sẵn sàng</Badge>;
      case "full":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Đã đầy</Badge>;
      case "maintenance":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Bảo trì</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Không xác định</Badge>;
    }
  };

  // Filter rooms
  const filteredRooms = examRooms.filter(
    (room) =>
      (room.maphong.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.tenphong.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterToaNha === "all" || room.toanha.toLowerCase() === filterToaNha.toLowerCase()) &&
      (filterTrangThai === "all" || room.trangthai === filterTrangThai),
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Quản Lý Phòng Thi</h1>
        <Button onClick={handleCreateRoom} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm phòng thi
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Bộ lọc tìm kiếm</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="toaNha">Tòa nhà</Label>
                <Select value={filterToaNha} onValueChange={setFilterToaNha}>
                  <SelectTrigger id="toaNha">
                    <SelectValue placeholder="Chọn tòa nhà" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tòa nhà</SelectItem>
                    {[...new Set(examRooms.map((room) => room.toanha))].map((toanha) => (
                      <SelectItem key={toanha} value={toanha.toLowerCase()}>
                        {toanha}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trangThai">Trạng thái</Label>
                <Select value={filterTrangThai} onValueChange={setFilterTrangThai}>
                  <SelectTrigger id="trangThai">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Chọn trạng thái" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="available">Sẵn sàng</SelectItem>
                    <SelectItem value="full">Đã đầy</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="searchRoom">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchRoom"
                    placeholder="Tìm theo mã hoặc tên phòng"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setSearchTerm("");
                  setFilterToaNha("all");
                  setFilterTrangThai("all");
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách phòng thi</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Đang tải dữ liệu...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && filteredRooms.length === 0 && <p>Không có phòng thi nào phù hợp với bộ lọc.</p>}
          {!loading && filteredRooms.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phòng</TableHead>
                    <TableHead>Tên phòng</TableHead>
                    <TableHead>Tòa nhà</TableHead>
                    <TableHead className="text-center">Sức chứa</TableHead>
                    <TableHead className="text-center">Số thí sinh</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.maphong}>
                      <TableCell className="font-medium">{room.maphong}</TableCell>
                      <TableCell>{room.tenphong}</TableCell>
                      <TableCell>{room.toanha}</TableCell>
                      <TableCell className="text-center">{room.succhua}</TableCell>
                      <TableCell className="text-center">{room.soThiSinhHienTai}</TableCell>
                      <TableCell>{getRoomStatusBadge(room.trangthai)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleViewRoom(room)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px]">
                              <DialogHeader>
                                <DialogTitle>Chi tiết phòng thi</DialogTitle>
                              </DialogHeader>
                              {selectedRoom && !isEditing && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Mã phòng</p>
                                      <p className="text-lg font-semibold">{selectedRoom.maphong}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Tên phòng</p>
                                      <p className="text-lg font-semibold">{selectedRoom.tenphong}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Tòa nhà</p>
                                      <p className="text-lg font-semibold">{selectedRoom.toanha}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Sức chứa</p>
                                      <p className="text-lg font-semibold">{selectedRoom.succhua}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Số thí sinh hiện tại</p>
                                      <p className="text-lg font-semibold">{selectedRoom.soThiSinhHienTai}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Trạng thái</p>
                                      <div className="pt-1">{getRoomStatusBadge(selectedRoom.trangthai)}</div>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Ghi chú</p>
                                    <p className="text-base">{selectedRoom.ghichu || "Không có ghi chú"}</p>
                                  </div>

                                  <Tabs defaultValue="candidates" className="mt-6">
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="candidates">Danh sách thí sinh</TabsTrigger>
                                      <TabsTrigger value="actions">Thao tác</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="candidates" className="space-y-4 pt-4">
                                      <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Danh sách thí sinh trong phòng</h3>
                                        <Button
                                          onClick={() => handleAssignCandidate("", selectedRoom.maphong)}
                                          disabled={
                                            selectedRoom.trangthai === "full" ||
                                            selectedRoom.trangthai === "maintenance"
                                          }
                                          className="gap-2"
                                        >
                                          <UserPlus className="h-4 w-4" />
                                          Thêm thí sinh
                                        </Button>
                                      </div>

                                      {selectedRoom.thiSinh.length > 0 ? (
                                        <div className="rounded-md border">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>Số báo danh</TableHead>
                                                <TableHead>Họ tên</TableHead>
                                                <TableHead>Loại chứng chỉ</TableHead>
                                                <TableHead className="text-right">Thao tác</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {selectedRoom.thiSinh.map((candidate) => (
                                                <TableRow key={candidate.soBaoDanh}>
                                                  <TableCell className="font-medium">{candidate.soBaoDanh}</TableCell>
                                                  <TableCell>{candidate.hoTen}</TableCell>
                                                  <TableCell>{candidate.loaiChungChi}</TableCell>
                                                  <TableCell className="text-right">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => handleRemoveCandidate(candidate.soBaoDanh)}
                                                    >
                                                      Chuyển phòng
                                                    </Button>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                          <p className="text-muted-foreground">Chưa có thí sinh nào trong phòng này</p>
                                          <Button
                                            variant="outline"
                                            onClick={() => handleAssignCandidate("", selectedRoom.maphong)}
                                            disabled={selectedRoom.trangthai === "maintenance"}
                                            className="mt-4 gap-2"
                                          >
                                            <UserPlus className="h-4 w-4" />
                                            Thêm thí sinh
                                          </Button>
                                        </div>
                                      )}
                                    </TabsContent>
                                    <TabsContent value="actions" className="space-y-4 pt-4">
                                      <div className="flex flex-col gap-4">
                                        <Button onClick={() => handleEditRoom(selectedRoom)} className="gap-2">
                                          <Pencil className="h-4 w-4" />
                                          Chỉnh sửa thông tin phòng
                                        </Button>
                                        <Button
                                          variant={selectedRoom.trangthai === "maintenance" ? "default" : "outline"}
                                          onClick={async () => {
                                            const newStatus =
                                              selectedRoom.trangthai === "maintenance" ? "available" : "maintenance";
                                            await supabase
                                              .from("phongthi")
                                              .update({ trangthai: newStatus })
                                              .eq("maphong", selectedRoom.maphong);
                                            setSelectedRoom({ ...selectedRoom, trangthai: newStatus });
                                            alert(
                                              newStatus === "maintenance"
                                                ? "Đã đánh dấu phòng đang bảo trì!"
                                                : "Đã kết thúc bảo trì!",
                                            );
                                          }}
                                          className="gap-2"
                                        >
                                          {selectedRoom.trangthai === "maintenance" ? (
                                            <>
                                              <Building className="h-4 w-4" />
                                              Kết thúc bảo trì
                                            </>
                                          ) : (
                                            <>
                                              <Building className="h-4 w-4" />
                                              Đánh dấu đang bảo trì
                                            </>
                                          )}
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleDeleteRoom(selectedRoom)}
                                          disabled={selectedRoom.soThiSinhHienTai > 0}
                                          className="gap-2"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Xóa phòng thi
                                        </Button>
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                </div>
                              )}
                              {isEditing && (
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="maphong">Mã phòng</Label>
                                      <Input
                                        id="maphong"
                                        placeholder="Nhập mã phòng"
                                        value={newRoomData.maphong}
                                        onChange={(e) => handleInputChange("maphong", e.target.value)}
                                        readOnly={!!selectedRoom}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="tenphong">Tên phòng</Label>
                                      <Input
                                        id="tenphong"
                                        placeholder="Nhập tên phòng"
                                        value={newRoomData.tenphong}
                                        onChange={(e) => handleInputChange("tenphong", e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="toanha">Tòa nhà</Label>
                                      <Input
                                        id="toanha"
                                        placeholder="Nhập tên tòa nhà"
                                        value={newRoomData.toanha}
                                        onChange={(e) => handleInputChange("toanha", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="succhua">Sức chứa</Label>
                                      <Input
                                        id="succhua"
                                        type="number"
                                        placeholder="Nhập sức chứa phòng thi"
                                        value={newRoomData.succhua}
                                        onChange={(e) => handleInputChange("succhua", e.target.value)}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="trangthai">Trạng thái</Label>
                                    <Select
                                      value={newRoomData.trangthai}
                                      onValueChange={(value) => handleInputChange("trangthai", value)}
                                    >
                                      <SelectTrigger id="trangthai">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="available">Sẵn sàng</SelectItem>
                                        <SelectItem value="maintenance">Bảo trì</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="ghichu">Ghi chú</Label>
                                    <Textarea
                                      id="ghichu"
                                      placeholder="Nhập ghi chú (nếu có)"
                                      value={newRoomData.ghichu}
                                      onChange={(e) => handleInputChange("ghichu", e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                                      Hủy
                                    </Button>
                                    <Button onClick={handleSaveRoom}>
                                      {selectedRoom ? "Cập nhật phòng thi" : "Thêm phòng thi"}
                                    </Button>
                                  </DialogFooter>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleEditRoom(room)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRoom(room)}
                            disabled={room.soThiSinhHienTai > 0}
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
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Thí sinh chưa phân phòng</CardTitle>
            <Button
              className="gap-2"
              onClick={() => alert("Chức năng phân phòng hàng loạt chưa được triển khai!")}
            >
              <UserPlus className="h-4 w-4" />
              Phân phòng hàng loạt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {unassignedCandidates.length === 0 && <p>Không có thí sinh chưa phân phòng.</p>}
          {unassignedCandidates.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số báo danh</TableHead>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Loại chứng chỉ</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedCandidates.map((candidate) => (
                    <TableRow key={candidate.sobaodanh}>
                      <TableCell className="font-medium">{candidate.sobaodanh}</TableCell>
                      <TableCell>{candidate.hoten}</TableCell>
                      <TableCell>{candidate.tencc}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Phân phòng
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Phân phòng thi cho thí sinh</DialogTitle>
                              <DialogDescription>
                                Chọn phòng thi cho thí sinh {candidate.hoten} ({candidate.sobaodanh})
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="selectRoom">Chọn phòng thi</Label>
                                <Select
                                  onValueChange={(maphong) => handleAssignCandidate(candidate.sobaodanh, maphong)}
                                >
                                  <SelectTrigger id="selectRoom">
                                    <SelectValue placeholder="Chọn phòng thi" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {examRooms
                                      .filter(
                                        (room) =>
                                          room.trangthai === "available" && room.soThiSinhHienTai < room.succhua,
                                      )
                                      .map((room) => (
                                        <SelectItem key={room.maphong} value={room.maphong}>
                                          {room.tenphong} ({room.toanha}) - Còn {room.succhua - room.soThiSinhHienTai}{" "}
                                          chỗ
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ghiChuPhanPhong">Ghi chú</Label>
                                <Textarea id="ghiChuPhanPhong" placeholder="Nhập ghi chú (nếu có)" rows={3} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Hủy</Button>
                              <Button disabled>Xác nhận phân phòng</Button>
                            </DialogFooter>
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