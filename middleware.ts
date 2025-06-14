import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// 不需要验证的路径
const publicPaths = [
  '/auth/login',
  '/api/auth/login',
];

// 需要验证的路径配置
const onlyVerifiedPaths = [
  {
    path: '/api/posts',
    methods: ['POST', 'PUT', 'DELETE'], // 只拦截修改操作
  }
];

async function verifyToken(token: string) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');
  const secret = new TextEncoder().encode(JWT_SECRET);
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

// 检查路径是否需要验证
function needsVerification(pathname: string, method: string): boolean {
  // 如果是公开路径，不需要验证
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return false;
  }

  // 检查是否需要验证的路径
  return onlyVerifiedPaths.some(({ path, methods }) => {
    if (pathname.startsWith(path)) {
      // 如果指定了方法，则只验证这些方法
      if (methods && methods.length > 0) {
        return methods.includes(method);
      }
      // 如果没有指定方法，则验证所有方法
      return true;
    }
    return false;
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 如果不需要验证，直接放行
  if (!needsVerification(pathname, method)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  // API 路由的验证
  if (pathname.startsWith('/api')) {
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 页面路由的验证
  if (!token || !(await verifyToken(token))) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnPath', encodeURIComponent(pathname));
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/demos/:path*',
  ],
};