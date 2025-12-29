import { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  MapPin,
  Share2,
  ChevronLeft,
  Clock,
  X,
  Plus,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { getComments, createComment, createReply } from "@/api/comments";
import { apiJson } from "@/api/client";
import { me } from "@/api/auth";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [comments, setComments] = useState([]); // 댓글 목록 상태 분리

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false); // TODO: 실제 로그인 유저 기준으로 교체
  const [likeLoading, setLikeLoading] = useState(false);
  const [tags, setTags] = useState([]); // 태그 목록 { id, name }
  const [newTagName, setNewTagName] = useState("");
  const [tagLoading, setTagLoading] = useState(false);
  const tagInputRef = useRef(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const userData = await me();
        console.log("사용자 정보:", userData);
        const userId =
          userData?.user?.id || userData?.data?.id || userData?.data?.user?.id;
        if (userId) {
          setCurrentUserId(userId);
          console.log("현재 사용자 ID:", userId);
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
      }
    }
    loadCurrentUser();
  }, []);

  // 공유 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showShareMenu]);

  // URL 복사 함수
  const handleCopyUrl = async () => {
    const url = `${window.location.origin}/post/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      alert("URL이 클립보드에 복사되었습니다!");
      setShowShareMenu(false);
    } catch (error) {
      console.error("URL 복사 실패:", error);
      alert("URL 복사에 실패했습니다.");
    }
  };

  // SNS 공유 함수
  const handleShareSNS = (platform) => {
    const url = `${window.location.origin}/post/${id}`;
    const title = post?.title || "여행기";
    const text = post?.content?.substring(0, 100) || "";

    let shareUrl = "";

    switch (platform) {
      case "kakao":
        // 카카오톡 공유 (더미)
        shareUrl = `https://story.kakao.com/share?url=${encodeURIComponent(
          url
        )}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        break;
      case "link":
        shareUrl = `https://story.kakao.com/share?url=${encodeURIComponent(
          url
        )}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        break;
      default:
        break;
    }

    setShowShareMenu(false);
  };

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message || "게시글 로딩 실패");
        }

        const p = json.data;

        setPost({
          id: p.id,
          title: p.title,
          author: p.author_name || p.author || "작성자",
          authorId: p.author_id,
          authorAvatar: p.author_avatar || "/user-profile-avatar.png",
          location: p.region || p.location || "한국",
          date: p.created_at
            ? new Date(p.created_at).toLocaleDateString("ko-KR")
            : "",
          comments: p.comment_count ?? 0,
          image:
            (p.images && p.images[0] && p.images[0].image_url) ||
            "/placeholder.svg",
          tags: (p.tags || []).map((t) => `#${t.name}`),
          content: p.content,
          commentsList: [], // TODO: 댓글 API 연동 시 수정
        });
        console.log("게시글 작성자 ID:", p.author_id, typeof p.author_id);
        setLikeCount(p.like_count ?? 0);
        // 태그 목록 저장 (id 포함)
        setTags(p.tags || []);

        // 댓글 목록 로딩
        try {
          const commentData = await getComments(id);
          setComments(commentData || []);
        } catch (e) {
          console.error("댓글 로딩 실패:", e);
        }

        // 확인 현재 사용자의 좋아요 상태
        try {
          const res = await apiJson(`/api/posts/${id}/likes`);
          if (res.success && res.data) {
            setIsLiked(res.data.isLiked ?? false);
            setLikeCount(res.data.likeCount ?? 0);
          }
        } catch (error) {
          console.error("좋아요 상태 확인 실패:", error);
        }

        // 추천 게시글 불러오기
        try {
          const recRes = await fetch(`/api/posts?limit=2`);
          if (recRes.ok) {
            const recJson = await recRes.json();
            if (recJson.success) {
              const list = recJson.data || [];
              setRecommendations(
                list
                  .filter((p) => String(p.id) !== String(id))
                  .slice(0, 2)
                  .map((p) => ({
                    id: p.id,
                    title: p.title,
                    author: p.author_name || "작성자",
                    image:
                      p.thumbnail_url ||
                      (p.images && p.images[0] && p.images[0].image_url) ||
                      "/placeholder.svg",
                  }))
              );
            }
          }
        } catch (error) {
          console.error("추천 게시글 로딩 실패:", error);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPost();
    }
  }, [id]);

  const handleToggleLike = async () => {
    if (!post || likeLoading) return;

    setLikeLoading(true);
    try {
      // 백엔드는 POST로 토글 (이미 좋아요가 있으면 취소, 없으면 추가)
      const res = await apiJson(`/api/posts/${post.id}/likes`, {
        method: "POST",
      });
      // 백엔드 응답 형식: { success: true, data: { likeCount, isLiked } }
      if (res.success && res.data) {
        setLikeCount(res.data.likeCount ?? likeCount);
        setIsLiked(res.data.isLiked ?? isLiked);
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  // 태그 추가
  const handleAddTag = async () => {
    if (!newTagName.trim() || tagLoading) return;

    const tagName = newTagName.trim().replace(/^#/, ""); // # 제거
    if (!tagName) {
      setNewTagName("");
      return;
    }

    setTagLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "태그 추가 실패");
      }

      // 새 태그를 목록에 추가
      setTags([...tags, json.data]);
      setNewTagName("");
      // 입력 필드에 포커스 유지 (React 상태 업데이트 후)
      requestAnimationFrame(() => {
        tagInputRef.current?.focus();
      });
    } catch (error) {
      console.error("태그 추가 실패:", error);
      alert(error.message || "태그 추가에 실패했습니다.");
      // 에러 발생 시에도 포커스 유지
      requestAnimationFrame(() => {
        tagInputRef.current?.focus();
      });
    } finally {
      setTagLoading(false);
    }
  };

  // 태그 삭제
  const handleRemoveTag = async (tagId) => {
    if (tagLoading) return;

    setTagLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}/tags/${tagId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "태그 삭제 실패");
      }

      // 태그 목록에서 제거
      setTags(tags.filter((t) => t.id !== tagId));
    } catch (error) {
      console.error("태그 삭제 실패:", error);
      alert(error.message || "태그 삭제에 실패했습니다.");
    } finally {
      setTagLoading(false);
    }
  };

  if (loading || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
              <span
                className="font-semibold"
                style={{
                  fontFamily: "Noto Sans KR Black",
                  transform: "translateY(3px)",
                }}
              >
                돌아가기
              </span>
            </Link>
            <div className="flex items-center gap-2">
              {/* 임시: 모든 게시글에 수정 버튼 표시 (나중에 조건 추가) */}
              {post && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/post/${id}/edit`)}
                >
                  수정
                </Button>
              )}
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
            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 제목 및 기본 정보 */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
              {post.title}
            </h1>

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
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-2 group"
                  >
                    #{tag.name}
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      disabled={tagLoading}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      aria-label="태그 삭제"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {/* 태그 추가 입력 */}
              <div className="flex gap-2">
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="태그 추가 (예: 맛집)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 text-sm px-3 py-1 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={tagLoading}
                />
                <Button
                  onClick={handleAddTag}
                  disabled={tagLoading || !newTagName.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div className="prose prose-sm max-w-none mb-8">
            <div className="text-foreground leading-relaxed whitespace-pre-line text-lg">
              {post.content}
            </div>
          </div>

          {/* 상호작용 버튼 */}
          <div className="border-y border-border py-6 mb-8">
            <div className="flex items-center gap-4">
              <Button
                className={`flex items-center gap-2 ${
                  isLiked
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90"
                }`}
                onClick={handleToggleLike}
                disabled={likeLoading}
              >
                <Heart
                  className="w-5 h-5"
                  fill={isLiked ? "currentColor" : "none"}
                />
                <span>{likeCount}</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-border bg-transparent"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </Button>
              <div className="relative ml-auto" ref={shareMenuRef}>
                <Button
                  variant="ghost"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="relative"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={handleCopyUrl}
                      className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm text-foreground"
                    >
                      📋 URL 복사
                    </button>
                    <div className="border-t border-border">
                      <button
                        onClick={() => handleShareSNS("kakao")}
                        className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm text-foreground"
                      >
                        💬 카카오톡
                      </button>
                      <button
                        onClick={() => handleShareSNS("facebook")}
                        className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm text-foreground"
                      >
                        📘 Facebook
                      </button>
                      <button
                        onClick={() => handleShareSNS("twitter")}
                        className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm text-foreground"
                      >
                        🐦 Twitter
                      </button>
                      <button
                        onClick={() => handleShareSNS("link")}
                        className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm text-foreground"
                      >
                        🔗 링크 공유
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              댓글 ({post.comments || (post.commentsList?.length ?? 0)})
            </h2>

            {/* 댓글 입력 */}
            <Card className="p-4 mb-6 border-border/50">
              <div className="flex gap-3">
                <img
                  src="/user-profile-avatar.png"
                  alt="프로필"
                  className="w-10 h-10 rounded-full bg-secondary"
                />
                <div className="flex-1">
                  <textarea
                    placeholder="댓글을 작성해주세요..."
                    className="w-full bg-secondary/50 text-foreground placeholder-muted-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button className="bg-primary hover:bg-primary/90">
                      댓글 등록
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {(post.commentsList || []).length > 0 ? (
                (post.commentsList || []).map((comment) => (
                  <Card key={comment.id} className="p-4 border-border/50">
                    <div className="flex gap-3">
                      <img
                        src={comment.avatar || "/placeholder.svg"}
                        alt={comment.author}
                        className="w-10 h-10 rounded-full bg-secondary"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-foreground">
                            {comment.author}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comment.date}
                          </p>
                        </div>
                        <p className="text-foreground mb-2">
                          {comment.content}
                        </p>
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
                  <p className="text-sm text-muted-foreground">
                    첫 댓글을 작성해보세요!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 추천 게시글 */}
          <div className="border-t border-border pt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              다른 여행기
            </h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {recommendations.map((recPost) => (
                <Link key={recPost.id} to={`/post/${recPost.id}`}>
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
                      <p className="text-xs text-muted-foreground">
                        {recPost.author}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
              {recommendations.length === 0 && (
                <Card className="p-4 border-border/50 text-muted-foreground">
                  추천할 게시글이 없습니다.
                </Card>
              )}
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
            <p>© 2025 Yogizogi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
