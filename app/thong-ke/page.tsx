import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ThongKePage() {
  // Mock data for statistics
  const registrationStats = [
    { month: "Tháng 1", individual: 45, organization: 12, total: 57 },
    { month: "Tháng 2", individual: 38, organization: 15, total: 53 },
    { month: "Tháng 3", individual: 52, organization: 18, total: 70 },
    { month: "Tháng 4", individual: 61, organization: 21, total: 82 },
  ]

  // Mock data for certificate statistics
  const certificateStats = [
    { certificate: "Chứng chỉ Tiếng Anh B1", count: 120, percentage: "35%" },
    { certificate: "Chứng chỉ Tiếng Anh B2", count: 85, percentage: "25%" },
    { certificate: "Chứng chỉ Tin học cơ bản", count: 95, percentage: "28%" },
    { certificate: "Chứng chỉ Tin học nâng cao", count: 42, percentage: "12%" },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Thống Kê Báo Cáo</h1>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Xuất báo cáo
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="date" className="w-[180px] pl-8" />
          </div>
          <span className="text-sm">đến</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="date" className="w-[180px] pl-8" />
          </div>
        </div>
        <Select defaultValue="month">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Tuần này</SelectItem>
            <SelectItem value="month">Tháng này</SelectItem>
            <SelectItem value="quarter">Quý này</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số phiếu đăng ký</CardDescription>
            <CardTitle className="text-2xl">262</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 12%</span> so với kỳ trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Phiếu đăng ký cá nhân</CardDescription>
            <CardTitle className="text-2xl">196</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 8%</span> so với kỳ trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Phiếu đăng ký đơn vị</CardDescription>
            <CardTitle className="text-2xl">66</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 15%</span> so với kỳ trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Phiếu gia hạn</CardDescription>
            <CardTitle className="text-2xl">38</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500">↓ 3%</span> so với kỳ trước
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registration">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registration">Thống kê đăng ký</TabsTrigger>
          <TabsTrigger value="certificate">Thống kê chứng chỉ</TabsTrigger>
        </TabsList>

        <TabsContent value="registration" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê đăng ký theo tháng</CardTitle>
              <CardDescription>Số lượng phiếu đăng ký theo từng tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tháng</TableHead>
                      <TableHead className="text-right">Cá nhân</TableHead>
                      <TableHead className="text-right">Đơn vị</TableHead>
                      <TableHead className="text-right">Tổng cộng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrationStats.map((stat) => (
                      <TableRow key={stat.month}>
                        <TableCell className="font-medium">{stat.month}</TableCell>
                        <TableCell className="text-right">{stat.individual}</TableCell>
                        <TableCell className="text-right">{stat.organization}</TableCell>
                        <TableCell className="text-right font-semibold">{stat.total}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Tổng cộng</TableCell>
                      <TableCell className="text-right font-bold">196</TableCell>
                      <TableCell className="text-right font-bold">66</TableCell>
                      <TableCell className="text-right font-bold">262</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificate" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê theo loại chứng chỉ</CardTitle>
              <CardDescription>Số lượng đăng ký theo từng loại chứng chỉ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại chứng chỉ</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Tỷ lệ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificateStats.map((stat) => (
                      <TableRow key={stat.certificate}>
                        <TableCell className="font-medium">{stat.certificate}</TableCell>
                        <TableCell className="text-right">{stat.count}</TableCell>
                        <TableCell className="text-right">{stat.percentage}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Tổng cộng</TableCell>
                      <TableCell className="text-right font-bold">342</TableCell>
                      <TableCell className="text-right font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
