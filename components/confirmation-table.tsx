import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ConfirmationTable() {
  // Mock data for confirmation
  const confirmationData = {
    customer: {
      type: "Cá nhân",
      id: "KH001",
      name: "Nguyễn Văn A",
      contact: "0912345678",
    },
    candidate: {
      id: "TS001",
      name: "Nguyễn Văn A",
      dob: "01/01/1990",
      gender: "Nam",
    },
    exam: {
      id: "BT001",
      time: "09:00 - 11:00, 15/05/2025",
      location: "Phòng 101, Tòa nhà A",
      certificateType: "Chứng chỉ Tiếng Anh B1",
    },
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Xác nhận thông tin đăng ký</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="bg-muted">
                Thông tin khách hàng
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium w-1/3">Loại khách hàng</TableCell>
              <TableCell>{confirmationData.customer.type}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Mã khách hàng</TableCell>
              <TableCell>{confirmationData.customer.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Tên khách hàng</TableCell>
              <TableCell>{confirmationData.customer.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Liên hệ</TableCell>
              <TableCell>{confirmationData.customer.contact}</TableCell>
            </TableRow>
          </TableBody>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="bg-muted">
                Thông tin thí sinh
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Mã thí sinh</TableCell>
              <TableCell>{confirmationData.candidate.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Họ tên</TableCell>
              <TableCell>{confirmationData.candidate.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ngày sinh</TableCell>
              <TableCell>{confirmationData.candidate.dob}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Giới tính</TableCell>
              <TableCell>{confirmationData.candidate.gender}</TableCell>
            </TableRow>
          </TableBody>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="bg-muted">
                Thông tin lịch thi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Mã buổi thi</TableCell>
              <TableCell>{confirmationData.exam.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Thời gian</TableCell>
              <TableCell>{confirmationData.exam.time}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Địa điểm</TableCell>
              <TableCell>{confirmationData.exam.location}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Loại chứng chỉ</TableCell>
              <TableCell>{confirmationData.exam.certificateType}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
