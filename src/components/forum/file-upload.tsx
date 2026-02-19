"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, File, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void;
  onFileRemoved: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  maxFiles?: number;
  maxSize?: number; // in MB
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-rar-compressed",
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="w-4 h-4" />;
  }
  return <File className="w-4 h-4" />;
};

export function FileUpload({
  onFileUploaded,
  onFileRemoved,
  uploadedFiles,
  maxFiles = 5,
  maxSize = 1,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('upload');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(
        t('maxFilesExceeded', {
          max: maxFiles,
        })
      );
      return;
    }

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          t('fileTooLarge', {
            name: file.name,
            size: maxSize,
          })
        );
        continue;
      }

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(
          t('fileTypeNotAllowed', {
            name: file.name,
          })
        );
        continue;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || t('uploadFailed'));
        }

        const uploadedFile = await response.json();
        onFileUploaded(uploadedFile);
        toast.success(
          t('fileUploaded', {
            name: file.name,
          })
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t('failedToUpload')
        );
      } finally {
        setUploading(false);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (file: UploadedFile) => {
    try {
      const response = await fetch(`/api/upload?id=${file.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(t('failedToDelete'));
      }

      onFileRemoved(file.id);
      toast.success(t('fileRemoved'));
    } catch (error) {
      toast.error(t('failedToRemove'));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_MIME_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || uploadedFiles.length >= maxFiles}
          className="border-[#2a2a35] hover:border-[var(--cyber-cyan)] text-[var(--cyber-cyan)] font-mono text-xs"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? t('uploading') : t('attachFiles')}
        </Button>
        <span className="text-xs text-gray-500 font-mono">
          {t('status', {
            current: uploadedFiles.length,
            max: maxFiles,
            size: maxSize,
          })}
        </span>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-[#1a1a24] border border-[#2a2a35] rounded-lg hover:border-[var(--cyber-cyan)] transition-colors"
            >
              <div className="text-[var(--cyber-cyan)]">
                {getFileIcon(file.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-white truncate">
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(file)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
