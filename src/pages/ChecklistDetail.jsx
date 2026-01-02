import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, MapPin, Plus, Trash2 } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import {
  addChecklistItem,
  addChecklistLocation,
  clearChecklistLocations,
  getChecklistDetail,
  removeChecklistItem,
  removeChecklistLocation,
  reorderChecklistLocations,
  updateChecklistItemStatus,
} from "@/api/checklists";
import { ensureSocketConnected } from "@/lib/socket";

const notoSansKR = "Noto Sans KR";
const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const KAKAO_SCRIPT_ID = "kakao-map-sdk";

function toDateString(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function* dateRange(start, end) {
  const startStr = toDateString(start);
  const endStr = toDateString(end);
  if (!startStr || !endStr) return;
  if (startStr > endStr) return;

  let cursor = new Date(`${startStr}T00:00:00`);
  const endDate = new Date(`${endStr}T00:00:00`);
  while (cursor.getTime() <= endDate.getTime()) {
    yield toDateString(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
}

function groupByTripDate(locations) {
  const groups = new Map();
  locations.forEach((loc) => {
    const key = loc.tripDate || "미지정";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(loc);
  });
  return Array.from(groups.entries());
}

function buildDateColorMap(dateKeys) {
  const palette = [
    "#0EA5E9",
    "#22C55E",
    "#F97316",
    "#A855F7",
    "#EF4444",
    "#14B8A6",
    "#EAB308",
  ];
  const map = new Map();
  dateKeys.forEach((d, idx) => map.set(d, palette[idx % palette.length]));
  return map;
}

export default function ChecklistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthed, logout } = useAuthStatus();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("itinerary"); // itinerary | checklist

  const [checklist, setChecklist] = useState(null);
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [locations, setLocations] = useState([]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemAssignee, setNewItemAssignee] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");

  const [tripStartDate, setTripStartDate] = useState("");
  const [tripEndDate, setTripEndDate] = useState("");
  const [selectedTripDate, setSelectedTripDate] = useState("");

  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState([]);
  const [placeError, setPlaceError] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  const [kakaoReady, setKakaoReady] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const overlaysRef = useRef([]);
  const polylineRef = useRef(null);

  const [dragging, setDragging] = useState(null); // { tripDateKey, id }

  const availableTripDates = useMemo(
    () => Array.from(dateRange(tripStartDate, tripEndDate)),
    [tripStartDate, tripEndDate]
  );

  const normalizedLocations = useMemo(() => {
    const rows = Array.isArray(locations) ? locations : [];
    return rows
      .map((l) => ({
        ...l,
        tripDate: l.tripDate ? String(l.tripDate).slice(0, 10) : null,
        sortOrder: Number.isFinite(Number(l.sortOrder)) ? Number(l.sortOrder) : 0,
      }))
      .sort((a, b) => {
        const aDate = a.tripDate || "9999-99-99";
        const bDate = b.tripDate || "9999-99-99";
        if (aDate !== bDate) return aDate.localeCompare(bDate);
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return Number(a.id) - Number(b.id);
      });
  }, [locations]);

  const dateKeys = useMemo(() => {
    const keys = [];
    normalizedLocations.forEach((l) => {
      if (!l.tripDate) return;
      if (!keys.includes(l.tripDate)) keys.push(l.tripDate);
    });
    return keys.sort();
  }, [normalizedLocations]);

  const dateColorMap = useMemo(() => buildDateColorMap(dateKeys), [dateKeys]);

  const locationNumberMap = useMemo(() => {
    const map = new Map();
    normalizedLocations.forEach((loc, idx) => {
      map.set(loc.id, idx + 1);
    });
    return map;
  }, [normalizedLocations]);

  const fetchDetail = async (options = {}) => {
    const { silent = false } = options;
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await getChecklistDetail(id);
      setChecklist(data.checklist || null);
      setItems(data.items || []);
      setMembers(data.members || []);
      setLocations(data.locations || []);
    } catch (err) {
      if (err?.status === 401) {
        navigate("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "불러오기에 실패했습니다.");
      setChecklist(null);
      setItems([]);
      setMembers([]);
      setLocations([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthed, navigate]);

  useEffect(() => {
    if (!isAuthed) return;

    const socket = ensureSocketConnected();
    let active = true;

    socket.emit("room:join", { checklistId: id }, () => {});

    const onChanged = (payload) => {
      if (!active) return;
      if (String(payload?.checklistId) !== String(id)) return;
      fetchDetail({ silent: true });
    };

    socket.on("checklist:changed", onChanged);
    socket.on("locations:changed", onChanged);
    socket.on("members:changed", onChanged);

    return () => {
      active = false;
      socket.off("checklist:changed", onChanged);
      socket.off("locations:changed", onChanged);
      socket.off("members:changed", onChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthed]);

  useEffect(() => {
    if (!tripStartDate || !tripEndDate) return;
    if (!selectedTripDate) {
      const first = Array.from(dateRange(tripStartDate, tripEndDate))[0] || "";
      setSelectedTripDate(first);
      return;
    }
    if (tripStartDate <= selectedTripDate && selectedTripDate <= tripEndDate) return;
    const first = Array.from(dateRange(tripStartDate, tripEndDate))[0] || "";
    setSelectedTripDate(first);
  }, [tripStartDate, tripEndDate, selectedTripDate]);

  useEffect(() => {
    if (!KAKAO_MAP_KEY) {
      setPlaceError("Kakao 지도 키(VITE_KAKAO_MAP_KEY)가 필요합니다.");
      return;
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(() => setKakaoReady(true));
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

    const onLoad = () => {
      if (!window.kakao?.maps) {
        setPlaceError("Kakao 지도 SDK를 불러오지 못했습니다.");
        return;
      }
      window.kakao.maps.load(() => setKakaoReady(true));
    };

    const onError = () => setPlaceError("Kakao 지도 SDK를 불러오지 못했습니다.");

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, []);

  const handleMapDoubleClick = (mouseEvent) => {
    const tripDate = requireTripDate();
    if (!tripDate) return;
    if (!confirm("이 위치를 일정 리스트에 등록할까요?")) return;
    if (!window.kakao?.maps?.services) return;

    const latlng = mouseEvent.latLng;
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), async (result, status) => {
      if (status !== window.kakao.maps.services.Status.OK) return;
      const address =
        result?.[0]?.road_address?.address_name ||
        result?.[0]?.address?.address_name ||
        "";
      try {
        await addChecklistLocation(id, {
          name: address || "핀 위치",
          address: address || "",
          tripDate,
          lat: latlng.getLat(),
          lng: latlng.getLng(),
          kakaoPlaceId: "",
        });
        fetchDetail({ silent: true });
      } catch (err) {
        alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
      }
    });
  };

  const initializeMap = () => {
    if (!mapContainerRef.current) return;
    const center = new window.kakao.maps.LatLng(37.5665, 126.978);
    const map = new window.kakao.maps.Map(mapContainerRef.current, {
      center,
      level: 5,
      disableDoubleClickZoom: true,
    });
    mapRef.current = map;

    window.kakao.maps.event.addListener(map, "dblclick", (mouseEvent) =>
      handleMapDoubleClick(mouseEvent)
    );
  };

  useEffect(() => {
    if (tab !== "itinerary") return;
    if (!kakaoReady) return;
    if (mapRef.current) return;
    initializeMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kakaoReady, tab]);

  useEffect(() => {
    if (tab === "itinerary") return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);
    polylineRef.current = null;
    mapRef.current = null;
  }, [tab]);

  useEffect(() => {
    if (tab !== "itinerary") return;
    if (!kakaoReady) return;
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);
    polylineRef.current = null;

    const path = [];

    normalizedLocations.forEach((loc) => {
      const latlng = new window.kakao.maps.LatLng(loc.lat, loc.lng);
      const marker = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: latlng,
      });
      markersRef.current.push(marker);
      path.push(latlng);

      const idx = locationNumberMap.get(loc.id) || 0;
      const color = loc.tripDate ? dateColorMap.get(loc.tripDate) : "#64748B";
      const content = `
        <div style="
          width:24px;height:24px;border-radius:9999px;
          background:${color};
          color:white;
          font-weight:800;
          font-size:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          border:1px solid rgba(255,255,255,0.7);
        ">${idx}</div>
      `;
      const overlay = new window.kakao.maps.CustomOverlay({
        position: latlng,
        content,
        yAnchor: 1.3,
      });
      overlay.setMap(mapRef.current);
      overlaysRef.current.push(overlay);
    });

    if (path.length >= 2) {
      polylineRef.current = new window.kakao.maps.Polyline({
        map: mapRef.current,
        path,
        strokeWeight: 3,
        strokeColor: "#0F172A",
        strokeOpacity: 0.35,
        strokeStyle: "solid",
      });
    }

    if (path.length >= 1) {
      mapRef.current.setCenter(path[0]);
    }
  }, [tab, kakaoReady, normalizedLocations, locationNumberMap, dateColorMap]);

  const requireTripDate = () => {
    const date = selectedTripDate.trim();
    if (!date) {
      alert("먼저 여행 날짜 범위를 설정하고, 저장할 날짜를 선택해주세요.");
      return null;
    }
    return date;
  };

  const handleAddItem = async () => {
    const name = newItemName.trim();
    if (!name) return;

    try {
      await addChecklistItem(id, {
        name,
        assignedTo: newItemAssignee.trim(),
        quantity: Number.parseInt(newItemQuantity, 10) || 1,
      });
      setNewItemName("");
      setNewItemAssignee("");
      setNewItemQuantity("1");
      fetchDetail({ silent: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "추가에 실패했습니다.");
    }
  };

  const handleToggleItem = async (item) => {
    try {
      await updateChecklistItemStatus(id, item.id, !item.isCompleted);
      fetchDetail({ silent: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "변경에 실패했습니다.");
    }
  };

  const handleDeleteItem = async (item) => {
    if (!confirm("이 아이템을 삭제할까요?")) return;
    try {
      await removeChecklistItem(id, item.id);
      fetchDetail({ silent: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handlePlaceSearch = async (e) => {
    e.preventDefault();
    setPlaceError("");
    setPlaceResults([]);
    setSelectedPlaceId("");

    const query = placeQuery.trim();
    if (!query) return;
    if (!window.kakao?.maps?.services || !mapRef.current) {
      setPlaceError("지도 준비 중입니다.");
      return;
    }

    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(query, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setPlaceResults(data || []);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        setPlaceError("검색 결과가 없습니다.");
      } else {
        setPlaceError("장소 검색에 실패했습니다.");
      }
    });
  };

  const handleAddPlaceToList = async (place) => {
    const tripDate = requireTripDate();
    if (!tripDate) return;

    try {
      const lat = Number.parseFloat(place.y);
      const lng = Number.parseFloat(place.x);
      await addChecklistLocation(id, {
        name: place.place_name,
        address: place.road_address_name || place.address_name,
        tripDate,
        lat,
        lng,
        kakaoPlaceId: place.id,
      });
      setPlaceResults([]);
      setPlaceQuery("");
      setSelectedPlaceId("");
      fetchDetail({ silent: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  };

  const handleFocusLocation = (loc) => {
    if (!mapRef.current || !kakaoReady) return;
    mapRef.current.setCenter(new window.kakao.maps.LatLng(loc.lat, loc.lng));
    mapRef.current.setLevel(4);
    setTab("itinerary");
  };

  const handleRemoveLocation = async (loc) => {
    if (!confirm("이 위치를 삭제할까요?")) return;
    try {
      await removeChecklistLocation(id, loc.id);
      fetchDetail({ silent: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleClearItinerary = async () => {
    if (normalizedLocations.length === 0) return;
    if (!confirm("저장된 일정을 모두 삭제할까요?")) return;
    try {
      await clearChecklistLocations(id);
      fetchDetail({ silent: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleDropReorder = async (tripDateKey, nextIds) => {
    const tripDate = tripDateKey === "미지정" ? null : tripDateKey;
    try {
      await reorderChecklistLocations(id, { tripDate, orderedIds: nextIds });
      fetchDetail({ silent: true });
    } catch (err) {
      alert(err instanceof Error ? err.message : "순서 저장에 실패했습니다.");
      fetchDetail({ silent: true });
    }
  };

  const renderItinerary = () => {
    const grouped = groupByTripDate(normalizedLocations);

    return (
      <Card className="border-border/50 p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-black text-foreground" style={{ fontFamily: notoSansKR }}>
              일정 지도
            </h2>
          </div>
          <Button
            variant="outline"
            className="bg-transparent border-red-500 text-red-500 hover:bg-red-500/10"
            onClick={handleClearItinerary}
            disabled={normalizedLocations.length === 0}
          >
            전체 삭제
          </Button>
        </div>

        <Card className="border-border/50 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">시작일</div>
              <Input type="date" value={tripStartDate} onChange={(e) => setTripStartDate(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">종료일</div>
              <Input type="date" value={tripEndDate} onChange={(e) => setTripEndDate(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">저장할 날짜</div>
              <select
                className="w-full h-10 rounded-md border border-border bg-secondary/20 px-3 text-sm"
                value={selectedTripDate}
                onChange={(e) => setSelectedTripDate(e.target.value)}
                disabled={availableTripDates.length === 0}
              >
                {availableTripDates.length === 0 ? (
                  <option value="">날짜 범위를 먼저 설정하세요</option>
                ) : (
                  availableTripDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            지도 더블클릭 → 확인하면 저장됩니다. 검색 결과는 선택 후 “담기”를 눌러 저장됩니다.
          </p>
        </Card>

        {placeError && <p className="text-sm text-destructive mb-3">{placeError}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div ref={mapContainerRef} className="w-full h-[420px] rounded-lg border border-border/50" />

            <Card className="border-border/50 p-4 mt-3">
              <form onSubmit={handlePlaceSearch} className="flex gap-2">
                <Input
                  value={placeQuery}
                  onChange={(e) => setPlaceQuery(e.target.value)}
                  placeholder="장소 검색 (예: 역삼역, 호텔, 카페)"
                />
                <Button type="submit" variant="outline" className="bg-transparent">
                  검색
                </Button>
              </form>

              {placeResults.length > 0 && (
                <div className="mt-3 max-h-[220px] overflow-auto border border-border/50 rounded-md">
                  {placeResults.map((p) => {
                    const selected = selectedPlaceId === p.id;
                    return (
                      <div key={p.id} className={`p-3 border-b border-border/50 ${selected ? "bg-secondary/30" : ""}`}>
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => {
                            setSelectedPlaceId(p.id);
                            if (mapRef.current) {
                              const lat = Number.parseFloat(p.y);
                              const lng = Number.parseFloat(p.x);
                              if (Number.isFinite(lat) && Number.isFinite(lng)) {
                                mapRef.current.panTo(new window.kakao.maps.LatLng(lat, lng));
                              }
                            }
                          }}
                        >
                          <div className="font-medium text-foreground">{p.place_name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {p.road_address_name || p.address_name}
                          </div>
                        </button>
                        {selected && (
                          <div className="mt-2">
                            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleAddPlaceToList(p)}>
                              담기
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-border/50 p-4 h-[650px] overflow-auto">
              <h3 className="font-black text-foreground mb-3">저장된 위치</h3>
              <div className="space-y-4">
                {grouped.map(([key, group]) => {
                  const title = key === "미지정" ? "미지정" : key;
                  const color = key !== "미지정" ? dateColorMap.get(key) : "#64748B";

                  return (
                    <div key={key} className="border border-border/50 rounded-md">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-sm font-bold text-foreground">{title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{group.length}개</span>
                      </div>

                      <div className="p-2 space-y-2">
                        {group.map((loc) => (
                          <div
                            key={loc.id}
                            draggable
                            onDragStart={() => setDragging({ tripDateKey: key, id: loc.id })}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              if (!dragging) return;
                              if (dragging.tripDateKey !== key) return;
                              const fromIdx = group.findIndex((g) => g.id === dragging.id);
                              const toIdx = group.findIndex((g) => g.id === loc.id);
                              if (fromIdx < 0 || toIdx < 0) return;

                              const next = [...group];
                              const [moved] = next.splice(fromIdx, 1);
                              next.splice(toIdx, 0, moved);
                              handleDropReorder(key, next.map((v) => v.id));
                              setDragging(null);
                            }}
                            className="p-3 rounded border border-border/50 hover:bg-secondary/30"
                          >
                            <button type="button" className="w-full text-left" onClick={() => handleFocusLocation(loc)}>
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-medium text-foreground truncate">
                                  {locationNumberMap.get(loc.id)}. {loc.name}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent border-red-500 text-red-500 hover:bg-red-500/10"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveLocation(loc);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{loc.address || `${loc.lat}, ${loc.lng}`}</div>
                              <div className="text-[10px] text-muted-foreground mt-1">드래그해서 순서 변경</div>
                            </button>
                          </div>
                        ))}
                        {group.length === 0 && (
                          <p className="text-sm text-muted-foreground p-2">저장된 위치가 없습니다.</p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {normalizedLocations.length === 0 && (
                  <p className="text-sm text-muted-foreground">저장된 위치가 없습니다.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Card>
    );
  };

  const renderChecklist = () => (
    <>
      <Card className="border-border/50 p-6">
        <h2 className="text-lg font-black text-foreground mb-4" style={{ fontFamily: notoSansKR }}>
          준비물 추가
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Input value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="아이템 (예: 여권)" />
          <Input value={newItemAssignee} onChange={(e) => setNewItemAssignee(e.target.value)} placeholder="담당자 userId (선택)" />
          <Input value={newItemQuantity} onChange={(e) => setNewItemQuantity(e.target.value)} placeholder="수량" inputMode="numeric" />
        </div>

        <Button onClick={handleAddItem} className="w-full bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          추가
        </Button>
      </Card>

      <Card className="border-border/50 p-6">
        <h2 className="text-lg font-black text-foreground mb-4" style={{ fontFamily: notoSansKR }}>
          준비물 목록
        </h2>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-secondary/30 transition-colors group">
              <button
                onClick={() => handleToggleItem(item)}
                className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  item.isCompleted ? "bg-primary border-primary" : "border-border hover:border-primary"
                }`}
              >
                {item.isCompleted && <Check className="w-4 h-4 text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-medium ${item.isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {item.name}
                </p>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>담당: {item.assignedTo || "미정"}</span>
                  <span>수량: {item.quantity}개</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteItem(item)}
                className="flex-shrink-0 p-2 rounded hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">준비물이 없습니다.</p>}
        </div>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="요기조기" className="w-10 h-10 rounded-lg flex-shrink-0" />
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
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthed && (
                <>
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" className="hover:bg-secondary">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </Button>
                  </Link>
                  <Button variant="ghost" style={{ fontFamily: notoSansKR, fontWeight: 900 }} onClick={logout}>
                    로그아웃
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            className="border-border hover:bg-secondary bg-transparent"
            onClick={() => navigate("/checklist")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-foreground" style={{ fontFamily: notoSansKR }}>
              {checklist?.title || (loading ? "불러오는 중…" : "체크리스트")}
            </h1>
            <p className="text-sm text-muted-foreground">멤버 {members.length}</p>
          </div>
        </div>

        {error && (
          <Card className="p-4 mb-6 border-destructive/50 text-destructive bg-destructive/5">{error}</Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 p-4">
              <div className="flex gap-2">
                <Button
                  variant={tab === "itinerary" ? "default" : "outline"}
                  className={tab === "itinerary" ? "" : "bg-transparent"}
                  onClick={() => setTab("itinerary")}
                >
                  일정 지도
                </Button>
                <Button
                  variant={tab === "checklist" ? "default" : "outline"}
                  className={tab === "checklist" ? "" : "bg-transparent"}
                  onClick={() => setTab("checklist")}
                >
                  짐 체크리스트
                </Button>
              </div>
            </Card>

            {tab === "itinerary" ? renderItinerary() : renderChecklist()}
          </div>

          <div className="lg:col-span-1">
            <Card className="border-border/50 p-6 sticky top-24">
              <h3 className="text-lg font-black text-foreground mb-4" style={{ fontFamily: notoSansKR }}>
                참여 멤버 ({members.length})
              </h3>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-foreground text-sm">{member.name || "알 수 없음"}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
                {members.length === 0 && <p className="text-sm text-muted-foreground">멤버 정보가 없습니다.</p>}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
