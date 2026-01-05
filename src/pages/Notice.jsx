import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const notoSansKR = "Noto Sans KR";

export default function NoticePage() {
  const notices = [
    {
      id: 1,
      title: "서비스 오픈 안내",
      date: "2025.01.15",
      content: "여기저기 서비스가 정식 오픈되었습니다. 많은 이용 부탁드립니다.",
    },
    {
      id: 2,
      title: "시스템 점검 안내",
      date: "2025.01.10",
      content: "2025년 1월 20일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
            <span
              className="font-semibold"
              style={{
                fontFamily: notoSansKR,
                transform: "translateY(3px)",
              }}
            >
              돌아가기
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1
          className="text-4xl font-bold text-foreground mb-8"
          style={{ fontFamily: notoSansKR }}
        >
          공지사항
        </h1>

        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="border border-border rounded-lg p-6 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {notice.title}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {notice.date}
                </span>
              </div>
              <p className="text-muted-foreground">{notice.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}



