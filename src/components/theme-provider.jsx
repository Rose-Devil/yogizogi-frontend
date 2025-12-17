import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// 백엔드 데이터: 없음.
export function ThemeProvider(props) {
  const { children, ...rest } = props
  return <NextThemesProvider {...rest}>{children}</NextThemesProvider>
}
