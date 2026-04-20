// Сценарий диалога от Андрея.
// Каждое сообщение — это объект с типом и полями.
// Типы: 'text', 'photo', 'link-preview', 'video-preview', 'voice', 'sticker', 'reactions-target'
// Поле `typing` — сколько мс "печатать" до отправки (масштабируется скоростью)
// Поле `after` — пауза после отправки
// Поле `reactions` — массив эмодзи-реакций
// Поле `from` — 'andrey' (по умолчанию) или 'you'

window.CHAT_SCRIPT = [
  {
    type: "text",
    text: "Привет! 👋",
    typing: 900,
    after: 400,
  },
  {
    type: "text",
    text: "Я Андрей Осягин",
    typing: 1100,
    after: 500,
  },
  {
    type: "photo",
    src: "assets/photo.webp",
    caption: "собственной персоной",
    typing: 1400,
    after: 700,
    reactions: ["❤️"],
  },
  {
    type: "text",
    text: "Делаю продукты в Авито Недвижимости — в роли ведущего менеджера продукта",
    typing: 2400,
    after: 600,
  },
  {
    type: "link-preview",
    url: "https://www.avito.ru",
    site: "avito.ru",
    title: "Авито — сайт объявлений России",
    description: "Крупнейшая площадка по продаже и аренде недвижимости, автомобилей и товаров",
    color: "#00AAFF",
    initial: "А",
    typing: 900,
    after: 800,
  },
  {
    type: "text",
    text: "Иногда меня зовут выступать на конференциях и подкастах — делюсь опытом про продукты, команды и исследования",
    typing: 2800,
    after: 700,
  },
  {
    type: "video-preview",
    src: "https://www.youtube.com/embed/tMH41PAqZ2A?si=5Wpr-MS_0g80lGRR",
    thumb: "https://i.ytimg.com/vi/tMH41PAqZ2A/hqdefault.jpg",
    title: "Подкаст: тимлид vs продакт — кто кому должен",
    duration: "58:42",
    typing: 1600,
    after: 600,
    reactions: ["🔥", "👍"],
  },
  {
    type: "video-preview",
    src: "https://www.youtube.com/embed/NUV_XFGkUBc?si=xqkPk6yzN-rC0fYx",
    thumb: "https://i.ytimg.com/vi/NUV_XFGkUBc/hqdefault.jpg",
    title: "Гемба: не верь данным своим",
    duration: "32:15",
    typing: 1200,
    after: 800,
  },
  {
    type: "text",
    text: "Если хочется пообщаться — напиши мне 👇",
    typing: 1600,
    after: 400,
  },
  {
    type: "contact",
    label: "Почта",
    value: "for@privetandrey.ru",
    href: "mailto:for@privetandrey.ru",
    typing: 700,
    after: 700,
  },
  {
    type: "text",
    text: "Мои крестражи в социалочках — раскидал по разным местам 🪄",
    typing: 1900,
    after: 500,
  },
  {
    type: "socials",
    items: [
      { name: "Facebook", href: "https://www.facebook.com/osyagin", color: "#3B5998", key: "fb" },
      { name: "YouTube", href: "https://www.youtube.com/user/osyagin", color: "#FF0000", key: "yt" },
      { name: "Instagram", href: "https://www.instagram.com/andreyosyagin/", color: "#E1306C", key: "ig" },
    ],
    typing: 1100,
    after: 900,
  },
  {
    type: "text",
    text: "На этом всё. Спасибо, что дочитал до конца 🙌",
    typing: 1700,
    after: 500,
  },
  {
    type: "text",
    text: "© Андрей Осягин, 1991–2026",
    muted: true,
    typing: 800,
    after: 0,
  },
];
