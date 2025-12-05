import type { Business, BusinessInventory } from "@/core/types/business.types";
import type { Skill } from '@/core/types';
import { calculateEmployeeKPI } from './employee-calculations';
import { getPlayerRoleBusinessImpact } from '@/features/business/lib/player-roles';

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
      // Если задан quantity (план производства/запасов), используем его как целевой уровень
      // Иначе пытаемся заполнить склад до максимума
      const targetStock = business.quantity > 0 ? business.quantity : inventory.maxStock;
      purchaseAmount = Math.max(0, targetStock - (inventory.currentStock - salesVolume));
    }

    purchaseCost = purchaseAmount * inventory.purchaseCost;

    console.log(`[Business ${business.name}] PRODUCT: BaseDemand=${baseProductDemand.toFixed(1)}, Price=${price}, Market=${marketMod.toFixed(2)}, FinalDemand=${finalDemand.toFixed(1)}, Sales=${salesVolume}, Income=$${salesIncome}`);
  }

  const totalIncome = salesIncome;
  let totalExpenses = baseExpenses + purchaseCost;

  // ✅ НОВОЕ: Расчет налогов
  const grossProfit = totalIncome - totalExpenses;
  let taxAmount = 0;

  if (grossProfit > 0) {
    const taxRate = business.taxRate || 0.15;
    // Бухгалтер может снизить налогооблагаемую базу или ставку?
    // Пока просто базовая ставка
    taxAmount = Math.round(grossProfit * taxRate);

    // Если есть бухгалтер, он уже снизил baseExpenses, что увеличило прибыль и налог
    // Но в реальности бухгалтер оптимизирует налоги. 
    // Давайте сделаем так: если есть бухгалтер, налог снижается на 10-20%
    if (accountants.length > 0) {
      const totalStars = accountants.reduce((sum, a) => sum + a.stars, 0);
      const taxReduction = Math.min(0.20, 0.05 + (totalStars * 0.02)); // 5-20%
      taxAmount = Math.round(taxAmount * (1 - taxReduction));
      console.log(`[Business ${business.name}] Accountant reduced tax by ${(taxReduction * 100).toFixed(1)}%`);
    }

    totalExpenses += taxAmount;
  }

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

  console.log(`[Business ${business.name}] Global Market: ${globalMarketValue.toFixed(2)}, Income=$${totalIncome}, Expenses=$${totalExpenses} (Tax: ${taxAmount}), Profit=$${totalIncome - totalExpenses}`);

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
