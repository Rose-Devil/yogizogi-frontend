import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, User, Lock, CheckCircle, ShieldCheck } from "lucide-react";
import { apiJson } from "@/api/client";

const notoSansKR = "Noto Sans KR";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [showVerification, setShowVerification] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageError, setProfileImageError] = useState("");
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const profileImageInputRef = useRef(null);

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview("");
      return;
    }

    const url = URL.createObjectURL(profileImageFile);
    setProfileImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImageFile]);

  const uploadProfileImage = async () => {
    if (!profileImageFile) {
      setProfileImageError("프로필 이미지 파일을 선택해 주세요.");
      return;
    }

    setProfileImageError("");
    setProfileImageUploading(true);
    try {
      const form = new FormData();
      form.append("image", profileImageFile);

      await apiJson("/api/auth/me/profile-image", {
        method: "POST",
        body: form,
      });

      navigate("/profile");
    } catch (err) {
      setProfileImageError(
        err instanceof Error ? err.message : "업로드에 실패했습니다."
      );
    } finally {
      setProfileImageUploading(false);
    }
  };

  // 백엔드 필드(프로필 편집): id(수정 불가), nickname, email, verificationCode, password, passwordConfirm, bio
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [originalProfile, setOriginalProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await apiJson("/users/me");
      console.log("users/me response:", data);

      if (!data) {
        console.error("data is null");
        return;
      }

      setNickname(data.nickname || "");
      setEmail(data.email || "");
      setBio(data.bio || "");

      setOriginalProfile(data);
    };

    fetchProfile();
  }, []);

  // const handleCancel = () => {
  //   if (!originalProfile) return;

  //   setNickname(originalProfile.nickname || "");
  //   setEmail(originalProfile.email || "");
  //   setBio(originalProfile.bio || "");
  // };

  // return;

  const handleSaveProfile = async () => {
    try {
      console.log("편집완료 클릭됨");

      await apiJson("/api/users/me/nickname", {
        method: "PATCH",
        body: JSON.stringify({
          nickname,
        }),
      });

      alert("프로필이 수정되었습니다");
    } catch (err) {
      console.error(err);
      alert("프로필 수정 실패");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl border-border/50 shadow-xl">
        <div className="p-8 space-y-8">
          <header className="space-y-3 text-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.png"
                alt="여기저기 로고"
                className="w-12 h-12 rounded-lg"
              />
              <h1
                className="text-2xl"
                style={{
                  fontFamily: notoSansKR,
                  fontWeight: 900,
                  transform: "translate(-7px, 1.5px)",
                }}
              >
                여기저기
              </h1>
            </Link>
            <div className="space-y-1">
              <p className="text-lg font-semibold">프로필 편집</p>
              <p className="text-sm text-muted-foreground">
                아이디는 수정할 수 없으며, 이메일 인증 후 정보를 변경하세요.
              </p>
            </div>
          </header>

          <form className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                프로필 사진
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border border-border">
                  <img
                    src={profileImagePreview || "/user-profile-avatar.png"}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setProfileImageFile(e.target.files?.[0] ?? null)
                  }
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profileImageInputRef.current?.click()}
                  >
                    선택
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadProfileImage}
                    disabled={profileImageUploading}
                  >
                    {profileImageUploading ? "업로드 중..." : "업로드"}
                  </Button>
                </div>
              </div>

              {profileImageError && (
                <p className="text-sm text-destructive">{profileImageError}</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  아이디
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value="travel_user01"
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-muted/60 text-foreground placeholder-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  닉네임
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={nickname || ""}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="닉네임을 입력하세요"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  이메일
                </label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      name="userEmailInput"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="이메일을 입력하세요"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="whitespace-nowrap"
                    onClick={() => setShowVerification(true)}
                  >
                    인증
                  </Button>
                </div>
                {showVerification && (
                  <div className="flex gap-2 flex-col sm:flex-row items-start sm:items-center">
                    <div className="relative flex-1">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="인증번호 6자리 입력"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="whitespace-nowrap"
                    >
                      확인
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="새 비밀번호"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="비밀번호 확인"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                소개
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="나의 여행 스타일이나 관심사를 적어주세요."
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                // defaultValue="세계 여행을 꿈꾸는 여행 블로거입니다. 현재 30개국을 다녀왔습니다."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button type="button" variant="outline" disabled>
                취소
              </Button>

              <Button
                type="button"
                onClick={handleSaveProfile}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                style={{ fontFamily: notoSansKR, fontWeight: 900 }}
              >
                편집 완료
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <Link
              to="/profile"
              className="text-primary hover:underline font-medium"
            >
              마이페이지로 돌아가기
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
