// PTTKHTTT/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase.auth.getSession();
  const session = data.session;

  const protectedRoutes = [
    "/quan-ly-khach-hang",
    "/dang-ky",
    "/gia-han",
    "/nhap-ket-qua",
    "/quan-ly-hoa-don",
    "/tra-cuu-lich-thi",
    "/quan-ly-phieu",
    "/thong-ke",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/quan-ly-khach-hang/:path*", "/dang-ky/:path*", "/gia-han/:path*", "/nhap-ket-qua/:path*", "/quan-ly-hoa-don/:path*", "/tra-cuu-lich-thi/:path*", "/quan-ly-phieu/:path*", "/thong-ke/:path*"],
};