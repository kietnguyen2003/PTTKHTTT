import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ExamTicketSearch from "@/components/exam-ticket-search"
import ExtensionForm from "@/components/extension-form"

export default function GiaHanPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gia Hạn Thời Gian Thi</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ExamTicketSearch />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ExtensionForm />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Hủy</Button>
        <Button variant="outline">Kiểm tra điều kiện gia hạn</Button>
        <Button>Lập phiếu gia hạn</Button>
      </div>
    </div>
  )
}
