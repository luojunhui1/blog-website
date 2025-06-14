import { format, parseISO, compareDesc } from "date-fns";
import PostCard from "@/components/UI/Homepage/PostCard";
import { getPosts } from "@/lib/post";

const PostsView = ({ feature_only = false }) => {
  const allPosts = getPosts();

  const posts = allPosts.sort((p1, p2) =>
    compareDesc(
      parseISO(p1.metadata.publishDate),
      parseISO(p2.metadata.publishDate),
    ),
  );
  let filteredBlogPosts = posts;
  if (feature_only) {
    filteredBlogPosts = posts.filter(
      post => post.metadata.featured === true,
    );
  }
  return (
    <div className="primary mx-auto mt-4 space-y-6 py-5 sm:mt-10 sm:px-4">
      {filteredBlogPosts.map(post => (
        <PostCard
          key={post.metadata.title}
          title={post.metadata.title}
          url={`/posts/${post.slug}`}
          date={format(
            parseISO(post.metadata.publishDate),
            "yyyy-LL-dd",
          )}
          summary={post.metadata.summary}
          showSummary={true}
        />
      ))}
    </div>
  );
};

export default PostsView;
