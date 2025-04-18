"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  ClipboardList,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  UserCircle,
  PenLine,
  Receipt,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      href: "/",
      icon: Home,
      title: "Trang chủ",
    },
    {
      href: "/quan-ly-khach-hang",
      icon: UserCircle,
      title: "Quản lý khách hàng",
    },
    {
      href: "/dang-ky",
      icon: ClipboardList,
      title: "Đăng ký kiểm tra",
    },
    {
      href: "/gia-han",
      icon: Clock,
      title: "Gia hạn thời gian thi",
    },
    {
      href: "/nhap-ket-qua",
      icon: PenLine,
      title: "Nhập kết quả thi",
    },
    {
      href: "/quan-ly-hoa-don",
      icon: Receipt,
      title: "Quản lý hóa đơn",
    },
    {
      href: "/tra-cuu-lich-thi",
      icon: CalendarDays,
      title: "Tra cứu lịch thi",
    },
    {
      href: "/quan-ly-phieu",
      icon: FileText,
      title: "Quản lý phiếu",
    },
    {
      href: "/thong-ke",
      icon: BarChart3,
      title: "Thống kê báo cáo",
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon" className="absolute left-4 top-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <MobileSidebar routes={routes} pathname={pathname} setOpen={setOpen} />
        </SheetContent>
      </Sheet>

      <div className={cn("hidden border-r bg-background lg:block", className)}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <ClipboardList className="h-5 w-5" />
              <span>Hệ thống QL Kiểm tra</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 py-2">
            <nav className="grid gap-1 px-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                  {route.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="mt-auto border-t p-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

interface MobileSidebarProps {
  routes: {
    href: string
    icon: React.ElementType
    title: string
  }[]
  pathname: string
  setOpen: (open: boolean) => void
}

function MobileSidebar({ routes, pathname, setOpen }: MobileSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
          <ClipboardList className="h-5 w-5" />
          <span>Hệ thống QL Kiểm tra</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === route.href ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="mt-auto border-t p-4">
        <Button variant="outline" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}
