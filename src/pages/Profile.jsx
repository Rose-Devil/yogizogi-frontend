import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Edit2,
  Settings,
  MapPin,
  Eye,
  FileText,
  TrendingUp,
} from "lucide-react";
import { apiJson } from "@/api/client";

const notoSansKR = "Noto Sans KR";

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({ postCount: 0, totalViews: 0 });
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);

      try {
        // /api/auth/me 한 번만 호출해서 모든 데이터 받기
        const data = await apiJson("/api/auth/me");

        // 사용자 프로필 설정
        setUserProfile({
          nickname: data.user?.nickname || "사용자",
          bio: data.user?.bio || "소개 정보가 없습니다.",
          profileImage:
            data.user?.image || data.user?.url || "/user-profile-avatar.png",
          joinDate: data.user?.joinDate || "",
        });

        // 통계 설정
        setStats({
          postCount: data.stats?.postCount || 0,
          totalViews: data.stats?.totalViews || 0,
        });

        // 여행기 목록 설정
        setMyTrips(data.trips || []);
      } catch (err) {
        console.error("프로필 데이터 로드 실패:", err);
        setError("프로필 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition-opacity">
                <img
                  src="/logo.png"
                  alt="여기저기"
                  className="w-10 h-10 rounded-lg flex-shrink-0"
                />
                <span
                  className="text-xl font-[900] text-foreground hidden sm:inline"
                  style={{
                    fontFamily: notoSansKR,
                    transform: "translate(-7px, 1.5px)",
                  }}
                >
                  여기저기
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/write">
                <Button className="bg-primary hover:bg-primary/90">
                  여행기 작성
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-secondary"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 프로필 섹션 */}
        <Card className="p-8 mb-8 border-border/50">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
            {/* 프로필 이미지 */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={userProfile?.profileImage || "/placeholder.svg"}
                alt={userProfile?.nickname || "프로필"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-foreground">
                  {userProfile?.nickname || "사용자"}
                </h1>
                <Link to="/profile/edit">
                  <Button
                    variant="outline"
                    className="gap-2 bg-transparent"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    편집
                  </Button>
                </Link>
              </div>

              <p className="text-muted-foreground mb-6 max-w-2xl">
                {userProfile?.bio}
              </p>

              {/* 통계 카드 */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.postCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      작성한 여행기
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-secondary/50 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {stats.totalViews.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      총 조회수
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                가입일: {userProfile?.joinDate}
              </p>
            </div>
          </div>
        </Card>

        {/* 탭 */}
        <div className="flex gap-4 border-b border-border mb-8">
          <button className="px-4 py-4 font-medium text-primary border-b-2 border-primary">
            내 여행기
          </button>
        </div>

        {/* 여행기 리스트 */}
        {loading && (
          <Card className="p-6 text-center text-muted-foreground border-border/50">
            프로필 정보를 불러오는 중...
          </Card>
        )}

        {error && (
          <Card className="p-6 text-center text-red-500 border-border/50">
            {error}
          </Card>
        )}

        {!loading && !error && myTrips.length === 0 && (
          <Card className="p-6 text-center text-muted-foreground border-border/50">
            등록된 여행기가 없습니다.
          </Card>
        )}

        {!loading && !error && myTrips.length > 0 && (
          <div className="space-y-4">
            {myTrips.map((trip) => (
              <Link to={`/post/${trip.id}`} key={trip.id}>
                <Card className="p-6 hover:shadow-lg transition-shadow border-border/50 cursor-pointer">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* 썸네일 이미지 */}
                    {trip.thumbnail && (
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                        <img
                          src={trip.thumbnail}
                          alt={trip.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* 여행기 정보 */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {trip.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {/* 지역 */}
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{trip.location || "위치 미지정"}</span>
                        </div>

                        {/* 조회수 */}
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{trip.views?.toLocaleString() || 0}회</span>
                        </div>

                        {/* 작성일 */}
                        <div className="flex items-center gap-1">
                          <span>{trip.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
