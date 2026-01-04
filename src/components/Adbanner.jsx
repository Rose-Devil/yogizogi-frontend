// components/AdBanner.jsx
import { X } from "lucide-react";
import { useState, useEffect } from "react";

// 광고 데이터 - 2개만 사용
const AD_DATA = [
  {
    id: 1,
    image: "/unigen.png",
    link: "https://unigensns.duckdns.org/",
    alt: "여행 상품 광고",
  },
  {
    id: 2,
    image: "/trip%20canvas.png",
    link: "https://sunlike-diametrically-marta.ngrok-free.dev/",
    alt: "호텔 예약 광고",
  },
];

export default function AdBanner({ className = "" }) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // 광고 순환 (5초마다 자동 변경)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % AD_DATA.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentAd = AD_DATA[currentAdIndex];

  return (
    <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 ${className}`}>
      <div className="relative bg-card border border-border rounded-lg shadow-lg overflow-hidden w-64">
        {/* 닫기 버튼 */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
          aria-label="광고 닫기"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 광고 링크 */}
        <a
          href={currentAd.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          {/* 광고 이미지 */}
          <div className="relative overflow-hidden bg-secondary">
            <img
              src={currentAd.image}
              alt={currentAd.alt}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = "/placeholder.svg";
              }}
            />

            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* 광고 라벨 */}
          <div className="px-3 py-2 bg-muted/50">
            <p className="text-xs text-muted-foreground text-center"></p>
          </div>
        </a>

        {/* 광고 인디케이터 */}
        <div className="flex justify-center gap-1 py-2 bg-card">
          {AD_DATA.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentAdIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentAdIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/30"
              }`}
              aria-label={`광고 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ==============================================
// 사용 예시: ProfilePage.jsx
// ==============================================
/*
import AdBanner from "@/components/AdBanner";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <header>...</header>
      <main>...</main>

      {/* 광고 배너 추가 *\/}
      <AdBanner />
    </div>
  );
}
*/

// ==============================================
// 또는 Layout.jsx에서 전체 페이지에 적용
// ==============================================
/*
import { Outlet } from "react-router-dom";
import AdBanner from "@/components/AdBanner";

export default function Layout() {
  return (
    <div className="relative min-h-screen">
      <Outlet />
      <AdBanner />
    </div>
  );
}
*/
