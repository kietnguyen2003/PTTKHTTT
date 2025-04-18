import Link from "next/link"
import { Calendar, Filter, Search, Trophy, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function ContestsPage() {
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
              <Link href="/contests" className="text-sm font-medium text-primary transition-colors">
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
      <main className="flex-1">
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tighter">Tất cả cuộc thi</h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Khám phá và đăng ký tham gia các cuộc thi của chúng tôi
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                <div className="relative w-full md:w-[260px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm cuộc thi..."
                    className="w-full rounded-md border bg-background pl-8 shadow-sm"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Lọc theo loại" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cuộc thi</SelectItem>
                    <SelectItem value="programming">Lập trình</SelectItem>
                    <SelectItem value="design">Thiết kế</SelectItem>
                    <SelectItem value="ai">Trí tuệ nhân tạo</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contests.map((contest, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{contest.title}</CardTitle>
                    <CardDescription>{contest.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Đăng ký: {contest.registration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                      <Users className="h-4 w-4" />
                      <span>{contest.participants} người tham gia</span>
                    </div>
                    <div className="mt-4">
                      <p className="line-clamp-3 text-sm">{contest.description}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {contest.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button className="mt-4 w-full">Đăng ký ngay</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <span className="sr-only">Trang trước</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Button>
                <Button variant="outline" size="sm" className="h-8 min-w-8 rounded-md font-medium">
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 min-w-8 rounded-md bg-primary font-medium text-primary-foreground"
                >
                  2
                </Button>
                <Button variant="outline" size="sm" className="h-8 min-w-8 rounded-md font-medium">
                  3
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <span className="sr-only">Trang sau</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </section>
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

const contests = [
  {
    title: "Cuộc thi Lập trình",
    date: "Ngày 15 tháng 5, 2025",
    registration: "01/04 - 30/04",
    participants: 125,
    description:
      "Thử thách kỹ năng lập trình của bạn trong cuộc thi lập trình thường niên của chúng tôi với nhiều giải thưởng hấp dẫn.",
    tags: ["Lập trình", "Giải thuật", "Web"],
  },
  {
    title: "Cuộc thi Thiết kế UI/UX",
    date: "Ngày 22 tháng 5, 2025",
    registration: "10/04 - 10/05",
    participants: 78,
    description:
      "Thể hiện tài năng thiết kế của bạn trong cuộc thi thiết kế giao diện người dùng với chủ đề Tương lai của công nghệ.",
    tags: ["UI/UX", "Thiết kế", "Figma"],
  },
  {
    title: "Hackathon AI",
    date: "Ngày 10 tháng 6, 2025",
    registration: "15/04 - 20/05",
    participants: 92,
    description:
      "Phát triển các giải pháp sáng tạo sử dụng trí tuệ nhân tạo trong hackathon kéo dài 48 giờ của chúng tôi.",
    tags: ["AI", "Machine Learning", "Hackathon"],
  },
  {
    title: "Cuộc thi Phát triển Game",
    date: "Ngày 25 tháng 6, 2025",
    registration: "01/05 - 15/06",
    participants: 64,
    description: "Tạo ra trò chơi độc đáo và hấp dẫn trong cuộc thi phát triển game của chúng tôi.",
    tags: ["Game Dev", "Unity", "Unreal"],
  },
  {
    title: "Cuộc thi An ninh mạng",
    date: "Ngày 05 tháng 7, 2025",
    registration: "10/05 - 25/06",
    participants: 42,
    description: "Thử thách kỹ năng bảo mật của bạn trong cuộc thi an ninh mạng với các thử thách thực tế.",
    tags: ["Bảo mật", "Hacking", "CTF"],
  },
  {
    title: "Cuộc thi Phân tích dữ liệu",
    date: "Ngày 18 tháng 7, 2025",
    registration: "20/05 - 30/06",
    participants: 56,
    description: "Phân tích và trực quan hóa dữ liệu phức tạp để đưa ra những hiểu biết có giá trị.",
    tags: ["Data Science", "Phân tích", "Trực quan hóa"],
  },
]
