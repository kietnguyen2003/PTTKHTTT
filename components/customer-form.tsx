// src/components/customer-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/supabaseClient';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { CustomerFormProps } from '@/types/CustomerTypes';

export default function CustomerForm({ onSuccess, initialData }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    makh: initialData?.makh || '',
    loaikh: initialData?.loaikh || ('CaNhan' as 'CaNhan' | 'DonVi'),
    hoten: initialData?.hoten || '',
    cccd: initialData?.cccd || '',
    email: initialData?.email || '',
    sdt: initialData?.sdt || '',
    diachi: initialData?.diachi || '',
    tendv: initialData?.tendv || '',
    madv: initialData?.madv || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation logic
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.makh) newErrors.makh = 'Mã khách hàng là bắt buộc';
    if (formData.loaikh === 'CaNhan') {
      if (!formData.hoten) newErrors.hoten = 'Họ tên là bắt buộc';
      if (formData.cccd && !/^\d{12}$/.test(formData.cccd)) newErrors.cccd = 'CCCD phải là 12 số';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Email không hợp lệ';
      if (formData.sdt && !/^\d{10}$/.test(formData.sdt)) newErrors.sdt = 'Số điện thoại phải là 10 số';
    } else {
      if (!formData.tendv) newErrors.tendv = 'Tên đơn vị là bắt buộc';
      if (!formData.madv) newErrors.madv = 'Mã đơn vị là bắt buộc';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Email không hợp lệ';
      if (formData.sdt && !/^\d{10}$/.test(formData.sdt)) newErrors.sdt = 'Số điện thoại phải là 10 số';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tạo makh mới bằng UUID
  useEffect(() => {
    if (!initialData) {
      setFormData((prev) => ({ ...prev, makh: uuidv4() }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Lỗi', description: 'Vui lòng kiểm tra lại thông tin nhập', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      if (initialData) {
        // Cập nhật khách hàng
        const { error: updateKhachHangError } = await supabase
          .from('khachhang')
          .update({ diachi: formData.diachi || null })
          .eq('makh', formData.makh);

        if (formData.loaikh === 'CaNhan') {
          const { error: updateKhachHangCNError } = await supabase
            .from('khachhang_cn')
            .update({
              hoten: formData.hoten,
              cccd: formData.cccd || null,
              email: formData.email || null,
              sdt: formData.sdt || null,
            })
            .eq('makh', formData.makh);

          if (updateKhachHangError || updateKhachHangCNError) {
            throw new Error('Không thể cập nhật khách hàng cá nhân');
          }
        } else {
          const { error: updateKhachHangDVError } = await supabase
            .from('khachhang_dv')
            .update({
              tendv: formData.tendv,
              madv: formData.madv,
              sdt: formData.sdt || null,
              email: formData.email || null,
            })
            .eq('makh', formData.makh);

          if (updateKhachHangError || updateKhachHangDVError) {
            throw new Error('Không thể cập nhật khách hàng đơn vị');
          }
        }
      } else {
        // Thêm khách hàng mới
        const { error: insertKhachHangError } = await supabase.from('khachhang').insert({
          makh: formData.makh,
          loaikh: formData.loaikh,
          diachi: formData.diachi || null,
        });

        if (formData.loaikh === 'CaNhan') {
          const { error: insertKhachHangCNError } = await supabase.from('khachhang_cn').insert({
            makh: formData.makh,
            hoten: formData.hoten,
            cccd: formData.cccd || null,
            email: formData.email || null,
            sdt: formData.sdt || null,
          });

          if (insertKhachHangError || insertKhachHangCNError) {
            throw new Error('Không thể thêm khách hàng cá nhân');
          }
        } else {
          const { error: insertKhachHangDVError } = await supabase.from('khachhang_dv').insert({
            makh: formData.makh,
            tendv: formData.tendv,
            madv: formData.madv,
            sdt: formData.sdt || null,
            email: formData.email || null,
          });

          if (insertKhachHangError || insertKhachHangDVError) {
            throw new Error('Không thể thêm khách hàng đơn vị');
          }
        }
      }

      toast({ title: 'Thành công', description: initialData ? 'Đã cập nhật khách hàng' : 'Đã thêm khách hàng' });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      toast({
        title: 'Lỗi',
        description: `Không thể lưu khách hàng: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="makh">Mã khách hàng</Label>
        <Input id="makh" value={formData.makh} disabled />
        {errors.makh && <p className="text-sm text-red-500">{errors.makh}</p>}
      </div>
      <div>
        <Label htmlFor="loaikh">Loại khách hàng</Label>
        <Select
          value={formData.loaikh}
          onValueChange={(value) => setFormData({ ...formData, loaikh: value as 'CaNhan' | 'DonVi' })}
          disabled={!!initialData}
        >
          <SelectTrigger id="loaikh">
            <SelectValue placeholder="Chọn loại khách hàng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CaNhan">Cá nhân</SelectItem>
            <SelectItem value="DonVi">Đơn vị</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.loaikh === 'CaNhan' ? (
        <>
          <div>
            <Label htmlFor="hoten">Họ tên</Label>
            <Input
              id="hoten"
              value={formData.hoten}
              onChange={(e) => setFormData({ ...formData, hoten: e.target.value })}
              required
            />
            {errors.hoten && <p className="text-sm text-red-500">{errors.hoten}</p>}
          </div>
          <div>
            <Label htmlFor="cccd">CCCD</Label>
            <Input
              id="cccd"
              value={formData.cccd}
              onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
            />
            {errors.cccd && <p className="text-sm text-red-500">{errors.cccd}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="sdt">Số điện thoại</Label>
            <Input
              id="sdt"
              value={formData.sdt}
              onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
            />
            {errors.sdt && <p className="text-sm text-red-500">{errors.sdt}</p>}
          </div>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="tendv">Tên đơn vị</Label>
            <Input
              id="tendv"
              value={formData.tendv}
              onChange={(e) => setFormData({ ...formData, tendv: e.target.value })}
              required
            />
            {errors.tendv && <p className="text-sm text-red-500">{errors.tendv}</p>}
          </div>
          <div>
            <Label htmlFor="madv">Mã đơn vị</Label>
            <Input
              id="madv"
              value={formData.madv}
              onChange={(e) => setFormData({ ...formData, madv: e.target.value })}
              required
            />
            {errors.madv && <p className="text-sm text-red-500">{errors.madv}</p>}
          </div>
          <div>
            <Label htmlFor="sdt">Số điện thoại</Label>
            <Input
              id="sdt"
              value={formData.sdt}
              onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
            />
            {errors.sdt && <p className="text-sm text-red-500">{errors.sdt}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
        </>
      )}
      <div>
        <Label htmlFor="diachi">Địa chỉ</Label>
        <Input
          id="diachi"
          value={formData.diachi}
          onChange={(e) => setFormData({ ...formData, diachi: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm khách hàng'}
      </Button>
    </form>
  );
}