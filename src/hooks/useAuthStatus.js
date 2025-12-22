import { useEffect, useState } from "react"
import { logout as apiLogout } from "@/api/auth"
import { getAccessToken } from "@/api/client"

export function useAuthStatus() {
  const [isAuthed, setIsAuthed] = useState(!!getAccessToken())

  useEffect(() => {
    const sync = () => setIsAuthed(!!getAccessToken())

    sync()
    window.addEventListener("auth:changed", sync)
    window.addEventListener("storage", sync)

    return () => {
      window.removeEventListener("auth:changed", sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const logout = async () => {
    await apiLogout()
  }

  return { isAuthed, logout }
}
