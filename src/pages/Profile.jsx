import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, MessageCircle, MapPin, Edit2, Settings, MoreVertical } from "lucide-react"
import { apiJson } from "@/api/client"

const notoSansKR = "Noto Sans KR"

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null)
  const [myTrips, setMyTrips] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        try {
          const data = await apiJson("/api/auth/me")
          setUserProfile({
            nickname: data.user?.nickname || "",
            bio: data.user?.bio || "",
            followers: data.user?.followers ?? 0,
            following: data.user?.following ?? 0,
            trips: data.user?.trips ?? 0,
            joinDate: data.user?.joinDate || "",
            image: data.user?.image || "/user-profile-avatar.png",
          })
        } catch {
          setUserProfile(null)
        }

        try {
          const posts = await apiJson("/api/posts?limit=6")
          const list = Array.isArray(posts) ? posts : posts.items || []
          setMyTrips(list)
        } catch {
          setMyTrips([])
        }
      } catch (err) {
        console.error("Failed to load profile", err)
        setUserProfile(null)
        setMyTrips([])
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity">
                <img src="/logo.png" alt="여기저기" className="w-10 h-10 rounded-lg flex-shrink-0" />
                <span
                  className="text-xl font-[900] text-foreground hidden sm:inline"
                  style={{ fontFamily: notoSansKR, transform: "translate(-7px, 1.5px)" }}
                >
                  여기저기
                </span>
              </div>
            </Link>

            {/* 우측 버튼 */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/write">
                <Button className="bg-primary hover:bg-primary/90">여행기 작성</Button>
              </Link>
              <Button variant="ghost" size="icon" className="hover:bg-secondary">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 프로필 섹션 */}
        <Card className="p-8 mb-8 border-border/50">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
            {/* 프로필 이미지 */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={userProfile?.image || "/placeholder.svg"}
                alt={userProfile?.nickname || "프로필"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-foreground">{userProfile?.nickname || "사용자"}</h1>
                <Link to="/profile/edit">
                  <Button variant="outline" className="gap-2 bg-transparent" size="sm">
                    <Edit2 className="w-4 h-4" />
                    편집
                  </Button>
                </Link>
              </div>

              <p className="text-muted-foreground mb-6 max-w-2xl">{userProfile?.bio || "소개 정보가 없습니다."}</p>

              {/* 통계 */}
              <div className="flex gap-8 mb-6">
                <div>
                  <div className="text-2xl font-bold text-primary">{userProfile?.trips ?? 0}</div>
                  <div className="text-sm text-muted-foreground">여행기</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{(userProfile?.followers ?? 0).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">팔로워</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{userProfile?.following ?? 0}</div>
                  <div className="text-sm text-muted-foreground">팔로우 중</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{userProfile?.joinDate || ""}</p>
            </div>
          </div>
        </Card>

        {/* 탭 */}
        <div className="flex gap-4 border-b border-border mb-8">
          <button className="px-4 py-4 font-medium text-primary border-b-2 border-primary">내 여행기</button>
          <button className="px-4 py-4 font-medium text-muted-foreground hover:text-foreground transition-colors">
            좋아한 여행기
          </button>
          <button className="px-4 py-4 font-medium text-muted-foreground hover:text-foreground transition-colors">
            댓글
          </button>
        </div>

        {/* 여행기 그리드 */}
        {loading && <Card className="p-6 text-muted-foreground border-border/50">프로필 정보를 불러오는 중...</Card>}
        {!loading && myTrips.length === 0 && (
          <Card className="p-6 text-muted-foreground border-border/50">등록된 여행기가 없습니다.</Card>
        )}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {myTrips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow border-border/50 group">
              {/* 이미지 */}
              <div className="relative h-48 overflow-hidden bg-secondary">
                <img
                  src={trip.image || "/placeholder.svg"}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                  <MoreVertical className="w-4 h-4 text-foreground" />
                </button>
              </div>

              {/* 콘텐츠 */}
              <div className="p-4">
                <h3 className="font-bold text-foreground line-clamp-2 mb-2">{trip.title}</h3>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.location}</span>
                </div>

                <div className="flex gap-1 mb-4 flex-wrap">
                  {(trip.tags || []).map((tag, idx) => (
                    <span key={idx} className="text-xs bg-secondary text-primary px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{trip.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{trip.comments}</span>
                  </div>
                  <span className="text-xs">{trip.date}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

