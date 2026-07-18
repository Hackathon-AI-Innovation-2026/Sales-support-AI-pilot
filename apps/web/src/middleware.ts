import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("refresh_token")?.value
  const { pathname } = request.nextUrl

  // Identify path categories
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/tasks")

  const isAuthPath = pathname.startsWith("/login")

  // Redirect unauthenticated users trying to access protected pages
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect authenticated users trying to access login page
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Handle index page fallback redirection based on token existence
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (internal API endpoints)
     * - _next/static (static build assets)
     * - _next/image (image optimization assets)
     * - favicon.ico, next.svg, vercel.svg (logo files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)",
  ],
}
