import type { EmployeeCandidate, EmployeeRole, EmployeeStars, EmployeeSkills, Business, BusinessEvent, BusinessInventory, Employee, BusinessProposal, BusinessPartner } from "@/core/types/business.types"
import type { Skill } from '@/core/types';
import { checkMinimumStaffing, getPlayerRoleBusinessImpact } from '@/features/business/lib/player-roles';

const FIRST_NAMES = [
  "Александр", "Дмитрий", "Максим", "Сергей", "Андрей",
  "Алексей", "Артём", "Илья", "Кирилл", "Михаил",
  "Никита", "Матвей", "Роман", "Владимир", "Павел",
  "Анна", "Мария", "Елена", "Ольга", "Наталья",
  "Татьяна", "Ирина", "Екатерина", "Светлана", "Юлия"
]

const LAST_NAMES = [
  "Иванов", "Петров", "Сидоров", "Козлов", "Новиков",
  "Морозов", "Волков", "Соловьёв", "Васильев", "Зайцев",
  "Павлов", "Семёнов", "Голубев", "Виноградов", "Богданов"
]

const ROLE_DESCRIPTIONS: Record<EmployeeRole, { strengths: string[], weaknesses: string[] }> = {
  manager: {
    strengths: ["Организация процессов", "Мотивация команды", "Стратегическое мышление"],
    weaknesses: ["Высокая зарплата", "Может конфликтовать с владельцем"]
  },
  salesperson: {
    strengths: ["Увеличивает продажи", "Привлекает клиентов", "Коммуникабельность"],
    weaknesses: ["Зависит от рынка", "Нужны бонусы"]
  },
  accountant: {
    strengths: ["Снижает расходы", "Оптимизирует налоги", "Контроль финансов"],
    weaknesses: ["Не влияет на продажи", "Консервативен"]
  },
  marketer: {
    strengths: ["Повышает узнаваемость", "Привлекает трафик", "Креативность"],
    weaknesses: ["Результат не сразу", "Требует бюджета"]
  },
  technician: {
    strengths: ["Повышает качество", "Решает проблемы", "Надежность"],
    weaknesses: ["Не работает с клиентами", "Узкая специализация"]
  },
  worker: {
    strengths: ["Низкая зарплата", "Выполняет рутину", "Гибкость"],
    weaknesses: ["Низкая квалификация", "Частая текучка"]
  }
}

/**
 * Генерирует случайные навыки для сотрудника на основе роли и звезд
 */
function generateSkills(role: EmployeeRole, stars: EmployeeStars): EmployeeSkills {
  const baseSkills = {
    efficiency: 40,
    salesAbility: 40,
    technical: 40,
    management: 40,
    creativity: 40
  }

  // Модификаторы по звездам (1 звезда = +10 к базе, 5 звезд = +50)
  const starBonus = stars * 10;

  // Модификаторы по роли
  const roleModifiers: Record<EmployeeRole, Partial<EmployeeSkills>> = {
    manager: { management: 30, efficiency: 20 },
    salesperson: { salesAbility: 35, creativity: 15 },
    accountant: { efficiency: 25, management: 15 },
    marketer: { creativity: 30, salesAbility: 20 },
    technician: { technical: 35, efficiency: 15 },
    worker: { efficiency: 10 }
  }

  const skills = { ...baseSkills }
  const modifiers = roleModifiers[role]

  // Применяем модификаторы роли
  Object.keys(modifiers).forEach(key => {
    const skillKey = key as keyof EmployeeSkills
    skills[skillKey] += modifiers[skillKey] || 0
  })

  // Применяем бонус звезд ко всем навыкам с рандомом
  Object.keys(skills).forEach(key => {
    const skillKey = key as keyof EmployeeSkills
    skills[skillKey] = Math.min(100, Math.max(10, skills[skillKey] + starBonus + (Math.random() * 20 - 10)))
  })

  return skills
}

/**
 * Рассчитывает зарплату на основе роли и звезд
 */
function calculateSalary(role: EmployeeRole, stars: EmployeeStars): number {
  const baseSalary = {
    worker: 800,
    salesperson: 1200,
    technician: 1500,
    accountant: 1800,
    marketer: 2000,
    manager: 2500
  }[role]

  // Множитель зарплаты от звезд (экспоненциальный рост)
  // 1★: 1.0, 2★: 1.5, 3★: 2.2, 4★: 3.5, 5★: 5.0
  const starMultiplier = [1.0, 1.5, 2.2, 3.5, 5.0][stars - 1];

  return Math.round(baseSalary * starMultiplier)
}

/**
 * Генерирует кандидата на работу
 */
export function generateEmployeeCandidate(role: EmployeeRole, stars?: EmployeeStars): EmployeeCandidate {
  // Распределение звезд если не указано: 1★ (40%), 2★ (30%), 3★ (20%), 4★ (8%), 5★ (2%)
  let candidateStars: EmployeeStars = 1;
  if (stars) {
    candidateStars = stars;
  } else {
    const rand = Math.random();
    if (rand > 0.98) candidateStars = 5;
    else if (rand > 0.90) candidateStars = 4;
    else if (rand > 0.70) candidateStars = 3;
    else if (rand > 0.40) candidateStars = 2;
  }

  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const skills = generateSkills(role, candidateStars)
  const salary = calculateSalary(role, candidateStars)

  const experience = {
    1: Math.floor(Math.random() * 4),
    2: 4 + Math.floor(Math.random() * 8),
    3: 12 + Math.floor(Math.random() * 12),
    4: 24 + Math.floor(Math.random() * 24),
    5: 48 + Math.floor(Math.random() * 48)
  }[candidateStars]

  const roleDesc = ROLE_DESCRIPTIONS[role]

  return {
    id: `candidate_${Date.now()}_${Math.random()}`,
    name: `${firstName} ${lastName}`,
    role,
    stars: candidateStars,
    skills,
    requestedSalary: salary,
    experience,
    strengths: roleDesc.strengths,
    weaknesses: roleDesc.weaknesses
  }
}

/**
 * Генерирует несколько кандидатов для выбора
 */
export function generateCandidates(role: EmployeeRole, count: number = 3): EmployeeCandidate[] {
  const candidates: EmployeeCandidate[] = []
  for (let i = 0; i < count; i++) {
    candidates.push(generateEmployeeCandidate(role))
  }
  return candidates
}

/**
 * Рассчитывает KPI бонус/штраф для сотрудника
 */
export function calculateEmployeeKPI(employee: Employee): number {
  if (employee.productivity >= 80) return Math.round(employee.salary * 0.1);  // +10%
  if (employee.productivity <= 50) return Math.round(employee.salary * -0.1); // -10%
  return 0;
}

/**
 * Рассчитывает эффективность бизнеса (0-100)
 */
export function calculateEfficiency(business: Business, playerSkills?: Skill[]): number {
  const state = business.state ?? 'active';
  if (state !== 'active') return 0;

  // 1. Проверка минимального персонала
  const staffingCheck = checkMinimumStaffing(business);
  if (!staffingCheck.isValid) {
    console.log(`[Business ${business.name}] Staffing requirements not met. Efficiency: 0`);
    return 0; // Бизнес не работает без минимума
  }

  // 2. Базовая эффективность от сотрудников
  let totalEfficiency = 0;
  let managerBonus = 0;

  business.employees.forEach(emp => {
    // Вклад сотрудника зависит от его эффективности и продуктивности
    const contribution = emp.skills.efficiency * (emp.productivity / 100);

    // Менеджеры дают бонус к общей эффективности
    if (emp.role === 'manager') {
      managerBonus += (emp.skills.management / 100) * 10; // До +10% от каждого менеджера
    }

    totalEfficiency += contribution;
  });

  // Средняя эффективность команды
  let avgEfficiency = totalEfficiency / business.employees.length;

  // 3. Бонус менеджера
  avgEfficiency += managerBonus;

  // 4. ✅ НОВОЕ: Влияние навыков игрока
  let playerBonus = 0;
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills);
    playerBonus = playerImpact.efficiencyBonus;
    avgEfficiency += playerBonus;
  }

  // 5. Влияние событий (последние 4 события)
  const recentEvents = (business.eventsHistory || []).slice(-4);
  const eventImpact = recentEvents.reduce((sum, event) => sum + (event.effects.efficiency || 0), 0);

  // Итоговая эффективность
  const finalEfficiency = Math.min(100, Math.max(0, avgEfficiency + eventImpact));

  console.log(`[Business ${business.name}] Efficiency Calc: Avg=${avgEfficiency.toFixed(1)}, ManagerBonus=${managerBonus.toFixed(1)}, PlayerBonus=${playerBonus.toFixed(1)}, EventImpact=${eventImpact}, Final=${finalEfficiency.toFixed(1)}`);

  return Math.round(finalEfficiency);
}

/**
 * Рассчитывает репутацию бизнеса (0-100)
 */
export function calculateReputation(business: Business, currentEfficiency: number, playerSkills?: Skill[]): number {
  // Репутация меняется медленно, стремясь к текущей эффективности
  // Но также зависит от маркетинга и событий

  // 1. Влияние эффективности (вес 60%)
  const efficiencyImpact = currentEfficiency * 0.6;

  // 2. Влияние команды (звезды) (вес 20%)
  const avgStars = business.employees.length > 0
    ? business.employees.reduce((sum, e) => sum + e.stars, 0) / business.employees.length
    : 0;
  const teamImpact = (avgStars / 5) * 100 * 0.2; // 5 звезд = 100 * 0.2 = 20

  // 3. Маркетологи (вес 20%)
  const marketers = business.employees.filter(e => e.role === 'marketer');
  const marketingImpact = marketers.length > 0
    ? (marketers.reduce((sum, m) => sum + m.skills.creativity, 0) / marketers.length) * 0.2
    : 0;

  // 4. ✅ НОВОЕ: Влияние навыков игрока на репутацию
  let playerReputationBonus = 0;
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills);
    playerReputationBonus = playerImpact.reputationBonus;
  }

  // 5. События (прямое влияние)
  const recentEvents = (business.eventsHistory || []).slice(-4);
  const eventImpact = recentEvents.reduce((sum, event) => sum + (event.effects.reputation || 0), 0);

  // Целевая репутация
  const targetReputation = efficiencyImpact + teamImpact + marketingImpact + playerReputationBonus + eventImpact;

  // Плавное изменение (сдвиг на 10% к цели каждый ход)
  const newReputation = business.reputation + (targetReputation - business.reputation) * 0.1;

  console.log(`[Business ${business.name}] Reputation Calc: Target=${targetReputation.toFixed(1)}, PlayerBonus=${playerReputationBonus.toFixed(1)}, Current=${business.reputation.toFixed(1)}, New=${newReputation.toFixed(1)}`);

  return Math.min(100, Math.max(0, Math.round(newReputation)));
}

/**
 * Обновляет метрики бизнеса (эффективность, репутация)
 */
export function updateBusinessMetrics(business: Business, playerSkills?: Skill[]): Business {
  const efficiency = calculateEfficiency(business, playerSkills);
  const reputation = calculateReputation(business, efficiency, playerSkills);

  return {
    ...business,
    efficiency,
    reputation
  };
}

/**
 * Рассчитывает детальные финансовые показатели бизнеса за квартал
 */
export function calculateBusinessFinancials(
  business: Business,
  isPreview: boolean = false,
  playerSkills?: Skill[],
  globalMarketValue: number = 1.0  // ✅ НОВОЕ: глобальное состояние рынка
): {
  income: number;
  expenses: number;
  profit: number;
  newInventory: BusinessInventory;
} {
  const state = business.state ?? 'active';
  if (state !== 'active') {
    const fixedExpenses = business.quarterlyExpenses;
    return {
      income: 0,
      expenses: fixedExpenses,
      profit: -fixedExpenses,
      newInventory: business.inventory || {
        currentStock: 0,
        maxStock: 1000,
        pricePerUnit: 100,
        purchaseCost: 50,
        autoPurchaseAmount: 0
      }
    };
  }

  // 1. Base Expenses
  const employeesCost = business.employees.reduce((sum, emp) => {
    const kpi = calculateEmployeeKPI(emp);
    return sum + emp.salary + kpi;
  }, 0);
  const rent = business.maxEmployees * 200;
  const utilities = business.maxEmployees * 50;

  let baseExpenses = employeesCost + rent + utilities;

  // Accountant reduction (from employees)
  const accountants = business.employees.filter(e => e.role === 'accountant');
  if (accountants.length > 0) {
    const totalStars = accountants.reduce((sum, a) => sum + a.stars, 0);
    const reduction = Math.min(0.15, 0.05 + (totalStars * 0.01));
    baseExpenses *= (1 - reduction);
  }

  // ✅ НОВОЕ: Дополнительное снижение расходов от навыков игрока
  let playerExpenseReduction = 0;
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills);
    playerExpenseReduction = playerImpact.expenseReduction / 100;
    baseExpenses *= (1 - playerExpenseReduction);
  }

  // 2. Sales & Inventory
  let salesIncome = 0;
  let purchaseCost = 0;
  let salesVolume = 0;
  let purchaseAmount = 0;

  const inventory = business.inventory;

  // ✅ НОВОЕ: Разделяем логику для товарных и услуговых бизнесов
  if (business.isServiceBased) {
    // === УСЛУГОВЫЙ БИЗНЕС ===
    const price = business.price || 5;
    const baseServiceDemand = business.maxEmployees * 10;

    const efficiencyMod = business.efficiency / 100;
    const reputationMod = business.reputation / 100;
    const priceMod = 1 / price;
    const marketMod = globalMarketValue;

    let serviceDemand = baseServiceDemand * efficiencyMod * reputationMod * priceMod * marketMod;

    if (playerSkills && playerSkills.length > 0) {
      const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills);
      const salesBonus = playerImpact.salesBonus / 100;
      serviceDemand *= (1 + salesBonus);
    }

    const pricePerService = 1000 * price;
    salesIncome = Math.floor(serviceDemand * pricePerService);

    console.log(`[Business ${business.name}] SERVICE: Demand=${serviceDemand.toFixed(1)}, Price=${price}, Market=${marketMod.toFixed(2)}, Income=$${salesIncome}`);

  } else if (inventory) {
    // === ТОВАРНЫЙ БИЗНЕС ===
    const price = business.price || 5;

    const baseDemand = business.maxEmployees * 50;
    const efficiencyMod = business.efficiency / 100;
    const reputationMod = business.reputation / 100;
    const marketMod = globalMarketValue;

    let baseProductDemand = baseDemand * efficiencyMod * reputationMod * marketMod;
    const priceMod = 1 / price;
    let finalDemand = baseProductDemand * priceMod;

    if (!isPreview) {
      const demandFluctuation = 0.8 + Math.random() * 0.4;
      finalDemand *= demandFluctuation;
    }

    if (playerSkills && playerSkills.length > 0) {
      const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills);
      const salesBonus = playerImpact.salesBonus / 100;
      finalDemand *= (1 + salesBonus);
    }

    salesVolume = Math.min(Math.floor(finalDemand), inventory.currentStock);
    salesIncome = salesVolume * inventory.pricePerUnit;

    if (inventory.autoPurchaseAmount > 0) {
      purchaseAmount = inventory.autoPurchaseAmount;
    } else {
      purchaseAmount = Math.max(0, inventory.maxStock - (inventory.currentStock - salesVolume));
    }

    purchaseCost = purchaseAmount * inventory.purchaseCost;

    console.log(`[Business ${business.name}] PRODUCT: BaseDemand=${baseProductDemand.toFixed(1)}, Price=${price}, Market=${marketMod.toFixed(2)}, FinalDemand=${finalDemand.toFixed(1)}, Sales=${salesVolume}, Income=$${salesIncome}`);
  }

  const totalIncome = salesIncome;
  const totalExpenses = baseExpenses + purchaseCost;

  const newInventory: BusinessInventory = inventory ? {
    ...inventory,
    currentStock: Math.max(0, Math.min(inventory.maxStock, inventory.currentStock - salesVolume + purchaseAmount))
  } : {
    currentStock: 0,
    maxStock: 1000,
    pricePerUnit: 100,
    purchaseCost: 50,
    autoPurchaseAmount: 0
  };

  if (playerSkills && playerSkills.length > 0) {
    console.log(`[Business ${business.name}] Player impact on financials: ExpenseReduction=${(playerExpenseReduction * 100).toFixed(1)}%`);
  }

  console.log(`[Business ${business.name}] Global Market: ${globalMarketValue.toFixed(2)}, Income=$${totalIncome}, Expenses=$${totalExpenses}, Profit=$${totalIncome - totalExpenses}`);

  return {
    income: Math.round(totalIncome),
    expenses: Math.round(totalExpenses),
    profit: Math.round(totalIncome - totalExpenses),
    newInventory
  };
}

/**
 * Рассчитывает доход бизнеса (упрощенная версия для UI)
 */
export function calculateBusinessIncome(business: Business): number {
  const financials = calculateBusinessFinancials(business, true);
  return financials.income;
}

/**
 * @deprecated Use calculateBusinessFinancials instead
 */
export function updateInventory(business: Business): BusinessInventory {
  return business.inventory;
}

/**
 * Генерирует случайные события для бизнеса
 */
export function generateBusinessEvents(business: Business, currentTurn: number): BusinessEvent[] {
  const state = business.state ?? 'active';
  if (state !== 'active') return [];

  const events: BusinessEvent[] = [];
  // 0-3 события за квартал
  const eventCount = Math.floor(Math.random() * 4);

  // Шанс негативного события выше, если эффективность или репутация низкие
  const negativeChance = 0.3 + (100 - business.efficiency) / 200 + (100 - business.reputation) / 200;

  for (let i = 0; i < eventCount; i++) {
    const isNegative = Math.random() < negativeChance;

    if (isNegative) {
      const negativeEvents = [
        { title: "Конфликт сотрудников", desc: "Снижение эффективности", eff: -5, rep: -2 },
        { title: "Поломка оборудования", desc: "Требуется ремонт", eff: -10, money: -500 },
        { title: "Жалоба клиента", desc: "Удар по репутации", rep: -5, eff: -2 },
        { title: "Проверка", desc: "Найдены нарушения", money: -1000, rep: -3 },
        { title: "Порча товара", desc: "Списана часть склада", money: -Math.round((business.inventory?.currentStock || 0) * (business.inventory?.purchaseCost || 0) * 0.1) }
      ];
      const evt = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];

      events.push({
        id: `evt_${Date.now()}_${Math.random()}`,
        type: 'negative',
        title: evt.title,
        description: evt.desc,
        turn: currentTurn,
        effects: {
          efficiency: evt.eff,
          reputation: evt.rep,
          money: evt.money
        }
      });
    } else {
      const positiveEvents = [
        { title: "Удачный маркетинг", desc: "Рост продаж", rep: 5, eff: 2 },
        { title: "Премия", desc: "Награда от города", rep: 3, money: 500 },
        { title: "Командный дух", desc: "Рост эффективности", eff: 5, rep: 1 },
        { title: "Выгодная сделка", desc: "Снижение расходов", money: 200 },
        { title: "Вирусный пост", desc: "Резкий рост популярности", rep: 8 }
      ];
      const evt = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];

      events.push({
        id: `evt_${Date.now()}_${Math.random()}`,
        type: 'positive',
        title: evt.title,
        description: evt.desc,
        turn: currentTurn,
        effects: {
          efficiency: evt.eff,
          reputation: evt.rep,
          money: evt.money
        }
      });
    }
  }

  return events;
}

/**
 * Рассчитывает голос NPC по предложению
 */
export function calculateNPCVote(
  proposal: BusinessProposal,
  business: Business,
  partner: BusinessPartner,
  marketPrice: number = 5 // Базовая рыночная цена
): boolean {
  // Если отношение плохое, голосует против из вредности (с вероятностью 30%)
  if (partner.relation < 30 && Math.random() < 0.3) {
    return false;
  }

  switch (proposal.type) {
    case 'change_price':
      const newPrice = proposal.payload.newPrice || business.price;

      // Если цена в разумных пределах (4-8), то скорее всего ЗА
      if (newPrice >= 4 && newPrice <= 8) return true;

      // Если эффективность низкая, нужны перемены -> ЗА
      if (business.efficiency < 40) return true;

      // Если эффективность высокая и цена растет -> ЗА (капитализация успеха)
      if (business.efficiency > 80 && newPrice > business.price) return true;

      return false;

    case 'change_quantity':
      const newQuantity = proposal.payload.newQuantity || 0;
      const currentStock = business.inventory?.currentStock || 0;
      const maxStock = business.inventory?.maxStock || 1000;

      // Если склад почти полон (>80%) и мы снижаем производство -> ЗА
      if (currentStock > maxStock * 0.8 && newQuantity < business.quantity) return true;

      // Если склад почти пуст (<20%) и мы повышаем производство -> ЗА
      if (currentStock < maxStock * 0.2 && newQuantity > business.quantity) return true;

      // В остальных случаях NPC консервативен, если изменение резкое (>50%)
      const changePercent = Math.abs(newQuantity - business.quantity) / (business.quantity || 1);
      if (changePercent > 0.5) return false;

      return true;

    case 'expand_network':
      // NPC всегда за расширение, если есть деньги
      return true;

    case 'withdraw_dividends':
      // Если денег много, то ЗА
      return true;

    default:
      return false;
  }
}

