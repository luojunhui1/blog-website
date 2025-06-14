import { getPosts } from "@/lib/post";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const series = decodeURIComponent(params.slug);
  const posts = getPosts()
    .filter(p => p.metadata.series === series && p.metadata.status === "published")
    .sort(
      (a, b) =>
        new Date(a.metadata.publishDate).getTime() -
        new Date(b.metadata.publishDate).getTime(),
    )
    .map(p => ({
      title: p.metadata.title,
      slug: p.slug,
    }));

  return NextResponse.json(posts);
}