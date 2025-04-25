"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Search, AlertCircle } from "lucide-react";
import { searchExamTicket, TicketInfo } from "@/lib/extensionService";
import { toast } from "@/components/ui/use-toast";

export default function ExamTicketSearch({ onTicketFound }: { onTicketFound: (ticket: TicketInfo | null) => void }) {
  const [ticketid, setTicketId] = useState("");
  const [candidatenumber, setCandidateNumber] = useState("");
  const [searchperformed, setSearchPerformed] = useState(false);
  const [ticketfound, setTicketFound] = useState(false);
  const [ticketinfo, setTicketInfo] = useState<TicketInfo | null>(null);

  const handleSearch = async () => {
    setSearchPerformed(true);

    const result = await searchExamTicket(ticketid, candidatenumber);

    if (result) {
      setTicketFound(true);
      setTicketInfo(result);
      onTicketFound(result);
    } else {
      setTicketFound(false);
      setTicketInfo(null);
      onTicketFound(null);
      toast({
        title: "Không tìm thấy",
        description: "Không tìm thấy phiếu dự thi với thông tin đã nhập.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Tra cứu phiếu dự thi</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ticketid">Mã phiếu dự thi</Label>
          <Input
            id="ticketid"
            placeholder="Nhập mã phiếu dự thi"
            value={ticketid}
            onChange={(e) => setTicketId(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="candidatenumber">Số báo danh</Label>
          <Input
            id="candidatenumber"
            placeholder="Nhập số báo danh"
            value={candidatenumber}
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

      {searchperformed && !ticketfound && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Không tìm thấy</AlertTitle>
          <AlertDescription>Không tìm thấy phiếu dự thi với thông tin đã nhập. Vui lòng kiểm tra lại.</AlertDescription>
        </Alert>
      )}

      {searchperformed && ticketfound && ticketinfo && (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium w-1/3">Mã phiếu dự thi</TableCell>
                  <TableCell>{ticketinfo.ticketid}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Số báo danh</TableCell>
                  <TableCell>{ticketinfo.candidatenumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Tên khách hàng</TableCell>
                  <TableCell>{ticketinfo.customername}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Mã buổi thi</TableCell>
                  <TableCell>{ticketinfo.examid}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Thời gian thi</TableCell>
                  <TableCell>{ticketinfo.examtime}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Địa điểm thi</TableCell>
                  <TableCell>{ticketinfo.examlocation}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Số lần gia hạn hiện tại</TableCell>
                  <TableCell>{ticketinfo.extensioncount}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {ticketinfo.extensioncount >= 2 && (
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
  );
}