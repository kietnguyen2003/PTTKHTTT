// src/lib/supabase/auth.ts
import { supabase } from '@/lib/supabase/supabaseClient';
import { User } from '@supabase/supabase-js';

// Đăng nhập bằng Magic Link
export async function signInWithMagicLink(email: string) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    if (error) throw error;
    return { success: true, message: 'Vui lòng kiểm tra email để nhận liên kết đăng nhập!' };
  } catch (error: any) {
    return { success: false, message: `Lỗi: ${error.message}` };
  }
}

// Đăng ký người dùng mới
export async function signUpWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    if (error) throw error;
    return { success: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.', data };
  } catch (error: any) {
    return { success: false, message: `Lỗi: ${error.message}` };
  }
}

// Đăng xuất
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true, message: 'Đăng xuất thành công!' };
  } catch (error: any) {
    return { success: false, message: `Lỗi: ${error.message}` };
  }
}

// Lấy thông tin người dùng hiện tại
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}