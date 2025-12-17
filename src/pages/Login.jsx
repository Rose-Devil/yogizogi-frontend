import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";

const notoSansKR = "Noto Sans KR";

export default function LoginPage() {
  // 백엔드 필드(로그인): email, password.
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <div className="p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="여기저기"
                className="w-12 h-12 rounded-lg"
              />
              <h1
                className="text-2xl"
                style={{
                  fontFamily: notoSansKR,
                  fontWeight: 900,
                  transform: "translate(-7px, 1.5px)",
                }}
              >
                여기저기
              </h1>
            </div>
            <p className="text-muted-foreground mt-2">
              여행의 추억을 공유하세요
            </p>
          </div>

          {/* 폼 */}
          <form className="space-y-5">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                이메일
              </label>
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
              <label className="block text-sm font-medium text-foreground mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {/* 자동로그인 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                자동 로그인
              </label>
            </div>

            {/* 로그인 버튼 */}
            <Button
              className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-medium"
              style={{ fontFamily: notoSansKR, fontWeight: 900 }}
            >
              로그인
            </Button>
          </form>

          {/* 구분선 */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button className="w-full py-3 rounded-lg border border-border bg-card hover:bg-secondary transition-colors font-medium text-foreground">
              Google로 로그인
            </button>
            <button className="w-full py-3 rounded-lg border border-border bg-card hover:bg-secondary transition-colors font-medium text-foreground">
              카카오로 로그인
            </button>
          </div>

          {/* 하단 링크 */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              아직 회원이 아니신가요?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                회원가입
              </Link>
            </p>
            <a href="#" className="block text-sm text-primary hover:underline">
              비밀번호를 잊어버렸나요?
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
