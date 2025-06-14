import React from 'react';
import { getPostsCache, getPosts } from '@/lib/post';

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let posts = getPostsCache()?.posts;
  if (!posts) {
    getPosts();
    posts = getPostsCache()?.posts;
  }

  return (
    <div className="flex flex-1 justify-center h-[85vh]">
    <div className="flex w-[95vw] bg-white">
      {children}
    </div>
    </div>
  );
} 