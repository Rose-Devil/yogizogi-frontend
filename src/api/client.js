const ACCESS_TOKEN_KEY = "accessToken"

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

async function refreshAccessToken() {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })

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

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  if (!isFormData && !headers.has("Content-Type") && init.body != null) {
    headers.set("Content-Type", "application/json")
  }

  const doFetch = (overrideHeaders) =>
    fetch(input, { ...init, headers: overrideHeaders ?? headers, credentials: "include" })

  const res = await doFetch()
  const shouldTryRefresh =
    res.status === 401 &&
    typeof input === "string" &&
    !input.includes("/api/auth/login") &&
    !input.includes("/api/auth/signup") &&
    !input.includes("/api/auth/refresh") &&
    !input.includes("/api/auth/logout")

  if (!shouldTryRefresh) return res

  const newToken = await refreshAccessToken()
  if (!newToken) return res

  const retryHeaders = new Headers(init.headers || {})
  if (!isFormData && !retryHeaders.has("Content-Type") && init.body != null) {
    retryHeaders.set("Content-Type", "application/json")
  }
  retryHeaders.set("Authorization", `Bearer ${newToken}`)

  return doFetch(retryHeaders)
}

export async function apiJson(input, init = {}) {
  const res = await apiFetch(input, init)
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`
    const error = new Error(message)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

