import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CandidateForm from "@/components/candidate-form"
import ConfirmationTable from "@/components/confirmation-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function DangKyPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lập Phiếu Đăng Ký Kiểm Tra</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Chọn khách hàng</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerType">Loại khách hàng</Label>
                <Select defaultValue="individual">
                  <SelectTrigger id="customerType">
                    <SelectValue placeholder="Chọn loại khách hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Cá nhân</SelectItem>
                    <SelectItem value="organization">Đơn vị</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerId">Mã khách hàng</Label>
                <div className="flex gap-2">
                  <Input id="customerId" placeholder="Nhập hoặc tra cứu mã khách hàng" />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="rounded-md border p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mã khách hàng</p>
                  <p className="font-medium">KH001</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Loại khách hàng</p>
                  <p className="font-medium">Cá nhân</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Họ tên</p>
                  <p className="font-medium">Nguyễn Văn A</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">0901234567</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <CandidateForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ConfirmationTable />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Làm mới</Button>
        <Button variant="outline">Hủy</Button>
        <Button>Lập phiếu đăng ký</Button>
      </div>
    </div>
  )
}
