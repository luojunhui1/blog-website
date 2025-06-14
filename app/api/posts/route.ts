import { getPostsCache, getPosts } from '@/lib/post';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const posts = getPostsCache();
    if (!posts) {
        getPosts();
        return NextResponse.json(getPostsCache());
    }
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 

