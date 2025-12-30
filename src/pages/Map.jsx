import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useAuthStatus";

const notoSansKR = "Noto Sans KR";
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const KAKAO_SCRIPT_ID = "kakao-map-sdk";

export default function MapPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const markersRef = useRef([]);
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [loading, setLoading] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    "키워드 검색 후 결과가 표시됩니다."
  );
  const { isAuthed, logout } = useAuthStatus();

  useEffect(() => {
    if (!KAKAO_MAP_KEY) {
      setMapLoadError(
        "카카오맵 API 키(VITE_KAKAO_MAP_KEY)를 .env에 설정해주세요."
      );
      return;
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(() => initializeMap());
      return;
    }

    let script = document.getElementById(KAKAO_SCRIPT_ID);
    if (!script) {
      script = document.createElement("script");
      script.id = KAKAO_SCRIPT_ID;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services,clusterer`;
      script.async = true;
      document.head.appendChild(script);
    }

    script.onload = () => {
      if (!window.kakao?.maps) {
        setMapLoadError(
          "카카오맵 객체를 불러오지 못했습니다. API 키와 허용 도메인을 확인해주세요."
        );
        return;
      }
      window.kakao.maps.load(() => initializeMap());
    };
    script.onerror = () =>
      setMapLoadError(
        "카카오맵 스크립트 로드에 실패했습니다. API 키와 허용 도메인을 확인해주세요."
      );
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current) return;

    const container = mapContainer.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: zoomLevel,
    };

    const map = new window.kakao.maps.Map(container, options);
    mapRef.current = map;

    const clusterer = new window.kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 4,
    });
    clustererRef.current = clusterer;

    window.kakao.maps.event.addListener(map, "zoom_changed", () => {
      const level = map.getLevel();
      setZoomLevel(level);
    });
    setStatusMessage("키워드 검색 후 결과가 표시됩니다.");
  };

  // 백엔드 필드(장소 API):
  // response: { success, data, error }
  // data[]: { id, name, type, lat, lng, address, description, rating }
  // 백엔드 필드(장소 API 응답): id, name, type, lat, lng, address, description, rating
  const clearMarkers = () => {
    const clusterer = clustererRef.current;
    if (clusterer?.getMarkers) {
      const existingMarkers = clusterer.getMarkers();
      if (existingMarkers.length) {
        clusterer.removeMarkers(existingMarkers);
      }
    }

    markersRef.current.forEach((markerObj) => markerObj.marker?.setMap(null));
    markersRef.current = [];
    setMarkers([]);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!window.kakao?.maps?.services || !mapRef.current) {
      setMapLoadError("지도를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    if (!clustererRef.current) {
      setMapLoadError("지도를 초기화하는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (loading) return;

    const query = searchQuery.trim();
    if (!query) {
      setStatusMessage("검색어를 입력해주세요.");
      return;
    }

    setLoading(true);
    setMapLoadError(null);

    try {
      const placesService = new window.kakao.maps.services.Places();
      const results = await new Promise((resolve, reject) => {
        placesService.keywordSearch(query, (data, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            resolve(data || []);
            return;
          }
          if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            resolve([]);
            return;
          }
          reject(new Error("카카오 키워드 검색에 실패했습니다."));
        });
      });

      if (!results.length) {
        clearMarkers();
        setSelectedMarker(null);
        setStatusMessage("검색 결과가 없습니다.");
        return;
      }

      clearMarkers();
      setSelectedMarker(null);

      const formattedPlaces = results
        .map((place) => ({
          id: place.id,
          name: place.place_name,
          lat: Number.parseFloat(place.y),
          lng: Number.parseFloat(place.x),
          address: place.road_address_name || place.address_name,
          phone: place.phone,
          url: place.place_url,
          category: place.category_name,
        }))
        .filter(
          (place) => Number.isFinite(place.lat) && Number.isFinite(place.lng)
        );

      if (!formattedPlaces.length) {
        setStatusMessage("검색 결과가 없습니다.");
        return;
      }

      const first = formattedPlaces[0];
      if (Number.isFinite(first.lat) && Number.isFinite(first.lng)) {
        const newCenter = new window.kakao.maps.LatLng(first.lat, first.lng);
        mapRef.current.panTo(newCenter);
      }

      const newMarkers = formattedPlaces.map((place) => {
        const markerImage = new window.kakao.maps.MarkerImage(
          `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%230EA5E9'/%3E%3C/svg%3E`,
          new window.kakao.maps.Size(32, 32)
        );

        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(place.lat, place.lng),
          title: place.name,
          image: markerImage,
        });

        window.kakao.maps.event.addListener(marker, "click", () =>
          setSelectedMarker(place)
        );

        if (clustererRef.current?.addMarker) {
          clustererRef.current.addMarker(marker);
        }

        return { ...place, marker };
      });

      markersRef.current = newMarkers;
      setMarkers(newMarkers);
      setStatusMessage("");
    } catch (error) {
      console.error("Keyword search error:", error);
      setMapLoadError("키워드 검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {mapLoadError && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 text-sm text-center">
          {mapLoadError}
        </div>
      )}

      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img
                  src="/logo.png"
                  alt="요기조기"
                  className="w-10 h-10 rounded-lg flex-shrink-0"
                />
                <span
                  className="text-xl text-foreground hidden sm:inline"
                  style={{
                    fontFamily: notoSansKR,
                    fontWeight: 900,
                    transform: "translate(-7px, 1.5px)",
                  }}
                >
                  요기조기
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/write">
                <Button className="hidden sm:flex gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="w-5 h-5" />
                  여행기 작성
                </Button>
              </Link>
              {isAuthed && (
                <>
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-secondary"
                    >
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    style={{ fontFamily: notoSansKR, fontWeight: 900 }}
                    onClick={logout}
                  >
                    로그아웃
                  </Button>
                </>
              )}
              {!isAuthed && (
                <Link to="/login">
                  <Button
                    variant="ghost"
                    style={{ fontFamily: notoSansKR, fontWeight: 900 }}
                  >
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex gap-4 h-[calc(100vh-120px)]">
        <div className="w-80 bg-card border-r border-border overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold text-foreground mb-4">
              위치 검색
            </h2>

            <form className="flex gap-2 mb-4" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="장소 검색..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button type="submit" className="px-4 py-2">
                검색
              </Button>
            </form>

            {statusMessage && !loading && (
              <p className="text-sm text-muted-foreground mb-6">
                {statusMessage}
              </p>
            )}

            {selectedMarker && (
              <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6">
                <h3 className="font-bold text-foreground mb-2">
                  {selectedMarker.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedMarker.address || "주소 정보가 없습니다."}
                </p>
                {selectedMarker.phone && (
                  <p className="text-sm text-foreground mb-2">
                    전화: {selectedMarker.phone}
                  </p>
                )}
                {selectedMarker.url && (
                  <a
                    href={selectedMarker.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline"
                  >
                    상세 보기
                  </a>
                )}
                {selectedMarker.category && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedMarker.category}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-bold text-foreground mb-3">
                검색 결과 ({loading ? "로딩중..." : markers.length})
              </h3>
              <div className="space-y-2">
                {!loading && markers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {statusMessage || "검색 결과가 없습니다."}
                  </p>
                )}
                {markers.map((markerObj) => (
                  <div
                    key={markerObj.id}
                    onClick={() => setSelectedMarker(markerObj)}
                    className="p-3 bg-secondary/50 border border-border rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <p className="font-medium text-foreground text-sm">
                      {markerObj.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {markerObj.address}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div ref={mapContainer} className="w-full h-full" />
        </div>
      </main>

      <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 text-sm text-muted-foreground z-40">
        <p>줌 레벨: {zoomLevel}</p>
        <p className="text-xs mt-1">
          {zoomLevel <= 3
            ? "마커 숨김 (1km 이상)"
            : zoomLevel === 4
            ? "종합 마커 (500m)"
            : "개별 마커 (300m 이내)"}
        </p>
      </div>
    </div>
  );
}
