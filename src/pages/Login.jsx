import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, Lock } from "lucide-react"
import { useState } from "react"
import { login } from "@/api/auth"

const notoSansKR = "Noto Sans KR"

export default function LoginPage() {
  // 백엔드 필드(로그인): email, password
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center justify-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="여기저기 로고" className="w-12 h-12 rounded-lg" />
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
            </Link>
            <p className="text-muted-foreground mt-2">여행의 추억을 공유하세요</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded" />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                자동 로그인
              </label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-medium"
              style={{ fontFamily: notoSansKR, fontWeight: 900 }}
              disabled={isLoading}
            >
              로그인
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 rounded-lg border border-border bg-card hover:bg-secondary transition-colors font-medium text-foreground">
              Google로 로그인
            </button>
            <button className="w-full py-3 rounded-lg border border-border bg-card hover:bg-secondary transition-colors font-medium text-foreground">
              카카오로 로그인
            </button>
          </div>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              아직 회원이 아니신가요?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                회원가입
              </Link>
            </p>
            <Link to="/forgot-password" className="block text-sm text-primary hover:underline font-medium">
              비밀번호를 잊어버리셨나요?
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
