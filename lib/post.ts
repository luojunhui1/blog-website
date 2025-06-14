import fs from "fs";
import path from "path";
import { Metadata, Post, PostCache } from "@/types/post";
import { formatDate } from '@/lib/format';

// Keep the metadata simple.
// Since type info is not available in the runtime, we must declare all the fields as string.



// 服务端缓存，只在服务端模块作用域内存在
let postCache: PostCache | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// transform publishDate from yyyy-mm-dd to ISO.
function parseDate(dateString: string): string {
  const publishDate = new Date(dateString);
  if (isNaN(publishDate.getTime())) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  const year = publishDate.getFullYear();
  const month = publishDate.getMonth() + 1;
  const day = publishDate.getDate();

  // Wenxuan followed Beijing time until Augest 2022, and switched to Chicago Time thereafter.
  // By the way, fuck DST, I don't care.
  const utcOffset =
    year < 2022 || (year === 2022 && month <= 8) ? 8 : -6;

  const adjustedDate = new Date(
    Date.UTC(year, month - 1, day, utcOffset),
  );
  return adjustedDate.toISOString();
}

function parseFrontMatter(fileContent: string): {
  metadata: Metadata;
  content: string;
} {
  const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
  const match = frontmatterRegex.exec(fileContent);
  const frontMatterBlock = match![1];
  const content = fileContent.replace(frontmatterRegex, "").trim();
  const frontMatterLines = frontMatterBlock.trim().split("\n");
  const metadata: Partial<Metadata> = {};

  frontMatterLines.forEach(line => {
    const [key, ...valueArr] = line.split(": ");
    let value = valueArr.join(": ").trim();
    value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
    if (key === 'featured') {
      metadata.featured = value === 'true' ? true : false;
    }else{
      metadata[key.trim() as keyof Metadata] = value as never;
    }
  });

  if (metadata.publishDate) {
    metadata.publishDate = parseDate(metadata.publishDate);
  }
  
  return { metadata: metadata as Metadata, content };
}

function getMDXData(dir: string): Post[] {
  const mdxFiles = fs
    .readdirSync(dir)
    .filter(file => file.endsWith(".mdx"));

  return mdxFiles.map(file => {
    const rawContent = fs.readFileSync(path.join(dir, file), "utf-8");
    const { metadata, content } = parseFrontMatter(rawContent);
    const slug = path.basename(file, path.extname(file));
    return {
      metadata,
      content,
      slug,
    };
  });
}


/**
 * 获取所有博客文章，使用服务端缓存优化性能
 * @returns 博客文章列表
 */
export function getPosts(): Post[] {
  // 缓存无效，重新读取数据
  const posts = getMDXData(path.join(process.cwd(), "data/posts"));
  
  // 更新缓存
  postCache = {
    posts: {},
    lastUpdated: Date.now(),
  };
  
  // 只缓存 metadata
  posts.forEach(post => {
    postCache!.posts[post.slug] = post.metadata;
  });

  return posts;
}

/**
 * 获取单个博客文章的完整内容
 * @param slug 博客文章的 slug
 * @returns 博客文章的完整内容
 */
export function getPost(slug: string): Post {
  const filePath = path.join(process.cwd(), "data/posts", `${slug}.mdx`);
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { metadata, content } = parseFrontMatter(rawContent);
  return { metadata, content, slug };
}

/**
 * 清除博客缓存
 * 在更新或删除博客文章后调用此函数
 */
export function clearPostCache(): void {
  postCache = null;
}

export function getPostsCache(): PostCache | null {
  return postCache;
}

// 输入BlogPost，将内容写入对应的文件中
/**
 * 保存博客文章到文件系统
 * @param blog 要保存的博客文章
 * @param originalSlug 原始的文件名（slug），如果提供则表示需要重命名
 */
export function savePost(post: Post, originalSlug?: string): void {
  console.log("savePost", post, originalSlug);
  const postDir = path.join(process.cwd(), "data/posts");
  const newFilePath = path.join(postDir, `${post.slug}.mdx`);

  // 如果提供了originalSlug且与新的slug不同，需要处理重命名
  if (originalSlug && originalSlug !== post.slug) {
    const originalFilePath = path.join(postDir, `${originalSlug}.mdx`);
    
    // 检查原文件是否存在
    if (fs.existsSync(originalFilePath)) {
      // 如果新文件已存在，抛出错误
      if (fs.existsSync(newFilePath)) {
        throw new Error(`File ${post.slug}.mdx already exists`);
      }
      // 删除原文件
      fs.unlinkSync(originalFilePath);
    }
  }

  // 构建frontmatter内容
  const frontmatter = [
    '---',
    ...Object.entries(post.metadata).map(([key, value]) => {
      // 处理日期类型
      if (key === 'publishDate') {
        return `${key}: ${formatDate(value as string)}`;
      }
      // 处理undefined值
      if (value === undefined) {
        return null;
      }
      return `${key}: ${JSON.stringify(value)}`;
    }).filter(Boolean), // 过滤掉null值
    '---',
    '',
    post.content
  ].join('\n');
  // 写入新文件
  fs.writeFileSync(newFilePath, frontmatter, 'utf-8');

  // 清除缓存以便下次读取时获取最新内容
  clearPostCache();
}

/**
 * 保存上传的图片到指定目录
 * @param file 图片文件的 Buffer
 * @param fileName 文件名
 * @returns 保存后的图片路径
 */
export async function saveImage(file: Buffer, fileName: string): Promise<string> {
  const imagesDir = path.join(process.cwd(), "public/images");
  
  // 确保目录存在
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 生成文件路径
  const filePath = path.join(imagesDir, fileName);
  
  // 写入文件
  fs.writeFileSync(filePath, file);
  
  // 返回相对路径（用于前端访问）
  return `/images/${fileName}`;
}

/**
 * 搜索图片名称
 * @param query 搜索字符串
 * @returns 图片的名称列表
 */
export function searchImages(query: string): string[] {
  const imagesDir = path.join(process.cwd(), "public/images");
  const files = fs.readdirSync(imagesDir);
  const imageNames = files.filter(file => encodeURIComponent(file).toLowerCase().includes(encodeURIComponent(query).toLowerCase()));
  // 返回图片的相对路径，不包含public前缀
  return imageNames.map(file => `/images/${file}`);
}