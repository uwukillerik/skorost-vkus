import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Сообщение отправлено! Мы свяжемся с вами.");
    setForm({ name: "", email: "", message: "" });
  };

  const contacts = [
    { icon: MapPin, label: "Адрес", value: "г. Москва, ул. Тверская, 1" },
    { icon: Phone, label: "Телефон", value: "+7 (999) 123-45-67" },
    { icon: Mail, label: "Email", value: "hello@skorost-vkus.ru" },
    { icon: Clock, label: "Часы работы", value: "10:00 — 23:00 ежедневно" },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-12 pb-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="section-title mb-4">Контакты</h1>
          <p className="text-lg text-muted-foreground">
            Свяжитесь с нами — мы всегда на связи
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
        <div className="space-y-4">
          {contacts.map((c) => (
            <Card key={c.label}>
              <CardContent className="flex items-start gap-4 pt-6">
                <c.icon className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="font-medium">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="rounded-2xl overflow-hidden h-48 bg-muted flex items-center justify-center text-muted-foreground text-sm">
            Карта филиала (демо)
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="font-bold text-xl mb-4">Написать нам</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Сообщение</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">
                Отправить
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
