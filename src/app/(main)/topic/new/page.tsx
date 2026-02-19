"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlitchText } from "@/components/cyberpunk";
import { FileUpload, type UploadedFile } from "@/components/forum";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

function NewTopicForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get("category");
  const tTopic = useTranslations('topic');
  const tCommon = useTranslations('common');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: preselectedCategory || "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        if (preselectedCategory) {
          setFormData((prev) => ({ ...prev, categoryId: preselectedCategory }));
        }
      })
      .catch(console.error);
  }, [preselectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          attachmentIds: uploadedFiles.map((f) => f.id),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create topic");
      }

      const topic = await response.json();
      toast.success("Topic created successfully");
      router.push(`/topic/${topic.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-cyber p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
          {tTopic('category')}
        </Label>
        <select
          id="category"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          required
          className="w-full h-10 px-3 bg-[#1a1a24] border border-[#2a2a35] text-foreground font-mono text-sm focus:border-[var(--cyber-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyber-cyan)]/20 clip-cyber"
        >
          <option value="">{tTopic('selectCategory')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
          {tTopic('title')}
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          minLength={3}
          maxLength={200}
          className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] font-mono"
          placeholder={tTopic('titlePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
          {tTopic('content')}
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          minLength={10}
          className="min-h-[200px] bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] font-mono resize-none"
          placeholder={tTopic('contentPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
          {tTopic('attachments')}
        </Label>
        <FileUpload
          onFileUploaded={(file) => setUploadedFiles([...uploadedFiles, file])}
          onFileRemoved={(fileId) =>
            setUploadedFiles(uploadedFiles.filter((f) => f.id !== fileId))
          }
          uploadedFiles={uploadedFiles}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a35]">
        <Link href="/">
          <Button type="button" variant="ghost" className="font-mono">
            {tCommon('cancel')}
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={loading}
          className="btn-cyber"
        >
          {loading ? tTopic('submitting') : tTopic('submit')}
        </Button>
      </div>
    </form>
  );
}

function FormLoading() {
  return (
    <div className="card-cyber p-6 flex items-center justify-center min-h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--cyber-cyan)]" />
    </div>
  );
}

export default function NewTopicPage() {
  const tTopic = useTranslations('topic');
  const tProfile = useTranslations('profile');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Link 
        href="/" 
        className="inline-flex items-center text-muted-foreground hover:text-[var(--cyber-cyan)] font-mono text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {tProfile('backToForum')}
      </Link>

      {/* Header */}
      <div className="card-cyber p-6">
        <GlitchText 
          text={tTopic('newTopicHeader')}
          as="h1"
          className="text-2xl font-bold text-[var(--cyber-cyan)] mb-2"
        />
        <p className="text-muted-foreground font-mono text-sm">
          {tTopic('newTopicDescription')}
        </p>
      </div>

      {/* Form */}
      <Suspense fallback={<FormLoading />}>
        <NewTopicForm />
      </Suspense>
    </div>
  );
}
