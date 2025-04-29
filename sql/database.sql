-- Drop existing tables in reverse dependency order to avoid conflicts
DROP TABLE IF EXISTS bangtinh CASCADE;
DROP TABLE IF EXISTS ketquathi CASCADE;
DROP TABLE IF EXISTS hoadon CASCADE;
DROP TABLE IF EXISTS phieudangkigiahan CASCADE;
DROP TABLE IF EXISTS phieuduthi CASCADE;
DROP TABLE IF EXISTS phieudangkichitiet CASCADE;
DROP TABLE IF EXISTS phieudangki CASCADE;
DROP TABLE IF EXISTS phongthi CASCADE;
DROP TABLE IF EXISTS buoithi CASCADE;
DROP TABLE IF EXISTS thongtinchungchi CASCADE;
DROP TABLE IF EXISTS thongtinthisinh CASCADE;
DROP TABLE IF EXISTS khachhang_dv CASCADE;
DROP TABLE IF EXISTS khachhang_cn CASCADE;
DROP TABLE IF EXISTS khachhang CASCADE;
DROP TABLE IF EXISTS nhanvien CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS HoaDon_status CASCADE;
DROP TYPE IF EXISTS Gender CASCADE;
DROP TYPE IF EXISTS KhachHang_type CASCADE;
DROP TYPE IF EXISTS ChungChi_status CASCADE;
DROP TYPE IF EXISTS PhongThi_status CASCADE;
DROP TYPE IF EXISTS phieuduthi_status CASCADE;

-- Enum definitions
CREATE TYPE HoaDon_status AS ENUM ('ChuaThanhToan', 'DaThanhToan', 'DaHuy');
CREATE TYPE Gender AS ENUM ('Nam', 'Nữ');
CREATE TYPE KhachHang_type AS ENUM ('CaNhan', 'DonVi');
CREATE TYPE ChungChi_status AS ENUM ('ChuaNhan', 'DaNhan');
CREATE TYPE PhongThi_status AS ENUM ('available', 'full', 'maintenance');
CREATE TYPE phieuduthi_status AS ENUM ('da_thi', 'chua_thi');

-- Table: khachhang
CREATE TABLE khachhang (
    makh VARCHAR(50) PRIMARY KEY,
    loaikh KhachHang_type NOT NULL,
    diachi TEXT,
    CONSTRAINT unique_makh UNIQUE (makh)
);
COMMENT ON COLUMN khachhang.diachi IS 'Added for contact information';

-- Table: khachhang_cn
CREATE TABLE khachhang_cn (
    makh VARCHAR(50) PRIMARY KEY,
    hoten TEXT NOT NULL,
    cccd VARCHAR(20),
    email VARCHAR(255),
    sdt VARCHAR(15),
    CONSTRAINT fk_khachhang_cn FOREIGN KEY (makh) REFERENCES khachhang(makh) ON DELETE CASCADE
);

-- Table: khachhang_dv
CREATE TABLE khachhang_dv (
    makh VARCHAR(50) PRIMARY KEY,
    tendv TEXT NOT NULL,
    madv VARCHAR(50) NOT NULL,
    sdt VARCHAR(15),
    email VARCHAR(255),
    CONSTRAINT fk_khachhang_dv FOREIGN KEY (makh) REFERENCES khachhang(makh) ON DELETE CASCADE,
    CONSTRAINT unique_madv UNIQUE (madv)
);

-- Table: thongtinthisinh
CREATE TABLE thongtinthisinh (
    mats VARCHAR(50) PRIMARY KEY,
    makh VARCHAR(50) NOT NULL,
    hoten TEXT NOT NULL,
    ngaysinh DATE,
    gioitinh Gender,
    CONSTRAINT fk_thongtinthsinh_kh FOREIGN KEY (makh) REFERENCES khachhang(makh) ON DELETE CASCADE
);
COMMENT ON TABLE thongtinthisinh IS 'Removed redundant unique_mats constraint; PRIMARY KEY on mats ensures uniqueness';

-- Table: thongtinchungchi
CREATE TABLE thongtinchungchi (
    macc VARCHAR(50) PRIMARY KEY,
    tencc TEXT NOT NULL,
    thoigianthi INTEGER NOT NULL,
    giatien DOUBLE PRECISION NOT NULL,
    CONSTRAINT unique_macc UNIQUE (macc)
);

-- Table: buoithi
CREATE TABLE buoithi (
    mabuoithi VARCHAR(50) PRIMARY KEY,
    macc VARCHAR(50) NOT NULL,
    soluongthisinh INTEGER NOT NULL,
    diadiem TEXT NOT NULL,
    thoigian TIMESTAMP NOT NULL,
    trangthai VARCHAR(20) NOT NULL CHECK (trangthai IN ('DaToChuc', 'ChuaToChuc')),
    CONSTRAINT fk_buoithi_cc FOREIGN KEY (macc) REFERENCES thongtinchungchi(macc) ON DELETE RESTRICT,
    CONSTRAINT unique_mabuoithi UNIQUE (mabuoithi)
);
COMMENT ON COLUMN buoithi.trangthai IS 'Added to track status: DaToChuc/ChuaToChuc';

-- Table: phongthi
CREATE TABLE phongthi (
    maphong VARCHAR(50) PRIMARY KEY,
    mabuoithi VARCHAR(50) NOT NULL,
    tenphong TEXT NOT NULL,
    toanha TEXT NOT NULL,
    succhua INTEGER NOT NULL CHECK (succhua > 0),
    trangthai PhongThi_status NOT NULL,
    ghichu TEXT,
    CONSTRAINT fk_phongthi_buoithi FOREIGN KEY (mabuoithi) REFERENCES buoithi(mabuoithi) ON DELETE CASCADE,
    CONSTRAINT unique_maphong UNIQUE (maphong)
);

-- Table: phieudangki
CREATE TABLE phieudangki (
    maphieu VARCHAR(50) PRIMARY KEY,
    makh VARCHAR(50) NOT NULL,
    mabuoithi VARCHAR(50) NOT NULL,
    ngaydangky TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trangthai VARCHAR(50) NOT NULL DEFAULT 'Chờ duyệt',
    CONSTRAINT fk_phieudangki_kh FOREIGN KEY (makh) REFERENCES khachhang(makh) ON DELETE CASCADE,
    CONSTRAINT fk_phieudangki_buoithi FOREIGN KEY (mabuoithi) REFERENCES buoithi(mabuoithi) ON DELETE RESTRICT,
    CONSTRAINT unique_maphieu UNIQUE (maphieu),
    CONSTRAINT check_trangthai_phieudangki CHECK (trangthai IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối'))
);

-- Table: nhanvien
CREATE TABLE nhanvien (
    manv VARCHAR(50) PRIMARY KEY,
    tennv TEXT NOT NULL,
    congviec TEXT NOT NULL,
    sdt VARCHAR(15),
    CONSTRAINT unique_manv UNIQUE (manv)
);

-- Table: phieuduthi
CREATE TABLE phieuduthi (
    maphieu VARCHAR(50) PRIMARY KEY,
    sobaodanh VARCHAR(50) NOT NULL,
    makh VARCHAR(50) NOT NULL,
    mats VARCHAR(50) NOT NULL,
    maphieudangki VARCHAR(50),
    mabuoithi VARCHAR(50) NOT NULL,
    macc VARCHAR(50) NOT NULL,
    maphong VARCHAR(50),
    status phieuduthi_status NOT NULL DEFAULT 'chua_thi',
    CONSTRAINT fk_phieuduthi_kh FOREIGN KEY (makh) REFERENCES khachhang(makh) ON DELETE CASCADE,
    CONSTRAINT fk_phieuduthi_ts FOREIGN KEY (mats) REFERENCES thongtinthisinh(mats) ON DELETE RESTRICT,
    CONSTRAINT fk_phieuduthi_pdk FOREIGN KEY (maphieudangki) REFERENCES phieudangki(maphieu) ON DELETE SET NULL,
    CONSTRAINT fk_phieuduthi_buoithi FOREIGN KEY (mabuoithi) REFERENCES buoithi(mabuoithi) ON DELETE RESTRICT,
    CONSTRAINT fk_phieuduthi_cc FOREIGN KEY (macc) REFERENCES thongtinchungchi(macc) ON DELETE RESTRICT,
    CONSTRAINT fk_phieuduthi_phong FOREIGN KEY (maphong) REFERENCES phongthi(maphong) ON DELETE SET NULL,
    CONSTRAINT unique_maphieu_duthi UNIQUE (maphieu),
    CONSTRAINT unique_sobaodanh UNIQUE (sobaodanh)
);
COMMENT ON COLUMN phieuduthi.maphong IS 'Allow NULL for unassigned candidates';
COMMENT ON COLUMN phieuduthi.status IS 'Status of the exam ticket: da_thi (taken) or chua_thi (not taken)';

-- Table: phieudangkigiahan
CREATE TABLE phieudangkigiahan (
    maphieu VARCHAR(50) PRIMARY KEY,
    makh VARCHAR(50) NOT NULL,
    maphieuduthi VARCHAR(50) NOT NULL,
    langiahan INTEGER NOT NULL CHECK (langiahan <= 2),
    nguoilapphieu VARCHAR(50) NOT NULL,
    buoithimoi VARCHAR(50) NOT NULL,
    truonghopdacbiet BOOLEAN NOT NULL DEFAULT FALSE,
    trangthai VARCHAR(50) NOT NULL DEFAULT 'Chờ duyệt',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phieugiahan_kh FOREIGN KEY (makh) REFERENCES khachhang(makh) ON DELETE CASCADE,
    CONSTRAINT fk_phieugiahan_phieuduthi FOREIGN KEY (maphieuduthi) REFERENCES phieuduthi(maphieu) ON DELETE CASCADE,
    CONSTRAINT fk_phieugiahan_nv FOREIGN KEY (nguoilapphieu) REFERENCES nhanvien(manv) ON DELETE RESTRICT,
    CONSTRAINT fk_phieugiahan_buoithimoi FOREIGN KEY (buoithimoi) REFERENCES buoithi(mabuoithi) ON DELETE RESTRICT,
    CONSTRAINT unique_maphieu_giahan UNIQUE (maphieu),
    CONSTRAINT check_trangthai_phieugiahan CHECK (trangthai IN ('Chờ duyệt', 'Đã duyệt', 'Từ chối'))
);

-- Table: hoadon
CREATE TABLE hoadon (
    mahoadon VARCHAR(50) PRIMARY KEY,
    makh VARCHAR(50) NOT NULL,
    ngaylaphoadon TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nguoilaphoadon VARCHAR(50) NOT NULL,
    giamgia DOUBLE PRECISION NOT NULL DEFAULT 0,
    tongtien DOUBLE PRECISION NOT NULL,
    tinhtrang HoaDon_status NOT NULL,
    CONSTRAINT fk_hoadon_kh FOREIGN KEY (makh) REFERENCES khachhang(makh) ON DELETE CASCADE,
    CONSTRAINT fk_hoadon_nv FOREIGN KEY (nguoilaphoadon) REFERENCES nhanvien(manv) ON DELETE RESTRICT,
    CONSTRAINT unique_mahoadon UNIQUE (mahoadon)
);

-- Table: ketquathi
CREATE TABLE ketquathi (
    mabaithi VARCHAR(50) PRIMARY KEY,
    sobaodanh VARCHAR(50) NOT NULL,
    diemthi FLOAT NOT NULL,
    nguoicham TEXT NOT NULL,
    giamthi TEXT NOT NULL,
    CONSTRAINT fk_ketquathi_sbd FOREIGN KEY (sobaodanh) REFERENCES phieuduthi(sobaodanh) ON DELETE CASCADE,
    CONSTRAINT unique_mabaithi UNIQUE (mabaithi)
);

-- Table: bangtinh
CREATE TABLE bangtinh (
    sobaodanh VARCHAR(50) PRIMARY KEY,
    diemthi FLOAT NOT NULL,
    macc VARCHAR(50) NOT NULL,
    ngaycap TIMESTAMP NOT NULL,
    nguoinhap VARCHAR(50) NOT NULL,
    trangthai ChungChi_status NOT NULL,
    CONSTRAINT fk_bangtinh_sbd FOREIGN KEY (sobaodanh) REFERENCES phieuduthi(sobaodanh) ON DELETE CASCADE,
    CONSTRAINT fk_bangtinh_cc FOREIGN KEY (macc) REFERENCES thongtinchungchi(macc) ON DELETE RESTRICT,
    CONSTRAINT fk_bangtinh_nv FOREIGN KEY (nguoinhap) REFERENCES nhanvien(manv) ON DELETE RESTRICT
);

-- Create indexes for performance
CREATE INDEX idx_khachhang_loaikh ON khachhang(loaikh);
CREATE INDEX idx_buoithi_macc ON buoithi(macc);
CREATE INDEX idx_phieudangki_makh ON phieudangki(makh);
CREATE INDEX idx_phieudangki_mabuoithi ON phieudangki(mabuoithi);
CREATE INDEX idx_phieuduthi_sobaodanh ON phieuduthi(sobaodanh);
CREATE INDEX idx_phieuduthi_mats ON phieuduthi(mats);
CREATE INDEX idx_phieuduthi_maphieudangki ON phieuduthi(maphieudangki);
CREATE INDEX idx_hoadon_makh ON hoadon(makh);
CREATE INDEX idx_phongthi_mabuoithi ON phongthi(mabuoithi);

-- Function to generate unique mats without uuid-ossp
CREATE OR REPLACE FUNCTION generate_mats()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_mats VARCHAR(50);
  timestamp_part VARCHAR(20);
  random_part VARCHAR(10);
BEGIN
  timestamp_part := to_char(current_timestamp, 'YYYYMMDDHH24MISS');
  random_part := substring(md5(random()::text) FROM 1 FOR 6);
  new_mats := 'TS-' || timestamp_part || '-' || random_part;
  WHILE EXISTS (SELECT 1 FROM thongtinthisinh WHERE mats = new_mats) LOOP
    random_part := substring(md5(random()::text) FROM 1 FOR 6);
    new_mats := 'TS-' || timestamp_part || '-' || random_part;
  END LOOP;
  RETURN new_mats;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION generate_mats IS 'Generates a unique mats ID using timestamp and random string, avoiding uuid-ossp dependency';

-- Trigger to automatically update soluongthisinh in buoithi
CREATE OR REPLACE FUNCTION update_buoithi_soluongthisinh()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE buoithi
    SET soluongthisinh = (
        SELECT COUNT(*)
        FROM phieuduthi
        WHERE phieuduthi.mabuoithi = buoithi.mabuoithi
    )
    WHERE mabuoithi IN (NEW.mabuoithi, COALESCE(OLD.mabuoithi, NEW.mabuoithi));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_buoithi_soluongthisinh
AFTER INSERT OR UPDATE OR DELETE ON phieuduthi
FOR EACH ROW
EXECUTE FUNCTION update_buoithi_soluongthisinh();

-- Trigger to automatically update tongtien in hoadon
CREATE OR REPLACE FUNCTION update_hoadon_tongtien()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE hoadon
    SET tongtien = (
        SELECT COALESCE(SUM(thongtinchungchi.giatien), 0)
        FROM phieuduthi
        JOIN phieudangki ON phieuduthi.maphieudangki = phieudangki.maphieu
        JOIN thongtinchungchi ON phieuduthi.macc = thongtinchungchi.macc
        WHERE phieudangki.makh = hoadon.makh
    )
    WHERE hoadon.makh IN (SELECT makh FROM phieudangki WHERE maphieu = NEW.maphieudangki);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hoadon_tongtien
AFTER INSERT OR UPDATE OR DELETE ON phieuduthi
FOR EACH ROW
EXECUTE FUNCTION update_hoadon_tongtien();

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