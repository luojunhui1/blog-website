'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ImageHinterProps {
  query: string;
  onSelect: (imagePath: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function ImageHinter({ query, onSelect, onClose, position }: ImageHinterProps) {
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!query.trim()) {
        setImages([]);
        return;
      }

      setLoading(true);
      try {
          const response = await fetch(`/api/posts/assets/image?query=${encodeURIComponent(query)}`);
          const data = await response.json();
          setImages(data.images);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    // 使用防抖来避免频繁请求
    const timeoutId = setTimeout(fetchImages, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    // 当images更新时，重置选中索引
    setSelectedIndex(0);
  }, [images]);

  // 确保组件挂载后获得焦点以支持键盘导航
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 添加全局键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!images.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % images.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + images.length) % images.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (images[selectedIndex]) {
            onSelect(images[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images, selectedIndex, onSelect, onClose]);

  if (!query || images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="absolute z-50 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-neutral-200 overflow-auto"
    >
      {loading ? (
        <div className="p-4 text-center text-sm text-neutral-500">
          Loading...
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {images.map((image, index) => (
            <div
              key={image}
              onClick={() => onSelect(image)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                selectedIndex === index ? 'bg-blue-50' : 'hover:bg-neutral-50'
              }`}
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-900 truncate">
                  {image.split('/').pop()}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {image}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
