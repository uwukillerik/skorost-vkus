import Layout from "@/components/Layout";
import { Flame, Heart, Users, Award } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Flame,
      title: "Скорость",
      text: "Готовим и доставляем быстрее конкурентов — наша кухня работает как часы.",
    },
    {
      icon: Heart,
      title: "Качество",
      text: "Свежие продукты каждый день, строгий контроль на всех этапах.",
    },
    {
      icon: Users,
      title: "Команда",
      text: "Более 50 сотрудников, которые любят своё дело и наших гостей.",
    },
    {
      icon: Award,
      title: "Опыт",
      text: "С 2020 года радуем город — каждый день тысячи довольных гостей.",
    },
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-12 pb-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="section-title mb-4">О нас</h1>
          <p className="text-lg text-muted-foreground">
            «Скорость & Вкус» — современная сеть быстрого питания с доставкой
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            Мы создали «Скорость & Вкус», чтобы каждый мог насладиться
            вкусной едой без очередей и долгого ожидания. Наша миссия — готовить
            быстро, подавать горячим и держать честные цены.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            У нас собственная кухня, отлаженная логистика и команда, которая
            заботится о каждом заказе. Меню обновляется, но классические бургеры
            и картошка фри остаются хитами года за годом.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-card rounded-2xl p-6 shadow-md"
            >
              <v.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-bold text-xl mb-2">{v.title}</h3>
              <p className="text-muted-foreground text-sm">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Присоединяйтесь к нам</h3>
          <p className="opacity-90">
            Заказывайте онлайн — доставка по всему городу с 10:00 до 23:00
          </p>
        </div>
      </div>
    </Layout>
  );
}
