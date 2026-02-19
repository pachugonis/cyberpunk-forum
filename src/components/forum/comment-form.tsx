"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload, type UploadedFile } from "./file-upload";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface CommentFormProps {
  topicId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
}

export function CommentForm({ 
  topicId, 
  parentId, 
  onSuccess,
  placeholder
}: CommentFormProps) {
  const router = useRouter();
  const t = useTranslations('comment');
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error(t('writeComment'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/topics/${topicId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          parentId,
          attachmentIds: uploadedFiles.map((f) => f.id),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('error'));
      }

      setContent("");
      setUploadedFiles([]);
      toast.success(t('addComment'));
      router.refresh();
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder ?? t('writeComment')}
        className="min-h-[100px] bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] font-mono text-sm resize-none"
      />
      <FileUpload
        onFileUploaded={(file) => setUploadedFiles([...uploadedFiles, file])}
        onFileRemoved={(fileId) =>
          setUploadedFiles(uploadedFiles.filter((f) => f.id !== fileId))
        }
        uploadedFiles={uploadedFiles}
        maxFiles={3}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading || !content.trim()}
          className="btn-cyber text-xs"
        >
          {loading ? t('submitting') : t('submit')}
        </Button>
      </div>
    </form>
  );
}
