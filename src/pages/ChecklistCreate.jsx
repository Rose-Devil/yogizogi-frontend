import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { createChecklist } from "@/api/checklists"
import { useAuthStatus } from "@/hooks/useAuthStatus"

const notoSansKR = "Noto Sans KR"

export default function CreateChecklistPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthed } = useAuthStatus()

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login")
    }
  }, [isAuthed, navigate])

  const handleCreate = async () => {
    if (!title.trim()) return
    setError("")
    setIsSubmitting(true)

    try {
      const data = await createChecklist({ title: title.trim(), description: description.trim() || null })
      navigate(data?.id ? `/checklist/${data.id}` : "/checklist")
    } catch (err) {
      console.error("Failed to create checklist", err)
      if (err?.status === 401) {
        navigate("/login")
        return
      }
      setError(err instanceof Error ? err.message : "체크리스트를 만들지 못했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="여기저기" className="w-10 h-10 rounded-lg flex-shrink-0" />
              <span
                className="text-xl text-foreground hidden sm:inline"
                style={{ fontFamily: notoSansKR, fontWeight: 900, transform: "translate(-7px, 1.5px)" }}
              >
                여기저기
              </span>
            </Link>

            <Link to="/profile">
              <Button variant="ghost" size="icon" className="hover:bg-secondary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/checklist" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Link>
          <h1 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: notoSansKR }}>
            새 체크리스트 만들기
          </h1>
          <p className="text-muted-foreground">여행 준비를 위한 체크리스트를 작성하세요.</p>
        </div>

        <Card className="p-8 border-border/50">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">체크리스트 이름 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 제주 2박3일 가족여행 준비물"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="함께 챙길 물품이나 메모를 적어주세요"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
              />
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <span className="font-bold">TIP.</span> 체크리스트를 만들면 멤버들이 바로 확인할 수 있어요. 링크를 공유해 초대해보세요.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-4 pt-6">
              <Link to="/checklist" className="flex-1">
                <Button variant="outline" className="w-full border-border hover:bg-secondary bg-transparent">
                  취소
                </Button>
              </Link>
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? "만드는 중..." : "체크리스트 만들기"}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
