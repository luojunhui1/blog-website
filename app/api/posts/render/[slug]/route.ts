import { serialize } from "next-mdx-remote/serialize";
import { getPost } from '@/lib/post';
import { NextResponse } from "next/server";
// rehype and remark plugins
import rehypePrism from "rehype-prism-plus";
import rehypeCodeTitles from "rehype-code-titles";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import remarkMath from "remark-math";
import pangu from "remark-pangu";


export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        // console.log("render/[slug]/params GET", params);
        const post = getPost(params.slug);
        const mdxSource = await serialize(post.content, {
            mdxOptions: {
                rehypePlugins: [
                  rehypeCodeTitles,
                  rehypePrism as unknown,
                  rehypeKatex as unknown,
                ],
                remarkPlugins: [
                  remarkGfm,
                  remarkMath,
                  remarkUnwrapImages,
                  pangu,
                ],
              }
        });
        return NextResponse.json({ mdxSource });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to render MDX content' },
            { status: 500 }
        );
    }
}