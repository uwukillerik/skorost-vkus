import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ProductDto } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    imageUrl: "",
    isAvailable: true,
    isFeatured: false,
    calories: "" as string | number,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      categoryId: categories[0]?.id || "",
      name: "",
      slug: "",
      description: "",
      price: 0,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      isAvailable: true,
      isFeatured: false,
      calories: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (p: ProductDto) => {
    setEditing(p);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Товары</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="bg-card rounded-xl shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Фото</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Доступен</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.categoryName}</TableCell>
                  <TableCell>{p.price}₽</TableCell>
                  <TableCell>{p.isAvailable ? "Да" : "Нет"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Редактировать" : "Новый товар"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Категория</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
              >
                <SelectTrigger>
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Цена</Label>
                <Input
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
                  value={form.calories}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>URL изображения</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({ ...form, imageUrl: e.target.value })
                }
              />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(v) =>
                    setForm({ ...form, isAvailable: v })
                  }
                />
                <Label>Доступен</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) =>
                    setForm({ ...form, isFeatured: v })
                  }
                />
                <Label>Хит</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
