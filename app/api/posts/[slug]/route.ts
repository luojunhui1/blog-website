import { getPost, savePost, clearPostCache } from '@/lib/post';
import { defaultPost } from '@/types/post';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    if (params.slug === "Untitled") {
      return NextResponse.json(defaultPost);
    }
    const post = getPost(params.slug);
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: 'Blog not found' },
      { status: 404 }
    );
  }
}

// 调用saveBlogPost，用户保存博客内容到服务器
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await request.json();
    const originalSlug = params.slug;
    console.log(post, params, originalSlug);
    
    // Validate required fields
    if (!post.metadata) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 检查是否需要重命名文件
    if (post.slug !== originalSlug) {
      savePost(post, originalSlug);
    } else {
      savePost(post);
    }

    // Clear the blog cache
    clearPostCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}


