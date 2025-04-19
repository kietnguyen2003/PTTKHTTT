"use client"

import {   useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {  Calendar } from "lucide-react"
import { Customer } from "@/lib/customerService"
import { CertificateList } from "@/lib/certificateService"
import { DateList } from "@/lib/dateService"

export default function CandidateForm( { selectedCustomer, dateList, certificateList }: { selectedCustomer: Customer | null, dateList: DateList[], certificateList: CertificateList[] }) {
  const [showIndividualForm, setShowIndividualForm] = useState(true)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Thông tin thí sinh và lịch thi</h2>

      <div className="space-y-2">
        <Label htmlFor="candidateId">Mã thí sinh</Label>
        <div className="flex gap-2">
          <Input value={selectedCustomer?.id} id="candidateId" disabled />
        </div>
        <p className="text-xs text-muted-foreground">Mã sẽ được tự động tạo nếu là thí sinh mới</p>
      </div>

      {showIndividualForm ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateName">Họ tên</Label>
            <Input value={selectedCustomer?.name} id="candidateName" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Ngày sinh</Label>
            <div className="relative">
              <Input id="dob" type="date" />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Giới tính</Label>
            <Select>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidateCount">Số lượng thí sinh</Label>
            <Input id="candidateCount" type="number" min="1" placeholder="Nhập số lượng thí sinh" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Địa điểm tổ chức</Label>
            <Input id="venue" placeholder="Nhập địa điểm tổ chức" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="certificateType">Loại chứng chỉ</Label>
        <Select>
          <SelectTrigger id="certificateType">
            <SelectValue placeholder="Chọn loại chứng chỉ" />
          </SelectTrigger>
          <SelectContent>
            {certificateList.map((certificate) => (
              <SelectItem key={certificate.macc} value={certificate.macc}>
                {certificate.tencc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Lịch thi</Label>
          <Button variant="outline" size="sm" className="h-8">
            Kiểm tra lịch thi
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Mã buổi</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Địa điểm</TableHead>
                <TableHead className="w-[100px] text-center">Số lượng</TableHead>
                <TableHead className="w-[100px] text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dateList.map((schedule) => (
                <TableRow key={schedule.mabuoithi} className="cursor-pointer hover:bg-muted">
                  <TableCell className="font-medium">{schedule.mabuoithi}</TableCell>
                  <TableCell>{schedule.thoigian}</TableCell>
                  <TableCell>{schedule.diadiem}</TableCell>
                  <TableCell className="text-center">{schedule.soluongthisinh}</TableCell>
                  <TableCell className="text-center">{schedule.trangthai}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
