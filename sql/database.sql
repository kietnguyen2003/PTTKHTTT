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
    CONSTRAINT fk_thongtinthisinh_kh FOREIGN KEY (makh) REFERENCES khachhang(makh) ON DELETE CASCADE
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
