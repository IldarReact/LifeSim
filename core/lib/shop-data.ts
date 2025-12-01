import type { ShopItem } from '@/core/types/shop.types'

export const SHOP_ITEMS: ShopItem[] = [
  // --- ПИТАНИЕ (Режимы питания) ---
  {
    id: 'food_homemade',
    name: '🏠 Готовлю сам',
    description: 'Экономно, но требует времени и сил. Здоровая домашняя еда.',
    price: 0, // Бесплатно
    category: 'food',
    effects: {
      energy: -10, // Тратит энергию на готовку
      health: 3,
      happiness: 2,
      intelligence: 1 // Учишься готовить
    },
    isRecurring: true,
    costPerTurn: 100 // Продукты
  },
  {
    id: 'food_fastfood',
    name: '🍔 Фастфуд',
    description: 'Быстро, дешево, но не очень полезно.',
    price: 0,
    category: 'food',
    effects: {
      energy: 15,
      health: -2,
      happiness: 3
    },
    isRecurring: true,
    costPerTurn: 180
  },
  {
    id: 'food_business_lunch',
    name: '🥗 Бизнес-ланч',
    description: 'Сбалансированный обед для продуктивной работы.',
    price: 0,
    category: 'food',
    effects: {
      energy: 25,
      health: 2,
      happiness: 5
    },
    isRecurring: true,
    costPerTurn: 600
  },
  {
    id: 'food_restaurant',
    name: '🍷 Рестораны',
    description: 'Изысканная еда и приятная атмосфера каждый день.',
    price: 0,
    category: 'food',
    effects: {
      energy: 40,
      health: 3,
      happiness: 15,
      sanity: 5
    },
    isRecurring: true,
    costPerTurn: 1800
  },
  {
    id: 'food_premium',
    name: '👨‍🍳 Личный повар',
    description: 'Индивидуальное меню, идеальный баланс питательных веществ.',
    price: 0,
    category: 'food',
    effects: {
      energy: 50,
      health: 10,
      happiness: 20,
      sanity: 10,
      intelligence: 2
    },
    isRecurring: true,
    costPerTurn: 5000
  },

  // --- ЗДОРОВЬЕ (Разовые покупки) ---
  {
    id: 'health_meds',
    name: '💊 Лекарства',
    description: 'Базовый набор медикаментов.',
    price: 50,
    category: 'health',
    effects: {
      health: 10
    }
  },
  {
    id: 'health_doctor',
    name: '👨‍⚕️ Визит к врачу',
    description: 'Профессиональная медицинская помощь.',
    price: 200,
    category: 'health',
    effects: {
      health: 30,
      sanity: 5
    }
  },
  {
    id: 'health_therapy',
    name: '🧠 Сеанс у психолога',
    description: 'Помогает разобраться в себе и снять стресс.',
    price: 150,
    category: 'health',
    effects: {
      sanity: 25,
      happiness: 5
    }
  },
  {
    id: 'health_spa',
    name: '🧖‍♀️ СПА-день',
    description: 'Полный релакс для тела и души.',
    price: 500,
    category: 'health',
    effects: {
      health: 10,
      sanity: 20,
      happiness: 15,
      energy: 50
    }
  },

  // --- УСЛУГИ И РАЗВЛЕЧЕНИЯ (Разовые покупки) ---
  {
    id: 'service_cinema',
    name: '🎬 Кино',
    description: 'Поход на премьеру нового фильма.',
    price: 25,
    category: 'services',
    effects: {
      happiness: 8,
      sanity: 2
    }
  },
  {
    id: 'service_concert',
    name: '🎸 Концерт',
    description: 'Живая музыка и драйв.',
    price: 120,
    category: 'services',
    effects: {
      happiness: 20,
      sanity: 5,
      energy: -10
    }
  },
  {
    id: 'service_travel',
    name: '✈️ Путешествие',
    description: 'Неделя отдыха на курорте.',
    price: 2500,
    category: 'services',
    effects: {
      happiness: 60,
      sanity: 40,
      health: 10,
      energy: 100
    }
  },

  // --- ЖИЛЬЕ (Режимы проживания) ---
  {
    id: 'housing_room',
    name: '🚪 Съемная комната',
    description: 'Минимальные условия. Общая кухня и ванная.',
    price: 0,
    category: 'real_estate',
    effects: {
      happiness: -5,
      sanity: -3
    },
    isRecurring: true,
    costPerTurn: 900 // $300/мес × 3
  },
  {
    id: 'housing_studio',
    name: '🏠 Съемная студия',
    description: 'Небольшая квартира-студия. Все свое.',
    price: 0,
    category: 'real_estate',
    effects: {
      happiness: 5,
      sanity: 2
    },
    isRecurring: true,
    costPerTurn: 1800 // $600/мес × 3
  },
  {
    id: 'housing_apartment',
    name: '🏢 Съемная квартира',
    description: 'Полноценная 1-2 комнатная квартира.',
    price: 0,
    category: 'real_estate',
    effects: {
      happiness: 15,
      sanity: 8,
      health: 2
    },
    isRecurring: true,
    costPerTurn: 3600 // $1200/мес × 3
  },
  {
    id: 'housing_own_apartment',
    name: '🏡 Своя квартира',
    description: 'Собственная квартира. Только коммунальные платежи.',
    price: 150000, // Первоначальный взнос/полная стоимость
    category: 'real_estate',
    effects: {
      happiness: 30,
      sanity: 15,
      health: 5,
      intelligence: 2
    },
    isRecurring: true,
    costPerTurn: 600, // Только коммунальные
    assetType: 'real_estate'
  },
  {
    id: 'housing_house',
    name: '🏘️ Свой дом',
    description: 'Частный дом с участком. Максимальный комфорт.',
    price: 500000,
    category: 'real_estate',
    effects: {
      happiness: 50,
      sanity: 25,
      health: 10,
      intelligence: 5,
      energy: 10
    },
    isRecurring: true,
    costPerTurn: 1200, // Коммунальные + обслуживание
    assetType: 'real_estate'
  },
  {
    id: 'housing_penthouse',
    name: '🌆 Пентхаус',
    description: 'Элитное жилье в центре города. Престиж и роскошь.',
    price: 2000000,
    category: 'real_estate',
    effects: {
      happiness: 80,
      sanity: 40,
      health: 15,
      intelligence: 10,
      energy: 20
    },
    isRecurring: true,
    costPerTurn: 3000,
    assetType: 'real_estate'
  },

  // --- ТРАНСПОРТ (АКТИВЫ) ---
  {
    id: 'transport_bike',
    name: '🚲 Велосипед',
    description: 'Экологично и полезно для здоровья.',
    price: 500,
    category: 'transport',
    effects: {
      health: 5,
      happiness: 5
    },
    assetType: 'stock' // Временная заглушка
  },
  {
    id: 'transport_used_car',
    name: '🚗 Подержанное авто',
    description: 'Старенькая, но едет.',
    price: 5000,
    category: 'transport',
    effects: {
      happiness: 20
    },
    assetType: 'stock'
  },
  {
    id: 'transport_sportscar',
    name: '🏎️ Спорткар',
    description: 'Скорость, стиль и статус.',
    price: 150000,
    category: 'transport',
    effects: {
      happiness: 80
    },
    assetType: 'stock'
  }
]
