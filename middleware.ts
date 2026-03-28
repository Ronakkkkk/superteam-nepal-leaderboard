import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow /admin/login through without auth check
  if (pathname === '/admin/login') return NextResponse.next()

  const session = request.cookies.get('admin_session')
  const secret  = process.env.ADMIN_SECRET_KEY

  if (!session || !secret || session.value !== secret) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/(.+)'],
}
