import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, User, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signup, signupRequestCode, signupVerifyCode } from "@/api/auth";

const notoSansKR = "Noto Sans KR";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [signupTicket, setSignupTicket] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpStatus, setOtpStatus] = useState({
    sending: false,
    verifying: false,
    message: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isEmailVerified = Boolean(signupTicket) && verifiedEmail === email;

  const onChangeEmail = (nextEmail) => {
    setEmail(nextEmail);
    if (verifiedEmail !== nextEmail) {
      setSignupTicket("");
      setOtpCode("");
      setOtpStatus({ sending: false, verifying: false, message: "" });
    }
  };

  const sendOtp = async () => {
    setError("");
    setOtpStatus({ sending: true, verifying: false, message: "" });
    try {
      await signupRequestCode({ email });
      setShowVerification(true);
      setOtpStatus({
        sending: false,
        verifying: false,
        message: "인증 코드를 전송했습니다.",
      });
    } catch (err) {
      setOtpStatus({ sending: false, verifying: false, message: "" });
      setError(err instanceof Error ? err.message : "인증 코드 전송에 실패했습니다.");
    }
  };

  const verifyOtp = async () => {
    setError("");
    setOtpStatus({ sending: false, verifying: true, message: "" });
    try {
      const data = await signupVerifyCode({ email, code: otpCode });
      const ticket = data?.ticket;
      if (!ticket) throw new Error("인증 티켓이 없습니다.");
      setSignupTicket(ticket);
      setVerifiedEmail(email);
      setOtpStatus({ sending: false, verifying: false, message: "인증 완료" });
    } catch (err) {
      setSignupTicket("");
      setVerifiedEmail("");
      setOtpStatus({ sending: false, verifying: false, message: "" });
      setError(err instanceof Error ? err.message : "인증 확인에 실패했습니다.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!isEmailVerified) {
      setError("이메일 인증이 필요합니다.");
      return;
    }

    setIsLoading(true);
    try {
      await signup({ email, password, nickname, url, signupTicket });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center justify-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="요기조기 로고" className="w-12 h-12 rounded-lg" />
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
            <p className="text-muted-foreground mt-2">새 계정을 만들어 시작하세요</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">이메일</label>
              <div className="space-y-2">
                <div className="flex gap-2 flex-col sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => onChangeEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="whitespace-nowrap"
                    onClick={sendOtp}
                    disabled={!email || otpStatus.sending}
                  >
                    {otpStatus.sending ? "전송 중..." : "인증"}
                  </Button>
                </div>

                {showVerification && (
                  <div className="flex gap-2 flex-col sm:flex-row items-start sm:items-center">
                    <div className="relative flex-1">
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
                      className="whitespace-nowrap"
                      onClick={verifyOtp}
                      disabled={otpStatus.verifying || otpCode.trim().length !== 6}
                    >
                      {otpStatus.verifying ? "확인 중..." : "확인"}
                    </Button>
                  </div>
                )}

                {otpStatus.message && (
                  <p className={`text-sm ${isEmailVerified ? "text-green-600" : "text-muted-foreground"}`}>
                    {otpStatus.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">닉네임</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">프로필 URL (선택)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">비밀번호 확인</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 py-3 text-base font-medium"
              style={{ fontFamily: notoSansKR, fontWeight: 900 }}
              disabled={isLoading || !isEmailVerified}
            >
              회원가입
            </Button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
