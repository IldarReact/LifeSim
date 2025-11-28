import type { EmployeeCandidate, EmployeeRole, EmployeeLevel, EmployeeSkills, Business } from "@/core/types/business.types"

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
 * Генерирует случайные навыки для сотрудника на основе роли и уровня
 */
function generateSkills(role: EmployeeRole, level: EmployeeLevel): EmployeeSkills {
  const baseSkills = {
    efficiency: 50,
    salesAbility: 50,
    technical: 50,
    management: 50,
    creativity: 50
  }

  // Модификаторы по уровню
  const levelBonus = {
    junior: 0,
    middle: 15,
    senior: 30,
    expert: 50
  }[level]

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

  // Применяем бонус уровня ко всем навыкам
  Object.keys(skills).forEach(key => {
    const skillKey = key as keyof EmployeeSkills
    skills[skillKey] = Math.min(100, skills[skillKey] + levelBonus + Math.random() * 10 - 5)
  })

  return skills
}

/**
 * Рассчитывает зарплату на основе роли, уровня и навыков
 */
function calculateSalary(role: EmployeeRole, level: EmployeeLevel, skills: EmployeeSkills): number {
  const baseSalary = {
    worker: 800,
    salesperson: 1200,
    technician: 1500,
    accountant: 1800,
    marketer: 2000,
    manager: 2500
  }[role]

  const levelMultiplier = {
    junior: 0.7,
    middle: 1.0,
    senior: 1.5,
    expert: 2.2
  }[level]

  // Средний навык влияет на зарплату
  const avgSkill = Object.values(skills).reduce((a, b) => a + b, 0) / Object.keys(skills).length
  const skillMultiplier = 0.8 + (avgSkill / 100) * 0.4 // 0.8 - 1.2

  return Math.round(baseSalary * levelMultiplier * skillMultiplier)
}

/**
 * Генерирует кандидата на работу
 */
export function generateEmployeeCandidate(role: EmployeeRole, level?: EmployeeLevel): EmployeeCandidate {
  const candidateLevel = level || (['junior', 'middle', 'senior', 'expert'][Math.floor(Math.random() * 4)] as EmployeeLevel)
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const skills = generateSkills(role, candidateLevel)
  const salary = calculateSalary(role, candidateLevel, skills)
  const experience = {
    junior: Math.floor(Math.random() * 12),
    middle: 12 + Math.floor(Math.random() * 24),
    senior: 36 + Math.floor(Math.random() * 36),
    expert: 72 + Math.floor(Math.random() * 60)
  }[candidateLevel]

  const roleDesc = ROLE_DESCRIPTIONS[role]

  return {
    id: `candidate_${Date.now()}_${Math.random()}`,
    name: `${firstName} ${lastName}`,
    role,
    level: candidateLevel,
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
  const levels: EmployeeLevel[] = ['junior', 'middle', 'senior', 'expert']

  for (let i = 0; i < count; i++) {
    // Распределяем уровни: больше middle и junior, меньше senior и expert
    const levelWeights = [0.3, 0.4, 0.2, 0.1]
    const random = Math.random()
    let cumulative = 0
    let selectedLevel: EmployeeLevel = 'junior'

    for (let j = 0; j < levels.length; j++) {
      cumulative += levelWeights[j]
      if (random <= cumulative) {
        selectedLevel = levels[j]
        break
      }
    }

    candidates.push(generateEmployeeCandidate(role, selectedLevel))
  }

  return candidates
}

/**
 * Рассчитывает детальные финансовые показатели бизнеса
 */
export function calculateBusinessFinancials(business: Business): { income: number, expenses: number, profit: number } {
  let income = business.quarterlyIncome || 0
  let expenses = business.quarterlyExpenses || 0

  // Добавляем зарплаты сотрудников к расходам
  business.employees.forEach(employee => {
    expenses += employee.salary || 0

    // Каждый сотрудник влияет на доход в зависимости от роли и навыков
    const productivityFactor = (employee.productivity || 50) / 100
    const satisfactionFactor = (employee.satisfaction || 50) / 100
    const overallFactor = (productivityFactor + satisfactionFactor) / 2

    switch (employee.role) {
      case 'salesperson':
        // Продавец напрямую увеличивает доход
        income += (employee.skills.salesAbility || 0) * 10 * overallFactor
        break
      case 'manager':
        // Менеджер повышает эффективность всех
        income *= 1 + ((employee.skills.management || 0) / 100) * 0.2 * overallFactor
        break
      case 'marketer':
        // Маркетолог привлекает клиентов
        income += (employee.skills.creativity || 0) * 8 * overallFactor
        break
      case 'accountant':
        // Бухгалтер снижает расходы
        expenses *= 1 - ((employee.skills.efficiency || 0) / 100) * 0.15 * overallFactor
        break
      case 'technician':
        // Техник повышает качество, что привлекает клиентов
        income *= 1 + ((employee.skills.technical || 0) / 100) * 0.15 * overallFactor
        break
      case 'worker':
        // Рабочий дает базовый вклад
        income += (employee.skills.efficiency || 0) * 5 * overallFactor
        break
    }
  })

  return {
    income: Math.round(income) || 0,
    expenses: Math.round(expenses) || 0,
    profit: Math.round(income - expenses) || 0
  }
}

/**
 * Рассчитывает итоговый доход бизнеса с учетом сотрудников
 */
export function calculateBusinessIncome(business: Business): number {
  return calculateBusinessFinancials(business).profit
}

/**
 * Обновляет характеристики бизнеса на основе сотрудников
 */
export function updateBusinessMetrics(business: Business): Business {
  if (business.employees.length === 0) {
    return {
      ...business,
      efficiency: 50,
      reputation: 50,
      customerSatisfaction: 50
    }
  }

  // Средняя эффективность сотрудников
  const avgEfficiency = business.employees.reduce((sum, emp) =>
    sum + emp.skills.efficiency * (emp.productivity / 100), 0
  ) / business.employees.length

  // Репутация зависит от качества работы
  const avgTechnical = business.employees.reduce((sum, emp) =>
    sum + emp.skills.technical, 0
  ) / business.employees.length

  // Удовлетворенность клиентов зависит от продавцов и сервиса
  const salespeople = business.employees.filter(e => e.role === 'salesperson')
  const avgSales = salespeople.length > 0
    ? salespeople.reduce((sum, emp) => sum + emp.skills.salesAbility, 0) / salespeople.length
    : 60

  return {
    ...business,
    efficiency: Math.min(100, Math.round(avgEfficiency)),
    reputation: Math.min(100, Math.round((avgTechnical + business.reputation) / 2)),
    customerSatisfaction: Math.min(100, Math.round(avgSales))
  }
}
