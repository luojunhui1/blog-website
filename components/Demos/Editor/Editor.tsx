'use client';

import { MDXEditor } from '@/components/Demos/Editor/WriteArea';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { Post, Metadata, PostCache, defaultPost } from '@/types/post';
import { PostList } from '@/components/Demos/Editor/PostList';
import dynamic from 'next/dynamic';
import { MDXRemoteProps } from 'next-mdx-remote';

// 动态导入MDX组件以避免SSR问题
const Mdx = dynamic(() => import('@/components/Demos/Editor/Render'), {
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <span className="text-sm text-neutral-500">Loading MDX...</span>
    </div>
  ),
  ssr: false,
});

export default function Editor() {
  const [post, setPost] = useState<Post>(defaultPost);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [posts, setPosts] = useState<{ [slug: string]: Metadata }>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [mdxSource, setMdxSource] = useState<MDXRemoteProps | null>(null);
  const [isModified, setIsModified] = useState(false);

  // 验证标题
  const validateTitle = useCallback((title: string): string | null => {
    if (!title || title === 'Untitled') {
      return '标题不能为空或默认值';
    }
    // 检查标题是否符合文件命名规范（只允许字母、数字、中文、连字符和下划线）
    if (!/^[\w\u4e00-\u9fa5-]+$/.test(title)) {
      return '标题只能包含字母、数字、中文、连字符和下划线';
    }
    return null;
  }, []);

  // 保存博客
  const saveBlog = useCallback(async () => {
    if (!post || !isModified) return;

    // 验证标题
    const titleError = validateTitle(post.metadata.title);
    if (titleError) {
      setSaveError(titleError);
      return;
    }

    setSaveError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${selectedSlug || post.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      // 更新本地博客列表状态，确保包含所有必要的metadata字段
      setPosts(prev => ({
        ...prev,
        [post.slug]: {
          ...prev[post.slug],  // 保留原有的metadata
          ...post.metadata,    // 使用新的metadata覆盖
        }
      }));

      // 获取渲染后的内容
      const renderResponse = await fetch(`/api/posts/render/${post.slug}`);
      const renderData = await renderResponse.json();
      setMdxSource(renderData.mdxSource);

      // 重置修改状态
      setIsModified(false);

    } catch (error) {
      console.error('Error saving blog:', error);
      setSaveError('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [post, selectedSlug, validateTitle]);

  // 监听Command+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveBlog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveBlog]);

  // 获取所有博客的缓存信息
  const fetchBlogs = useCallback(() => {
    setIsPostsLoading(true);
    fetch('/api/posts')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch blogs');
        return response.json();
      })
      .then((data: PostCache) => {
        if (data && data.posts) {
          setPosts(data.posts);
        }
      })
      .catch(error => {
        console.error('Error fetching blogs:', error);
      })
      .finally(() => {
        setIsPostsLoading(false);
      });
  }, []);

  // 初始化时获取博客列表
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleMetadataUpdate = (newMetadata: Metadata) => {
    if (!post) return;

    setPost(prev => ({ ...prev, metadata: newMetadata, slug: newMetadata.title || prev.slug }));
    setIsModified(true);
    setSaveError(null);
  };

  const handleContentUpdate = (newContent: string) => {
    if (!post) return;
    setPost(prev => ({ ...prev, content: newContent }));
    setIsModified(true);
  };

  const handleSelectPost = async (slug: string) => {
    // 如果选择的是当前正在编辑的博客，不做任何操作
    if (selectedSlug === slug) return;

    // 如果当前博客有未保存的修改，先保存
    if (isModified) {
      await saveBlog();
    }

    setSelectedSlug(slug);
    setIsLoading(true);
    setSaveError(null);
    setMdxSource(null);
    setIsModified(false);  // 重置修改状态

    // 如果是新建的默认博客，直接使用默认值
    if (slug === defaultPost.slug) {
      setPost(defaultPost);
      setIsLoading(false);
      
      // 获取默认内容的渲染
      fetch(`/api/posts/render/${slug}`)
        .then(response => response.json())
        .then(data => {
          setMdxSource(data.mdxSource);
        });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch blog');
      const data = await response.json();
      
      setPost(data);
      setIsLoading(false);

      const renderResponse = await fetch(`/api/posts/render/${slug}`);
      const renderData = await renderResponse.json();
      setMdxSource(renderData.mdxSource);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setSaveError('加载博客失败，请重试');
      setIsLoading(false);
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex h-full items-center justify-center">
  //       <span className="text-sm text-neutral-500">Loading editor...</span>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="w-[15%] border-r border-neutral-200">
        <PostList 
          posts={posts} 
          onSelect={handleSelectPost} 
          isLoading={isPostsLoading}
          selectedSlug={selectedSlug}
        />
      </div>
      <div className="w-[40%] border-r border-neutral-200">
        {post ? (
          <>
            <MDXEditor
              metadata={post.metadata}
              onMetadataUpdate={handleMetadataUpdate}
              content={post.content}
              onContentUpdate={handleContentUpdate}
              isModified={isModified}
            />
            {saveError && (
              <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-lg">
                {saveError}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-neutral-500">Select a post to edit or create a new one</span>
          </div>
        )}
      </div>
      <div className="w-[45%]">
        <Suspense fallback={
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-neutral-500">Loading preview...</span>
          </div>
        }>
          <Mdx post={post} source={mdxSource} />
        </Suspense>
      </div>
    </>
  );
}