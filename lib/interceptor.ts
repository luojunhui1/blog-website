'use client';

type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function fetchWithAuth(url: string, options: FetchOptions = {}) {
  const { skipAuth = false, ...fetchOptions } = options;

  if (!skipAuth) {
    // 不需要手动添加 token，因为 cookies 会自动随请求发送
    fetchOptions.credentials = 'include';
  }

  try {
    const response = await fetch(url, fetchOptions);

    // 处理 401 未授权错误
    if (response.status === 401) {
      // 获取当前完整 URL（包括查询参数）
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname + window.location.search;
      
      // 如果当前不在登录页面，则重定向
      if (!currentPath.startsWith('/auth/login')) {
        // 使用 replace 而不是 href 赋值，这样不会在历史记录中留下未授权的页面
        window.location.replace(`/auth/login?returnPath=${encodeURIComponent(currentPath)}`);
        throw new Error('Unauthorized - Redirecting to login');
      }
    }

    return response;
  } catch (error) {
    // 如果是未授权错误且已经触发重定向，则不再抛出错误
    if (error instanceof Error && error.message === 'Unauthorized - Redirecting to login') {
      return new Response(null, { status: 401 });
    }
    console.error('Fetch error:', error);
    throw error;
  }
}