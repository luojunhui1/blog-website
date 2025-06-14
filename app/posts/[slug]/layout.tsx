import dynamic from "next/dynamic";
import { formatDate, formatDateShort } from "@/lib/format";

// temperory fix for nextjs /app scrolling issues
import ScrollUp from "@/components/UI/Website/ScrollUp";

// intra-blog components
import Prose from "@/components/Layouts/Prose";
const Comment = dynamic(() => import("@/components/UI/Blog/Comment"));
const License = dynamic(() => import("@/components/UI/Blog/License"));
const Series = dynamic(() => import("@/components/UI/Blog/Series"));

import metadata from "@/data/metadata";
import { getPosts } from "@/lib/post";

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const allPosts = getPosts();
  const post = allPosts.find(p => encodeURIComponent(p.slug) === params.slug);
  
  // 如果post为空，或者post的状态为draft，则显示Not Prepared界面
  if (!post || post.metadata.status === 'draft') {
    return <div className="h-[85vh] flex items-center justify-center">Not Prepared</div>;
  }

  return (
    <div>
      <ScrollUp />
      <div className="bg-gray-100">
        <article className="pb-5 font-article sm:pt-10 w-[35vw] mx-auto">
          <Prose>
            <h1>{post.metadata.title}</h1>
            <div className="-mt-5 flex items-center justify-between pb-5 font-sans text-sm lg:text-base">
              <div className="inline-flex items-center space-x-1">
                <div>{metadata.author.name} / </div>
                <span>
                  {formatDateShort(post.metadata.publishDate)}
                </span>
              </div>
            </div>
            {post.metadata.series && (
              <Series
                slug={post.slug}
                series={post.metadata.series}
              />
            )}
            {children}
            {post.metadata.series && (
              <Series
                slug={post.slug}
                series={post.metadata.series}
              />
            )}
            <License />
          </Prose>
        </article>
        <div className="pb-10">
          <Comment slug={post.slug} />
        </div>
      </div>
    </div>
  );
}
