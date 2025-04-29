import { supabase } from "@/lib/supabase/supabaseClient";
import { Customer, SupabaseCustomer } from "@/types/CustomerTypes";


export async function fetchIndividualCustomers(setCustomers: (customers: Customer[]) => void) {
  const { data, error } = await supabase
    .from('khachhang')
    .select(`
      makh,
      loaikh,
      diachi,
      khachhang_cn (
        hoten,
        cccd,
        email,
        sdt
      ),
      phieudangki (
        maphieu,
        ngaydangky,
        trangthai,
        buoithi (
          thoigian,
          thongtinchungchi (
            tencc
          )
        )
      )
    `)
    .eq('loaikh', 'CaNhan');

  if (error) {
    console.error('Error fetching individual customers:', error.message);
    throw error;
  }

  console.log("data", data);

  // Loại bỏ trùng lặp dựa trên makh
  const uniqueData = Array.from(new Map((data as unknown as SupabaseCustomer[]).map(item => [item.makh, item])).values());

  const customers: Customer[] = uniqueData.map((item) => ({
    makh: item.makh,
    loaikh: item.loaikh,
    diachi: item.diachi,
    hoten: item.khachhang_cn?.hoten,
    cccd: item.khachhang_cn?.cccd,
    email: item.khachhang_cn?.email,
    sdt: item.khachhang_cn?.sdt,
    tendv: undefined, // Không áp dụng cho khách hàng cá nhân
    madv: undefined, // Không áp dụng cho khách hàng cá nhân
    registrations: item.phieudangki.map((pdk) => ({
      maphieu: pdk.maphieu,
      ngaythi: pdk.buoithi.thoigian,
      tencc: pdk.buoithi.thongtinchungchi.tencc,
      trangthai: pdk.trangthai,
      ngaydangky: pdk.ngaydangky,
    })),
  }));

  setCustomers(customers);
}

export async function fetchOrganizationCustomers(setCustomers: (customers: Customer[]) => void) {
  const { data, error } = await supabase
    .from('khachhang')
    .select(`
      makh,
      loaikh,
      diachi,
      khachhang_dv (
        tendv,
        madv,
        email,
        sdt
      ),
      phieudangki (
        maphieu,
        ngaydangky,
        trangthai,
        buoithi (
          thoigian,
          thongtinchungchi (
            tencc
          )
        )
      )
    `)
    .eq('loaikh', 'DonVi');

  if (error) {
    console.error('Error fetching organization customers:', error.message);
    throw error;
  }

  // Loại bỏ trùng lặp dựa trên makh
  const uniqueData = Array.from(new Map((data as unknown as SupabaseCustomer[]).map(item => [item.makh, item])).values());

  const customers: Customer[] = uniqueData.map((item) => ({
    makh: item.makh,
    loaikh: item.loaikh,
    diachi: item.diachi,
    hoten: undefined, // Không áp dụng cho khách hàng đơn vị
    cccd: undefined, // Không áp dụng cho khách hàng đơn vị
    email: item.khachhang_dv?.email,
    sdt: item.khachhang_dv?.sdt,
    tendv: item.khachhang_dv?.tendv,
    madv: item.khachhang_dv?.madv,
    registrations: item.phieudangki.map((pdk) => ({
      maphieu: pdk.maphieu,
      ngaythi: pdk.buoithi.thoigian,
      tencc: pdk.buoithi.thongtinchungchi.tencc,
      trangthai: pdk.trangthai,
      ngaydangky: pdk.ngaydangky,
    })),
  }));

  setCustomers(customers);
}