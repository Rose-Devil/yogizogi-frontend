import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ImageIcon, Trash2, Save } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { apiJson } from "@/api/client";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import "react-day-picker/dist/style.css";

const notoSansKR = "Noto Sans KR";

export default function WritePage() {
  const navigate = useNavigate();
  const { id } = useParams(); // 수정 모드일 때 postId
  const { isAuthed } = useAuthStatus();
  const isEditMode = !!id; // 수정 모드 여부

  // 폼 상태
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [tagsInput, setTagsInput] = useState("#여행"); // 기본 태그
  const [content, setContent] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const imageInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [images, setImages] = useState([]); // File 객체 저장
  const [thumbnailFile, setThumbnailFile] = useState(null); // File 객체 저장
  const [imagePreviews, setImagePreviews] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });
  const calendarRef = useRef(null);

  // 인증 체크
  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
    }
  }, [isAuthed, navigate]);

  // 수정 모드일 때 기존 게시글 데이터 불러오기
  useEffect(() => {
    if (isEditMode && id) {
      const loadPost = async () => {
        setLoading(true);
        try {
          const res = await apiJson(`/api/posts/${id}`);

          if (!res.success) {
            throw new Error(res.message || "게시글 로딩 실패");
          }

          const post = res.data;

          // 폼 데이터 설정
          setTitle(post.title || "");
          setLocation(post.region || "");
          setContent(post.content || "");
          setTagsInput(
            post.tags && post.tags.length > 0
              ? post.tags.map((t) => `#${t.name}`).join(" ")
              : "#여행"
          );

          // 날짜 범위 설정
          if (post.start_date && post.end_date) {
            const startDate = new Date(post.start_date);
            const endDate = new Date(post.end_date);
            const startStr = format(startDate, "yyyy.MM.dd");
            const endStr = format(endDate, "yyyy.MM.dd");
            setDateRange(`${startStr} - ${endStr}`);
            setSelectedRange({ from: startDate, to: endDate });
          } else if (post.start_date) {
            const startDate = new Date(post.start_date);
            const startStr = format(startDate, "yyyy.MM.dd");
            setDateRange(startStr);
            setSelectedRange({ from: startDate, to: null });
          }

          // 이미지 설정 (기존 이미지 URL)
          if (post.images && post.images.length > 0) {
            setImagePreviews(
              post.images.map((img) => img.image_url || "/placeholder.svg")
            );
          }

          // 썸네일 설정 (기존 썸네일 URL)
          if (post.thumbnail_url) {
            setThumbnailPreview(post.thumbnail_url);
          }
        } catch (error) {
          console.error("게시글 로딩 실패:", error);
          setError("게시글을 불러오는데 실패했습니다.");
        } finally {
          setLoading(false);
        }
      };

      loadPost();
    }
  }, [isEditMode, id]);

  // 이미지 파일 변경 시 미리보기 URL 생성
  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => {
      // 기존 URL 미리보기와 새로 업로드된 파일 미리보기를 합침
      const existingUrls = prev.filter((url) => !url.startsWith("blob:"));
      return [...existingUrls, ...urls];
    });
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return;
    }

    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  // 달력 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar]);

  // 날짜 범위가 변경되면 dateRange 업데이트
  useEffect(() => {
    if (selectedRange.from && selectedRange.to) {
      const fromStr = format(selectedRange.from, "yyyy.MM.dd");
      const toStr = format(selectedRange.to, "yyyy.MM.dd");
      setDateRange(`${fromStr} - ${toStr}`);
      setShowCalendar(false);
    } else if (selectedRange.from) {
      const fromStr = format(selectedRange.from, "yyyy.MM.dd");
      setDateRange(fromStr);
    }
  }, [selectedRange]);

  // 인증되지 않았으면 아무것도 렌더링하지 않음
  if (!isAuthed) {
    return null;
  }

  const handleSubmit = async () => {
    if (!title || !content || !location) {
      setError("제목, 여행지, 내용을 모두 입력해주세요.");
      return;
    }

    setError("");
    setSubmitting(true);

    // 날짜 파싱 (예: "2025.01.01 - 2025.01.05")
    let start_date = undefined;
    let end_date = undefined;
    if (dateRange.includes("-")) {
      const [startRaw, endRaw] = dateRange.split("-").map((s) => s.trim());
      const normalize = (s) => s.replace(/\./g, "-");
      if (startRaw) start_date = normalize(startRaw);
      if (endRaw) end_date = normalize(endRaw);
    }

    // 태그 문자열을 배열로 파싱
    const tags =
      tagsInput
        .split(/[\s,]+/)
        .map((t) => t.replace(/^#/, "").trim())
        .filter(Boolean) || [];

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("content", content);
      form.append("region", location);
      if (start_date) form.append("start_date", start_date);
      if (end_date) form.append("end_date", end_date);
      form.append("tags", JSON.stringify(tags));
      form.append("allow_comments", String(allowComments));
      if (thumbnailFile) {
        form.append("thumbnail", thumbnailFile);
      }

      // images 배열에서 실제 File 객체만 필터링 (blob URL이 아닌 것들)
      const imageFiles = images.filter((img) => img instanceof File);
      console.log("전송할 이미지 파일:", imageFiles.length, "개"); // 디버깅용

      for (const file of imageFiles) {
        form.append("images", file);
      }

      // 수정 모드면 PUT, 아니면 POST
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `/api/posts/${id}` : "/api/posts";

      const json = await apiJson(url, {
        method,
        body: form,
      });

      if (!json.success) {
        throw new Error(
          json.message ||
            (isEditMode
              ? "게시글 수정에 실패했습니다."
              : "게시글 작성에 실패했습니다.")
        );
      }

      const post = json.data;
      if (post && post.id) {
        navigate(`/post/${post.id}`);
      } else {
        navigate("/");
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImages((prev) => {
      const next = [...prev, ...files];
      return next.slice(0, 6);
    });

    e.target.value = "";
  };

  const removeImageAt = (index) => {
    setImagePreviews((prev) => {
      const removedUrl = prev[index];
      // blob URL 정리
      if (removedUrl && removedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removedUrl);
      }
      const newPreviews = prev.filter((_, i) => i !== index);

      // 기존 URL 개수 계산 (blob이 아닌 것들)
      const existingUrlCount = prev.filter(
        (url) => !url.startsWith("blob:")
      ).length;

      // 제거된 것이 새로 추가된 파일(blob)인 경우 images에서도 제거
      if (index >= existingUrlCount) {
        const fileIndex = index - existingUrlCount;
        setImages((prevImages) => prevImages.filter((_, i) => i !== fileIndex));
      }

      return newPreviews;
    });
  };

  const handlePickThumbnail = (e) => {
    setThumbnailFile(e.target.files?.[0] ?? null);
    e.target.value = "";
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;

    const confirmed = window.confirm(
      "정말 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const res = await apiJson(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.success) {
        throw new Error(res.message || "게시글 삭제에 실패했습니다.");
      }

      navigate("/");
    } catch (e) {
      console.error(e);
      setError(e.message || "게시글 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity">
                <img
                  src="/logo.png"
                  alt="요기조기"
                  className="w-10 h-10 rounded-lg flex-shrink-0"
                />
                <span
                  className="text-xl font-[900] text-foreground"
                  style={{
                    fontFamily: notoSansKR,
                    transform: "translate(-7px, 1.5px)",
                  }}
                >
                  요기조기
                </span>
              </div>
            </Link>

            {/* 우측 버튼 */}
            <div className="flex items-center gap-4">
              <Link to={isEditMode ? `/post/${id}` : "/"}>
                <Button variant="ghost">취소</Button>
              </Link>
              {isEditMode && (
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "삭제 중..." : "삭제"}
                </Button>
              )}
              <Button
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Save className="w-4 h-4" />
                {submitting
                  ? isEditMode
                    ? "수정 중..."
                    : "발행 중..."
                  : isEditMode
                  ? "수정하기"
                  : "발행하기"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            게시글을 불러오는 중...
          </div>
        ) : (
          <>
            {/* 제목 */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="여행기의 제목을 입력하세요"
                className="w-full text-4xl font-bold text-foreground placeholder-muted-foreground/50 bg-transparent focus:outline-none border-b-2 border-transparent hover:border-border focus:border-primary pb-4 transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 썸네일 이미지 */}
            <div className="mb-8">
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handlePickThumbnail}
              />
              <div
                className="relative h-64 rounded-lg bg-secondary/50 border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-secondary/70 transition-colors group overflow-hidden"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="thumbnail"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {thumbnailPreview && (
                  <button
                    type="button"
                    className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background border border-border z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearThumbnail();
                    }}
                    aria-label="remove thumbnail"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <ImageIcon className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors relative z-10" />
                <div className="text-center relative z-10">
                  <p className="font-medium text-foreground mb-1">
                    썸네일 이미지를 선택하세요
                  </p>
                  <p className="text-sm text-muted-foreground">
                    클릭하거나 드래그해서 업로드
                  </p>
                </div>
              </div>
            </div>

            {/* 여행 정보 */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
              {/* 위치 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  여행지
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="예: 서울, 한국"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* 여행 기간 */}
              <div className="relative" ref={calendarRef}>
                <label className="block text-sm font-medium text-foreground mb-2">
                  여행 기간
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded transition-colors z-10 cursor-pointer"
                    aria-label="달력 열기"
                  >
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <input
                    type="text"
                    placeholder="2025.01.01 - 2025.01.05"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    onClick={() => setShowCalendar(!showCalendar)}
                    readOnly
                  />
                </div>
                {showCalendar && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-lg shadow-xl p-4">
                    <DayPicker
                      mode="range"
                      selected={selectedRange}
                      onSelect={setSelectedRange}
                      locale={ko}
                      className="rounded-lg"
                      classNames={{
                        months: "flex flex-row space-x-4",
                        month: "space-y-4",
                        caption:
                          "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button:
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell:
                          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_range_end: "day-range-end",
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside:
                          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle:
                          "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 이미지 갤러리 */}
            <div className="mb-8 pb-8 border-b border-border">
              <label className="block text-sm font-medium text-foreground mb-4">
                여행 사진
              </label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handlePickImages}
              />
              <div className="grid grid-cols-4 gap-4">
                {imagePreviews.map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border bg-secondary"
                  >
                    <img
                      src={src}
                      alt={`upload-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background border border-border"
                      onClick={() => removeImageAt(idx)}
                      aria-label="remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {imagePreviews.length < 6 && (
                  <button
                    type="button"
                    className="relative aspect-square rounded-lg bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center group cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                )}
              </div>
            </div>

            {/* 태그 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                태그
              </label>
              <input
                type="text"
                placeholder="#여행 #서울 #카페 (쉼표 또는 스페이스로 구분)"
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                태그로 여행기를 더 쉽게 찾을 수 있습니다
              </p>
            </div>

            {/* 본문 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                여행기 내용
              </label>
              <textarea
                placeholder="당신의 여행 이야기를 자유롭게 작성해주세요..."
                className="w-full px-4 py-4 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                마크다운 형식을 지원합니다
              </p>
            </div>

            {/* 설정 */}
            <div className="mb-8 pb-8 border-b border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">댓글 허용</p>
                  <p className="text-sm text-muted-foreground">
                    독자들의 댓글을 받을 수 있습니다
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                />
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-4 justify-end">
              <Link to={isEditMode ? `/post/${id}` : "/"}>
                <Button variant="outline" className="gap-2 bg-transparent">
                  취소
                </Button>
              </Link>
              {isEditMode && (
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "삭제 중..." : "삭제하기"}
                </Button>
              )}
              <Button
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Save className="w-4 h-4" />
                {submitting
                  ? isEditMode
                    ? "수정 중..."
                    : "발행 중..."
                  : isEditMode
                  ? "수정하기"
                  : "발행하기"}
              </Button>
            </div>

            {error && (
              <p className="mt-4 text-sm text-destructive text-right">
                {error}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
