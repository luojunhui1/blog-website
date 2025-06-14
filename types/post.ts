export interface Metadata {
    title: string;
    publishDate: string;
    summary: string;
    status: 'published' | 'draft';
    series?: string;
    image?: string;
    featured?: boolean;
  };

  export type Post = {
    metadata: Metadata;
    content: string;
    slug: string;
  };

  export type PostCache = {
    posts: { [slug: string]: Metadata };
    lastUpdated: number;
  };

  export const defaultPost: Post = {
    metadata: {
      title: 'Untitled',
      summary: '',
      publishDate: new Date().toISOString(),
      status: 'draft',
      series: undefined,
      image: undefined,
      featured: false
    },
    content: '',
    slug: 'Untitled',
  }
  