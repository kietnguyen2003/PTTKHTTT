"use client"

import { useState } from "react"
import Link from "next/link"
import { Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState("individual")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-6 w-6" />
              <span className="font-bold">ContestHub</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Trang chủ
              </Link>
              <Link href="/contests" className="text-sm font-medium transition-colors hover:text-primary">
                Cuộc thi
              </Link>
              <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                Lịch trình
              </Link>
              <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                Kết quả
              </Link>
              <Link href="#" className="text-sm font-medium transition-colors hover:text-primary">
                Liên hệ
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              Đăng nhập
            </Button>
            <Button size="sm">Đăng ký</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Đăng ký tham gia cuộc thi</h1>
              <p className="text-gray-500 dark:text-gray-400">Điền thông tin của bạn để đăng ký tham gia cuộc thi</p>
            </div>
            <Tabs defaultValue="contest-info" className="mt-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contest-info">Thông tin cuộc thi</TabsTrigger>
                <TabsTrigger value="participant-info">Thông tin người tham gia</TabsTrigger>
              </TabsList>
              <TabsContent value="contest-info" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Chọn cuộc thi</CardTitle>
                    <CardDescription>Chọn cuộc thi bạn muốn tham gia</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contest">Cuộc thi</Label>
                      <Select>
                        <SelectTrigger id="contest">
                          <SelectValue placeholder="Chọn cuộc thi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Cuộc thi Lập trình (15/05/2025)</SelectItem>
                          <SelectItem value="design">Cuộc thi Thiết kế UI/UX (22/05/2025)</SelectItem>
                          <SelectItem value="ai">Hackathon AI (10/06/2025)</SelectItem>
                          <SelectItem value="game">Cuộc thi Phát triển Game (25/06/2025)</SelectItem>
                          <SelectItem value="security">Cuộc thi An ninh mạng (05/07/2025)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Loại đăng ký</Label>
                      <RadioGroup
                        defaultValue="individual"
                        value={registrationType}
                        onValueChange={setRegistrationType}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="individual" id="individual" />
                          <Label htmlFor="individual">Cá nhân</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="team" id="team" />
                          <Label htmlFor="team">Đội nhóm</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {registrationType === "team" && (
                      <div className="space-y-2">
                        <Label htmlFor="team-name">Tên đội</Label>
                        <Input id="team-name" placeholder="Nhập tên đội của bạn" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="category">Hạng mục</Label>
                      <Select>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Chọn hạng mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Người mới bắt đầu</SelectItem>
                          <SelectItem value="intermediate">Trung cấp</SelectItem>
                          <SelectItem value="advanced">Nâng cao</SelectItem>
                          <SelectItem value="professional">Chuyên nghiệp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Tiếp tục</Button>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="participant-info" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                    <CardDescription>Điền thông tin cá nhân của bạn</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name">Họ</Label>
                        <Input id="first-name" placeholder="Nhập họ của bạn" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name">Tên</Label>
                        <Input id="last-name" placeholder="Nhập tên của bạn" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="example@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" placeholder="Nhập số điện thoại của bạn" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Ngày sinh</Label>
                      <Input id="dob" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input id="address" placeholder="Nhập địa chỉ của bạn" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="experience">Kinh nghiệm</Label>
                      <Select>
                        <SelectTrigger id="experience">
                          <SelectValue placeholder="Chọn mức kinh nghiệm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1">Dưới 1 năm</SelectItem>
                          <SelectItem value="1-3">1-3 năm</SelectItem>
                          <SelectItem value="3-5">3-5 năm</SelectItem>
                          <SelectItem value="5+">Trên 5 năm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Hoàn tất đăng ký</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 ContestHub. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Điều khoản
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Liên hệ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
