'use client';

import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

interface SeriesPost {
  title: string;
  slug: string;
}

const Series = ({ slug, series }: { slug: string; series: string }) => {
  const [seriesPosts, setSeriesPosts] = useState<SeriesPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeriesPosts = async () => {
      try {
        const response = await fetch(`/api/posts/series/${encodeURIComponent(series)}`);
        if (!response.ok) throw new Error('Failed to fetch series posts');
        const posts = await response.json();
        setSeriesPosts(posts);
      } catch (error) {
        console.error('Error fetching series posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesPosts();
  }, [series]);

  if (isLoading) {
    return (
      <div className="not-prose relative m-4 break-inside-avoid-page rounded-lg border-2 border-violet-200/80 bg-violet-200/5 p-4 font-sans">
        <div className="absolute left-0 top-0 flex items-center justify-center space-x-2 border-b border-r border-violet-300/80 bg-violet-300/10 px-2 font-bold">
          <BookOpenIcon className="h-6 w-6" />
          <div>{series}</div>
        </div>
        <div className="pt-6">Loading series posts...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="not-prose relative m-4 break-inside-avoid-page rounded-lg border-2 border-violet-200/80 bg-violet-200/5 p-4 font-sans">
        <div className="absolute left-0 top-0 flex items-center justify-center space-x-2 border-b border-r border-violet-300/80 bg-violet-300/10 px-2 font-bold">
          <BookOpenIcon className="h-6 w-6" />
          <div>{series}</div>
        </div>
        <ul className="list-inside list-decimal pt-6">
          {seriesPosts.map(({ slug: postSlug, title }) => (
            <li
              key={postSlug}
              className={`${postSlug === slug && "font-bold"}`}>
              <Link
                href={`/posts/${postSlug}`}
                className="rounded-sm p-1 transition-all hover:bg-violet-800/5">
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Series;
