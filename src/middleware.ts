import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas públicas (sin necesidad de autenticación)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/error',
  '/pricing',
  '/generar-cv',
  '/api',
  '/_next',
  '/images',
];

// Rutas accesibles solo para usuarios no autenticados
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  // Verificar si es una ruta pública o de recursos estáticos sin necesidad de verificar token
  const isStaticAsset = pathname.includes('/_next') ||
    pathname.includes('/images') ||
    pathname.includes('/locales') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.json') ||
    pathname.includes('/api/auth');

  const isPublicRoute = publicRoutes.some(route =>
    route === '/' ? pathname === route : pathname.startsWith(route)
  );

  if (isStaticAsset || isPublicRoute) {
    return NextResponse.next();
  }


  // 🔐 Obtener token del usuario autenticado con opciones optimizadas
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXT_PUBLIC_API_NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
      cookieName: "next-auth.session-token",
    });

    const isAuthRoute = authRoutes.some(route =>
      pathname === route || pathname.startsWith(route)
    );

    const response = NextResponse.next();

    // 🔐 Redirigir si el usuario NO tiene sesión y la ruta NO es pública
    if (!token) {
      console.log("El token no existe", token);
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // 🔁 Redirigir si el usuario YA está autenticado e intenta acceder a login/register
    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    // 🛡️ Encabezados de seguridad
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://*.stripe.com;
        font-src 'self';
        connect-src 'self' https://api.stripe.com;
        frame-src https://js.stripe.com https://hooks.stripe.com;
      `.replace(/\s+/g, ' ').trim(),
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Error verificando sesión:', error);
    // En caso de error al verificar la sesión, permitir continuar para evitar bloqueos
    return NextResponse.next();
  }
}

// 🧩 Define qué rutas aplica este middleware - OPTIMIZADO
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)',
  ],
};
