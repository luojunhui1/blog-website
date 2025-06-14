import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const PASSWORD_SALT = process.env.NEXT_PUBLIC_PASSWORD_SALT

// Helper function to encrypt password
const encryptPassword = (password: string) => {
  return crypto
    .createHash('sha256')
    .update(password + (PASSWORD_SALT || ''))
    .digest('hex');
};

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Encrypt stored admin password for comparison
    const encryptedAdminPassword = encryptPassword(ADMIN_PASSWORD);

    if (password !== encryptedAdminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');
    const secret = new TextEncoder().encode(JWT_SECRET);
    const now = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + 60 * 60 * 24) // 24小时
      .sign(secret);

    // 创建响应对象
    const response = NextResponse.json({ token });
    
    // 设置 auth_token cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true, // 防止 JavaScript 访问
      secure: process.env.NODE_ENV === 'production', // 在生产环境中只通过 HTTPS 发送
      sameSite: 'lax', // 防止 CSRF 攻击
      maxAge: 60 * 60 * 24, // 24小时过期
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}