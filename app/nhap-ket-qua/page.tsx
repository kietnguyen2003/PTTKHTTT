"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, RotateCcw, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/supabaseClient";

// Enum for ChungChiStatus
export enum ChungChiStatus {
  ChuaNhan = 'ChuaNhan',
  DaNhan = 'DaNhan',
}

// Interface for Candidate Info
export interface CandidateInfo {
  soBaoDanh: string;
  maPhieuDuThi: string;
  hoTen: string;
  loaiChungChi: string;
  thoiGianThi: string;
  diaDiem: string;
}

// Interface for Result Data
export interface ResultData {
  diemThi: string;
  nguoiCham: string;
  giamThi: string;
  trangThai: ChungChiStatus;
}

// Interface for PhieuDuThi from Supabase
interface PhieuDuThi {
  sobaodanh: string;
  maphieu: string;
  thoigian: string;
  diadiem: string;
  thongtinchungchi: { tencc: string };
  khachhang: {
    thongtinthisinh?: { hoten: string };
    khachhang_cn?: { hoten: string };
  };
}

export default function NhapKetQuaPage() {
  const [phieuDuThiList, setPhieuDuThiList] = useState<PhieuDuThi[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateInfo | null>(null);
  const [resultData, setResultData] = useState<ResultData>({
    diemThi: "",
    nguoiCham: "",
    giamThi: "",
    trangThai: ChungChiStatus.ChuaNhan,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all phieuduthi on component mount
  useEffect(() => {
    async function fetchPhieuDuThi() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("phieuduthi")
          .select(`
            sobaodanh,
            maphieu,
            thoigian,
            diadiem,
            thongtinchungchi:macc (tencc),
            khachhang:makh (
              thongtinthisinh (hoten),
              khachhang_cn (hoten)
            )
          `);

        if (error) throw error;

        setPhieuDuThiList(data || []);
      } catch (error: any) {
        setError("Lỗi khi tải danh sách phiếu dự thi: " + error.message);
        console.error("Error fetching phieuduthi:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPhieuDuThi();
  }, []);

  // Handle selecting a candidate from the table
  const handleSelectCandidate = (phieu: PhieuDuThi) => {
    setSelectedCandidate({
      soBaoDanh: phieu.sobaodanh,
      maPhieuDuThi: phieu.maphieu,
      hoTen: phieu.khachhang.thongtinthisinh?.hoten || phieu.khachhang.khachhang_cn?.hoten || "Không có tên",
      loaiChungChi: phieu.thongtinchungchi.tencc,
      thoiGianThi: new Date(phieu.thoigian).toLocaleString("vi-VN"),
      diaDiem: phieu.diadiem,
    });
    setResultData({
      diemThi: "",
      nguoiCham: "",
      giamThi: "",
      trangThai: ChungChiStatus.ChuaNhan,
    });
    setError(null);
  };

  // Handle resetting the form
  const handleReset = () => {
    setSelectedCandidate(null);
    setResultData({
      diemThi: "",
      nguoiCham: "",
      giamThi: "",
      trangThai: ChungChiStatus.ChuaNhan,
    });
    setError(null);
  };

  // Handle saving results
  const handleSaveResults = async () => {
    setError(null);

    const score = Number.parseFloat(resultData.diemThi);
    if (isNaN(score) || score < 0 || score > 100) {
      setError("Điểm thi phải là số từ 0 đến 100");
      return;
    }

    try {
      // Check for duplicate result
      const { data: existing } = await supabase
        .from("ketquathi")
        .select("mabaithi")
        .eq("sobaodanh", selectedCandidate!.soBaoDanh)
        .single();
      if (existing) {
        setError("Kết quả thi cho số báo danh này đã tồn tại.");
        return;
      }

      // Insert ketquathi
      const { error: ketQuaError } = await supabase.from("ketquathi").insert([
        {
          mabaithi: `KQT${Date.now()}`,
          sobaodanh: selectedCandidate!.soBaoDanh,
          diemthi: score,
          nguoicham: resultData.nguoiCham,
          giamthi: resultData.giamThi,
        },
      ]);

      if (ketQuaError) throw ketQuaError;

      // Get macc for bangtinh
      const { data: phieuDuThi } = await supabase
        .from("phieuduthi")
        .select("macc")
        .eq("sobaodanh", selectedCandidate!.soBaoDanh)
        .single();

      // Insert bangtinh
      const { error: bangTinhError } = await supabase.from("bangtinh").insert([
        {
          sobaodanh: selectedCandidate!.soBaoDanh,
          diemthi: score,
          macc: phieuDuThi.macc,
          ngaycap: new Date().toISOString(),
          nguoinhap: "NV001",
          trangthai: resultData.trangThai,
        },
      ]);

      if (bangTinhError) throw bangTinhError;

      alert("Đã lưu kết quả thi thành công!");
      handleReset();
    } catch (error: any) {
      setError("Lỗi khi lưu kết quả thi: " + error.message);
      console.error("Error saving results:", error);
    }
  };

  const isScoreValid = (): boolean => {
    const score = Number.parseFloat(resultData.diemThi);
    return !isNaN(score) && score >= 0 && score <= 100;
  };

  const isFormValid = (): boolean => {
    return (
      resultData.diemThi.trim() !== "" &&
      resultData.nguoiCham.trim() !== "" &&
      resultData.giamThi.trim() !== "" &&
      isScoreValid()
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nhập Kết Quả Thi</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Danh sách phiếu dự thi</h2>
            {loading && <p>Đang tải dữ liệu...</p>}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!loading && phieuDuThiList.length === 0 && <p>Không có phiếu dự thi nào.</p>}
            {!loading && phieuDuThiList.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Số báo danh</TableHead>
                      <TableHead>Mã phiếu</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Loại chứng chỉ</TableHead>
                      <TableHead>Thời gian thi</TableHead>
                      <TableHead>Địa điểm</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phieuDuThiList.map((phieu) => (
                      <TableRow key={phieu.sobaodanh}>
                        <TableCell>{phieu.sobaodanh}</TableCell>
                        <TableCell>{phieu.maphieu}</TableCell>
                        <TableCell>
                          {phieu.khachhang.thongtinthisinh?.hoten ||
                            phieu.khachhang.khachhang_cn?.hoten ||
                            "Không có tên"}
                        </TableCell>
                        <TableCell>{phieu.thongtinchungchi.tencc}</TableCell>
                        <TableCell>{new Date(phieu.thoigian).toLocaleString("vi-VN")}</TableCell>
                        <TableCell>{phieu.diadiem}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectCandidate(phieu)}
                          >
                            Chọn
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCandidate && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Nhập kết quả thi</h2>
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium w-1/3">Số báo danh</TableCell>
                      <TableCell>{selectedCandidate.soBaoDanh}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mã phiếu dự thi</TableCell>
                      <TableCell>{selectedCandidate.maPhieuDuThi}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Họ tên thí sinh</TableCell>
                      <TableCell>{selectedCandidate.hoTen}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Loại chứng chỉ</TableCell>
                      <TableCell>{selectedCandidate.loaiChungChi}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Thời gian thi</TableCell>
                      <TableCell>{selectedCandidate.thoiGianThi}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Địa điểm</TableCell>
                      <TableCell>{selectedCandidate.diaDiem}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="diemThi">Điểm thi</Label>
                  <Input
                    id="diemThi"
                    placeholder="Nhập điểm thi (0-100)"
                    value={resultData.diemThi}
                    onChange={(e) => setResultData({ ...resultData, diemThi: e.target.value })}
                    className={resultData.diemThi && !isScoreValid() ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {resultData.diemThi && !isScoreValid() && (
                    <p className="text-xs text-red-500">Điểm thi phải là số từ 0 đến 100</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trangThai">Trạng thái chứng chỉ</Label>
                  <Select
                    value={resultData.trangThai}
                    onValueChange={(value: ChungChiStatus) => setResultData({ ...resultData, trangThai: value })}
                  >
                    <SelectTrigger id="trangThai">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ChungChiStatus.ChuaNhan}>Chưa nhận</SelectItem>
                      <SelectItem value={ChungChiStatus.DaNhan}>Đã nhận</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nguoiCham">Người chấm thi</Label>
                  <Input
                    id="nguoiCham"
                    placeholder="Nhập tên người chấm thi"
                    value={resultData.nguoiCham}
                    onChange={(e) => setResultData({ ...resultData, nguoiCham: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giamThi">Giám thị</Label>
                  <Input
                    id="giamThi"
                    placeholder="Nhập tên giám thị"
                    value={resultData.giamThi}
                    onChange={(e) => setResultData({ ...resultData, giamThi: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Hủy
                </Button>
                <Button onClick={handleSaveResults} disabled={!isFormValid()} className="gap-2">
                  <Save className="h-4 w-4" />
                  Lưu kết quả
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}