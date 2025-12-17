import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, MessageCircle, MapPin, Edit2, Settings, MoreVertical } from "lucide-react"

const notoSansKR = "Noto Sans KR"

export default function ProfilePage() {
  // 백엔드 필드(프로필): nickname, bio, followers, following, trips, joinDate, image.
  const userProfile = {
    nickname: "여행러미",
    bio: "세계 여행을 꿈꾸는 여행 블로거입니다. 현재 30개국을 다녀왔습니다.",
    followers: 1234,
    following: 567,
    trips: 48,
    joinDate: "2023년 3월 가입",
    image: "/user-profile-avatar.png",
  }

  // 백엔드 필드(여행 카드): id, title, location, likes, comments, image, tags, date.
  const myTrips = [
    {
      id: 1,
      title: "서울의 숨은 카페거리",
      location: "서울, 한국",
      likes: 234,
      comments: 12,
      image: "/seoul-cafe.jpg",
      tags: ["#카페", "#서울"],
      date: "2일 전",
    },
    {
      id: 2,
      title: "강원도 산림욕 여행",
      location: "강원도, 한국",
      likes: 189,
      comments: 8,
      image: "/korean-mountain-forest.jpg",
      tags: ["#산림욕", "#강원도"],
      date: "1주 전",
    },
    {
      id: 3,
      title: "부산 해변 일몰 감상",
      location: "부산, 한국",
      likes: 312,
      comments: 25,
      image: "/busan-beach-sunset.png",
      tags: ["#부산", "#해변"],
      date: "2주 전",
    },
  ]

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
                src={userProfile.image || "/placeholder.svg"}
                alt={userProfile.nickname}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-foreground">{userProfile.nickname}</h1>
                <Button variant="outline" className="gap-2 bg-transparent" size="sm">
                  <Edit2 className="w-4 h-4" />
                  편집
                </Button>
              </div>

              <p className="text-muted-foreground mb-6 max-w-2xl">{userProfile.bio}</p>

              {/* 통계 */}
              <div className="flex gap-8 mb-6">
                <div>
                  <div className="text-2xl font-bold text-primary">{userProfile.trips}</div>
                  <div className="text-sm text-muted-foreground">여행기</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{userProfile.followers.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">팔로워</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{userProfile.following}</div>
                  <div className="text-sm text-muted-foreground">팔로우 중</div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{userProfile.joinDate}</p>
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
                  {trip.tags.map((tag, idx) => (
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

