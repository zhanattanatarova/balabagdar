export type Lang = "ru" | "kz" | "en";

export const translations = {
  // Nav
  "nav.home": { ru: "Главная", kz: "Басты бет", en: "Home" },
  "nav.map": { ru: "Карта", kz: "Карта", en: "Map" },
  "nav.events": { ru: "События", kz: "Оқиғалар", en: "Events" },
  "nav.profile": { ru: "Профиль", kz: "Профиль", en: "Profile" },
  "nav.dashboard": { ru: "Кабинет", kz: "Кабинет", en: "Dashboard" },

  // Auth
  "auth.title": { ru: "Вход в BalaBagdar", kz: "BalaBagdar-ға кіру", en: "Sign in to BalaBagdar" },
  "auth.phone_label": { ru: "Номер телефона", kz: "Телефон нөмірі", en: "Phone number" },
  "auth.phone_placeholder": { ru: "+7 777 123 4567", kz: "+7 777 123 4567", en: "+7 777 123 4567" },
  "auth.get_code": { ru: "Получить код", kz: "Код алу", en: "Get code" },
  "auth.enter_code": { ru: "Введите код", kz: "Кодты енгізіңіз", en: "Enter code" },
  "auth.code_sent": { ru: "Код отправлен ✅", kz: "Код жіберілді ✅", en: "Code sent ✅" },
  "auth.check_telegram": { ru: "Проверьте Telegram", kz: "Telegram-ды тексеріңіз", en: "Check Telegram" },
  "auth.confirm": { ru: "Подтвердить", kz: "Растау", en: "Confirm" },
  "auth.change_number": { ru: "← Изменить номер", kz: "← Нөмірді өзгерту", en: "← Change number" },
  "auth.code_via_telegram": { ru: "Код придёт в Telegram", kz: "Код Telegram-ға келеді", en: "Code will come via Telegram" },
  "auth.enter_phone": { ru: "Введите номер телефона", kz: "Телефон нөмірін енгізіңіз", en: "Enter phone number" },
  "auth.open_bot": { ru: "Открыть бота", kz: "Ботты ашу", en: "Open bot" },
  "auth.waiting": { ru: "Ожидаю привязку…", kz: "Байланысты күтемін…", en: "Waiting for link…" },
  "auth.retry": { ru: "Повторить", kz: "Қайталау", en: "Retry" },

  // Role selection
  "role.title": { ru: "Кто вы?", kz: "Сіз кімсіз?", en: "Who are you?" },
  "role.subtitle": { ru: "Выберите вашу роль", kz: "Рөліңізді таңдаңыз", en: "Choose your role" },
  "role.parent": { ru: "Родитель", kz: "Ата-ана", en: "Parent" },
  "role.parent_desc": { ru: "Ищу кружки для ребёнка", kz: "Балаға үйірме іздеймін", en: "Looking for clubs for my child" },
  "role.club": { ru: "Кружок / Центр", kz: "Үйірме / Орталық", en: "Club / Center" },
  "role.club_desc": { ru: "Хочу разместить свой кружок", kz: "Үйірмемді орналастырғым келеді", en: "I want to list my club" },

  // Home
  "home.select_city": { ru: "Выберите город", kz: "Қаланы таңдаңыз", en: "Select city" },
  "home.search": { ru: "Найти кружок или репетитора...", kz: "Үйірме немесе репетитор іздеу...", en: "Find a club or tutor..." },
  "home.popular": { ru: "⭐ Популярные кружки", kz: "⭐ Танымал үйірмелер", en: "⭐ Popular clubs" },
  "home.nearby": { ru: "📍 Рядом с вами", kz: "📍 Сіздің жаныңызда", en: "📍 Near you" },
  "home.all": { ru: "Все →", kz: "Барлығы →", en: "All →" },
  "home.not_found": { ru: "Ничего не найдено", kz: "Ештеңе табылмады", en: "Nothing found" },
  "home.free_banner_title": { ru: "🎉 Бесплатная доска объявлений", kz: "🎉 Тегін хабарландырулар тақтасы", en: "🎉 Free bulletin board" },
  "home.free_banner_text": { ru: "Размещайте кружки и события бесплатно — мы собираем лучшую базу детских занятий Казахстана!", kz: "Үйірмелер мен оқиғаларды тегін орналастырыңыз — біз Қазақстанның балалар сабақтарының ең жақсы базасын жинаймыз!", en: "List clubs and events for free — we're building the best database of children's activities in Kazakhstan!" },

  // Categories
  "cat.creativity": { ru: "Творчество", kz: "Шығармашылық", en: "Art" },
  "cat.sport": { ru: "Спорт", kz: "Спорт", en: "Sports" },
  "cat.development": { ru: "Развитие", kz: "Даму", en: "Development" },
  "cat.speech": { ru: "Логопеды", kz: "Логопедтер", en: "Speech" },
  "cat.dance": { ru: "Танцы", kz: "Би", en: "Dance" },
  "cat.robotics": { ru: "Робототехника", kz: "Робототехника", en: "Robotics" },
  "cat.swim": { ru: "Бассейн", kz: "Бассейн", en: "Swimming" },
  "cat.music": { ru: "Музыка", kz: "Музыка", en: "Music" },
  "cat.health": { ru: "Здоровье", kz: "Денсаулық", en: "Health" },
  "cat.tutors": { ru: "Репетиторы", kz: "Репетиторлар", en: "Tutors" },

  // Club detail
  "club.book": { ru: "Забронировать", kz: "Брондау", en: "Book" },
  "club.schedule": { ru: "Расписание", kz: "Кесте", en: "Schedule" },
  "club.about": { ru: "О нас", kz: "Біз туралы", en: "About us" },
  "club.contacts": { ru: "Контакты", kz: "Байланыс", en: "Contacts" },
  "club.age": { ru: "Возраст", kz: "Жас", en: "Age" },
  "club.price": { ru: "Цена от", kz: "Бағасы", en: "Price from" },
  "club.reviews": { ru: "отзывов", kz: "пікір", en: "reviews" },
  "club.call": { ru: "Позвонить", kz: "Қоңырау шалу", en: "Call" },
  "club.whatsapp": { ru: "WhatsApp", kz: "WhatsApp", en: "WhatsApp" },
  "club.telegram_link": { ru: "Telegram", kz: "Telegram", en: "Telegram" },
  "club.gallery": { ru: "Галерея", kz: "Галерея", en: "Gallery" },

  // Booking
  "booking.title": { ru: "Запись на занятие", kz: "Сабаққа жазылу", en: "Book a class" },
  "booking.child_name": { ru: "Имя ребёнка", kz: "Баланың аты", en: "Child's name" },
  "booking.child_age": { ru: "Возраст ребёнка", kz: "Баланың жасы", en: "Child's age" },
  "booking.phone": { ru: "Ваш телефон", kz: "Телефон нөміріңіз", en: "Your phone" },
  "booking.date": { ru: "Дата", kz: "Күні", en: "Date" },
  "booking.message": { ru: "Сообщение (необязательно)", kz: "Хабарлама (міндетті емес)", en: "Message (optional)" },
  "booking.submit": { ru: "Отправить заявку", kz: "Өтініш жіберу", en: "Submit request" },
  "booking.success": { ru: "Заявка отправлена! ✅", kz: "Өтініш жіберілді! ✅", en: "Request sent! ✅" },
  "booking.select_date": { ru: "Выберите дату", kz: "Күнді таңдаңыз", en: "Select date" },

  // Profile
  "profile.login": { ru: "Войти / Регистрация", kz: "Кіру / Тіркелу", en: "Login / Register" },
  "profile.login_desc": { ru: "По номеру телефона", kz: "Телефон нөмірі бойынша", en: "By phone number" },
  "profile.favorites": { ru: "Избранное", kz: "Таңдаулылар", en: "Favorites" },
  "profile.history": { ru: "История просмотров", kz: "Қарау тарихы", en: "View history" },
  "profile.notifications": { ru: "Уведомления", kz: "Хабарландырулар", en: "Notifications" },
  "profile.contact_us": { ru: "Связаться с нами", kz: "Бізбен байланысу", en: "Contact us" },
  "profile.settings": { ru: "Мои настройки", kz: "Менің баптауларым", en: "My settings" },
  "profile.logout": { ru: "Выйти", kz: "Шығу", en: "Logout" },
  "profile.guest": { ru: "👋 Гость", kz: "👋 Қонақ", en: "👋 Guest" },
  "profile.guest_desc": { ru: "Войдите для полного доступа", kz: "Толық қол жеткізу үшін кіріңіз", en: "Sign in for full access" },
  "profile.free_access": { ru: "🎉 Бесплатный доступ ко всем функциям", kz: "🎉 Барлық функцияларға тегін қол жеткізу", en: "🎉 Free access to all features" },
  "profile.language": { ru: "Язык", kz: "Тіл", en: "Language" },

  // Club dashboard
  "dashboard.my_club": { ru: "Мой кружок", kz: "Менің үйірмем", en: "My club" },
  "dashboard.edit_profile": { ru: "Редактировать профиль", kz: "Профильді өзгерту", en: "Edit profile" },
  "dashboard.bookings": { ru: "Заявки", kz: "Өтініштер", en: "Bookings" },
  "dashboard.calendar": { ru: "Календарь", kz: "Күнтізбе", en: "Calendar" },
  "dashboard.settings": { ru: "Настройки", kz: "Баптаулар", en: "Settings" },
  "dashboard.no_club": { ru: "У вас ещё нет кружка", kz: "Сізде әлі үйірме жоқ", en: "You don't have a club yet" },
  "dashboard.create_club": { ru: "Создать кружок", kz: "Үйірме құру", en: "Create club" },
  "dashboard.pending": { ru: "Ожидает", kz: "Күтуде", en: "Pending" },
  "dashboard.confirmed": { ru: "Подтверждено", kz: "Расталды", en: "Confirmed" },
  "dashboard.rejected": { ru: "Отклонено", kz: "Қабылданбады", en: "Rejected" },

  // Club edit
  "edit.name": { ru: "Название", kz: "Атауы", en: "Name" },
  "edit.description": { ru: "Описание", kz: "Сипаттама", en: "Description" },
  "edit.category": { ru: "Категория", kz: "Санат", en: "Category" },
  "edit.city": { ru: "Город", kz: "Қала", en: "City" },
  "edit.address": { ru: "Адрес", kz: "Мекенжай", en: "Address" },
  "edit.phone": { ru: "Телефон", kz: "Телефон", en: "Phone" },
  "edit.whatsapp": { ru: "WhatsApp номер", kz: "WhatsApp нөмірі", en: "WhatsApp number" },
  "edit.telegram": { ru: "Telegram username", kz: "Telegram username", en: "Telegram username" },
  "edit.age_range": { ru: "Возраст детей", kz: "Балалар жасы", en: "Children's age" },
  "edit.price": { ru: "Цена от (₸)", kz: "Бағасы (₸)", en: "Price from (₸)" },
  "edit.save": { ru: "Сохранить", kz: "Сақтау", en: "Save" },
  "edit.saved": { ru: "Сохранено ✅", kz: "Сақталды ✅", en: "Saved ✅" },

  // Days of week
  "day.0": { ru: "Пн", kz: "Дс", en: "Mon" },
  "day.1": { ru: "Вт", kz: "Сс", en: "Tue" },
  "day.2": { ru: "Ср", kz: "Ср", en: "Wed" },
  "day.3": { ru: "Чт", kz: "Бс", en: "Thu" },
  "day.4": { ru: "Пт", kz: "Жм", en: "Fri" },
  "day.5": { ru: "Сб", kz: "Сб", en: "Sat" },
  "day.6": { ru: "Вс", kz: "Жс", en: "Sun" },

  // Common
  "common.search_city": { ru: "Поиск города...", kz: "Қала іздеу...", en: "Search city..." },
  "common.back": { ru: "Назад", kz: "Артқа", en: "Back" },
  "common.cancel": { ru: "Отмена", kz: "Болдырмау", en: "Cancel" },
  "common.error": { ru: "Ошибка", kz: "Қате", en: "Error" },
  "common.loading": { ru: "Загрузка...", kz: "Жүктеу...", en: "Loading..." },
  "common.logged_out": { ru: "Вы вышли", kz: "Сіз шықтыңыз", en: "You logged out" },
  "common.bye": { ru: "До встречи! 👋", kz: "Кездескенше! 👋", en: "See you! 👋" },
} as const;

export type TranslationKey = keyof typeof translations;
