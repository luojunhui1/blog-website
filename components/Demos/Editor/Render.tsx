'use client';

import metadata from "@/data/metadata";
import dynamic from "next/dynamic";
import { useMemo, Component, ReactNode } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import MDXComponents from '@/components/MDX/MDXComponents';
import { MDXRemoteProps } from 'next-mdx-remote';
import { Post } from '@/types/post';
import ScrollUp from "@/components/UI/Website/ScrollUp";
import { formatDateShort } from "@/lib/format";
// intra-blog components
import Prose from "@/components/Layouts/Prose";
const Comment = dynamic(() => import("@/components/UI/Blog/Comment"));
const License = dynamic(() => import("@/components/UI/Blog/License"));
const Series = dynamic(() => import("@/components/UI/Blog/Series"));

interface MdxProps {
  post: Post;
  source: MDXRemoteProps;
}

// 错误提示组件
interface ErrorDisplayProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

const ErrorDisplay = ({ error, errorInfo }: ErrorDisplayProps) => (
  <div className="p-4 rounded-md bg-red-50 border border-red-200">
    <p className="text-red-600 font-medium">Not prepared</p>
    <p className="text-sm text-red-500 mt-1">The content cannot be rendered at this moment.</p>
    
    {/* 开发环境下显示详细错误信息 */}
    {process.env.NODE_ENV === 'development' && error && (
      <div className="mt-4 space-y-2">
        <details className="text-sm">
          <summary className="text-red-600 cursor-pointer hover:text-red-700">
            Show error details
          </summary>
          <div className="mt-2 p-2 bg-red-100 rounded overflow-auto">
            <p className="font-mono text-red-800">{error.name}: {error.message}</p>
            {error.stack && (
              <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
            {errorInfo && (
              <div className="mt-2 border-t border-red-200 pt-2">
                <p className="text-xs text-red-600 font-medium">Component Stack:</p>
                <pre className="mt-1 text-xs text-red-700 whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </details>
      </div>
    )}
  </div>
);

// MDX渲染错误边界组件
class MDXErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MDX Rendering Error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

// MDX渲染包装组件
function SafeMDXRemote(props: MDXRemoteProps & { components: any }) {
  try {
    return <MDXRemote {...props} />;
  } catch (error) {
    console.error('MDX Rendering Error:', error);
    return <ErrorDisplay error={error instanceof Error ? error : new Error(String(error))} />;
  }
}

function Mdx({ post, source }: MdxProps) {
  const content = useMemo(() => {
    

    return (
      <div className="h-[85vh] relative">
        <div className="absolute inset-0 mx-auto w-[210mm] max-w-full bg-white shadow-md overflow-y-auto scrollbar-hide">
          <div className="py-[5mm]">
            <ScrollUp />
            {source ? (
            <article className="pb-5 font-article">
              <Prose>
                <h1>{post.metadata.title}</h1>
                <div className="-mt-5 flex items-center justify-between pb-5 font-sans text-sm lg:text-base">
                  <div className="inline-flex items-center space-x-2">
                    <span>{metadata.author.name}</span>
                    <span>/</span>
                    <span>{formatDateShort(post.metadata.publishDate)}</span>
                  </div>
                </div>
                {post.metadata.series && (
                  <Series
                    slug={post.slug}
                    series={post.metadata.series}
                  />
                )}
                <div className="min-h-[50vh]">
                  <MDXErrorBoundary>
                    <SafeMDXRemote {...source} components={{...MDXComponents}} />
                  </MDXErrorBoundary>
                </div>
                {post.metadata.series && (
                  <Series
                    slug={post.slug}
                    series={post.metadata.series}
                  />
                )}
                <License />
              </Prose>
            </article>
            ) : (
              <div className="text-center text-lg text-bold text-gray-500"> Not prepared</div>
            )}
            <div className="pb-10">
              <Comment slug={post.slug} />
            </div>  
          </div>
        </div>
      </div>
    );
  }, [source, post]);

  return content;
}

export default Mdx;