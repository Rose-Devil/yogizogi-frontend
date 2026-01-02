import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const notoSansKR = "Noto Sans KR";

export default function AboutPage() {
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
          여기저기 소개
        </h1>

        <div className="prose prose-lg max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">서비스 소개</h2>
            <p className="text-muted-foreground leading-relaxed">
              여기저기는 여행자들이 자신의 여행 경험을 공유하고, 다른 여행자들의
              이야기를 탐험할 수 있는 플랫폼입니다. 다양한 여행지의 정보와
              경험담을 통해 더 풍부한 여행을 계획할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">주요 기능</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>여행기 작성 및 공유</li>
              <li>여행 계획 수립 및 체크리스트 관리</li>
              <li>다양한 여행지 정보 탐색</li>
              <li>여행자 커뮤니티 참여</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">문의하기</h2>
            <p className="text-muted-foreground">
              문의사항이 있으시면 언제든지 연락주세요.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}


