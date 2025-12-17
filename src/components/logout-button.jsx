import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const supabase = createClient()

  // 백엔드 데이터: 현재 인증 세션(추가 필드 필요 없음).
  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      navigate("/")
    } catch (error) {
      console.error("로그아웃 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      className="border-sky-300 text-sky-600 hover:bg-sky-50 bg-transparent"
    >
      {isLoading ? "로그아웃 중..." : "로그아웃"}
    </Button>
  )
}

