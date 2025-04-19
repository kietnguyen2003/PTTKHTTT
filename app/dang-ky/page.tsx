"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CandidateForm from "@/components/candidate-form"
import ConfirmationTable from "@/components/confirmation-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Customer, fetchIndividualCustomers, fetchOrganizationCustomers } from "@/lib/customerService"
import { DateList, fetchDateList } from "@/lib/dateService"
import { CertificateList, fetchCertificateList } from "@/lib/certificateService"

export default function DangKyPage() {
  const [individualCustomers, setIndividualCustomers] = useState<Customer[]>([]);
  const [organizationCustomers, setOrganizationCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerType, setCustomerType] = useState("individual");
  const [dateList, setDateList] = useState<DateList[]>([]);
  const [certificateList, setCertificateList] = useState<CertificateList[]>([]);

  const handleSearch = () => {
    console.log("customerType:", customerType);
    const sourceCustomers = customerType === "individual" ? individualCustomers : organizationCustomers;
  
    const filtered = sourceCustomers.filter((customer) =>
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    console.log("Filtered customers:", filtered);
  
    setSelectedCustomer(filtered[0] || null);
  };
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchIndividualCustomers(setIndividualCustomers);
        await fetchOrganizationCustomers(setOrganizationCustomers);
        await fetchDateList(setDateList);
        await fetchCertificateList(setCertificateList);
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Không thể tải danh sách khách hàng");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  

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
              <Select value={customerType} onValueChange={setCustomerType}>
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
                <Input 
                  id="customerId" 
                  placeholder="Nhập hoặc tra cứu mã khách hàng" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline"onClick={handleSearch}  size="icon">
                <Search className="h-4 w-4" />
                </Button>
              </div>
              </div>
            </div>
            {selectedCustomer && (
              <div className="rounded-md border p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mã khách hàng</p>
                    <p className="font-medium">{selectedCustomer.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Loại khách hàng</p>
                    <p className="font-medium">
                      {selectedCustomer.type === "individual" ? "Cá nhân" : "Đơn vị"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {selectedCustomer.type === "individual" ? "Họ tên" : "Tên đơn vị"}
                    </p>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                </div>
              </div>
            )}

            </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <CandidateForm selectedCustomer={selectedCustomer} dateList={dateList} certificateList={certificateList} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ConfirmationTable  />
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
