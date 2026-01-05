const ACCESS_TOKEN_KEY = "accessToken"

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api"

function notifyAuthChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("auth:changed"))
}

export function getAccessToken() {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}


export function setAccessToken(token) {
  if (typeof window === "undefined") return
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  } else {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
  }
  notifyAuthChanged()
}

export function clearAccessToken() {
  setAccessToken(null)
}

function buildApiUrl(path) {
  if (typeof path !== "string") return path
  if (path.startsWith("http://") || path.startsWith("https://")) return path

  if (path === API_BASE) return path
  if (path.startsWith(`${API_BASE}/`)) return path

  if (!path.startsWith("/")) return `${API_BASE}/${path}`
  return `${API_BASE}${path}`
}

async function refreshAccessToken() {
  const res = await fetch(buildApiUrl("/auth/refresh"), {
    method: "POST",
    credentials: "include",
  })

  // 배포 상황일때 https 이면 refresh 토큰 Secure 옵션 설정

  if (!res.ok) return null

  const data = await res.json().catch(() => null)
  const newToken = data?.accessToken
  if (!newToken) return null

  setAccessToken(newToken)
  return newToken
}

export async function apiFetch(input, init = {}) {
  const headers = new Headers(init.headers || {})
  const token = getAccessToken()
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData

  const requestInput = typeof input === "string" ? buildApiUrl(input) : input

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  if (!isFormData && !headers.has("Content-Type") && init.body != null) {
    headers.set("Content-Type", "application/json")
  }

  const doFetch = (overrideHeaders, overrideBody = init.body) =>
    fetch(requestInput, { 
      ...init, 
      headers: overrideHeaders ?? headers, 
      body: overrideBody,
      credentials: "include" 
    })

  let res
  try {
    res = await doFetch()
  } catch (networkError) {
    // 네트워크 에러 (연결 실패 등)를 그대로 throw하여 호출자가 처리할 수 있도록
    throw networkError
  }
  const inputForChecks = typeof requestInput === "string" ? requestInput : ""
  const shouldTryRefresh =
    res.status === 401 &&
    !!inputForChecks &&
    !inputForChecks.includes("/auth/login") &&
    !inputForChecks.includes("/auth/signup") &&
    !inputForChecks.includes("/auth/refresh") &&
    !inputForChecks.includes("/auth/logout")

  if (!shouldTryRefresh) return res

  const newToken = await refreshAccessToken()
  if (!newToken) return res

  const retryHeaders = new Headers(init.headers || {})
  if (!isFormData && !retryHeaders.has("Content-Type") && init.body != null) {
    retryHeaders.set("Content-Type", "application/json")
  }
  retryHeaders.set("Authorization", `Bearer ${newToken}`)

  // FormData는 스트림이므로 재사용 불가 - 원본 body를 그대로 사용
  return doFetch(retryHeaders, init.body)
}

export async function apiJson(input, init = {}) {
  const res = await apiFetch(input, init)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    let message = data?.message || `HTTP ${res.status}`
    
    // 401 에러인 경우 더 명확한 메시지 제공
    if (res.status === 401) {
      // 토큰 갱신이 실패한 경우
      if (message === "토큰이 유효하지 않습니다." || message.includes("토큰")) {
        // FormData를 사용하는 경우 재시도가 어려우므로 명확한 안내
        const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData
        if (isFormData) {
          message = "로그인이 만료되었습니다. 다시 로그인해주세요."
        }
      }
    }
    
    const error = new Error(message)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

