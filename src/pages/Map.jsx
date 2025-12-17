import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAttractions } from "@/api/attractions";

const notoSansKR = "Noto Sans KR";
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const KAKAO_SCRIPT_ID = "kakao-map-sdk";

export default function MapPage() {
  const mapContainer = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [loading, setLoading] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(null);

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

    const clusterer = new window.kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 4,
    });

    window.kakao.maps.event.addListener(map, "zoom_changed", () => {
      const level = map.getLevel();
      setZoomLevel(level);
      updateMarkerVisibility(level, markers);
    });

    loadPlacesData(map, clusterer, 37.5665, 126.978);
  };

  // 백엔드 필드(장소 API):
  // response: { success, data, error }
  // data[]: { id, name, type, lat, lng, address, description, rating }
  const loadPlacesData = async (mapInstance, clustererInstance, lat, lng) => {
    setLoading(true);
    try {
      const attractionData = await getAttractions(
        lat.toString(),
        lng.toString(),
        "attraction"
      );
      const restaurantData = await getAttractions(
        lat.toString(),
        lng.toString(),
        "restaurant"
      );

      if (!attractionData.success || !restaurantData.success) {
        setMapLoadError(
          attractionData.error ||
            restaurantData.error ||
            "관광/맛집 데이터를 불러오지 못했습니다."
        );
      }

      const allPlaces = [
        ...(attractionData.success ? attractionData.data || [] : []),
        ...(restaurantData.success ? restaurantData.data || [] : []),
      ];

      const fallbackPlaces = allPlaces.length
        ? []
        : [
            {
              id: "sample-attraction",
              name: "서울 시청",
              type: "attraction",
              lat: 37.5665,
              lng: 126.978,
              address: "서울특별시 중구 세종대로 110",
              description: "샘플 관광지 데이터",
              rating: 4.5,
            },
            {
              id: "sample-restaurant",
              name: "을지로 맛집",
              type: "restaurant",
              lat: 37.5668,
              lng: 126.985,
              address: "서울특별시 중구 을지로 일대",
              description: "샘플 맛집 데이터",
              rating: 4.3,
            },
          ];

      const placesToRender = allPlaces.length ? allPlaces : fallbackPlaces;

      const newMarkers = placesToRender.map((place) => {
        const iconColor = place.type === "restaurant" ? "#FF6B6B" : "#0EA5E9";
        const markerImage = new window.kakao.maps.MarkerImage(
          `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='${encodeURIComponent(
            iconColor
          )}'/%3E%3C/svg%3E`,
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
        clustererInstance?.addMarker(marker);

        return { ...place, marker };
      });

      setMarkers(newMarkers);
    } catch (error) {
      console.error("Error loading places:", error);
      setMapLoadError("관광/맛집 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const updateMarkerVisibility = (level, markerList) => {
    markerList.forEach((markerObj) => {
      if (level <= 3) {
        markerObj.marker?.setVisible(false);
      } else {
        markerObj.marker?.setVisible(true);
      }
    });
  };

  const filteredMarkers = markers.filter((marker) => {
    if (filterType === "all") return true;
    return marker.type === filterType;
  });

  useEffect(() => {
    markers.forEach((markerObj) => {
      if (filterType === "all") {
        markerObj.marker?.setVisible(true);
      } else {
        markerObj.marker?.setVisible(markerObj.type === filterType);
      }
    });
  }, [filterType, markers]);

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
                  alt="여기저기"
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
                  여기저기
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
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-secondary"
                >
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="ghost"
                  style={{ fontFamily: notoSansKR, fontWeight: 900 }}
                >
                  로그인
                </Button>
              </Link>
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

            <div className="flex gap-2 mb-6">
              {[
                { key: "all", label: "전체" },
                { key: "restaurant", label: "맛집" },
                { key: "attraction", label: "관광지" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    filterType === filter.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-primary/20"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="장소 검색..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {selectedMarker && (
              <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-6">
                <h3 className="font-bold text-foreground mb-2">
                  {selectedMarker.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedMarker.address}
                </p>
                <p className="text-sm text-foreground mb-3">
                  {selectedMarker.description}
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">평점:</span>
                  <span className="text-sm text-primary">
                    {selectedMarker.rating.toFixed(1)}/5.0
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    자세히 보기
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    저장
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-bold text-foreground mb-3">
                주변{" "}
                {filterType === "restaurant"
                  ? "맛집"
                  : filterType === "attraction"
                  ? "관광지"
                  : "장소"}{" "}
                ({loading ? "로딩중..." : filteredMarkers.length})
              </h3>
              <div className="space-y-2">
                {filteredMarkers.map((markerObj) => (
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
