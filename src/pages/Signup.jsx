import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Lock, User } from "lucide-react"

const notoSansKR = "Noto Sans KR"

export default function SignupPage() {
  // 백엔드 필드(회원가입): nickname, email, password, passwordConfirm, termsAccepted, privacyAccepted.
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <div className="p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src="/logo.png" alt="여기저기" className="w-12 h-12 rounded-lg" />
              <h1
                className="text-2xl"
                style={{ fontFamily: notoSansKR, fontWeight: 900, transform: "translate(-7px, 1.5px)" }}
              >
                여기저기
              </h1>
            </div>
            <p className="text-muted-foreground mt-2">여행 커뮤니티에 가입하세요</p>
          </div>

          {/* 폼 */}
          <form className="space-y-5">
            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">닉네임</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="여행러미"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">8자 이상의 영문, 숫자, 특수문자 포함</p>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">비밀번호 확인</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {/* 약관동의 */}
            <div className="space-y-3 bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="terms" className="w-4 h-4 rounded mt-1" />
                <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                  이용약관에 동의합니다
                </label>
              </div>
              <div className="flex items-start gap-3">
                <input type="checkbox" id="privacy" className="w-4 h-4 rounded mt-1" />
                <label htmlFor="privacy" className="text-sm text-foreground cursor-pointer">
                  개인정보 수집에 동의합니다
                </label>
              </div>
            </div>

            {/* 가입 버튼 */}
            <Button
              className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-medium"
              style={{ fontFamily: notoSansKR, fontWeight: 900 }}
            >
              회원가입
            </Button>
          </form>

          {/* 구분선 */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* 소셜 가입 */}
          <div className="space-y-3">
            <button className="w-full py-3 rounded-lg border border-border bg-card hover:bg-secondary transition-colors font-medium text-foreground">
              Google로 가입
            </button>
            <button className="w-full py-3 rounded-lg border border-border bg-card hover:bg-secondary transition-colors font-medium text-foreground">
              카카오로 가입
            </button>
          </div>

          {/* 하단 링크 */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

