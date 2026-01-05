import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, MessageCircle, MapPin } from "lucide-react";
import { apiJson } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function getQueryParam(search, key) {
  const params = new URLSearchParams(search);
  return params.get(key) ?? "";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR");
}

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const q = useMemo(() => getQueryParam(location.search, "q").trim(), [location.search]);
  const [keyword, setKeyword] = useState(q);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setKeyword(q);
  }, [q]);

  useEffect(() => {
    let canceled = false;

    async function run() {
      setError("");
      setItems([]);

      if (!q) return;

      setLoading(true);
      try {
        const limit = 20;
        const data = await apiJson(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`);
        if (canceled) return;
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        if (canceled) return;
        setError(err?.message || "검색 중 오류가 발생했습니다.");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    run();
    return () => {
      canceled = true;
    };
  }, [q]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = String(keyword ?? "").trim();
    if (!next) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(next)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <Link to="/" className="font-extrabold text-foreground text-sm sm:text-base">
              Yogizogi
            </Link>
            <form className="flex-1 max-w-xl" onSubmit={handleSubmit}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  type="text"
                  placeholder="여행지, 태그 검색..."
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-1.5 sm:py-2 text-sm sm:text-base rounded-full border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-8 sm:w-8"
                  aria-label="검색"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!q && (
          <div className="text-muted-foreground">
            검색어를 입력하면 결과가 표시됩니다.
          </div>
        )}

        {loading && <div className="text-muted-foreground">검색 중…</div>}
        {error && <div className="text-destructive">{error}</div>}

        {!loading && !error && q && items.length === 0 && (
          <div className="text-muted-foreground text-center py-8">
            검색 결과가 없습니다.
          </div>
        )}

        {/* 검색 결과 그리드 - 메인 게시판과 동일한 스타일, 카드 크기 확대 */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {items.map((item) => {
            const postId = item.postId ?? item.id;
            if (postId == null) return null;
            
            const title = item.title ?? "(제목 없음)";
            const location = item.region ?? item.location ?? "한국";
            const author = item.author_name ?? item.author ?? "작성자";
            const authorAvatar = item.author_avatar ?? item.authorAvatar ?? "/user-profile-avatar.png";
            const date = item.created_at 
              ? new Date(item.created_at).toLocaleDateString("ko-KR")
              : formatDate(item.createdAt);
            const tags = Array.isArray(item.tags) 
              ? item.tags.map(t => typeof t === 'string' ? t : (t.name || t.text || t))
              : [];
            // 이미지 URL 추출 (여러 소스 확인)
            let image = "/placeholder.svg";
            if (item.thumbnail_url) {
              image = item.thumbnail_url;
            } else if (item.image_url) {
              image = item.image_url;
            } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
              const firstImage = item.images[0];
              image = typeof firstImage === 'string' 
                ? firstImage 
                : (firstImage.image_url || firstImage.url || "/placeholder.svg");
            }
            const likes = item.like_count ?? item.likes ?? 0;
            const comments = item.comment_count ?? item.comments ?? 0;

            return (
              <Link key={String(postId)} to={`/post/${encodeURIComponent(postId)}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border-border/50">
                  {/* 이미지 */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-secondary">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // 이미지 로드 실패 시 placeholder로 대체
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  </div>

                  {/* 콘텐츠 */}
                  <div className="p-4">
                    <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{location}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={authorAvatar}
                          alt={author}
                          className="w-6 h-6 rounded-full bg-secondary"
                        />
                        <span className="font-medium text-foreground/70">
                          {author}
                        </span>
                      </div>
                      <span>{date}</span>
                    </div>

                    {tags.length > 0 && (
                      <div className="flex gap-1 mb-4 flex-wrap">
                        {tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary text-primary px-2 py-1 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/50 pt-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{comments}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
