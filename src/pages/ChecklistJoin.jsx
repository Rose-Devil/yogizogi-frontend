import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { joinChecklist } from "@/api/checklists";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export default function ChecklistJoinPage() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { isAuthed } = useAuthStatus();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }

    let ignore = false;

    (async () => {
      try {
        const data = await joinChecklist(inviteCode);
        if (!ignore) navigate(`/checklist/${data.id}`);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "참여에 실패했습니다.");
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [inviteCode, isAuthed, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 border-border/50">
        <h1 className="text-xl font-black text-foreground mb-2">
          초대 링크로 참여 중…
        </h1>
        {error ? (
          <>
            <p className="text-sm text-destructive mb-4">{error}</p>
            <div className="flex gap-2">
              <Link to="/checklist" className="flex-1">
                <Button className="w-full" variant="outline">
                  체크리스트로
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button className="w-full">홈</Button>
              </Link>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            잠시만 기다려주세요.
          </p>
        )}
      </Card>
    </div>
  );
}

