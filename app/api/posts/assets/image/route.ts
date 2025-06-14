import { NextRequest, NextResponse } from 'next/server';
import { saveImage, searchImages } from '@/lib/post';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // 验证文件大小（6MB）
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 6MB' },
        { status: 400 }
      );
    }

    // 将文件转换为 Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 保存图片
    const imagePath = await saveImage(buffer, fileName);

    return NextResponse.json({ success: true, path: imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// 搜索图片列表
export async function GET(request: NextRequest,
  { params }: { params: { query: string } }
) {
  const query = request.nextUrl.searchParams.get('query');
  const images = searchImages(query);
  return NextResponse.json({ images });
}