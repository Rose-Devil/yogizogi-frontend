import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  MapPin,
  Search,
  Plus,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const notoSansKR = "Noto Sans KR";

export default function Home() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // 실제 백엔드에서 불러올 게시글 목록
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(true);

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
  ];

  const { isAuthed, logout } = useAuthStatus();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 알림 영역 외 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 백엔드에서 게시글 목록 불러오기 (무한 스크롤)
  const loadPosts = async (cursor = null) => {
    if (!hasNextPage && cursor !== null) return;
    setLoadingPosts(true);
    try {
      const query = new URLSearchParams();
      query.append("limit", "12");
      if (cursor) {
        query.append("cursor", cursor);
      }

      const res = await fetch(`/api/posts?${query.toString()}`);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "게시글 목록 조회 실패");
      }

      console.log("게시글 조회 성공:", json.data?.length || 0, "개");

      const mapped = (json.data || []).map((p) => ({
        id: p.id,
        title: p.title,
        author: p.author_name || "작성자",
        location: p.region || "한국",
        likes: p.like_count ?? 0,
        comments: p.comment_count ?? 0,
        image:
          p.thumbnail_url ||
          (p.images && p.images[0] && p.images[0].image_url) ||
          "/placeholder.svg",
        tags: (p.tags || []).map((t) => `#${t.name}`),
        date: p.created_at
          ? new Date(p.created_at).toLocaleDateString("ko-KR")
          : "",
      }));

      // 초기 로드(cursor가 null)면 교체, 그 외에는 추가
      if (cursor === null) {
        setPosts(mapped);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...mapped]);
      }
      setHasNextPage(json.cursorPagination?.hasNextPage ?? false);
      setNextCursor(json.cursorPagination?.nextCursor ?? null);
    } catch (error) {
      console.error("게시글 로드 실패:", error);
      console.log(`게시글을 불러오는데 실패했습니다: ${error.message}`);
      // 에러 발생 시에도 빈 배열로 설정하여 "게시글이 없습니다" 메시지 표시
      if (cursor === null) {
        setPosts([]);
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts(); // 초기 로드
  }, []);

  // 더보기 버튼 클릭 핸들러
  const handleLoadMore = () => {
    if (hasNextPage && !loadingPosts && nextCursor) {
      loadPosts(nextCursor);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.png"
                alt="여기저기"
                className="w-10 h-10 rounded-lg flex-shrink-0"
              />
              <span
                className="text-xl text-foreground hidden sm:inline"
                style={{
                  fontFamily: notoSansKR,
                  fontWeight: 900,
                  transform: "translate(-7px, 1.5px)",
                }}
              >
                여기저기
              </span>
            </Link>

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

            {/* 우측 버튼 */}
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
                    <div className="px-4 py-3 font-bold text-foreground border-b border-border/60">
                      알림
                    </div>
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
                              <span className="font-semibold">
                                {notification.user}
                              </span>{" "}
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary mt-2" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 bg-muted/40">
                      <Button
                        variant="ghost"
                        className="w-full justify-center text-primary hover:bg-secondary"
                      >
                        알림 모두 보기
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {isAuthed && (
                <>
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    style={{ fontFamily: notoSansKR, fontWeight: 900 }}
                    onClick={logout}
                  >
                    로그아웃
                  </Button>
                </>
              )}
              {!isAuthed && (
                <Link to="/login">
                  <Button
                    variant="ghost"
                    style={{ fontFamily: notoSansKR, fontWeight: 900 }}
                  >
                    로그인
                  </Button>
                </Link>
              )}
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
          {loadingPosts && posts.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              게시글을 불러오는 중입니다...
            </div>
          ) : posts.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              아직 등록된 여행기가 없습니다.
            </div>
          ) : (
            posts.map((post) => (
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
                      <span className="font-medium text-foreground/70">
                        {post.author}
                      </span>
                      <span>{post.date}</span>
                    </div>

                    <div className="flex gap-1 mb-4 flex-wrap">
                      {post.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-secondary text-primary px-2 py-1 rounded-full"
                        >
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
            ))
          )}
        </div>

        {/* 더보기 버튼 */}
        {hasNextPage && (
          <div className="flex justify-center mt-12">
            <Button
              onClick={handleLoadMore}
              disabled={loadingPosts}
              variant="outline"
              className="border-border hover:bg-secondary bg-transparent"
            >
              {loadingPosts ? "로딩 중..." : "더 보기"}
            </Button>
          </div>
        )}
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
  );
}
