import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CategoryDto } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const emptyForm = {
  name: "",
  slug: "",
  emoji: "🍔",
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

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (cat: CategoryDto) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      emoji: cat.emoji,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await api.admin.categories.update(editing.id, form);
        toast.success("Категория обновлена");
      } else {
        await api.admin.categories.create(form);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Категории</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      </div>

      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="bg-card rounded-xl shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emoji</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Порядок</TableHead>
                <TableHead>Активна</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-xl">{cat.emoji}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{cat.sortOrder}</TableCell>
                  <TableCell>{cat.isActive ? "Да" : "Нет"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(cat.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Редактировать" : "Новая категория"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Название</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Slug (латиница)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Emoji</Label>
              <Input
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              />
            </div>
            <div>
              <Label>Порядок</Label>
              <Input
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
              <Label>Активна</Label>
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
