import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="font-extrabold text-foreground">
              Yogizogi
            </Link>
            <form className="flex-1 max-w-xl" onSubmit={handleSubmit}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  type="text"
                  placeholder="여행지, 태그 검색..."
                  className="w-full pl-10 pr-12 py-2 rounded-full border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  aria-label="검색"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!q && (
          <div className="text-muted-foreground">
            검색어를 입력하면 결과가 표시됩니다.
          </div>
        )}

        {loading && <div className="text-muted-foreground">검색 중…</div>}
        {error && <div className="text-destructive">{error}</div>}

        {!loading && !error && q && items.length === 0 && (
          <div className="text-muted-foreground">검색 결과 없음</div>
        )}

        <div className="mt-6 space-y-4">
          {items.map((item) => {
            const postId = item.postId ?? item.id;
            if (postId == null) return null;
            const title = item.title ?? "(제목 없음)";
            const content = item.content ?? "";
            const tags = Array.isArray(item.tags) ? item.tags : [];
            const createdAt = formatDate(item.createdAt);

            return (
              <Link key={String(postId)} to={`/post/${encodeURIComponent(postId)}`}>
                <Card className="p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-foreground truncate">
                        {title}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {content.slice(0, 80)}
                        {content.length > 80 ? "…" : ""}
                      </div>
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tags.slice(0, 8).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {createdAt}
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
