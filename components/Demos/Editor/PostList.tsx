"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Metadata, defaultPost } from '@/types/post';
import { formatDate } from '@/lib/format';
import { fetchWithAuth } from '@/lib/interceptor';

interface PostListProps {
  posts: { [slug: string]: Metadata };
  onSelect?: (slug: string) => void;
  isLoading?: boolean;
  selectedSlug?: string;  // 添加选中的博客slug属性
}

export function PostList({ 
  posts: initialPosts, 
  onSelect, 
  isLoading = false,
  selectedSlug 
}: PostListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState(initialPosts);
  const latestPostRef = useRef<string | null>(null);

  // 更新blogs当initialBlogs改变时
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // 创建新博客
  const handleNewBlog = async () => {
    try {
      const response = await fetchWithAuth('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(defaultPost)
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const newBlog = await response.json();
      
      // 更新本地状态
      setPosts(prev => ({
        ...prev,
        [newBlog.slug]: newBlog.metadata
      }));

      // 记录最新创建的博客slug
      latestPostRef.current = newBlog.slug;

      // 自动选择新创建的博客
      onSelect?.(newBlog.slug);
    } catch (error) {
      console.error('Failed to create blog:', error);
      // 这里可以添加错误提示
    }
  };

  // 根据搜索词过滤博客列表
  const filteredBlogs = Object.entries(posts || {})
    .filter(([slug, metadata]) => 
      slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (metadata.series && metadata.series.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    // 排序：最新创建的博客在最前，然后是草稿，最后按标题排序
    .sort(([slugA, a], [slugB, b]) => {
      // 最新创建的博客始终在最前
      if (slugA === latestPostRef.current) return -1;
      if (slugB === latestPostRef.current) return 1;
      
      // 然后按状态排序（draft 在前）
      if (a.status !== b.status) {
        return a.status === 'draft' ? -1 : 1;
      }
      // 最后按标题排序
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="h-[85vh] flex flex-col">
      <div className="h-12 flex items-center gap-2 px-4 border-b border-neutral-200">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 px-3 text-sm bg-neutral-100 rounded-md border border-transparent focus:border-neutral-300 focus:outline-none"
            disabled={isLoading}
          />
        </div>
        <button 
          onClick={handleNewBlog}
          className="flex-none w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-md disabled:opacity-50"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-neutral-500">Loading blogs...</span>
          </div>
        ) : filteredBlogs.length > 0 ? (
          filteredBlogs.map(([slug, metadata]) => (
            <div
              key={slug}
              onClick={() => onSelect?.(slug)}
              className={`p-4 border-b border-neutral-200 hover:bg-neutral-50 cursor-pointer relative ${
                selectedSlug === slug ? 'bg-neutral-100' : ''
              }`}
            >
              {metadata.series && (
                <span className="absolute top-2 right-2 text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                  {metadata.series}
                </span>
              )}
              <h3 className={`text-sm mb-1 truncate pr-20 ${
                selectedSlug === slug ? 'font-bold' : 'font-medium'
              }`}>
                {metadata.title}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-neutral-500">
                  {formatDate(metadata.publishDate)}
                </span>
                <div className="flex items-center gap-2">
                  {metadata.featured && (
                    <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                      featured
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    metadata.status === 'published' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {metadata.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-neutral-500">No blogs found</span>
          </div>
        )}
      </div>
    </div>
  );
} 