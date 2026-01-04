import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  ImageIcon,
  Trash2,
  Save,
  Sparkles,
} from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { apiJson } from "@/api/client";
import { me } from "@/api/auth";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import "react-day-picker/dist/style.css";

const notoSansKR = "Noto Sans KR";
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const KAKAO_SCRIPT_ID = "kakao-map-sdk";

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
  const [converting, setConverting] = useState(false); // MZ 변환 로딩 상태
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ from: null, to: null });
  const calendarRef = useRef(null);
  const locationBoxRef = useRef(null);
  const skipPlaceSearchRef = useRef(false);
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const saveDraftTimeoutRef = useRef(null);
  const DRAFT_STORAGE_KEY = "post_draft";

  // 인증 체크 및 현재 사용자 ID 가져오기
  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    // 현재 사용자 ID 가져오기
    async function loadCurrentUser() {
      try {
        const userData = await me();
        const userId =
          userData?.user?.id || userData?.data?.id || userData?.data?.user?.id;
        if (userId) {
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error("사용자 정보 로딩 실패:", error);
      }
    }

    loadCurrentUser();
  }, [isAuthed, navigate]);

  // base64를 File 객체로 변환
  const base64ToFile = (base64String, filename, mimeType) => {
    const byteCharacters = atob(base64String.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
  };

  // 임시저장 데이터 로드 (수정 모드가 아닐 때만)
  useEffect(() => {
    if (!isEditMode && !id) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          // 사용자에게 복원할지 물어봄
          const shouldRestore = window.confirm(
            "이전에 작성하던 내용이 있습니다. 복원하시겠습니까?"
          );
          if (shouldRestore) {
            setTitle(draft.title || "");
            setContent(draft.content || "");
            setLocation(draft.location || "");
            setDateRange(draft.dateRange || "");
            setTagsInput(draft.tagsInput || "#여행");
            setAllowComments(draft.allowComments !== undefined ? draft.allowComments : true);
            
            // base64 이미지 복원
            if (draft.imageBase64s && draft.imageBase64s.length > 0) {
              const restoredFiles = draft.imageBase64s.map((base64, index) => {
                // base64에서 mime type 추출
                const mimeMatch = base64.match(/data:([^;]+);/);
                const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
                return base64ToFile(base64, `image-${index}.jpg`, mimeType);
              });
              setImages(restoredFiles);
            }
            
            if (draft.thumbnailBase64) {
              const mimeMatch = draft.thumbnailBase64.match(/data:([^;]+);/);
              const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
              const thumbnailFile = base64ToFile(draft.thumbnailBase64, "thumbnail.jpg", mimeType);
              setThumbnailFile(thumbnailFile);
            }
          } else {
            // 복원하지 않으면 임시저장 삭제
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("임시저장 데이터 로드 실패:", error);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }
  }, [isEditMode, id]);

  // 임시저장 함수 (File 객체는 base64로 변환)
  const saveDraft = async () => {
    if (isEditMode) return; // 수정 모드에서는 임시저장 안 함

    try {
      // 이미지 파일을 base64로 변환
      const imageBase64Promises = images
        .filter((img) => img instanceof File)
        .map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });
        });

      const thumbnailBase64Promise = thumbnailFile
        ? new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(thumbnailFile);
          })
        : Promise.resolve(null);

      const [imageBase64s, thumbnailBase64] = await Promise.all([
        Promise.all(imageBase64Promises),
        thumbnailBase64Promise,
      ]);

      const draft = {
        title,
        content,
        location,
        dateRange,
        tagsInput,
        allowComments,
        imageBase64s: imageBase64s.filter(Boolean),
        thumbnailBase64,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error("임시저장 실패:", error);
    }
  };

  // debounce된 임시저장 (1.5초마다)
  useEffect(() => {
    if (isEditMode) return; // 수정 모드에서는 임시저장 안 함

    // 기존 타이머 취소
    if (saveDraftTimeoutRef.current) {
      clearTimeout(saveDraftTimeoutRef.current);
    }

    // 내용이 있을 때만 저장
    if (title || content || location) {
      saveDraftTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 1500); // 1.5초 후 저장
    }

    return () => {
      if (saveDraftTimeoutRef.current) {
        clearTimeout(saveDraftTimeoutRef.current);
      }
    };
  }, [title, content, location, dateRange, tagsInput, allowComments, images, thumbnailFile, isEditMode]);

  // 페이지 종료 전 임시저장 (beforeunload)
  useEffect(() => {
    if (isEditMode) return;

    const handleBeforeUnload = (e) => {
      if (title || content || location) {
        // 동기적으로 저장 (비동기는 작동하지 않으므로 동기 저장)
        try {
          const draft = {
            title,
            content,
            location,
            dateRange,
            tagsInput,
            allowComments,
            // 이미지는 base64 변환이 시간이 걸리므로 저장하지 않음
            imageBase64s: [],
            thumbnailBase64: null,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        } catch (error) {
          console.error("임시저장 실패:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditMode, title, content, location, dateRange, tagsInput, allowComments]);

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

          // 작성자 확인 (수정 모드일 때만)
          if (isEditMode) {
            // 현재 사용자 ID 가져오기
            const userData = await me();
            const userId =
              userData?.user?.id ||
              userData?.data?.id ||
              userData?.data?.user?.id;

            if (userId && post.author_id !== userId) {
              alert("본인의 게시글만 수정할 수 있습니다.");
              navigate(`/post/${id}`);
              return;
            }
          }

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

      if (
        locationBoxRef.current &&
        !locationBoxRef.current.contains(event.target)
      ) {
        setPlaceSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  useEffect(() => {
    if (!KAKAO_MAP_KEY) {
      setPlaceSearchError(
        "Kakao 장소 검색 키(VITE_KAKAO_MAP_KEY)가 설정되지 않았습니다."
      );
      return;
    }

    if (window.kakao?.maps?.services) {
      window.kakao.maps.load(() => setKakaoReady(true));
      return;
    }

    let script = document.getElementById(KAKAO_SCRIPT_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = KAKAO_SCRIPT_ID;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
      script.async = true;
      document.head.appendChild(script);
    }

    script.onload = () => {
      if (!window.kakao?.maps) {
        setPlaceSearchError("카카오 지도 SDK 로딩에 실패했습니다.");
        return;
      }
      window.kakao.maps.load(() => setKakaoReady(true));
    };

    script.onerror = () =>
      setPlaceSearchError("카카오 지도 SDK를 불러오지 못했습니다.");
  }, []);

  useEffect(() => {
    if (!kakaoReady) return;

    if (skipPlaceSearchRef.current) {
      skipPlaceSearchRef.current = false;
      return;
    }

    const query = location.trim();
    if (!query || query.length < 2) {
      setPlaceSuggestions([]);
      setSearchingPlaces(false);
      return;
    }

    setSearchingPlaces(true);
    setPlaceSearchError("");
    const timeoutId = setTimeout(() => {
      const service = new window.kakao.maps.services.Places();
      service.keywordSearch(query, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setPlaceSuggestions((data || []).slice(0, 5));
          setPlaceSearchError("");
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          setPlaceSuggestions([]);
          setPlaceSearchError("");
        } else {
          setPlaceSuggestions([]);
          setPlaceSearchError("카카오 장소 검색에 실패했습니다.");
        }
        setSearchingPlaces(false);
      });
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [location, kakaoReady]);

  // 인증되지 않았으면 아무것도 렌더링하지 않음
  if (!isAuthed) {
    return null;
  }

  const formatRegionLabel = (place) => {
    const base =
      place.road_address_name || place.address_name || place.place_name || "";
    const parts = base.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return base.trim();
  };

  const handleSelectSuggestion = (place) => {
    const formatted = formatRegionLabel(place);
    skipPlaceSearchRef.current = true;
    setLocation(formatted);
    setPlaceSuggestions([]);
    setSearchingPlaces(false);
    setPlaceSearchError("");
  };

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
      
      // 게시글 작성 성공 시 임시저장 삭제
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      
      if (post && post.id) {
        navigate(`/post/${post.id}`);
      } else {
        navigate("/");
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e.message || "알 수 없는 오류가 발생했습니다.";
      
      // 토큰 만료 에러인 경우 로그인 페이지로 리다이렉트
      if (errorMessage.includes("로그인") || errorMessage.includes("토큰") || e.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        navigate("/login");
        return;
      }
      
      setError(errorMessage);
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

  const handleMzConvert = async () => {
    if (!content) {
      setError("변환할 내용을 입력해주세요.");
      return;
    }

    setConverting(true);
    setError("");

    try {
      const res = await apiJson("/api/ai/mz-convert", {
        method: "POST",
        body: JSON.stringify({ text: content }),
      });

      if (!res.success) {
        throw new Error(res.message || "MZ 스타일 변환에 실패했습니다.");
      }

      setContent(res.data.converted);
    } catch (e) {
      console.error(e);
      setError(e.message || "MZ 스타일 변환 중 오류가 발생했습니다.");
    } finally {
      setConverting(false);
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
                <div className="relative" ref={locationBoxRef}>
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="예: 서울, 한국"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    autoComplete="off"
                  />
                  {(placeSuggestions.length > 0 ||
                    (location.trim().length >= 2 &&
                      (searchingPlaces || placeSearchError))) && (
                    <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                      {searchingPlaces && (
                        <div className="px-4 py-3 text-sm text-muted-foreground">
                          ??? ??? ?? ????...
                        </div>
                      )}
                      {placeSuggestions.map((place) => (
                        <button
                          type="button"
                          key={place.id}
                          onClick={() => handleSelectSuggestion(place)}
                          className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-border/60 last:border-b-0"
                        >
                          <p className="font-medium text-foreground text-sm">
                            {place.place_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {place.road_address_name || place.address_name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {formatRegionLabel(place)}
                          </p>
                        </button>
                      ))}
                      {!searchingPlaces &&
                        placeSuggestions.length === 0 &&
                        placeSearchError && (
                          <div className="px-4 py-3 text-sm text-destructive">
                            {placeSearchError}
                          </div>
                        )}
                    </div>
                  )}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  여행기 내용
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 text-primary border-primary/20 hover:bg-primary/5 hover:text-primary"
                  onClick={handleMzConvert}
                  disabled={converting || !content}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {converting ? "변환 중..." : "MZ 스타일로 변환"}
                </Button>
              </div>
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
