import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const notoSansKR = "Noto Sans KR";

export default function PrivacyPage() {
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
          개인정보 처리방침
        </h1>

        <div className="prose prose-lg max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">제1조 (개인정보의 처리목적)</h2>
            <p className="text-muted-foreground leading-relaxed">
              여기저기는 다음의 목적을 위하여 개인정보를 처리합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>서비스 제공 및 계약의 이행</li>
              <li>회원 관리 및 본인 확인</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
              개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
              개인정보를 처리·보유합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제3조 (처리하는 개인정보의 항목)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 다음의 개인정보 항목을 처리하고 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>필수항목: 이메일, 비밀번호, 닉네임</li>
              <li>선택항목: 프로필 이미지, 자기소개</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              다만, 법령에 의하여 제공이 요구되는 경우에는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제5조 (개인정보 보호책임자)</h2>
            <p className="text-muted-foreground leading-relaxed">
              개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와
              관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이
              개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
              <p className="text-muted-foreground">
                <strong>개인정보 보호책임자</strong>
                <br />
                이메일: privacy@yogizogi.com
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}


