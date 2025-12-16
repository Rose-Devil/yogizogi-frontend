import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

const notoSansKR = "Noto Sans KR"

export default function CreateChecklistPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleCreate = () => {
    if (title.trim()) {
      // 체크리스트 생성 로직
      navigate("/checklist")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/checklist" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
          <Link
            to="/checklist"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Link>
          <h1 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: notoSansKR }}>
            새 체크리스트 만들기
          </h1>
          <p className="text-muted-foreground">여행 팀을 위한 짐 체크리스트를 생성하세요</p>
        </div>

        <Card className="p-8 border-border/50">
          <div className="space-y-6">
            {/* 제목 입력 */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">체크리스트 이름 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 제주도 여행 준비"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 설명 입력 */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 2월 제주도 가족여행 준비물"
                className="w-full px-4 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
              />
            </div>

            {/* 안내 텍스트 */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <span className="font-bold">💡 팁:</span> 체크리스트를 만든 후 팀원들을 초대할 수 있습니다. 팀원들은
                링크나 코드를 통해 참여할 수 있습니다.
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-6">
              <Link to="/checklist" className="flex-1">
                <Button variant="outline" className="w-full border-border hover:bg-secondary bg-transparent">
                  취소
                </Button>
              </Link>
              <Button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                체크리스트 만들기
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}



