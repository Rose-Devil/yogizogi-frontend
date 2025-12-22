import { apiFetch, apiJson, clearAccessToken, setAccessToken } from "./client"

export async function login({ email, password }) {
  const data = await apiJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  if (data?.accessToken) setAccessToken(data.accessToken)
  return data
}

export async function signup({ email, password, nickname, url }) {
  const data = await apiJson("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, nickname, url }),
  })

  if (data?.accessToken) setAccessToken(data.accessToken)
  return data
}

export async function me() {
  return apiJson("/api/auth/me")
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" })
  } finally {
    clearAccessToken()
  }
}

