import { BlogListingClient } from "@/components/blog/BlogListingClient";
import { getAllBlogPostsAction } from "@/app/actions/cms-actions";

export const metadata = {
    title: "Blog | Bodhi Board",
    description: "Insights, ideas, and best practices to build and run better schools from the Bodhi Board team.",
};

export default async function BlogListingPage() {
    const posts = await getAllBlogPostsAction();
    return <BlogListingClient initialPosts={posts} />;
}
