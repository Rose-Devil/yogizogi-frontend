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
  Sparkles,
  Calendar,
  Utensils,
  Lightbulb,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { getComments, createComment, createReply, updateComment, deleteComment } from "@/api/comments";
import { apiJson } from "@/api/client";
import { me } from "@/api/auth";

// 재귀적 댓글 컴포넌트 (외부로 이동)
const CommentItem = ({
  comment,
  replyTargetId,
  setReplyTargetId,
  setReplyContent,
  replyContent,
  handleSubmitReply,
  replyLoading,
  currentUserId,
  postAuthorId,
  onRefresh,
}) => {
  const isReplying = replyTargetId === comment.id;
  const navigate = useNavigate();
  const authorId = comment.author_id || comment.author?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editLoading, setEditLoading] = useState(false);

  const handleProfileClick = () => {
    if (authorId && !comment.is_ai) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    setEditLoading(true);
    try {
      await updateComment(comment.id, editContent);
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(comment.id);
      onRefresh();
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 권한 확인
  const canEdit =
    currentUserId &&
    parseInt(currentUserId) === parseInt(authorId) &&
    !comment.is_ai;

  const canDelete =
    currentUserId &&
    (parseInt(currentUserId) === parseInt(authorId) ||
      parseInt(currentUserId) === parseInt(postAuthorId));

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4 border-border/50">
        <div className="flex gap-3">
          <img
            src={comment.author?.profile_image || "/user-profile-avatar.png"}
            alt={comment.author?.nickname || comment.author || "작성자"}
            className={`w-10 h-10 rounded-full bg-secondary ${
              authorId && !comment.is_ai
                ? "cursor-pointer hover:opacity-80 transition-opacity"
                : ""
            }`}
            onClick={handleProfileClick}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-foreground">
                {comment.author?.nickname || comment.author || "작성자"}
              </p>
              <div className="flex items-center gap-2">
                {comment.is_ai && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    AI Bot
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(
                    comment.created_at || comment.createdAt || comment.date
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {isEditing ? (
              <div className="mb-2">
                <textarea
                  className="w-full bg-secondary/50 text-foreground rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-2"
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    disabled={editLoading}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={editLoading}
                  >
                    저장
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground mb-2 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-4 h-4" />
                <span>{comment.likes || 0}</span>
              </button>
              <button
                onClick={() => {
                  if (replyTargetId === comment.id) {
                    setReplyTargetId(null);
                  } else {
                    setReplyTargetId(comment.id);
                    setReplyContent("");
                  }
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isReplying ? "취소" : "답글달기"}
              </button>
              {!isEditing && (
                <>
                  {canEdit && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      수정
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 답글 입력 폼 */}
      {isReplying && (
        <div className="ml-12 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                placeholder={`@${
                  comment.author?.nickname || "작성자"
                } 님에게 답글 작성...`}
                className="w-full bg-secondary/50 text-foreground placeholder-muted-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={2}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSubmitReply}
                  disabled={replyLoading}
                >
                  {replyLoading ? "등록 중..." : "답글 등록"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 대댓글 렌더링 (재귀) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 border-l-2 border-border/50 pl-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replyTargetId={replyTargetId}
              setReplyTargetId={setReplyTargetId}
              setReplyContent={setReplyContent}
              replyContent={replyContent}
              handleSubmitReply={handleSubmitReply}
              replyLoading={replyLoading}
              currentUserId={currentUserId}
              postAuthorId={postAuthorId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [comments, setComments] = useState([]); // 댓글 목록 상태 분리
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null); // 현재 사용자 프로필 이미지
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [tagLoading, setTagLoading] = useState(false);

  // 댓글 입력 상태
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyTargetId, setReplyTargetId] = useState(null); // 답글 작성 중인 댓글 ID
  const [replyLoading, setReplyLoading] = useState(false); // 답글 전송 로딩

  const tagInputRef = useRef(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);
  const [postImages, setPostImages] = useState([]); // 모든 여행 사진 저장

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
        const userImage =
          userData?.user?.url ||
          userData?.user?.image ||
          userData?.data?.user?.url ||
          userData?.data?.user?.image ||
          userData?.user?.profile_image; // fallback
        if (userImage) {
          setCurrentUserProfileImage(userImage);
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

        // 모든 여행 사진 저장
        const images = (p.images || [])
          .map((img) => img.image_url)
          .filter(Boolean);
        setPostImages(images);

        console.log("게시글 작성자 정보 (원본):", {
          author_id: p.author_id,
          author_name: p.author_name,
          author_avatar: p.author_avatar,
          전체데이터: p,
        }); // 디버깅용

        // author_avatar가 빈 문자열이거나 null이면 null로 처리
        const authorAvatar =
          p.author_avatar && p.author_avatar.trim() !== ""
            ? p.author_avatar
            : null;

        console.log("처리된 작성자 정보:", {
          author: p.author_name || p.author || "작성자",
          authorAvatar: authorAvatar,
        });

        // ai_data 확인 및 파싱
        let parsedAiData = null;
        if (p.ai_data) {
          if (typeof p.ai_data === "string") {
            try {
              parsedAiData = JSON.parse(p.ai_data);
            } catch (e) {
              console.error("AI 데이터 JSON 파싱 실패:", e);
              parsedAiData = null;
            }
          } else {
            parsedAiData = p.ai_data;
          }
        }

        console.log("AI 데이터 확인:", {
          원본: p.ai_data,
          원본타입: typeof p.ai_data,
          파싱된데이터: parsedAiData,
          is_travel: parsedAiData?.is_travel,
        });

        setPost({
          id: p.id,
          title: p.title,
          author: p.author_name || p.author || "작성자",
          authorId: p.author_id,
          authorAvatar: authorAvatar, // null이면 렌더링 시 fallback 처리
          location: p.region || p.location || "한국",
          date: p.created_at
            ? new Date(p.created_at).toLocaleDateString("ko-KR")
            : "",
          comments: p.comment_count ?? 0,
          image:
            (p.images && p.images[0] && p.images[0].image_url) ||
            p.thumbnail_url ||
            "/placeholder.svg",
          tags: (p.tags || []).map((t) => `#${t.name}`),
          content: p.content,
          aiData: parsedAiData, // 파싱된 AI 분석 결과
        });
        console.log("게시글 작성자 ID:", p.author_id, typeof p.author_id);
        console.log("설정된 post.aiData:", parsedAiData);
        console.log("게시글 이미지:", images); // 디버깅용
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

  // 댓글 목록 다시 불러오기
  const fetchComments = async () => {
    try {
      const commentData = await getComments(id);
      setComments(commentData || []);
    } catch (e) {
      console.error("댓글 로딩 실패:", e);
    }
  };

  // ---------- Reply handling ----------
  const handleSubmitReply = async () => {
    if (!replyTargetId || !replyContent.trim()) return;
    setReplyLoading(true);
    try {
      await createReply(id, replyTargetId, replyContent.trim());
      await fetchComments(); // 재요청하여 목록 갱신
      setReplyContent("");
      setReplyTargetId(null);
    } catch (e) {
      console.error("답글 등록 실패:", e);
      alert("답글을 등록하지 못했습니다.");
    } finally {
      setReplyLoading(false);
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/"
              className="flex items-center gap-1 sm:gap-2 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              <span
                className="font-semibold text-sm sm:text-base"
                style={{
                  fontFamily: "Noto Sans KR Black",
                  transform: "translateY(3px)",
                }}
              >
                돌아가기
              </span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* 본인 게시글만 수정 버튼 표시 */}
              {post && currentUserId && post.authorId === currentUserId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/post/${id}/edit`)}
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  수정
                </Button>
              )}
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  프로필
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 게시글 헤더 */}
        <article>
          {/* 메인 이미지 */}
          <div className="w-full h-48 sm:h-64 lg:h-96 rounded-xl overflow-hidden mb-6 sm:mb-8 bg-secondary">
            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 제목 및 기본 정보 */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance">
              {post.title}
            </h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 pb-6 border-b border-border">
              {/* 작가 정보 */}
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src={post.authorAvatar || "/user-profile-avatar.png"}
                  alt={post.author}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary"
                  onError={(e) => {
                    // 이미지 로드 실패 시 기본 이미지로 대체
                    e.target.src = "/user-profile-avatar.png";
                  }}
                />
                <div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">{post.author}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {post.date}
                  </p>
                </div>
              </div>

              {/* 위치 정보 */}
              <div className="flex items-center gap-2 text-muted-foreground sm:ml-auto">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{post.location}</span>
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

          {/* AI 여행 비서 위젯 */}
          {(() => {
            console.log("🔍 AI 위젯 렌더링 체크:", {
              hasPost: !!post,
              hasAiData: !!post?.aiData,
              aiData: post?.aiData,
              is_travel: post?.aiData?.is_travel,
              is_travel_type: typeof post?.aiData?.is_travel,
              condition: post?.aiData && post?.aiData?.is_travel,
            });
            return post?.aiData && post?.aiData?.is_travel;
          })() && (
            <div className="mb-8 space-y-6">
              {/* AI 코디 & 준비물 제안 */}
              {post.aiData.outfit && (
                <Card className="p-6 border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">
                      AI 여행 코디 제안
                    </h3>
                  </div>
                  {post.aiData.outfit.recommendations &&
                    post.aiData.outfit.recommendations.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-foreground/70 mb-2">
                          추천 옷차림
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-foreground">
                          {post.aiData.outfit.recommendations.map(
                            (item, idx) => (
                              <li key={idx}>{item}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  {post.aiData.outfit.essentials &&
                    post.aiData.outfit.essentials.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-foreground/70 mb-2">
                          필수 준비물
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-foreground">
                          {post.aiData.outfit.essentials.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </Card>
              )}

              {/* AI 타임라인 & 맛집 요약 */}
              {post.aiData.timeline && post.aiData.timeline.length > 0 && (
                <Card className="p-6 border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">
                      AI 여행 일정 요약
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {post.aiData.timeline.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 pb-4 border-b border-border/50 last:border-0"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {item.day || idx + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">
                              {item.place}
                            </p>
                            {item.type === "restaurant" && (
                              <Utensils className="w-4 h-4 text-orange-500" />
                            )}
                            {item.type === "cafe" && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                카페
                              </span>
                            )}
                            {item.type === "attraction" && (
                              <MapPin className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          {item.review && (
                            <p className="text-sm text-muted-foreground italic">
                              {item.review}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* 일상글인 경우 간단한 AI 요약 */}
          {post.aiData &&
            post.aiData.is_travel === false &&
            post.aiData.summary && (
              <Card className="mb-8 p-4 border-border/50 bg-secondary/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground/70 mb-1">
                      AI 한 줄 요약
                    </p>
                    <p className="text-foreground">{post.aiData.summary}</p>
                  </div>
                </div>
              </Card>
            )}

          {/* 여행 사진 갤러리 */}
          {postImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                여행 사진 ({postImages.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {postImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border bg-secondary group cursor-pointer"
                    onClick={() => {
                      // 이미지 클릭 시 확대 보기 (간단한 alert 대신 모달 구현 가능)
                      window.open(imageUrl, "_blank");
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`여행 사진 ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 상호작용 버튼 */}
          <div className="border-y border-border py-4 sm:py-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Button
                className={`flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                  isLiked
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90"
                }`}
                onClick={handleToggleLike}
                disabled={likeLoading}
              >
                <Heart
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill={isLiked ? "currentColor" : "none"}
                />
                <span>{likeCount}</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 border-border bg-transparent text-sm sm:text-base"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{post.comments}</span>
              </Button>
              <div className="relative sm:ml-auto" ref={shareMenuRef}>
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
                        🌑 X
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
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
              댓글 ({comments.length})
            </h2>

            {/* 댓글 입력 */}
            <Card className="p-4 mb-6 border-border/50">
              <div className="flex gap-3">
                <img
                  src={currentUserProfileImage || "/user-profile-avatar.png"}
                  alt="프로필"
                  className="w-10 h-10 rounded-full bg-secondary"
                />
                <div className="flex-1">
                  <textarea
                    placeholder="댓글을 작성해주세요..."
                    className="w-full bg-secondary/50 text-foreground placeholder-muted-foreground rounded-lg px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={async () => {
                        if (!commentContent.trim()) return;
                        setCommentLoading(true);
                        try {
                          const newComment = await createComment(
                            id,
                            commentContent.trim()
                          );
                          setComments((prev) => [...prev, newComment]);
                          setCommentContent("");
                        } catch (e) {
                          console.error("댓글 등록 실패:", e);
                          alert("댓글을 등록하지 못했습니다.");
                        } finally {
                          setCommentLoading(false);
                        }
                      }}
                      disabled={commentLoading}
                    >
                      댓글 등록
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    replyTargetId={replyTargetId}
                    setReplyTargetId={setReplyTargetId}
                    setReplyContent={setReplyContent}
                    replyContent={replyContent}
                    handleSubmitReply={handleSubmitReply}
                    replyLoading={replyLoading}
                    currentUserId={currentUserId}
                    postAuthorId={post.authorId}
                    onRefresh={fetchComments}
                  />
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
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
              다른 여행기
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">요기조기</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-primary transition-colors"
                  >
                    소개
                  </Link>
                </li>
                <li>
                  <Link
                    to="/notice"
                    className="hover:text-primary transition-colors"
                  >
                    공지사항
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">기능</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/write"
                    className="hover:text-primary transition-colors"
                  >
                    여행기 작성
                  </Link>
                </li>
                <li>
                  <Link
                    to="/checklist"
                    className="hover:text-primary transition-colors"
                  >
                    여행 계획
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">정보</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-primary transition-colors"
                  >
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-primary transition-colors"
                  >
                    개인정보
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">팔로우</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://twitter.com/yogizogi_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
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
