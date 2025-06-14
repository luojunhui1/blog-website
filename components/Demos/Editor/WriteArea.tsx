"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MetadataDialog } from '@/components/Demos/Editor/MetadataDialog';
import { ImageHinter } from '@/components/Demos/Editor/ImageHinter';
import { Metadata } from '@/types/post';

interface WriteAreaProps {
  content: string;
  metadata: Metadata;
  onMetadataUpdate: (metadata: Metadata) => void;
  onContentUpdate: (content: string) => void;
  isModified: boolean;
}

export const MDXEditor: React.FC<WriteAreaProps> = ({
  content: initialContent,
  metadata,
  onMetadataUpdate,
  onContentUpdate,
  isModified
}) => {
  const [lastEditTime, setLastEditTime] = useState<number>(Date.now());
  const [hasEdited, setHasEdited] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout>();
  const [content, setContent] = useState(initialContent);
  const [isMetadataDialogOpen, setIsMetadataDialogOpen] = useState(false);
  const [imageHint, setImageHint] = useState<{
    query: string;
    position: { top: number; left: number };
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 计算字数，排除markdown语法和标点符号
  const wordCount = useMemo(() => {
    // 移除markdown语法
    const textWithoutMarkdown = content
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/`.*?`/g, '')  // 行内代码
      .replace(/\[.*?\]\(.*?\)/g, '$1') // 链接
      .replace(/[#*_~>`]/g, '') // markdown标记符号
      .replace(/\n/g, ' ') // 换行符替换为空格
      .trim();

    // 移除标点符号
    const cleanText = textWithoutMarkdown
      .replace(/[.,!?;:，。！？；：、]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 分别计算中文和英文单词
    const chineseChars = cleanText.match(/[\u4e00-\u9fa5]/g) || [];
    const englishWords = cleanText
      .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
      .split(/\s+/)
      .filter(word => word.length > 0);

    // 中文按字符计数，英文按单词计数
    return chineseChars.length + englishWords.length;
  }, [content]);

  // 同步外部内容更新
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    const checkForRender = () => {
      const now = Date.now();
      if (
        hasEdited && 
        now - lastEditTime >= 1000 // 1 second delay
      ) {
        setIsTyping(false);
        // Reset edit flag after starting render
        setHasEdited(false);
        // 触发内容更新
        onContentUpdate(content);
      }
    };

    const timer = setInterval(checkForRender, 100);
    return () => clearInterval(timer);
  }, [lastEditTime, hasEdited, content, onContentUpdate]);

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    setLastEditTime(Date.now());
    setHasEdited(true);
    setIsTyping(true);

    // 检查是否正在输入图片语法
    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    
    // 获取当前行的内容
    const lastNewlineIndex = value.lastIndexOf('\n', cursorPosition - 1) + 1;
    const currentLineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex;
    const currentLine = value.substring(currentLineStart, cursorPosition);
    // console.log("currentLine", currentLine);

    // 匹配未完成的图片语法
    const match = currentLine.match(/^!\[(.*?)\]\((.*?)$/);
    // console.log("match", match);

    if (match) {  // 如果匹配成功
      const query = match[2] || '';  // 使用括号中的内容作为搜索词
      const coordinates = getCaretCoordinates(textarea, cursorPosition);
      setImageHint({
        query,
        position: coordinates
      });
    } else {
      setImageHint(null);
    }

    // Reset typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);
  };

  const handleImageSelect = useCallback((imagePath: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);

    // 找到最后一个未闭合的图片标记
    const lastImageMarkIndex = textBeforeCursor.lastIndexOf('![');
    if (lastImageMarkIndex === -1) return;

    // 构建新的内容，保持原有的描述文本
    const match = textBeforeCursor.substring(lastImageMarkIndex).match(/^!\[(.*?)\]/);
    const altText = match ? match[1] : '';
    
    const newContent = 
      textBeforeCursor.substring(0, lastImageMarkIndex) +
      `![${altText}](${imagePath})` +
      textAfterCursor;

    setContent(newContent);
    onContentUpdate(newContent);
    setImageHint(null);
  }, [content, onContentUpdate]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!imageHint) return;

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      // TODO: 在 ImageHinter 组件中处理上下键选择
    } else if (e.key === 'Enter' && imageHint) {
      e.preventDefault();
      // TODO: 在 ImageHinter 组件中处理确认选择
    } else if (e.key === 'Escape') {
      setImageHint(null);
    }
  }, [imageHint]);

  // 获取光标位置的辅助函数
  const getCaretCoordinates = (textarea: HTMLTextAreaElement, position: number) => {
    const { offsetLeft, offsetTop } = textarea;
    const textBeforePosition = textarea.value.substring(0, position);
    const lines = textBeforePosition.split('\n');
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    
    return {
      left: offsetLeft + (lines[lines.length - 1].length * 8), // 假设每个字符宽度为 8px
      top: offsetTop + (lines.length * lineHeight)
    };
  };

  const togglePublishStatus = () => {
    onMetadataUpdate({
      ...metadata,
      status: metadata.status === 'published' ? 'draft' : 'published'
    });
  };

  const toggleFeatured = () => {
    onMetadataUpdate({
      ...metadata,
      featured: !metadata.featured
    });
  };

  return (
    <div className="border-r border-neutral-200">
      <div className="flex h-12 items-center justify-between border-b border-neutral-200 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMetadataDialogOpen(true)}
            className="text-sm font-medium hover:text-blue-500 truncate max-w-[200px]"
          >
            {metadata.title || 'Untitled'}
          </button>
          <span className="text-sm text-neutral-500">
            {isTyping ? "Typing..." : isModified ? "Modified" : "Saved"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* 字数统计 */}
          <span className="text-sm text-neutral-500">
            {wordCount} words
          </span>
          <div className="flex items-center gap-3">
            {/* Featured 开关 */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={metadata.featured}
                onChange={toggleFeatured}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
              <span className="ml-2 text-xs text-neutral-600">Featured</span>
            </label>
            {/* Published 开关 */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={metadata.status === 'published'}
                onChange={togglePublishStatus}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
              <span className="ml-2 text-xs text-neutral-600">Published</span>
            </label>
          </div>
        </div>
      </div>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleEditorChange}
          onKeyDown={handleKeyDown}
          className="h-[calc(85vh-4rem)] w-full resize-none border-0 bg-transparent p-4 text-sm focus:outline-none"
          placeholder="Type your markdown here..."
          spellCheck={false}
        />
        {imageHint && (
          <ImageHinter
            query={imageHint.query}
            position={imageHint.position}
            onSelect={handleImageSelect}
            onClose={() => setImageHint(null)}
          />
        )}
      </div>

      <MetadataDialog
        isOpen={isMetadataDialogOpen}
        onClose={() => setIsMetadataDialogOpen(false)}
        metadata={metadata}
        onUpdate={onMetadataUpdate}
      />
    </div>
  );
};

