'use client';

import { useAuth } from '@/components/Auth/Context';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import crypto from 'crypto';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, loginAsGuest, isGuest } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 加密密码
  const encryptPassword = (password: string) => {
    return crypto
      .createHash('sha256')
      .update(password + process.env.NEXT_PUBLIC_PASSWORD_SALT || '')
      .digest('hex');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 发送加密后的密码
      await login(encryptPassword(password));
    } catch (err) {
      setError('Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
  };

  // 如果用户已经登录，直接重定向到返回路径
  useEffect(() => {
    if (isAuthenticated || isGuest) {
      const returnPath = searchParams.get('returnPath');
      const decodedPath = decodeURIComponent(returnPath || '/');
      router.replace(decodedPath);
    }
  }, [isAuthenticated, isGuest, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
            Authentication Required
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Please enter your password to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-neutral-300 placeholder-neutral-500 text-neutral-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Authenticating...' : 'Sign in'}
            </button>
            
            <button
              type="button"
              onClick={handleGuestLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue as Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}