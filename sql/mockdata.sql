-- Insert sample data for KhachHang (2 customers: 1 CaNhan, 1 DonVi)
INSERT INTO KhachHang (MaKH, LoaiKH, DiaChi) VALUES
('KH001', 'CaNhan', '123 Đường Láng, Hà Nội'),
('KH002', 'DonVi', '456 Nguyễn Trãi, TP.HCM');

-- Insert sample data for KhachHang_CN (Individual customer details)
INSERT INTO KhachHang_CN (MaKH, HoTen, CCCD, Email, SDT) VALUES
('KH001', 'Nguyễn Văn An', '123456789012', 'an.nguyen@email.com', '0912345678');

-- Insert sample data for KhachHang_DV (Organization customer details, linked to DonVi)
INSERT INTO KhachHang_DV (MaKH, TenDV, MaDV, SDT, email) VALUES
('KH002', 'Công ty TNHH ABC', 'DV001', '0987654321', 'tnhhabc@gmail.com');

-- Insert sample data for ThongTinThiSinh (Candidates)
INSERT INTO ThongTinThiSinh (MaTS, MaKH, HoTen, NgaySinh, GioiTinh) VALUES
('TS001', 'KH001', 'Nguyễn Văn An', '1995-05-15', 'Nam'),
('TS002', 'KH002', 'Trần Thị Bình', '1998-08-20', 'Nu'),
('TS003', 'KH002', 'Lê Văn Cường', '1997-03-10', 'Nam');

-- Insert sample data for ThongTinChungChi (Certificates)
INSERT INTO ThongTinChungChi (MaCC, TenCC, ThoiGianThi, GiaTien) VALUES
('CC001', 'Chứng chỉ ACCI Cấp 1', 120, 1500000),
('CC002', 'Chứng chỉ ACCI Cấp 2', 180, 2500000);

-- Insert sample data for BuoiThi (Exam sessions)
INSERT INTO BuoiThi (MaBuoiThi, MaCC, SoLuongThiSinh, DiaDiem, ThoiGian, TrangThai) VALUES
('BT001', 'CC001', 50, 'Trung tâm Hội nghị ABC, Hà Nội', '2025-06-01 08:00:00', 'ChuaToChuc'),
('BT002', 'CC002', 30, 'Trường ĐH XYZ, TP.HCM', '2025-06-15 09:00:00', 'ChuaToChuc');

-- Insert sample data for PhongThi (Exam rooms)
INSERT INTO PhongThi (MaPhong, MaBuoiThi, SucChua) VALUES
('PT001', 'BT001', 25),
('PT002', 'BT001', 25),
('PT003', 'BT002', 30);

-- Insert sample data for NhanVien (Staff members)
INSERT INTO NhanVien (MaNV, TenNV, CongViec, SDT) VALUES
('NV001', 'Phạm Thị Dung', 'Quản lý thi', '0901234567'),
('NV002', 'Hoàng Văn Em', 'Kế toán', '0919876543');

-- Insert sample data for PhieuDangKi (Registrations)
INSERT INTO PhieuDangKi (MaPhieu, MaKH, MaBuoiThi, NgayDangKy) VALUES
('PDK001', 'KH001', 'BT001', '2025-05-01 10:00:00'),
('PDK002', 'KH002', 'BT002', '2025-05-02 14:00:00');

-- Insert sample data for PhieuDangKiChiTiet (Registration details)
INSERT INTO PhieuDangKiChiTiet (MaPhieu, MaTS, SoLuongThiSinh, DiaDiemToChuc) VALUES
('PDK001', 'TS001', NULL, NULL), -- CaNhan: no SoLuongThiSinh or DiaDiemToChuc
('PDK002', 'TS002', 2, 'Trường ĐH XYZ, TP.HCM'); -- DonVi: 2 candidates

-- Insert sample data for PhieuDuThi (Exam tickets)
INSERT INTO PhieuDuThi (MaPhieu, SoBaoDanh, MaKH, MaBuoiThi, MaCC, MaPhong, ThoiGian, DiaDiem, DiemThi) VALUES
('PDT001', 'SBD001', 'KH001', 'BT001', 'CC001', 'PT001', '2025-06-01 08:00:00', 'Trung tâm Hội nghị ABC, Hà Nội', NULL),
('PDT002', 'SBD002', 'KH002', 'BT002', 'CC002', 'PT003', '2025-06-15 09:00:00', 'Trường ĐH XYZ, TP.HCM', NULL),
('PDT003', 'SBD003', 'KH002', 'BT002', 'CC002', 'PT003', '2025-06-15 09:00:00', 'Trường ĐH XYZ, TP.HCM', NULL);

-- Insert sample data for PhieuDangKiGiaHan (Extension requests)
INSERT INTO PhieuDangKiGiaHan (MaPhieu, MaKH, MaPhieuDuThi, LanGiaHan, NguoiLapPhieu, NgayThiMoi, TruongHopDacBiet) VALUES
('PGH001', 'KH001', 'PDT001', 1, 'NV001', '2025-07-01 08:00:00', TRUE); -- Special case: illness

-- Insert sample data for HoaDon (Invoices)
INSERT INTO HoaDon (MaHoaDon, MaKH, NgayLapHoaDon, NguoiLapHoaDon, GiamGia, TongTien, TinhTrang) VALUES
('HD001', 'KH001', '2025-05-01 11:00:00', 'NV002', 0, 1500000, 'ChuaThanhToan'),
('HD002', 'KH002', '2025-05-02 15:00:00', 'NV002', 500000, 4500000, 'DaThanhToan'); -- 2 candidates x 2500000 - 500000 discount

-- Insert sample data for KetQuaThi (Exam results, assuming exams are graded later)
INSERT INTO KetQuaThi (MaBaiThi, SoBaoDanh, DiemThi, NguoiCham, GiamThi) VALUES
('KQT001', 'SBD001', 85.5, 'Nguyễn Thị Hoa', 'Trần Văn Nam'),
('KQT002', 'SBD002', 90.0, 'Nguyễn Thị Hoa', 'Trần Văn Nam');

-- Insert sample data for BangTinh (Certificates issued)
INSERT INTO BangTinh (SoBaoDanh, DiemThi, MaCC, NgayCap, NguoiNhap, TrangThai) VALUES
('SBD001', 85.5, 'CC001', '2025-06-10 10:00:00', 'NV001', 'DaNhan'),
('SBD002', 90.0, 'CC002', '2025-06-20 10:00:00', 'NV001', 'ChuaNhan');