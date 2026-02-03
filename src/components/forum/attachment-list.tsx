"use client";

import { File, Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="w-4 h-4" />;
  }
  return <File className="w-4 h-4" />;
};

const isImage = (mimeType: string) => mimeType.startsWith("image/");

export function AttachmentList({ attachments }: AttachmentListProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const images = attachments.filter((a) => isImage(a.mimeType));
  const files = attachments.filter((a) => !isImage(a.mimeType));

  return (
    <div className="space-y-4">
      {/* Image attachments with preview */}
      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-mono text-[var(--cyber-cyan)] uppercase tracking-wider">
            Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden rounded-lg border border-[#2a2a35] hover:border-[var(--cyber-cyan)] transition-all"
              >
                <img
                  src={attachment.url}
                  alt={attachment.originalName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-[var(--cyber-cyan)]" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs font-mono text-white truncate">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs font-mono text-gray-400">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* File attachments */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-mono text-[var(--cyber-cyan)] uppercase tracking-wider">
            Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 bg-[#1a1a24] border border-[#2a2a35] rounded-lg hover:border-[var(--cyber-cyan)] transition-colors group"
              >
                <div className="text-[var(--cyber-cyan)]">
                  {getFileIcon(attachment.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-white truncate">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <a
                  href={attachment.url}
                  download={attachment.originalName}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[var(--cyber-cyan)] hover:text-[var(--cyber-cyan)] hover:bg-[var(--cyber-cyan)]/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
