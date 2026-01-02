import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const notoSansKR = "Noto Sans KR";

export default function TermsPage() {
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
          이용약관
        </h1>

        <div className="prose prose-lg max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 약관은 여기저기(이하 "회사")가 제공하는 서비스의 이용과
              관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을
              목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>"서비스"란 회사가 제공하는 여행 정보 공유 플랫폼을 의미합니다.</li>
              <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</li>
              <li>"콘텐츠"란 이용자가 서비스에 게시한 모든 정보를 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제3조 (서비스의 제공)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>여행기 작성 및 공유 서비스</li>
              <li>여행 계획 수립 및 체크리스트 관리 서비스</li>
              <li>여행 정보 검색 및 탐색 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제4조 (이용자의 의무)</h2>
            <p className="text-muted-foreground leading-relaxed">
              이용자는 다음 행위를 하여서는 안 됩니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>타인의 정보 도용</li>
              <li>허위 정보의 게시</li>
              <li>서비스의 안정적 운영을 방해하는 행위</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}


