import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.admin.users.list().then((r) => r.users),
  });

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Клиенты</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-card rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Имя</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Телефон</th>
                  <th className="text-left p-4 font-semibold">Заказов</th>
                  <th className="text-left p-4 font-semibold">Роль</th>
                  <th className="text-left p-4 font-semibold">Регистрация</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone || "—"}</td>
                    <td className="p-4">{u.orderCount}</td>
                    <td className="p-4">
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(u.createdAt), "d MMM yyyy", { locale: ru })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <Card key={u.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold">{u.name}</p>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  {u.phone && (
                    <p className="text-sm text-muted-foreground">{u.phone}</p>
                  )}
                  <p className="text-sm mt-2">
                    Заказов: <span className="font-semibold">{u.orderCount}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
