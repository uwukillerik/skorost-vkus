import {
  PrismaClient,
  OrderStatus,
  Role,
  PaymentMethod,
  PaymentStatus,
  DeliveryType,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const IMG = {
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
  burger2:
    "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=300&fit=crop",
  chicken:
    "https://images.unsplash.com/photo-1606755962773-552e0c4c2e3e?w=400&h=300&fit=crop",
  fries:
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop",
  wings:
    "https://images.unsplash.com/photo-1608039755401-6c9a5c4b8b0e?w=400&h=300&fit=crop",
  rings:
    "https://images.unsplash.com/photo-1630431341973-02d0d6c5d5a4?w=400&h=300&fit=crop",
  pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
  nuggets:
    "https://images.unsplash.com/photo-1562967914-608f82629763?w=400&h=300&fit=crop",
  cola: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop",
  juice:
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop",
  tea: "https://images.unsplash.com/photo-1556670213-1c0e0c0e0e0e?w=400&h=300&fit=crop",
  shake:
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
  water:
    "https://images.unsplash.com/photo-1548839140-5a941f83e0c4?w=400&h=300&fit=crop",
  cake:
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
  icecream:
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
  cheesecake:
    "https://images.unsplash.com/photo-1524351196289-7a9e0b5b5b5b?w=400&h=300&fit=crop",
  donut:
    "https://images.unsplash.com/photo-1551024503-8b3838c4da8e?w=400&h=300&fit=crop",
  pudding:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
};

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.comboItem.deleteMany();
  await prisma.combo.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin123",
    10,
  );

  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@skorost-vkus.ru",
      passwordHash: adminPassword,
      name: "Администратор",
      phone: "+7 (999) 000-00-01",
      role: Role.ADMIN,
      referralCode: "SVADMIN",
    },
  });

  const demoUserPassword = await bcrypt.hash("user123", 10);
  const demoUser = await prisma.user.create({
    data: {
      email: "user@example.com",
      passwordHash: demoUserPassword,
      name: "Иван Петров",
      phone: "+7 (999) 123-45-67",
      role: Role.USER,
      referralCode: "SVIVAN01",
      loyaltyPoints: 420,
    },
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Бургеры",
        slug: "burgers",
        emoji: "🍔",
        sortOrder: 1,
        description: "Сочные бургеры на гриле",
        imageUrl: IMG.burger2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Курица",
        slug: "chicken",
        emoji: "🍗",
        sortOrder: 2,
        description: "Крылья, наггетсы и сэндвичи",
        imageUrl: IMG.chicken,
      },
    }),
    prisma.category.create({
      data: {
        name: "Закуски",
        slug: "appetizers",
        emoji: "🍟",
        sortOrder: 3,
        description: "Картошка, крылья и снеки",
        imageUrl: IMG.fries,
      },
    }),
    prisma.category.create({
      data: {
        name: "Напитки",
        slug: "drinks",
        emoji: "🥤",
        sortOrder: 4,
        description: "Освежающие напитки",
        imageUrl: IMG.cola,
      },
    }),
    prisma.category.create({
      data: {
        name: "Десерты",
        slug: "desserts",
        emoji: "🍰",
        sortOrder: 5,
        description: "Сладкое завершение",
        imageUrl: IMG.cake,
      },
    }),
  ]);

  const [burgers, chicken, appetizers, drinks, desserts] = categories;

  const productsData = [
    {
      categoryId: burgers.id,
      name: "Классический Бургер",
      slug: "klassicheskiy-burger",
      description:
        "Сочный бургер с говяжьей котлетой, помидорами, салатом и нашим специальным соусом",
      price: 189,
      imageUrl: IMG.burger,
      isFeatured: true,
      calories: 520,
      protein: 28,
      weightGrams: 285,
      ingredients:
        "Булка с кунжутом, котлета 100% говядина, салат, помидор, лук, фирменный соус",
      allergens: "Глютен, молоко, соя, горчица, кунжут",
    },
    {
      categoryId: burgers.id,
      name: "Двойной Классик",
      slug: "dvoynoy-klassik",
      description:
        "Два слоя котлеты для двойного удовольствия с морковью и всеми добавками",
      price: 259,
      imageUrl: IMG.burger2,
      isFeatured: true,
      calories: 680,
    },
    {
      categoryId: burgers.id,
      name: "Тройной Король",
      slug: "troynoy-korol",
      description:
        "Три слоя мяса с четырьмя ломтиками сыра - король всех бургеров!",
      price: 349,
      imageUrl: IMG.burger,
      calories: 890,
    },
    {
      categoryId: burgers.id,
      name: "Острый Чизбургер",
      slug: "ostryy-chizburger",
      description:
        "Бургер с острым перцем, расплавленным сыром и острой горчицей",
      price: 219,
      imageUrl: IMG.burger2,
      calories: 580,
    },
    {
      categoryId: burgers.id,
      name: "Бекон Фиеста",
      slug: "bekon-fiesta",
      description: "Классический бургер с хрустящим беконом и копченым соусом",
      price: 249,
      imageUrl: IMG.burger,
      calories: 620,
    },
    {
      categoryId: chicken.id,
      name: "Острый Чикен",
      slug: "ostryy-chiken",
      description: "Хрустящая курица с острым соусом и пикантными специями",
      price: 219,
      imageUrl: IMG.chicken,
      isFeatured: true,
      calories: 480,
    },
    {
      categoryId: chicken.id,
      name: "Мягкий Чикен",
      slug: "myagkiy-chiken",
      description: "Нежная курица со сливочным соусом и салатом айсберг",
      price: 199,
      imageUrl: IMG.chicken,
      calories: 420,
    },
    {
      categoryId: chicken.id,
      name: "Чикен Гриль",
      slug: "chiken-grill",
      description: "Курица-гриль с овощами и травяным соусом",
      price: 239,
      imageUrl: IMG.chicken,
      calories: 450,
    },
    {
      categoryId: chicken.id,
      name: "Чикен Сендвич",
      slug: "chiken-sendvich",
      description: "Простой и вкусный сендвич с куриным филе и горчицей",
      price: 179,
      imageUrl: IMG.chicken,
      calories: 380,
    },
    {
      categoryId: chicken.id,
      name: "Фестиваль Курицы",
      slug: "festival-kuritsy",
      description: "Два куриных филе с дополнительным сыром и острым соусом",
      price: 299,
      imageUrl: IMG.chicken,
      calories: 550,
    },
    {
      categoryId: appetizers.id,
      name: "Картошка Фри",
      slug: "kartoshka-fri",
      description: "Хрустящая картошка с морской солью и специями",
      price: 99,
      imageUrl: IMG.fries,
      isFeatured: true,
      calories: 320,
    },
    {
      categoryId: appetizers.id,
      name: "Крылья Барбекю",
      slug: "krylya-barbekyu",
      description: "10 куриных крыльев в соусе барбекю с овощами",
      price: 189,
      imageUrl: IMG.wings,
      calories: 410,
    },
    {
      categoryId: appetizers.id,
      name: "Луковые кольца",
      slug: "lukovye-koltsa",
      description: "Хрустящие луковые кольца с острым соусом",
      price: 119,
      imageUrl: IMG.rings,
      calories: 280,
    },
    {
      categoryId: appetizers.id,
      name: "Пицца Слайсы",
      slug: "pitstsa-slaysy",
      description: "Три кусочка пиццы с сыром и пепперони",
      price: 129,
      imageUrl: IMG.pizza,
      calories: 350,
    },
    {
      categoryId: appetizers.id,
      name: "Наггетсы",
      slug: "naggetsy",
      description: "8 куриных наггетсов в панировке с соусом на выбор",
      price: 139,
      imageUrl: IMG.nuggets,
      calories: 300,
    },
    {
      categoryId: drinks.id,
      name: "Кола",
      slug: "kola",
      description: "Газированный напиток объемом 0.5л",
      price: 69,
      imageUrl: IMG.cola,
      calories: 210,
    },
    {
      categoryId: drinks.id,
      name: "Апельсиновый сок",
      slug: "apelsinovyy-sok",
      description: "Свежевыжатый апельсиновый сок 0.35л",
      price: 89,
      imageUrl: IMG.juice,
      calories: 150,
    },
    {
      categoryId: drinks.id,
      name: "Ледяной чай",
      slug: "ledyanoy-chay",
      description: "Охлажденный чай лимонный 0.5л",
      price: 79,
      imageUrl: IMG.tea,
      calories: 90,
    },
    {
      categoryId: drinks.id,
      name: "Молочный коктейль",
      slug: "molochnyy-kokteyl",
      description: "Сливочный молочный коктейль со вкусом ваниль 0.4л",
      price: 129,
      imageUrl: IMG.shake,
      isFeatured: true,
      calories: 380,
    },
    {
      categoryId: drinks.id,
      name: "Вода",
      slug: "voda",
      description: "Чистая питьевая вода 0.5л",
      price: 39,
      imageUrl: IMG.water,
      calories: 0,
    },
    {
      categoryId: desserts.id,
      name: "Шоколадный Пирог",
      slug: "shokoladnyy-pirog",
      description: "Нежный шоколадный пирог со льдом сверху",
      price: 149,
      imageUrl: IMG.cake,
      calories: 420,
    },
    {
      categoryId: desserts.id,
      name: "Ванильное мороженое",
      slug: "vanilnoe-morozhenoe",
      description: "Сливочное ванильное мороженое в стаканчике",
      price: 99,
      imageUrl: IMG.icecream,
      isFeatured: true,
      calories: 280,
    },
    {
      categoryId: desserts.id,
      name: "Клубничный Чизкейк",
      slug: "klubnichnyy-chizkeyk",
      description: "Кремовый чизкейк с ягодной клубничной начинкой",
      price: 179,
      imageUrl: IMG.cheesecake,
      calories: 380,
    },
    {
      categoryId: desserts.id,
      name: "Донут",
      slug: "donut",
      description: "Пушистый донут с шоколадной глазурью и посыпкой",
      price: 89,
      imageUrl: IMG.donut,
      calories: 320,
    },
    {
      categoryId: desserts.id,
      name: "Карамельный Пудинг",
      slug: "karamelnyy-puding",
      description: "Нежный пудинг с карамельным соусом",
      price: 119,
      imageUrl: IMG.pudding,
      calories: 290,
    },
    {
      categoryId: burgers.id,
      name: "Грибной бургер",
      slug: "gribnoy-burger",
      description: "Котлета с жареными шампиньонами и сливочным соусом",
      price: 229,
      imageUrl: IMG.burger2,
      calories: 540,
    },
    {
      categoryId: burgers.id,
      name: "BBQ бургер",
      slug: "bbq-burger",
      description: "Копчёный соус барбекю, хрустящий лук и двойной сыр",
      price: 269,
      imageUrl: IMG.burger,
      isFeatured: true,
      calories: 610,
    },
    {
      categoryId: burgers.id,
      name: "Чизбургер классик",
      slug: "chizburger-klassik",
      description: "Говядина, расплавленный чеддер и маринованные огурчики",
      price: 169,
      imageUrl: IMG.burger2,
      calories: 450,
    },
    {
      categoryId: chicken.id,
      name: "Стрипсы 6 шт",
      slug: "strips-6",
      description: "Полоски куриного филе в хрустящей панировке",
      price: 199,
      imageUrl: IMG.nuggets,
      calories: 420,
    },
    {
      categoryId: chicken.id,
      name: "Крылышки острые 8 шт",
      slug: "krylyshki-ostrye",
      description: "Крылья в остром маринаде с соусом ранч",
      price: 249,
      imageUrl: IMG.wings,
      isFeatured: true,
      calories: 520,
    },
    {
      categoryId: chicken.id,
      name: "Ролл с курицей",
      slug: "roll-kuritsa",
      description: "Лаваш с курицей, овощами и йогуртовым соусом",
      price: 189,
      imageUrl: IMG.chicken,
      calories: 390,
    },
    {
      categoryId: appetizers.id,
      name: "Картошка по-деревенски",
      slug: "kartoshka-derevenski",
      description: "Дольки с розмарином и чесночным маслом",
      price: 109,
      imageUrl: IMG.fries,
      calories: 340,
    },
    {
      categoryId: appetizers.id,
      name: "Сырные палочки",
      slug: "syrnye-palochki",
      description: "6 палочек моцареллы с томатным соусом",
      price: 149,
      imageUrl: IMG.rings,
      calories: 380,
    },
    {
      categoryId: appetizers.id,
      name: "Кукурузные начос",
      slug: "nachos",
      description: "Начос с сырным соусом и халапеньо",
      price: 159,
      imageUrl: IMG.pizza,
      calories: 410,
    },
    {
      categoryId: appetizers.id,
      name: "Салат Цезар",
      slug: "salat-cezar",
      description: "Курица, пармезан, сухарики и соус цезар",
      price: 199,
      imageUrl: IMG.chicken,
      calories: 320,
    },
    {
      categoryId: drinks.id,
      name: "Лимонад домашний",
      slug: "limonad",
      description: "Освежающий лимонад с мятой 0.4 л",
      price: 99,
      imageUrl: IMG.juice,
      calories: 120,
    },
    {
      categoryId: drinks.id,
      name: "Капучино",
      slug: "kapuchino",
      description: "Кофе с молочной пенкой 0.3 л",
      price: 119,
      imageUrl: IMG.tea,
      calories: 80,
    },
    {
      categoryId: drinks.id,
      name: "Айс-латте",
      slug: "ays-latte",
      description: "Холодный кофе со льдом 0.4 л",
      price: 139,
      imageUrl: IMG.shake,
      calories: 110,
    },
    {
      categoryId: desserts.id,
      name: "Брауни",
      slug: "brauni",
      description: "Шоколадный брауни с орехами",
      price: 129,
      imageUrl: IMG.cake,
      calories: 350,
    },
    {
      categoryId: desserts.id,
      name: "Яблочный штрудель",
      slug: "shtrudel",
      description: "Тёплый штрудель с яблоками и корицей",
      price: 139,
      imageUrl: IMG.pudding,
      calories: 310,
    },
    {
      categoryId: desserts.id,
      name: "Мороженое шоколад",
      slug: "morozhenoe-shokolad",
      description: "Пломбир в вафельном рожке",
      price: 89,
      imageUrl: IMG.icecream,
      calories: 260,
    },
  ];

  const products = await Promise.all(
    productsData.map((p) =>
      prisma.product.create({
        data: {
          ...p,
          price: p.price,
        },
      }),
    ),
  );

  const burger = products.find((p) => p.slug === "klassicheskiy-burger")!;
  const fries = products.find((p) => p.slug === "kartoshka-fri")!;
  const cola = products.find((p) => p.slug === "kola")!;
  const chiken = products.find((p) => p.slug === "ostryy-chiken")!;
  const nuggets = products.find((p) => p.slug === "naggetsy")!;
  const shake = products.find((p) => p.slug === "molochnyy-kokteyl")!;
  const doubleBurger = products.find((p) => p.slug === "dvoynoy-klassik")!;

  await prisma.combo.create({
    data: {
      name: "Классик Меню",
      slug: "klassik-menu",
      description: "Бургер + картошка + напиток — наш самый популярный набор",
      price: 349,
      oldPrice: 447,
      imageUrl: IMG.burger,
      badge: "ХИТ",
      sortOrder: 1,
      calories: 920,
      items: {
        create: [
          { name: "Классический Бургер", quantity: 1, productId: burger.id },
          { name: "Картошка Фри", quantity: 1, productId: fries.id },
          { name: "Кола 0.5л", quantity: 1, productId: cola.id },
        ],
      },
    },
  });

  await prisma.combo.create({
    data: {
      name: "Чикен Бокс",
      slug: "chiken-box",
      description: "Острый чикен + наггетсы + картошка + напиток",
      price: 499,
      oldPrice: 646,
      imageUrl: IMG.chicken,
      badge: "ВЫГОДНО",
      sortOrder: 2,
      calories: 1100,
      items: {
        create: [
          { name: "Острый Чикен", quantity: 1, productId: chiken.id },
          { name: "Наггетсы 8 шт", quantity: 1, productId: nuggets.id },
          { name: "Картошка Фри", quantity: 1, productId: fries.id },
          { name: "Кола 0.5л", quantity: 1, productId: cola.id },
        ],
      },
    },
  });

  await prisma.combo.create({
    data: {
      name: "Двойной обед",
      slug: "dvoynoy-obed",
      description: "Двойной бургер + фри + молочный коктейль",
      price: 429,
      oldPrice: 537,
      imageUrl: IMG.burger2,
      badge: "-20%",
      sortOrder: 3,
      calories: 980,
      items: {
        create: [
          { name: "Двойной Классик", quantity: 1, productId: doubleBurger.id },
          { name: "Картошка Фри", quantity: 1, productId: fries.id },
          { name: "Молочный коктейль", quantity: 1, productId: shake.id },
        ],
      },
    },
  });

  await prisma.combo.create({
    data: {
      name: "Семейный набор",
      slug: "family-set",
      description: "2 бургера + 2 фри + 2 колы — для всей семьи",
      price: 799,
      oldPrice: 1044,
      imageUrl: IMG.burger2,
      badge: "СЕМЬЕ",
      sortOrder: 4,
      calories: 2100,
      items: {
        create: [
          { name: "Классический Бургер", quantity: 2, productId: burger.id },
          { name: "Картошка Фри", quantity: 2, productId: fries.id },
          { name: "Кола 0.5л", quantity: 2, productId: cola.id },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: demoUser.id,
      address: "ул. Ленина, 10, кв. 5",
      comment: "Позвонить за 5 минут",
      deliveryType: DeliveryType.DELIVERY,
      paymentMethod: PaymentMethod.CARD,
      paymentStatus: PaymentStatus.PAID,
      paymentId: "MOCK-SEED001",
      subtotal: 357,
      deliveryFee: 0,
      status: OrderStatus.DELIVERED,
      totalAmount: 357,
      items: {
        create: [
          {
            productId: burger.id,
            quantity: 1,
            unitPrice: 189,
            productName: burger.name,
          },
          {
            productId: fries.id,
            quantity: 1,
            unitPrice: 99,
            productName: fries.name,
          },
          {
            productId: cola.id,
            quantity: 1,
            unitPrice: 69,
            productName: cola.name,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      guestName: "Анна Смирнова",
      guestPhone: "+7 (999) 555-12-34",
      guestEmail: "anna@example.com",
      guestAccessToken: randomUUID(),
      address: "пр. Мира, 25",
      deliveryType: DeliveryType.DELIVERY,
      paymentMethod: PaymentMethod.SBP,
      paymentStatus: PaymentStatus.PAID,
      paymentId: "MOCK-SEED002",
      subtotal: 438,
      deliveryFee: 0,
      status: OrderStatus.PREPARING,
      totalAmount: 438,
      items: {
        create: [
          {
            productId: chiken.id,
            quantity: 2,
            unitPrice: 219,
            productName: chiken.name,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: demoUser.id,
      address: "ул. Пушкина, 3",
      deliveryType: DeliveryType.DELIVERY,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PENDING,
      subtotal: 259,
      deliveryFee: 0,
      status: OrderStatus.NEW,
      totalAmount: 259,
      items: {
        create: [
          {
            productId: products.find((p) => p.slug === "dvoynoy-klassik")!.id,
            quantity: 1,
            unitPrice: 259,
            productName: "Двойной Классик",
          },
        ],
      },
    },
  });

  console.log("Seed completed:");
  console.log(`  Admin: ${admin.email} / ${process.env.ADMIN_PASSWORD || "admin123"}`);
  console.log(`  Demo user: user@example.com / user123`);
  console.log(`  Products: ${products.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
