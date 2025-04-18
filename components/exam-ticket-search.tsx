"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Search, AlertCircle } from "lucide-react"

export default function ExamTicketSearch() {
  const [ticketId, setTicketId] = useState("")
  const [candidateNumber, setCandidateNumber] = useState("")
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [ticketFound, setTicketFound] = useState(false)
  const [extensionCount, setExtensionCount] = useState(0)

  // Mock data for the ticket information
  const ticketInfo = {
    ticketId: "PDT001",
    candidateNumber: "SBD001",
    customerName: "Nguyễn Văn A",
    examId: "BT005",
    examTime: "09:00 - 11:00, 20/05/2025",
    examLocation: "Phòng 201, Tòa nhà A",
  }

  const handleSearch = () => {
    setSearchPerformed(true)
    // Api call to search for the ticket
    // For this mock, we'll just check if either field has a value
    if (ticketId || candidateNumber) {
      setTicketFound(true)
      // Simulate a random number of extensions (0, 1, or 2)
      setExtensionCount(Math.floor(Math.random() * 3))
    } else {
      setTicketFound(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Tra cứu phiếu dự thi</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ticketId">Mã phiếu dự thi</Label>
          <Input
            id="ticketId"
            placeholder="Nhập mã phiếu dự thi"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="candidateNumber">Số báo danh</Label>
          <Input
            id="candidateNumber"
            placeholder="Nhập số báo danh"
            value={candidateNumber}
            onChange={(e) => setCandidateNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSearch} className="gap-2">
          <Search className="h-4 w-4" />
          Tra cứu
        </Button>
      </div>

      {searchPerformed && !ticketFound && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Không tìm thấy</AlertTitle>
          <AlertDescription>Không tìm thấy phiếu dự thi với thông tin đã nhập. Vui lòng kiểm tra lại.</AlertDescription>
        </Alert>
      )}

      {searchPerformed && ticketFound && (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium w-1/3">Mã phiếu dự thi</TableCell>
                  <TableCell>{ticketInfo.ticketId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Số báo danh</TableCell>
                  <TableCell>{ticketInfo.candidateNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tên khách hàng</TableCell>
                  <TableCell>{ticketInfo.customerName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Mã buổi thi</TableCell>
                  <TableCell>{ticketInfo.examId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Thời gian thi</TableCell>
                  <TableCell>{ticketInfo.examTime}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Địa điểm thi</TableCell>
                  <TableCell>{ticketInfo.examLocation}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Số lần gia hạn hiện tại</TableCell>
                  <TableCell>{extensionCount}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {extensionCount >= 2 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Vượt quá số lần gia hạn</AlertTitle>
              <AlertDescription>
                Thí sinh đã sử dụng tối đa số lần gia hạn cho phép (2 lần). Không thể gia hạn thêm.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
