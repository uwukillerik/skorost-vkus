import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CategoryDto } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { SafeImage } from "@/components/SafeImage";
import { slugify } from "@/lib/slug";
import { Skeleton } from "@/components/ui/skeleton";

const emptyForm = {
  name: "",
  slug: "",
  emoji: "🍔",
  description: "",
  imageUrl: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.admin.categories.list().then((r) => r.categories),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setSlugTouched(false);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: CategoryDto) => {
    setEditing(cat);
    setSlugTouched(true);
    setForm({
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji,
      description: cat.description ?? "",
      imageUrl: cat.imageUrl ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const body = {
      ...form,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
    };
    try {
      if (editing) {
        await api.admin.categories.update(editing.id, body);
        toast.success("Категория обновлена");
      } else {
        await api.admin.categories.create(body);
        toast.success("Категория создана");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить категорию?")) return;
    try {
      await api.admin.categories.delete(id);
      toast.success("Удалено");
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Категории"
        description="Разделы меню с фото и emoji"
        action={
          <Button onClick={openCreate} className="rounded-xl font-bold shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Добавить категорию
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <article
              key={cat.id}
              className="flex gap-4 bg-card rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0 flex items-center justify-center text-3xl">
                {cat.imageUrl ? (
                  <SafeImage
                    src={cat.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  cat.emoji
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      /{cat.slug}
                    </p>
                  </div>
                  <Badge variant={cat.isActive ? "default" : "secondary"}>
                    {cat.isActive ? "Активна" : "Скрыта"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {cat.productCount ?? 0} товаров · порядок {cat.sortOrder}
                </p>
                <div className="flex gap-1 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-destructive"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              {editing ? "Редактировать категорию" : "Новая категория"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <AdminImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              folder="categories"
              label="Фото категории (необязательно)"
            />

            <div className="grid grid-cols-[4rem_1fr] gap-3">
              <div>
                <Label>Emoji</Label>
                <Input
                  className="rounded-xl text-center text-2xl h-12"
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                />
              </div>
              <div>
                <Label>Название</Label>
                <Input
                  className="rounded-xl"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm({
                      ...form,
                      name,
                      slug: slugTouched ? form.slug : slugify(name),
                    });
                  }}
                />
              </div>
            </div>

            <div>
              <Label>Slug</Label>
              <Input
                className="rounded-xl font-mono text-sm"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value });
                }}
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                className="rounded-xl"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div>
              <Label>Порядок в меню</Label>
              <Input
                className="rounded-xl"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>Показывать в меню</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button className="rounded-xl font-bold" onClick={handleSave}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
