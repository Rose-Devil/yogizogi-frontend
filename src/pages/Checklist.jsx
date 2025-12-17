import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Share2 } from "lucide-react"
import { useState } from "react"

const notoSansKR = "Noto Sans KR"

export default function ChecklistPage() {
  const navigate = useNavigate()
  // 백엔드 필드(체크리스트 목록 항목): id, title, description, members, itemCount, createdAt.
  const [checklists, setChecklists] = useState([
    {
      id: "1",
      title: "제주도 여행 준비",
      description: "2월 제주도 가족여행",
      members: 3,
      itemCount: 12,
      createdAt: "2025-01-15",
    },
    {
      id: "2",
      title: "서울 출장 준비",
      description: "3월 출장 짐 준비",
      members: 2,
      itemCount: 8,
      createdAt: "2025-01-20",
    },
  ])

  const handleCreateNewChecklist = () => {
    navigate("/checklist/create")
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

            <div className="flex items-center gap-2 sm:gap-4">
              <Button onClick={handleCreateNewChecklist} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-5 h-5" />새 체크리스트
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 제목 */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: notoSansKR }}>
            공용 짐 체크리스트
          </h1>
          <p className="text-muted-foreground">
            여행 팀과 함께 짐을 준비하세요. 실시간으로 중복을 방지하고 누락을 줄일 수 있습니다.
          </p>
        </div>

        {/* 체크리스트 목록 */}
        {checklists.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {checklists.map((checklist) => (
              <Link to={`/checklist/${checklist.id}`} key={checklist.id}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border/50 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                        {checklist.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{checklist.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>팀 멤버</span>
                      <span className="font-medium text-foreground">{checklist.members}명</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>준비물</span>
                      <span className="font-medium text-foreground">{checklist.itemCount}개</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>생성일</span>
                      <span className="font-medium text-foreground">{checklist.createdAt}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 bg-transparent"
                      onClick={(e) => {
                        e.preventDefault()
                        // 공유 로직
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      공유
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-border/50">
            <div className="mb-4">
              <svg
                className="w-12 h-12 mx-auto text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">아직 체크리스트가 없습니다</h3>
            <p className="text-muted-foreground mb-6">새로운 체크리스트를 만들어 팀원들과 함께 준비하세요</p>
            <Button onClick={handleCreateNewChecklist} className="bg-primary hover:bg-primary/90">
              <Plus className="w-5 h-5 mr-2" />첫 번째 체크리스트 만들기
            </Button>
          </Card>
        )}
      </main>
    </div>
  )
}

