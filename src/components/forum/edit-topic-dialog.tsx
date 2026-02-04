"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
}

interface EditTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: {
    id: string;
    title: string;
    content: string;
    categoryId: string;
  };
}

export function EditTopicDialog({ open, onOpenChange, topic }: EditTopicDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: topic.title,
    content: topic.content,
    categoryId: topic.categoryId,
  });

  useEffect(() => {
    if (open) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => setCategories(data.categories || []))
        .catch(console.error);
      
      // Reset form data when dialog opens
      setFormData({
        title: topic.title,
        content: topic.content,
        categoryId: topic.categoryId,
      });
    }
  }, [open, topic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update topic");
      }

      toast.success("Topic updated successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0d0d12] border border-[#2a2a35] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[var(--cyber-cyan)] font-mono text-xl">
            EDIT TOPIC
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
              Category
            </Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="w-full h-10 px-3 bg-[#1a1a24] border border-[#2a2a35] text-foreground font-mono text-sm focus:border-[var(--cyber-cyan)] focus:outline-none focus:ring-1 focus:ring-[var(--cyber-cyan)]/20 clip-cyber"
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={200}
              className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-[var(--cyber-cyan)] font-mono uppercase text-xs tracking-wider">
              Content
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              className="bg-[#1a1a24] border-[#2a2a35] focus:border-[var(--cyber-cyan)] font-mono text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="font-mono"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="btn-cyber"
            >
              {loading ? "UPDATING..." : "UPDATE TOPIC"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
