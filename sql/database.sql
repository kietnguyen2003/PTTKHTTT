-- Drop existing tables in reverse dependency order to avoid conflicts
DROP TABLE IF EXISTS BangTinh CASCADE;
DROP TABLE IF EXISTS KetQuaThi CASCADE;
DROP TABLE IF EXISTS HoaDon CASCADE;
DROP TABLE IF EXISTS PhieuDangKiGiaHan CASCADE;
DROP TABLE IF EXISTS PhieuDuThi CASCADE;
DROP TABLE IF EXISTS PhieuDangKiChiTiet CASCADE;
DROP TABLE IF EXISTS PhieuDangKi CASCADE;
DROP TABLE IF EXISTS PhongThi CASCADE;
DROP TABLE IF EXISTS BuoiThi CASCADE;
DROP TABLE IF EXISTS ThongTinChungChi CASCADE;
DROP TABLE IF EXISTS ThongTinThiSinh CASCADE;
DROP TABLE IF EXISTS KhachHang_DV CASCADE;
DROP TABLE IF EXISTS KhachHang_CN CASCADE;
DROP TABLE IF EXISTS KhachHang CASCADE;
DROP TABLE IF EXISTS NhanVien CASCADE;


-- Drop existing enums
DROP TYPE IF EXISTS HoaDon_status CASCADE;
DROP TYPE IF EXISTS Gender CASCADE;
DROP TYPE IF EXISTS KhachHang_type CASCADE;
DROP TYPE IF EXISTS ChungChi_status CASCADE;

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum definitions
CREATE TYPE HoaDon_status AS ENUM ('ChuaThanhToan', 'DaThanhToan', 'DaHuy');
CREATE TYPE Gender AS ENUM ('Nam', 'Nu');
CREATE TYPE KhachHang_type AS ENUM ('CaNhan', 'DonVi');
CREATE TYPE ChungChi_status AS ENUM ('ChuaNhan', 'DaNhan');

-- Table: KhachHang
CREATE TABLE KhachHang (
    MaKH VARCHAR(50) PRIMARY KEY,
    LoaiKH KhachHang_type NOT NULL,
    DiaChi TEXT,
    CONSTRAINT unique_makh UNIQUE (MaKH)
);
COMMENT ON COLUMN KhachHang.DiaChi IS 'Added for contact information';

-- Table: KhachHang_CN
CREATE TABLE KhachHang_CN (
    MaKH VARCHAR(50) PRIMARY KEY,
    HoTen TEXT NOT NULL,
    CCCD VARCHAR(20),
    Email VARCHAR(255),
    SDT VARCHAR(15),
    CONSTRAINT fk_khachhang_cn FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE
);

-- Table: KhachHang_DV
CREATE TABLE KhachHang_DV (
    MaKH VARCHAR(50) PRIMARY KEY,
    TenDV TEXT NOT NULL,
    MaDV VARCHAR(50) NOT NULL,
    SDT VARCHAR(15),
    email varchar(255),
    CONSTRAINT fk_khachhang_dv FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE
);
COMMENT ON COLUMN KhachHang_DV.SDT IS 'Added for contact';

-- Table: ThongTinThiSinh
CREATE TABLE ThongTinThiSinh (
    MaTS VARCHAR(50) PRIMARY KEY,
    MaKH VARCHAR(50) NOT NULL,
    HoTen TEXT NOT NULL,
    NgaySinh DATE,
    GioiTinh Gender,
    CONSTRAINT fk_thongtinthsinh_kh FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE,
    CONSTRAINT unique_mats UNIQUE (MaTS)
);

-- Table: ThongTinChungChi
CREATE TABLE ThongTinChungChi (
    MaCC VARCHAR(50) PRIMARY KEY,
    TenCC TEXT NOT NULL,
    ThoiGianThi INTEGER NOT NULL,
    GiaTien DOUBLE PRECISION NOT NULL,
    CONSTRAINT unique_macc UNIQUE (MaCC)
);

-- Table: BuoiThi
CREATE TABLE BuoiThi (
    MaBuoiThi VARCHAR(50) PRIMARY KEY,
    MaCC VARCHAR(50) NOT NULL,
    SoLuongThiSinh INTEGER NOT NULL,
    DiaDiem TEXT NOT NULL,
    ThoiGian TIMESTAMP NOT NULL,
    TrangThai VARCHAR(20) NOT NULL CHECK (TrangThai IN ('DaToChuc', 'ChuaToChuc')),
    CONSTRAINT fk_buoithi_cc FOREIGN KEY (MaCC) REFERENCES ThongTinChungChi(MaCC) ON DELETE RESTRICT,
    CONSTRAINT unique_mabuoithi UNIQUE (MaBuoiThi)
);
COMMENT ON COLUMN BuoiThi.TrangThai IS 'Added to track status: DaToChuc/ChuaToChuc';

-- Table: PhongThi
CREATE TABLE PhongThi (
   MaPhong VARCHAR(50) PRIMARY KEY,
    MaBuoiThi VARCHAR(50) NOT NULL,
    SucChua INTEGER NOT NULL,
    CONSTRAINT fk_phongthi_buoithi FOREIGN KEY (MaBuoiThi) REFERENCES BuoiThi(MaBuoiThi) ON DELETE CASCADE,
    CONSTRAINT unique_maphong UNIQUE (MaPhong)
);
COMMENT ON COLUMN PhongThi.SucChua IS 'Added to manage room capacity';

-- Table: PhieuDangKi
CREATE TABLE PhieuDangKi (
    MaPhieu VARCHAR(50) PRIMARY KEY,
    MaKH VARCHAR(50) NOT NULL,
    MaBuoiThi VARCHAR(50) NOT NULL,
    NgayDangKy TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phieudangki_kh FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE,
    CONSTRAINT fk_phieudangki_buoithi FOREIGN KEY (MaBuoiThi) REFERENCES BuoiThi(MaBuoiThi) ON DELETE RESTRICT,
    CONSTRAINT unique_maphieu UNIQUE (MaPhieu)
);
COMMENT ON COLUMN PhieuDangKi.NgayDangKy IS 'Added to track registration date';

-- Table: PhieuDangKiChiTiet
CREATE TABLE PhieuDangKiChiTiet (
    MaPhieu VARCHAR(50) PRIMARY KEY,
    MaTS VARCHAR(50) NOT NULL,
    SoLuongThiSinh INTEGER,
    DiaDiemToChuc TEXT,
    CONSTRAINT fk_phieudangkict_phieu FOREIGN KEY (MaPhieu) REFERENCES PhieuDangKi(MaPhieu) ON DELETE CASCADE,
    CONSTRAINT fk_phieudangkict_ts FOREIGN KEY (MaTS) REFERENCES ThongTinThiSinh(MaTS) ON DELETE RESTRICT
);
COMMENT ON COLUMN PhieuDangKiChiTiet.SoLuongThiSinh IS 'For KhachHang_DV, NULL for CaNhan';
COMMENT ON COLUMN PhieuDangKiChiTiet.DiaDiemToChuc IS 'For KhachHang_DV, NULL for CaNhan';

-- Table: NhanVien (Moved before tables that reference it)
CREATE TABLE NhanVien (
    MaNV VARCHAR(50) PRIMARY KEY,
    TenNV TEXT NOT NULL,
    CongViec TEXT NOT NULL,
    SDT VARCHAR(15),
    CONSTRAINT unique_manv UNIQUE (MaNV)
);
COMMENT ON COLUMN NhanVien.SDT IS 'Added for contact';

-- Table: PhieuDuThi
CREATE TABLE PhieuDuThi (
    MaPhieu VARCHAR(50) PRIMARY KEY,
    SoBaoDanh VARCHAR(50) NOT NULL,
    MaKH VARCHAR(50) NOT NULL,
    MaBuoiThi VARCHAR(50) NOT NULL,
    MaCC VARCHAR(50) NOT NULL,
    MaPhong VARCHAR(50) NOT NULL,
    ThoiGian TIMESTAMP NOT NULL,
    DiaDiem TEXT NOT NULL,
    DiemThi FLOAT,
    CONSTRAINT fk_phieuduthi_kh FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE,
    CONSTRAINT fk_phieuduthi_buoithi FOREIGN KEY (MaBuoiThi) REFERENCES BuoiThi(MaBuoiThi) ON DELETE RESTRICT,
    CONSTRAINT fk_phieuduthi_cc FOREIGN KEY (MaCC) REFERENCES ThongTinChungChi(MaCC) ON DELETE RESTRICT,
    CONSTRAINT fk_phieuduthi_phong FOREIGN KEY (MaPhong) REFERENCES PhongThi(MaPhong) ON DELETE RESTRICT,
    CONSTRAINT unique_maphieu_duthi UNIQUE (MaPhieu),
    CONSTRAINT unique_sobaodanh UNIQUE (SoBaoDanh)
);
COMMENT ON COLUMN PhieuDuThi.DiemThi IS 'NULL until exam is graded';

-- Table: PhieuDangKiGiaHan
CREATE TABLE PhieuDangKiGiaHan (
    MaPhieu VARCHAR(50) PRIMARY KEY,
    MaKH VARCHAR(50) NOT NULL,
    MaPhieuDuThi VARCHAR(50) NOT NULL,
    LanGiaHan INTEGER NOT NULL CHECK (LanGiaHan <= 2),
    NguoiLapPhieu VARCHAR(50) NOT NULL,
    NgayThiMoi TIMESTAMP NOT NULL,
    TruongHopDacBiet BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_phieugiahan_kh FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE,
    CONSTRAINT fk_phieugiahan_phieuduthi FOREIGN KEY (MaPhieuDuThi) REFERENCES PhieuDuThi(MaPhieu) ON DELETE CASCADE,
    CONSTRAINT fk_phieugiahan_nv FOREIGN KEY (NguoiLapPhieu) REFERENCES NhanVien(MaNV) ON DELETE RESTRICT,
    CONSTRAINT unique_maphieu_giahan UNIQUE (MaPhieu)
);
COMMENT ON COLUMN PhieuDangKiGiaHan.TruongHopDacBiet IS 'True if special case like illness';

-- Table: HoaDon
CREATE TABLE HoaDon (
    MaHoaDon VARCHAR(50) PRIMARY KEY,
    MaKH VARCHAR(50) NOT NULL,
    NgayLapHoaDon TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NguoiLapHoaDon VARCHAR(50) NOT NULL,
    GiamGia DOUBLE PRECISION NOT NULL DEFAULT 0,
    TongTien DOUBLE PRECISION NOT NULL,
    TinhTrang HoaDon_status NOT NULL,
    CONSTRAINT fk_hoadon_kh FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE,
    CONSTRAINT fk_hoadon_nv FOREIGN KEY (NguoiLapHoaDon) REFERENCES NhanVien(MaNV) ON DELETE RESTRICT,
    CONSTRAINT unique_mahoadon UNIQUE (MaHoaDon)
);

-- Table: KetQuaThi
CREATE TABLE KetQuaThi (
    MaBaiThi VARCHAR(50) PRIMARY KEY,
    SoBaoDanh VARCHAR(50) NOT NULL,
    DiemThi FLOAT NOT NULL,
    NguoiCham TEXT NOT NULL,
    GiamThi TEXT NOT NULL,
    CONSTRAINT fk_ketquathi_sbd FOREIGN KEY (SoBaoDanh) REFERENCES PhieuDuThi(SoBaoDanh) ON DELETE CASCADE,
    CONSTRAINT unique_mabaithi UNIQUE (MaBaiThi)
);
COMMENT ON COLUMN KetQuaThi.GiamThi IS 'Exam supervisor';

-- Table: BangTinh
CREATE TABLE BangTinh (
    SoBaoDanh VARCHAR(50) PRIMARY KEY,
    DiemThi FLOAT NOT NULL,
    MaCC VARCHAR(50) NOT NULL,
    NgayCap TIMESTAMP NOT NULL,
    NguoiNhap VARCHAR(50) NOT NULL,
    TrangThai ChungChi_status NOT NULL,
    CONSTRAINT fk_bangtinh_sbd FOREIGN KEY (SoBaoDanh) REFERENCES PhieuDuThi(SoBaoDanh) ON DELETE CASCADE,
    CONSTRAINT fk_bangtinh_cc FOREIGN KEY (MaCC) REFERENCES ThongTinChungChi(MaCC) ON DELETE RESTRICT,
    CONSTRAINT fk_bangtinh_nv FOREIGN KEY (NguoiNhap) REFERENCES NhanVien(MaNV) ON DELETE RESTRICT
);

-- Create indexes for performance
CREATE INDEX idx_khachhang_loaikh ON KhachHang(LoaiKH);
CREATE INDEX idx_buoithi_macc ON BuoiThi(MaCC);
CREATE INDEX idx_phieudangki_makh ON PhieuDangKi(MaKH);
CREATE INDEX idx_phieudangki_mabuoithi ON PhieuDangKi(MaBuoiThi);
CREATE INDEX idx_phieuduthi_sobaodanh ON PhieuDuThi(SoBaoDanh);
CREATE INDEX idx_hoadon_makh ON HoaDon(MaKH);

CREATE OR REPLACE FUNCTION generate_mats()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_mats VARCHAR(50);
BEGIN
  new_mats := uuid_generate_v4()::VARCHAR(50);
  WHILE EXISTS (SELECT 1 FROM ThongTinThiSinh WHERE MaTS = new_mats) LOOP
    new_mats := uuid_generate_v4()::VARCHAR(50);
  END LOOP;
  RETURN new_mats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_mats() IS 'Generates a unique MaTS for ThongTinThiSinh';