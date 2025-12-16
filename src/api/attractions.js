// 서버 프록시를 통해 관광/맛집 데이터를 조회합니다.
export async function getAttractions(lat, lng, type = "attraction") {
  if (!lat || !lng) {
    return { success: false, data: [], error: "위도/경도가 필요합니다." }
  }

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      type,
    })

    const response = await fetch(`/api/attractions?${params.toString()}`)
    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || `API ${response.status}`)
    }

    return { success: true, data: data.data || [], error: null }
  } catch (error) {
    console.error("API Error:", error)
    const message =
      error instanceof Error ? error.message : "관광/맛집 데이터를 불러오지 못했습니다."
    return { success: false, data: [], error: message }
  }
}

