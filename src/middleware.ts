import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 갱신
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 현재 경로
  const { pathname } = request.nextUrl

  // 정적 파일 및 API 경로는 먼저 체크해서 제외 (가장 중요!)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|css|js)$/)
  ) {
    return supabaseResponse
  }

  // 공개 경로 (로그인 없이 접근 가능)
  const publicPaths = [
    '/login',
    '/signup',
    '/select-type',
    '/onboarding', // 구글 등 기본 온보딩
    '/onboarding/naver', // 네이버 전용 온보딩
    '/find-password',
    '/reset-password',
    '/verify-email',
    '/artwork', // 작품 상세 페이지는 공개
    '/auth/callback/naver', // 네이버 로그인 콜백 경로
  ]

  // 소셜 로그인 사용자의 추가 정보 체크
  if (user && !pathname.startsWith('/onboarding') && !publicPaths.includes(pathname)) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, gender, age_range, nickname, phone')
        .eq('id', user.id)
        .single()

      const provider = user.app_metadata?.provider || 'email'
      
      if (provider !== 'email') {
        // 프로필이 없으면 기본 온보딩으로 (최초)
        if (!profile) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }
        
        // user_type이 없는 경우, provider에 따라 분기
        if (!profile.user_type) {
          const url = request.nextUrl.clone()
          if (provider === 'naver') {
            url.pathname = '/onboarding/naver'
          } else {
            url.pathname = '/onboarding'
          }
          return NextResponse.redirect(url)
        }
        
        // user_type이 있지만 추가 정보가 필요한 경우 (구글 등)
        const isGuest = profile.user_type === 'guest'
        const isArtist = profile.user_type === 'artist'
        
        const needsOnboarding = (isGuest && (!profile.gender || !profile.age_range)) ||
                                (isArtist && (!profile.nickname || !profile.phone))
        
        if (needsOnboarding) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      const provider = user.app_metadata?.provider || 'email'
      if (provider !== 'email') {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    }
  }

  // 루트 경로 처리
  if (pathname === '/') {
    if (!user) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // 공개 경로는 로그인 여부 상관없이 접근 허용
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    // 이미 로그인된 사용자가 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
    if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // 로그인이 필요한 모든 경로
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // 원래 접근하려던 경로를 쿼리 파라미터로 저장 (로그인 후 돌아가기 위해)
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

