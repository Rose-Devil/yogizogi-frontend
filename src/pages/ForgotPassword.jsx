import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Mail, Send } from "lucide-react";

const notoSansKR = "Noto Sans KR";

export default function ForgotPasswordPage() {
  // 백엔드 필드(비밀번호 찾기): email, verificationCode, tempPassword
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <div className="p-8 space-y-8">
          <div className="text-center space-y-3">
            <Link
              to="/"
              className="flex items-center justify-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.png"
                alt="요기조기 로고"
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
                요기조기
              </h1>
            </Link>
            <div>
              <p className="text-lg font-semibold">비밀번호 찾기</p>
              <p className="text-sm text-muted-foreground mt-1">
                가입 시 사용한 이메일로 임시 비밀번호를 보내드려요.
              </p>
            </div>
          </div>

          <form className="space-y-5">
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

            <Button
              className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-medium flex items-center justify-center gap-2"
              style={{ fontFamily: notoSansKR, fontWeight: 900 }}
            >
              <Send className="w-4 h-4" />
              임시 비밀번호 발송
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              이메일로 받은 임시 비밀번호로 로그인한 뒤, 계정 설정에서 새
              비밀번호로 변경해주세요.
            </p>
          </form>

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/login"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              로그인으로 돌아가기
            </Link>
            <Link
              to="/signup"
              className="text-muted-foreground hover:text-primary"
            >
              회원가입
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
