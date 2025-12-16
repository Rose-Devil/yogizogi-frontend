import { Heart, MessageCircle, MapPin, Share2, ChevronLeft, Clock } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 예시 데이터 - 실제로는 ID로 게시글 데이터를 가져옵니다
const postsData = {
  1: {
    id: 1,
    title: "서울의 숨은 카페거리",
    author: "여행러미",
    authorAvatar: "/user-profile-avatar.png",
    location: "서울, 한국",
    date: "2025년 1월 8일",
    likes: 234,
    comments: 12,
    image: "/seoul-cafe.jpg",
    tags: ["#카페", "#서울", "#숨은명소", "#감성"],
    content: `서울 강남역 근처의 숨은 카페 거리를 발견했어요! 

한 블록 안에 정말 감성 있는 카페들이 가득 모여있어서 놀랐습니다. 아침부터 늦은 저녁까지 각각의 시간대에 다른 분위기의 카페들을 즐길 수 있어요.

첫 번째로 방문한 곳은 '라떼의 꿈' 이라는 카페였는데, 인테리어가 정말 예뻤어요. 자연채광이 잘 들어와서 사진 찍기에도 좋았고, 바리스타분이 정말 친절하셨습니다.

두 번째는 빈티지 감성의 '시간의 정원' 이라는 카페. 레코드판들과 오래된 책들이 곳곳에 놓여있어서 마치 시간 여행을 하는 기분이 들었어요.

서울에 사시는 분들도, 관광객분들도 꼭 한 번 방문해보세요! 정말 추천합니다!`,
    commentsList: [
      {
        id: 1,
        author: "지구여행자",
        avatar: "/user-profile-avatar.png",
        content: "서울 가면 꼭 들러야겠어요! 정보 감사합니다!",
        date: "1일 전",
        likes: 24,
      },
      {
        id: 2,
        author: "자연러버",
        avatar: "/user-profile-avatar.png",
        content: "우와 사진도 예쁘고 글도 잘 쓰셨네요. 저도 가봐야겠어요!",
        date: "2시간 전",
        likes: 12,
      },
    ],
  },
  2: {
    id: 2,
    title: "유럽 배낭여행 3주의 기록",
    author: "지구여행자",
    authorAvatar: "/user-profile-avatar.png",
    location: "프랑스, 이탈리아",
    date: "2025년 1월 1일",
    likes: 567,
    comments: 45,
    image: "/european-travel.jpg",
    tags: ["#유럽", "#배낭여행", "#프랑스", "#이탈리아"],
    content: `유럽 배낭여행 3주가 정말 특별했어요!

파리에서 시작해서 로마까지, 정말 많은 것을 경험했습니다. 유명한 관광지도 좋지만, 골목골목의 작은 카페와 현지인들의 일상이 가장 인상깊었어요.

특히 베네치아의 골목길 산책과 로마의 야경은 평생 잊을 수 없을 것 같습니다. 혼자 여행하면서 많은 사람들을 만났고, 함께 시간을 보냈던 것들이 가장 값진 경험이 됐어요.

시간과 여유가 된다면 저처럼 3주 정도 천천히 유럽을 돌아보시길 추천합니다!`,
    commentsList: [
      {
        id: 1,
        author: "여행러미",
        avatar: "/user-profile-avatar.png",
        content: "정말 멋진 여행이네요! 저도 언젠가 꼭 가보고 싶어요!",
        date: "3일 전",
        likes: 45,
      },
    ],
  },
  3: {
    id: 3,
    title: "제주도의 자연 속으로",
    author: "자연러버",
    authorAvatar: "/user-profile-avatar.png",
    location: "제주도, 한국",
    date: "2025년 1월 5일",
    likes: 389,
    comments: 28,
    image: "/jeju-nature.jpg",
    tags: ["#제주", "#자연", "#트래킹", "#휴식"],
    content: `제주도에서 자연과 하나 되는 시간을 보냈어요.

한라산 트래킹, 성산일출봉, 그리고 수많은 크고 작은 폭포들... 제주도는 정말 자연의 보물창고네요.

이번 여행의 하이라이트는 역시 새벽 4시에 올라간 성산일출봉에서 본 일출이었습니다. 말로 표현하기 어려울 정도로 아름다웠어요.

혼자만의 시간이 필요하신 분들, 자연을 사랑하시는 분들께 제주도를 정말 추천합니다!`,
    commentsList: [],
  },
  4: {
    id: 4,
    title: "도쿄 야경 산책",
    author: "도시탐험",
    authorAvatar: "/user-profile-avatar.png",
    location: "일본, 도쿄",
    date: "2024년 12월 31일",
    likes: 445,
    comments: 32,
    image: "/tokyo-night.jpg",
    tags: ["#도쿄", "#일본", "#야경", "#도시"],
    content: `도쿄의 밤은 정말 마법 같았어요.

신주쿠, 시부야, 롯폰기... 각각의 야경이 정말 달랐습니다. 특히 도쿄 스카이트리에서 본 전망은 정말 장관이었어요.

야간에만 활동하는 도시의 모습, 네온사인에 물든 거리들, 바쁜 사람들의 흐름... 모든 것이 하나의 아름다운 영화 같았습니다.

도쿄를 방문하신다면 꼭 야경 산책도 해보세요!`,
    commentsList: [],
  },
}

export default function PostDetail() {
  const { id } = useParams()
  const post = postsData[Number.parseInt(id || "1")] || postsData[1]

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronLeft className="w-6 h-6" />
              <span
                className="font-semibold"
                style={{ fontFamily: "Noto Sans KR Black", transform: "translateY(3px)" }}
              >
                돌아가기
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  프로필
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 게시글 헤더 */}
        <article>
          {/* 메인 이미지 */}
          <div className="w-full h-96 rounded-xl overflow-hidden mb-8 bg-secondary">
            <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* 제목 및 기본 정보 */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">{post.title}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-border">
              {/* 작가 정보 */}
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar || "/placeholder.svg"}
                  alt={post.author}
                  className="w-12 h-12 rounded-full bg-secondary"
                />
                <div>
                  <p className="font-semibold text-foreground">{post.author}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.date}
                  </p>
                </div>
              </div>

              {/* 위치 정보 */}
              <div className="flex items-center gap-2 text-muted-foreground ml-auto">
                <MapPin className="w-5 h-5" />
                <span>{post.location}</span>
              </div>
            </div>

            {/* 태그 */}
            <div className="flex gap-2 flex-wrap mb-6">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 본문 */}
          <div className="prose prose-sm max-w-none mb-8">
            <div className="text-foreground leading-relaxed whitespace-pre-line text-lg">{post.content}</div>
          </div>

          {/* 상호작용 버튼 */}
          <div className="border-y border-border py-6 mb-8">
            <div className="flex items-center gap-4">
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                <Heart className="w-5 h-5" />
                <span>{post.likes}</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2 border-border bg-transparent">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </Button>
              <Button variant="ghost" className="ml-auto">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">댓글 ({post.comments})</h2>

            {/* 댓글 입력 */}
            <Card className="p-4 mb-6 border-border/50">
              <div className="flex gap-3">
                <img src="/user-profile-avatar.png" alt="프로필" className="w-10 h-10 rounded-full bg-secondary" />
                <div className="flex-1">
                  <textarea
                    placeholder="댓글을 작성해주세요..."
                    className="w-full bg-secondary/50 text-foreground placeholder-muted-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button className="bg-primary hover:bg-primary/90">댓글 등록</Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {post.commentsList.length > 0 ? (
                post.commentsList.map((comment) => (
                  <Card key={comment.id} className="p-4 border-border/50">
                    <div className="flex gap-3">
                      <img
                        src={comment.avatar || "/placeholder.svg"}
                        alt={comment.author}
                        className="w-10 h-10 rounded-full bg-secondary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-foreground">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">{comment.date}</p>
                        </div>
                        <p className="text-foreground mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Heart className="w-4 h-4" />
                            <span>{comment.likes}</span>
                          </button>
                          <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            답글달기
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">아직 댓글이 없어요.</p>
                  <p className="text-sm text-muted-foreground">첫 댓글을 작성해보세요!</p>
                </div>
              )}
            </div>
          </div>

          {/* 추천 게시글 */}
          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">다른 여행기</h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {[1, 2].map((id) => {
                const recPost = postsData[id]
                return (
                  <Link key={id} to={`/post/${id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border-border/50 h-full">
                      <div className="relative h-40 overflow-hidden bg-secondary">
                        <img
                          src={recPost.image || "/placeholder.svg"}
                          alt={recPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-foreground line-clamp-2 mb-1 text-sm group-hover:text-primary transition-colors">
                          {recPost.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{recPost.author}</p>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </article>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
