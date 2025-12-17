import { useEffect, useRef, useState } from "react"
import { Bell, Heart, MessageCircle, MapPin, Search, Plus, User } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const notoSansKR = "Noto Sans KR"

export default function Home() {
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef(null)

  // 백엔드 필드(피드 게시글): id, title, author, location, likes, comments, image, tags, date.
  const travelPosts = [
    {
      id: 1,
      title: "서울의 숨은 카페거리",
      author: "여행러미",
      location: "서울, 한국",
      likes: 234,
      comments: 12,
      image: "/seoul-cafe.jpg",
      tags: ["#카페", "#서울"],
      date: "2일 전",
    },
    {
      id: 2,
      title: "유럽 배낭여행 3주의 기록",
      author: "지구여행자",
      location: "프랑스, 이탈리아",
      likes: 567,
      comments: 45,
      image: "/european-travel.jpg",
      tags: ["#유럽", "#배낭여행"],
      date: "1주 전",
    },
    {
      id: 3,
      title: "제주도의 자연 속으로",
      author: "자연러버",
      location: "제주도, 한국",
      likes: 389,
      comments: 28,
      image: "/jeju-nature.jpg",
      tags: ["#제주", "#자연"],
      date: "3일 전",
    },
    {
      id: 4,
      title: "도쿄 야경 산책",
      author: "도시탐험",
      location: "일본, 도쿄",
      likes: 445,
      comments: 32,
      image: "/tokyo-night.jpg",
      tags: ["#도쿄", "#일본"],
      date: "5일 전",
    },
  ]

  // 백엔드 필드(알림): id, type, user, message, time, read.
  const notifications = [
    {
      id: 1,
      type: "like",
      user: "여행러 A",
      message: "님이 회원님의 게시물에 좋아요를 눌렀어요.",
      time: "방금 전",
      read: false,
    },
    {
      id: 2,
      type: "comment",
      user: "프라하에긍",
      message: "님이 회원님의 게시글에 댓글을 남겼어요.",
      time: "1시간 전",
      read: false,
    },
    {
      id: 3,
      type: "reply",
      user: "첫두여행",
      message: "님이 회원님이 남긴 댓글에 답글을 달았어요.",
      time: "어제",
      read: true,
    },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="여기저기" className="w-10 h-10 rounded-lg flex-shrink-0" />
              <span
                className="text-xl text-foreground hidden sm:inline"
                style={{ fontFamily: notoSansKR, fontWeight: 900, transform: "translate(-7px, 1.5px)" }}
              >
                여기저기
              </span>
            </div>

            {/* 검색바 */}
            <div className="hidden md:flex flex-1 max-w-sm mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="여행지, 태그 검색..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 우측 버튼 - 링크로 변경 */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/write">
                <Button className="hidden sm:flex gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="w-5 h-5" />
                  여행기 작성
                </Button>
              </Link>
              <div className="relative" ref={notificationRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary relative"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  aria-expanded={showNotifications}
                  aria-label="알림 확인"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
                    <div className="px-4 py-3 font-bold text-foreground border-b border-border/60">알림</div>
                    <div className="divide-y divide-border/60 max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-full bg-secondary text-primary flex items-center justify-center flex-shrink-0">
                            {notification.type === "like" ? (
                              <Heart className="w-5 h-5" />
                            ) : (
                              <MessageCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-relaxed">
                              <span className="font-semibold">{notification.user}</span>{" "}
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-primary mt-2" />}
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 bg-muted/40">
                      <Button variant="ghost" className="w-full justify-center text-primary hover:bg-secondary">
                        알림 모두 보기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="hover:bg-secondary">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" style={{ fontFamily: notoSansKR, fontWeight: 900 }}>
                  로그인
                </Button>
              </Link>
            </div>
          </div>

          {/* 모바일 검색바 */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="검색..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-secondary/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 필터 탭 */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: "all", label: "전체" },
            { key: "popular", label: "인기" },
          ].map((tab) => (
            <button
              key={tab.key}
              className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
            >
              {tab.label}
            </button>
          ))}
          {/* 찾기 버튼 추가 */}
          <Link to="/map">
            <button className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">
              찾기
            </button>
          </Link>
          <Link to="/checklist">
            <button className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">
              담기
            </button>
          </Link>
        </div>

        {/* 여행기 그리드 */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {travelPosts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border-border/50">
                {/* 이미지 */}
                <div className="relative h-48 overflow-hidden bg-secondary">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* 콘텐츠 */}
                <div className="p-4">
                  <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground/70">{post.author}</span>
                    <span>{post.date}</span>
                  </div>

                  <div className="flex gap-1 mb-4 flex-wrap">
                    {post.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-secondary text-primary px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-3">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="flex justify-center mt-12">
          <Button variant="outline" className="border-border hover:bg-secondary bg-transparent">
            더 보기
          </Button>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">여기저기</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    소개
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    공지사항
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">기능</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    여행기 작성
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    여행 계획
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">정보</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    개인정보
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">팔로우</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 여기저기. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
