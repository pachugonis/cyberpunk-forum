"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none",
        // Base styles
        "prose-headings:text-[var(--cyber-cyan)] prose-headings:font-mono prose-headings:font-bold",
        "prose-h1:text-2xl prose-h1:mb-4 prose-h1:border-b prose-h1:border-[#2a2a35] prose-h1:pb-2",
        "prose-h2:text-xl prose-h2:mb-3",
        "prose-h3:text-lg prose-h3:mb-2",
        // Paragraphs and text
        "prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4",
        "prose-strong:text-[var(--cyber-yellow)] prose-strong:font-bold",
        "prose-em:text-[var(--cyber-magenta)] prose-em:italic",
        // Links
        "prose-a:text-[var(--cyber-cyan)] prose-a:no-underline prose-a:hover:underline prose-a:transition-colors",
        // Lists
        "prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4",
        "prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4",
        "prose-li:text-foreground prose-li:mb-1",
        // Code blocks
        "prose-code:bg-[#1a1a24] prose-code:text-[var(--cyber-cyan)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm",
        "prose-pre:bg-[#0a0a0f] prose-pre:border prose-pre:border-[#2a2a35] prose-pre:rounded prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:mb-4",
        "prose-pre:code:bg-transparent prose-pre:code:p-0",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-[var(--cyber-magenta)] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-4",
        // Tables
        "prose-table:w-full prose-table:border-collapse prose-table:mb-4",
        "prose-thead:border-b-2 prose-thead:border-[var(--cyber-cyan)]",
        "prose-th:text-left prose-th:text-[var(--cyber-cyan)] prose-th:font-mono prose-th:font-bold prose-th:px-4 prose-th:py-2",
        "prose-td:border-t prose-td:border-[#2a2a35] prose-td:px-4 prose-td:py-2",
        "prose-tr:hover:bg-[#1a1a24] prose-tr:transition-colors",
        // Horizontal rules
        "prose-hr:border-[#2a2a35] prose-hr:my-6",
        // Images
        "prose-img:rounded prose-img:border prose-img:border-[#2a2a35] prose-img:max-w-full prose-img:h-auto",
        // Font
        "font-mono text-sm",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
