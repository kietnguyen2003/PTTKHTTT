import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Clock, FileText, BarChart3, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  // Mock data for statistics
  const stats = [
    { title: "Tổng số phiếu đăng ký", value: "1,234", icon: ClipboardList, color: "bg-blue-100" },
    { title: "Phiếu đăng ký hôm nay", value: "42", icon: FileText, color: "bg-green-100" },
    { title: "Phiếu gia hạn", value: "156", icon: Clock, color: "bg-amber-100" },
    { title: "Tổng số thí sinh", value: "2,567", icon: Users, color: "bg-purple-100" },
  ]

  // Mock data for recent activities
  const recentActivities = [
    { id: "PDK001", type: "Đăng ký", customer: "Nguyễn Văn A", time: "10:30 AM, 18/04/2025" },
    { id: "PGH003", type: "Gia hạn", customer: "Trần Thị B", time: "09:15 AM, 18/04/2025" },
    { id: "PDK002", type: "Đăng ký", customer: "Công ty XYZ", time: "04:45 PM, 17/04/2025" },
    { id: "PGH002", type: "Gia hạn", customer: "Lê Văn C", time: "02:30 PM, 17/04/2025" },
    { id: "PDK003", type: "Đăng ký", customer: "Phạm Thị D", time: "11:20 AM, 17/04/2025" },
  ]

  // Mock data for upcoming exams
  const upcomingExams = [
    { id: "BT001", certificate: "Chứng chỉ Tiếng Anh B1", time: "09:00 - 11:00, 20/04/2025", candidates: 28 },
    { id: "BT002", certificate: "Chứng chỉ Tin học cơ bản", time: "14:00 - 16:00, 20/04/2025", candidates: 35 },
    { id: "BT003", certificate: "Chứng chỉ Tiếng Anh B2", time: "09:00 - 11:00, 21/04/2025", candidates: 22 },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-2 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Các hoạt động đăng ký và gia hạn gần đây</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type} - {activity.id}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Buổi thi sắp tới</CardTitle>
            <CardDescription>Các buổi thi sẽ diễn ra trong thời gian tới</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingExams.map((exam, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{exam.certificate}</p>
                    <p className="text-sm text-muted-foreground">
                      {exam.id} - {exam.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{exam.candidates}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <Link href="/dang-ky" className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-blue-100 p-3">
                <ClipboardList className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="font-semibold">Đăng ký kiểm tra</h3>
              <p className="text-sm text-muted-foreground">Lập phiếu đăng ký kiểm tra cho khách hàng</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Link href="/gia-han" className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-amber-100 p-3">
                <Clock className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="font-semibold">Gia hạn thời gian thi</h3>
              <p className="text-sm text-muted-foreground">Xử lý gia hạn thời gian thi cho thí sinh</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Link href="/quan-ly-phieu" className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-green-100 p-3">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="font-semibold">Quản lý phiếu</h3>
              <p className="text-sm text-muted-foreground">Xem và quản lý các phiếu đăng ký, gia hạn</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Link href="/thong-ke" className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-purple-100 p-3">
                <BarChart3 className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="font-semibold">Thống kê báo cáo</h3>
              <p className="text-sm text-muted-foreground">Xem thống kê và báo cáo tổng hợp</p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
