import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isAppRoute = url.pathname.startsWith('/marketplace') || url.pathname.startsWith('/messages') || url.pathname.startsWith('/board') || url.pathname.startsWith('/profile') || url.pathname.startsWith('/create-listing');

  if (!user && isAppRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && (url.pathname === '/login' || url.pathname === '/signup')) {
    url.pathname = '/marketplace';
    return NextResponse.redirect(url);
  }

  if (url.pathname === '/') {
    url.pathname = user ? '/marketplace' : '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
