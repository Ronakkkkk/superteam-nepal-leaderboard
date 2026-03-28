import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const secret = process.env.ADMIN_SECRET_KEY

  if (!secret || password !== secret) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_session', secret, {
    httpOnly: true,
    maxAge:   60 * 60 * 8,
    sameSite: 'strict',
    secure:   true,
    path:     '/',
  })

  return response
}
