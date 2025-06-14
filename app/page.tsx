import WelcomeCard from "@/components/UI/Homepage/WelcomeCard";
import DynJump from "@/components/UI/Homepage/DynJump";
import PostsView from "@/components/UI/Homepage/PostPage";

export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-2 h-[85vh]">
      <WelcomeCard />
      <div className="py-4">
        <DynJump />
        <PostsView feature_only />
      </div>
    </div>
  );
}
