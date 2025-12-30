import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Lock, CheckCircle, ShieldCheck } from "lucide-react";
import { apiJson } from "@/api/client";

const notoSansKR = "Noto Sans KR";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageError, setProfileImageError] = useState("");
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const profileImageInputRef = useRef(null);

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [originalProfile, setOriginalProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const wantsPasswordChange = password.trim().length > 0;

  const [showVerification, setShowVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState({
    sending: false,
    verifying: false,
    message: "",
  });
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(profileImageFile);
  }, [profileImageFile]);

  const uploadProfileImage = async () => {
    if (!profileImageFile) {
      setProfileImageError("프로필 이미지를 선택해주세요.");
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiJson("/api/auth/me");

        if (!response || !response.user) {
          console.error("Invalid response:", response);
          return;
        }

        const userData = response.user;
        setNickname(userData.nickname || "");
        setEmail(userData.email || "");
        setBio(userData.bio || "");

        setUserProfile({
          profileImage:
            userData.image || userData.url || "/user-profile-avatar.png",
        });

        setOriginalProfile(userData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        alert("프로필 정보를 불러오지 못했습니다.");
      }
    };

    fetchProfile();
  }, []);

  const isNicknameValid = nickname.trim().length > 0;
  const isPasswordValid =
    password === "" || (password.length > 0 && password === passwordConfirm);
  const isFormValid = isNicknameValid && isPasswordValid;

  const getPasswordConfirmBgColor = () => {
    if (passwordConfirm === "") return "bg-input";
    if (password === passwordConfirm) return "bg-green-50 dark:bg-green-950/20";
    return "bg-red-50 dark:bg-red-950/20";
  };

  const getNicknameBgColor = () => {
    if (nickname.trim().length === 0) return "bg-red-50 dark:bg-red-950/20";
    return "bg-green-50 dark:bg-green-950/20";
  };

  const requestPasswordOtp = async () => {
    if (!wantsPasswordChange) return;
    if (!isPasswordValid) {
      alert("비밀번호 확인을 먼저 완료해주세요.");
      return;
    }
    if (password.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setOtpStatus({ sending: true, verifying: false, message: "" });
    try {
      await apiJson("/api/auth/password/change/request-code", {
        method: "POST",
      });
      setShowVerification(true);
      setOtpStatus({
        sending: false,
        verifying: false,
        message: "인증 코드가 발송되었습니다.",
      });
    } catch (err) {
      setOtpStatus({ sending: false, verifying: false, message: "" });
      alert(
        err instanceof Error
          ? err.message
          : "인증 코드를 보내는 데 실패했습니다."
      );
    }
  };

  const confirmPasswordOtp = async () => {
    if (!wantsPasswordChange) return;
    if (!isPasswordValid) return;

    setOtpStatus({ sending: false, verifying: true, message: "" });
    try {
      await apiJson("/api/auth/password/change/confirm", {
        method: "POST",
        body: JSON.stringify({ newPassword: password, code: otpCode }),
      });
      setPasswordChanged(true);
      setOtpStatus({ sending: false, verifying: false, message: "인증 완료" });
    } catch (err) {
      setPasswordChanged(false);
      setOtpStatus({ sending: false, verifying: false, message: "" });
      alert(
        err instanceof Error ? err.message : "인증을 완료하지 못했습니다."
      );
    }
  };

  const handleSaveProfile = async () => {
    if (!isFormValid) return;

    try {
      console.log("Saving profile...");

      const body = {
        nickname,
        email,
        bio,
      };

      if (password) {
        body.password = password;
      }

      await apiJson("/api/user/me/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      });

      alert("프로필이 저장되었습니다.");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("프로필 저장에 실패했습니다.");
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
                alt="요기조기 로고"
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
                요기조기
              </h1>
            </Link>
            <div className="space-y-1">
              <p className="text-lg font-semibold">프로필 수정</p>
              <p className="text-sm text-muted-foreground">
                닉네임과 소개, 비밀번호를 업데이트할 수 있어요.
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
                    src={
                      profileImageFile
                        ? profileImagePreview
                        : userProfile?.profileImage ||
                          "/user-profile-avatar.png"
                    }
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                닉네임
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력해주세요"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border border-border ${getNicknameBgColor()} text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors`}
                />
              </div>
              {nickname.trim().length === 0 && (
                <p className="text-xs text-red-500">닉네임을 입력해주세요.</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  새 비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="새 비밀번호"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  비밀번호를 변경하지 않으려면 비워두세요.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호 확인"
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border border-border ${getPasswordConfirmBgColor()} text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors`}
                  />
                </div>
                {passwordConfirm !== "" && password !== passwordConfirm && (
                  <p className="text-xs text-red-500">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
                {passwordConfirm !== "" && password === passwordConfirm && (
                  <p className="text-xs text-green-500">
                    비밀번호가 일치합니다.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  이메일 인증
                </label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={requestPasswordOtp}
                  disabled={!wantsPasswordChange || otpStatus.sending}
                >
                  {otpStatus.sending ? "발송 중.." : "인증"}
                </Button>

                {showVerification && (
                  <>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="인증번호 6자리 입력"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={confirmPasswordOtp}
                      disabled={
                        otpStatus.verifying ||
                        otpCode.trim().length !== 6 ||
                        !isPasswordValid
                      }
                    >
                      {otpStatus.verifying ? "확인 중.." : "확인"}
                    </Button>
                  </>
                )}

                {otpStatus.message && (
                  <p
                    className={`text-sm ${
                      passwordChanged
                        ? "text-green-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {otpStatus.message}
                  </p>
                )}
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
                placeholder="나의 여행 경험과 관련된 소개를 적어주세요."
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleSaveProfile}
                disabled={!isFormValid}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: notoSansKR, fontWeight: 900 }}
              >
                저장하기
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
