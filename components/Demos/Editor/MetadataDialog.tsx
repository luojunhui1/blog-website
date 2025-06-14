"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Metadata } from '@/types/post';
import Image from 'next/image';

interface MetadataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: Metadata;
  onUpdate: (metadata: Metadata) => void;
}

//增加函数校验，在上传系统前确保上传的图片名称正确，不包含空格和影响文件保存的字符

// 文件名验证函数
const sanitizeFileName = (fileName: string): string => {
  // 移除文件扩展名
  const [name, ext] = fileName.split('.');
  
  // 替换非法字符为连字符
  const sanitized = name
    .toLowerCase()
    // 替换空格和特殊字符为连字符
    .replace(/[^a-z0-9]/g, '-')
    // 替换多个连续连字符为单个连字符
    .replace(/-+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '');
    
  return `${sanitized}.${ext}`;
};

// 验证文件名是否合法
const isValidFileName = (fileName: string): boolean => {
  // 检查文件名长度
  if (fileName.length > 255) return false;
  
  // 检查是否包含非法字符
  const invalidChars = /[<>:"/\\|?*\s]/;
  if (invalidChars.test(fileName)) return false;
  
  // 检查文件扩展名
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !validExtensions.includes(ext)) return false;
  
  return true;
};

export function MetadataDialog({ isOpen, onClose, metadata, onUpdate }: MetadataDialogProps) {
  const [localMetadata, setLocalMetadata] = useState(metadata);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // 监听 isOpen 和 metadata 的变化，更新 localMetadata
  useEffect(() => {
    if (isOpen) {
      setLocalMetadata(metadata);
    }
  }, [isOpen, metadata]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（6MB限制）
    if (file.size > 6 * 1024 * 1024) {
      alert('Image size should be less than 6MB');
      return;
    }

    // 验证原始文件名
    if (!isValidFileName(file.name)) {
      alert('Invalid file name. Please ensure the file name:\n- Contains no spaces or special characters\n- Has a valid image extension (jpg, jpeg, png, gif, webp)\n- Is not too long');
      return;
    }

    // 处理文件名
    const sanitizedFileName = sanitizeFileName(file.name);
    
    // 创建 FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', sanitizedFileName);

    try {
      const response = await fetch('/api/posts/assets/image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      
      // 创建新的 metadata 对象
      const updatedMetadata = {
        ...localMetadata,
        image: data.path,
      };
      
      // 更新本地状态
      setLocalMetadata(updatedMetadata);
      // 立即通知父组件
      onUpdate(updatedMetadata);

      console.log("localMetadata", updatedMetadata);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    }
  };

  const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadStatus(`Validating and uploading 0/${files.length} files...`);
    
    let successCount = 0;
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 6 * 1024 * 1024) {
        setUploadStatus(`Skipping ${file.name}: File size exceeds 6MB`);
        continue;
      }

      if (!isValidFileName(file.name)) {
        setUploadStatus(`Skipping ${file.name}: Invalid file name`);
        continue;
      }

      // 处理文件名
      const sanitizedFileName = sanitizeFileName(file.name);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', sanitizedFileName);

      try {
        const response = await fetch('/api/posts/assets/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        successCount++;
        setUploadStatus(`Uploaded ${successCount}/${totalFiles} files...`);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadStatus(`Failed to upload ${file.name}`);
      }
    }

    setUploadStatus(`Completed: ${successCount}/${totalFiles} files uploaded`);
    setTimeout(() => {
      setUploadStatus('');
      setIsUploading(false);
    }, 3000);
  };

  const handleSave = () => {
    // 直接使用当前的 localMetadata，不依赖异步状态更新
    onUpdate(localMetadata);
    onClose();
  };

  const handleInputChange = (field: keyof Metadata, value: string) => {
    const updatedMetadata = {
      ...localMetadata,
      [field]: value
    };
    setLocalMetadata(updatedMetadata);
    // 实时同步更新到父组件
    onUpdate(updatedMetadata);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] overflow-hidden">
        <div className="flex h-full">
          {/* 左侧图片区域 */}
          <div className="w-1/3 p-4 border-r border-neutral-200">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100 hover:bg-neutral-200"
            >
              {localMetadata.image ? (
                <>
                  <Image
                    src={localMetadata.image}
                    alt="Blog cover"
                    width={400}
                    height={400}
                    style={{ objectFit: 'cover' }}
                    className="h-full w-full transition-transform duration-200 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-opacity duration-200 group-hover:bg-opacity-20">
                    <span className="hidden text-sm text-white group-hover:block">Change image</span>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-sm text-neutral-500">Click to upload Cover Image</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="mt-2 text-center text-xs text-neutral-500">
              Max size: 6MB
            </p>

            {/* 批量上传按钮 */}
            <div className="mt-4">
              <button
                onClick={() => multipleFileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Bulk Upload Images'}
              </button>
              <input
                ref={multipleFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleBulkImageUpload}
                className="hidden"
              />
              {uploadStatus && (
                <p className="mt-2 text-center text-xs text-neutral-600">
                  {uploadStatus}
                </p>
              )}
            </div>
          </div>

          {/* 右侧表单区域 */}
          <div className="flex-1 p-6">
            <h2 className="text-lg font-medium mb-4">Blog Metadata</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={localMetadata.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Series
                </label>
                <input
                  type="text"
                  value={localMetadata.series || ''}
                  onChange={(e) => handleInputChange('series', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Summary
                </label>
                <textarea
                  value={localMetadata.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-white text-sm resize-none"
                />
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 