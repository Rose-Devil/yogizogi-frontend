import { apiFetch, apiJson, clearAccessToken, setAccessToken } from "./client"

export async function login({ email, password }) {
  const data = await apiJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })

  if (data?.accessToken) setAccessToken(data.accessToken)
  return data
}

export async function signup({ email, password, nickname, url, signupTicket }) {
  const data = await apiJson("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, nickname, url, signupTicket }),
  })

  if (data?.accessToken) setAccessToken(data.accessToken)
  return data
}

export async function signupRequestCode({ email }) {
  return apiJson("/api/auth/signup/request-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function signupVerifyCode({ email, code }) {
  return apiJson("/api/auth/signup/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  })
}

export async function changeEmailRequestCode({ email }) {
  return apiJson("/api/auth/email/change/request-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function changeEmailVerifyCode({ email, code }) {
  return apiJson("/api/auth/email/change/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  })
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

