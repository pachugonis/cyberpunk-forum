"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlitchText, CyberCard } from "@/components/cyberpunk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  _count: { topics: number };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "MessageSquare",
    color: "#00f0ff",
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      
      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save category");
      }

      toast.success(editingCategory ? "Category updated" : "Category created");
      setDialogOpen(false);
      resetForm();
      fetchCategories();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all topics in this category.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      toast.success("Category deleted");
      fetchCategories();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "MessageSquare",
      color: category.color || "#00f0ff",
      order: category.order,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "MessageSquare",
      color: "#00f0ff",
      order: 0,
    });
  };

  const icons = ["MessageSquare", "Cpu", "Zap", "Shield", "Code", "Gamepad2"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <GlitchText
            text="CATEGORIES"
            as="h1"
            className="text-2xl font-bold text-[var(--cyber-magenta)] mb-2"
          />
          <p className="text-muted-foreground font-mono text-sm">
            Manage forum categories.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="btn-cyber">
              <Plus className="h-4 w-4 mr-2" />
              ADD CATEGORY
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#13131a] border-[#2a2a35]">
            <DialogHeader>
              <DialogTitle className="text-[var(--cyber-cyan)] font-mono">
                {editingCategory ? "EDIT CATEGORY" : "NEW CATEGORY"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="bg-[#1a1a24] border-[#2a2a35]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase">Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-[#1a1a24] border-[#2a2a35]"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#1a1a24] border-[#2a2a35]"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase">Icon</Label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full h-10 px-3 bg-[#1a1a24] border border-[#2a2a35] text-foreground font-mono text-sm"
                  >
                    {icons.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase">Color</Label>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="bg-[#1a1a24] border-[#2a2a35] h-10 p-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase">Order</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="bg-[#1a1a24] border-[#2a2a35]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-cyber">
                  {editingCategory ? "UPDATE" : "CREATE"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories list */}
      {loading ? (
        <p className="text-muted-foreground font-mono">Loading...</p>
      ) : categories.length === 0 ? (
        <CyberCard className="p-8 text-center">
          <p className="text-muted-foreground font-mono">No categories yet.</p>
        </CyberCard>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <CyberCard key={category.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 flex items-center justify-center clip-cyber font-mono text-sm"
                    style={{ backgroundColor: `${category.color}20`, color: category.color || "var(--cyber-cyan)" }}
                  >
                    {category.order}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: category.color || "var(--cyber-cyan)" }}>
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      /{category.slug} - {category._count.topics} topics
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                    className="text-[var(--cyber-cyan)]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    className="text-[var(--cyber-magenta)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CyberCard>
          ))}
        </div>
      )}
    </div>
  );
}
