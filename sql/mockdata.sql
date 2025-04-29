-- Bước 1: Tạo khách hàng và lưu vào bảng khachhang
INSERT INTO khachhang (makh, loaikh, diachi) VALUES
('KH001', 'CaNhan', '123 Đường Láng, Hà Nội'),
('KH002', 'DonVi', '456 Nguyễn Trãi, TP.HCM'),
('KH003', 'CaNhan', '789 Lê Lợi, Đà Nẵng');

-- Bước 2: Phân loại khách hàng và lưu vào khachhang_cn hoặc khachhang_dv
-- Khách hàng cá nhân (CaNhan)
INSERT INTO khachhang_cn (makh, hoten, cccd, email, sdt) VALUES
('KH001', 'Nguyễn Văn An', '123456789012', 'an.nguyen@email.com', '0912345678'),
('KH003', 'Trần Thị Hương', '987654321098', 'huong.tran@email.com', '0935678901');

-- Khách hàng đơn vị (DonVi)
INSERT INTO khachhang_dv (makh, tendv, madv, sdt, email) VALUES
('KH002', 'Công ty TNHH ABC', 'DV001', '0987654321', 'tnhhabc@gmail.com');

-- Bước 3: Tạo dữ liệu hỗ trợ khác trước khi lập phiếu đăng ký
-- Thêm nhân viên (nhanvien) để hỗ trợ các bảng khác
INSERT INTO nhanvien (manv, tennv, congviec, sdt) VALUES
('NV001', 'Phạm Thị Dung', 'Quản lý thi', '0901234567'),
('NV002', 'Hoàng Văn Em', 'Kế toán', '0919876543');

-- Thêm chứng chỉ (thongtinchungchi)
INSERT INTO thongtinchungchi (macc, tencc, thoigianthi, giatien) VALUES
('CC001', 'Tiếng Anh B1', 120, 1500000),
('CC002', 'Tin học cơ bản', 90, 1000000);

-- Thêm buổi thi (buoithi)
INSERT INTO buoithi (mabuoithi, macc, soluongthisinh, diadiem, thoigian, trangthai) VALUES
('BT001', 'CC001', 0, 'Trung tâm Hội nghị ABC, Hà Nội', '2025-06-01 08:00:00', 'ChuaToChuc'),
('BT002', 'CC002', 0, 'Trường ĐH XYZ, TP.HCM', '2025-06-15 09:00:00', 'ChuaToChuc'),
('BT005', 'CC001', 0, 'Trung tâm Hội nghị XYZ, Hà Nội', '2025-07-01 08:00:00', 'ChuaToChuc');

-- Thêm phòng thi (phongthi)
INSERT INTO phongthi (maphong, mabuoithi, tenphong, toanha, succhua, trangthai, ghichu) VALUES
('P101', 'BT001', 'Phòng 101', 'Tòa nhà A', 30, 'available', 'Phòng máy tính, có máy chiếu'),
('P102', 'BT002', 'Phòng 102', 'Tòa nhà A', 25, 'available', 'Phòng máy tính, có máy chiếu'),
('P103', 'BT005', 'Phòng 103', 'Tòa nhà B', 20, 'available', 'Phòng máy tính, có máy chiếu');

-- Bước 4: Lập phiếu đăng ký (phieudangki) và thêm thông tin thí sinh (thongtinthisinh)
-- Khách hàng KH001 (CaNhan) lập phiếu đăng ký
INSERT INTO phieudangki (maphieu, makh, mabuoithi, ngaydangky, trangthai) VALUES
('PDK001', 'KH001', 'BT001', '2025-05-01 10:00:00', 'Chờ duyệt');

-- Đồng thời thêm thông tin thí sinh vào thongtinthisinh cho KH001
INSERT INTO thongtinthisinh (mats, makh, hoten, ngaysinh, gioitinh) VALUES
('TS001', 'KH001', 'Nguyễn Văn An', '1995-05-15', 'Nam');

-- Khách hàng KH002 (DonVi) lập phiếu đăng ký, thêm nhiều thí sinh
INSERT INTO phieudangki (maphieu, makh, mabuoithi, ngaydangky, trangthai) VALUES
('PDK002', 'KH002', 'BT002', '2025-05-02 14:00:00', 'Chờ duyệt');

-- Thêm thông tin thí sinh cho KH002 (giả sử đơn vị này đăng ký cho 2 thí sinh)
INSERT INTO thongtinthisinh (mats, makh, hoten, ngaysinh, gioitinh) VALUES
('TS002', 'KH002', 'Trần Thị Bình', '1998-08-20', 'Nữ'),
('TS003', 'KH002', 'Lê Văn Cường', '1997-03-10', 'Nam');

-- Khách hàng KH003 (CaNhan) lập phiếu đăng ký
INSERT INTO phieudangki (maphieu, makh, mabuoithi, ngaydangky, trangthai) VALUES
('PDK003', 'KH003', 'BT001', '2025-05-03 09:00:00', 'Chờ duyệt');

-- Thêm thông tin thí sinh cho KH003
INSERT INTO thongtinthisinh (mats, makh, hoten, ngaysinh, gioitinh) VALUES
('TS004', 'KH003', 'Trần Thị Hương', '1996-07-25', 'Nữ');

-- Bước 5: Duyệt phiếu đăng ký và thêm vào phieuduthi
-- Duyệt phiếu đăng ký PDK001 (KH001)
UPDATE phieudangki 
SET trangthai = 'Đã duyệt'
WHERE maphieu = 'PDK001';

-- Thêm phiếu dự thi cho thí sinh TS001 (KH001)
INSERT INTO phieuduthi (maphieu, sobaodanh, makh, mats, maphieudangki, mabuoithi, macc, maphong, status) VALUES
('PDT001', 'SBD001', 'KH001', 'TS001', 'PDK001', 'BT001', 'CC001', 'P101', 'da_thi');

-- Duyệt phiếu đăng ký PDK002 (KH002)
UPDATE phieudangki 
SET trangthai = 'Đã duyệt'
WHERE maphieu = 'PDK002';

-- Thêm phiếu dự thi cho các thí sinh TS002 và TS003 (KH002)
INSERT INTO phieuduthi (maphieu, sobaodanh, makh, mats, maphieudangki, mabuoithi, macc, maphong, status) VALUES
('PDT002', 'SBD002', 'KH002', 'TS002', 'PDK002', 'BT002', 'CC002', 'P102', 'da_thi'),
('PDT003', 'SBD003', 'KH002', 'TS003', 'PDK002', 'BT002', 'CC002', 'P102', 'da_thi');

-- Duyệt phiếu đăng ký PDK003 (KH003)
UPDATE phieudangki 
SET trangthai = 'Đã duyệt'
WHERE maphieu = 'PDK003';

-- Thêm phiếu dự thi cho thí sinh TS004 (KH003)
INSERT INTO phieuduthi (maphieu, sobaodanh, makh, mats, maphieudangki, mabuoithi, macc, maphong, status) VALUES
('PDT004', 'SBD004', 'KH003', 'TS004', 'PDK003', 'BT001', 'CC001', 'P101', 'da_thi');

-- Bước 6: Thêm phiếu đăng ký gia hạn (phieudangkigiahan)
INSERT INTO phieudangkigiahan (maphieu, makh, maphieuduthi, langiahan, nguoilapphieu, buoithimoi, truonghopdacbiet, trangthai, created_at) VALUES
('PGH002', 'KH002', 'PDT003', 1, 'NV001', 'BT005', FALSE, 'Chờ duyệt', '2025-05-11 14:00:00');

-- Bước 7: Sau khi thi xong, nhập điểm vào ketquathi
-- Nhập điểm cho thí sinh TS001 (SBD001)
INSERT INTO ketquathi (mabaithi, sobaodanh, diemthi, nguoicham, giamthi) VALUES
('KQT001', 'SBD001', 85.5, 'Nguyễn Thị Hoa', 'Trần Văn Nam');

-- Nhập điểm cho thí sinh TS002 (SBD002)
INSERT INTO ketquathi (mabaithi, sobaodanh, diemthi, nguoicham, giamthi) VALUES
('KQT002', 'SBD002', 80.0, 'Nguyễn Thị Hoa', 'Trần Văn Nam');

-- Nhập điểm cho thí sinh TS003 (SBD003)
INSERT INTO ketquathi (mabaithi, sobaodanh, diemthi, nguoicham, giamthi) VALUES
('KQT003', 'SBD003', 90.0, 'Nguyễn Thị Hoa', 'Trần Văn Nam');

-- Nhập điểm cho thí sinh TS004 (SBD004)
INSERT INTO ketquathi (mabaithi, sobaodanh, diemthi, nguoicham, giamthi) VALUES
('KQT004', 'SBD004', 88.5, 'Nguyễn Thị Hoa', 'Trần Văn Nam');

-- Bước 8: Thêm hóa đơn (hoadon) để hỗ trợ trigger update_hoadon_tongtien
INSERT INTO hoadon (mahoadon, makh, nguoilaphoadon, tongtien, tinhtrang) VALUES
('HD001', 'KH001', 'NV002', 0, 'ChuaThanhToan'),
('HD002', 'KH002', 'NV002', 0, 'ChuaThanhToan'),
('HD003', 'KH003', 'NV002', 0, 'ChuaThanhToan');