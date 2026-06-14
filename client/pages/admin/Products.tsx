import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProductDto } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminImageUpload } from "@/components/admin/AdminImageUpload";
import { SafeImage } from "@/components/SafeImage";
import { slugify } from "@/lib/slug";
import { Skeleton } from "@/components/ui/skeleton";

const emptyForm = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  price: 0,
  imageUrl: "",
  isAvailable: true,
  isFeatured: false,
  calories: "" as string | number,
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.admin.categories.list().then((r) => r.categories),
  });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => api.admin.products.list().then((r) => r.products),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setSlugTouched(false);
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id || "",
    });
    setDialogOpen(true);
  };

  const openEdit = (p: ProductDto) => {
    setEditing(p);
    setSlugTouched(true);
    setForm({
      categoryId: p.categoryId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      calories: p.calories ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.imageUrl) {
      toast.error("Загрузите изображение товара");
      return;
    }
    const body = {
      ...form,
      price: Number(form.price),
      calories: form.calories ? Number(form.calories) : null,
    };
    try {
      if (editing) {
        await api.admin.products.update(editing.id, body);
        toast.success("Товар обновлён");
      } else {
        await api.admin.products.create(body);
        toast.success("Товар создан");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить товар?")) return;
    try {
      await api.admin.products.delete(id);
      toast.success("Удалено");
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Товары"
        description="Добавляйте блюда с фото с компьютера — без ссылок на картинки"
        action={
          <Button onClick={openCreate} className="rounded-xl font-bold shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed">
          <p className="text-muted-foreground mb-4">Товаров пока нет</p>
          <Button onClick={openCreate}>Добавить первый товар</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="bg-card rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-36 bg-muted">
                <SafeImage
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                {p.isFeatured && (
                  <Badge className="absolute top-2 left-2 gap-1">
                    <Star className="h-3 w-3" />
                    Хит
                  </Badge>
                )}
                {!p.isAvailable && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-black/60 text-white"
                  >
                    Скрыт
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg leading-tight line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {p.categoryName} · {p.slug}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-black text-primary">
                    {p.price}₽
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl text-destructive hover:text-destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              {editing ? "Редактировать товар" : "Новый товар"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <AdminImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              folder="products"
            />

            <div>
              <Label>Категория</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div>
              <Label>Slug (латиница, для URL)</Label>
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
                className="rounded-xl min-h-[80px]"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Цена, ₽</Label>
                <Input
                  className="rounded-xl"
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Ккал</Label>
                <Input
                  className="rounded-xl"
                  value={form.calories}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(v) =>
                    setForm({ ...form, isAvailable: v })
                  }
                />
                <Label>В продаже</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) =>
                    setForm({ ...form, isFeatured: v })
                  }
                />
                <Label>Хит меню</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDialogOpen(false)}
            >
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
