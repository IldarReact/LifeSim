// src/shared/data/housing/loader.ts
import { HousingOption } from '@/core/types/housing.types';

// Импорт JSON-файлов по странам
import usHousing from '@/shared/data/world/countries/us/housing.json';
import geHousing from '@/shared/data/world/countries/germany/housing.json';
import brHousing from '@/shared/data/world/countries/brazil/housing.json';

// ──────────────────────────────────────────────────────────────────────
// Валидация одного объекта жилья (строгая, но с понятными ошибками)
// ──────────────────────────────────────────────────────────────────────
function isValidHousingOption(item: unknown): item is HousingOption {
  const h = item as Partial<HousingOption>;

  if (!h.id || typeof h.id !== 'string') {
    console.error('Housing validation failed: missing or invalid id', item);
    return false;
  }
  if (!h.name || typeof h.name !== 'string') {
    console.error(`Housing validation failed for ${h.id}: invalid name`);
    return false;
  }
  if (!h.description || typeof h.description !== 'string') {
    console.error(`Housing validation failed for ${h.id}: invalid description`);
    return false;
  }

  if (!['rent', 'mortgage', 'own'].includes(h.type ?? '')) {
    console.error(`Housing validation failed for ${h.id}: invalid type ${h.type}`);
    return false;
  }

  if (!h.subtype || typeof h.subtype !== 'string') {
    console.error(`Housing validation failed for ${h.id}: invalid subtype`);
    return false;
  }
  if (typeof h.marketValue !== 'number' || h.marketValue < 0) {
    console.error(`Housing validation failed for ${h.id}: invalid marketValue ${h.marketValue}`);
    return false;
  }
  if (typeof h.rentCostPerQuarter !== 'number' || h.rentCostPerQuarter < 0) {
    console.error(`Housing validation failed for ${h.id}: invalid rentCostPerQuarter ${h.rentCostPerQuarter}`);
    return false;
  }
  if (typeof h.maintenanceCost !== 'number' || h.maintenanceCost < 0) {
    console.error(`Housing validation failed for ${h.id}: invalid maintenanceCost ${h.maintenanceCost}`);
    return false;
  }
  if (typeof h.capacity !== 'number' || h.capacity <= 0) {
    console.error(`Housing validation failed for ${h.id}: invalid capacity ${h.capacity}`);
    return false;
  }
  if (typeof h.attractiveness !== 'number' || h.attractiveness < 0 || h.attractiveness > 100) {
    console.error(`Housing validation failed for ${h.id}: invalid attractiveness ${h.attractiveness}`);
    return false;
  }

  if (typeof h.isRentable !== 'boolean') {
    console.error(`Housing validation failed for ${h.id}: invalid isRentable ${h.isRentable}`);
    return false;
  }
  if (typeof h.rentalIncomePerQuarter !== 'number' || h.rentalIncomePerQuarter < 0) {
    console.error(`Housing validation failed for ${h.id}: invalid rentalIncomePerQuarter ${h.rentalIncomePerQuarter}`);
    return false;
  }

  // effects — может быть пустым объектом
  if (h.effects && typeof h.effects !== 'object') {
    console.error(`Housing validation failed for ${h.id}: invalid effects`);
    return false;
  }

  // nearbyConstructions — массив объектов
  if (h.nearbyConstructions && !Array.isArray(h.nearbyConstructions)) {
    console.error(`Housing validation failed for ${h.id}: invalid nearbyConstructions`);
    return false;
  }

  return true;
}

// ──────────────────────────────────────────────────────────────────────
// Загрузка и валидация данных по стране
// ──────────────────────────────────────────────────────────────────────
function loadHousing(data: unknown[], source: string): HousingOption[] {
  if (!Array.isArray(data)) {
    throw new Error(`Housing data is not an array: ${source}`);
  }

  const valid: HousingOption[] = [];
  const invalid: unknown[] = [];

  for (const item of data) {
    if (isValidHousingOption(item)) {
      valid.push(item);
    } else {
      invalid.push(item);
    }
  }

  if (invalid.length > 0) {
    console.error(`Found ${invalid.length} invalid housing entries in ${source}:`, invalid);
    throw new Error(`Housing data validation failed for ${source}. See console for details.`);
  }

  return valid;
}

// ──────────────────────────────────────────────────────────────────────
// Регистр жилья по странам
// ──────────────────────────────────────────────────────────────────────
const COUNTRY_HOUSING: Record<string, HousingOption[]> = {
  us: loadHousing(usHousing, 'US'),
  germany: loadHousing(geHousing, 'Germany'),
  brazil: loadHousing(brHousing, 'Brazil'),
};

// ──────────────────────────────────────────────────────────────────────
// Публичные функции
// ──────────────────────────────────────────────────────────────────────

// Все жильё для конкретной страны
export function getHousingForCountry(countryId: string): HousingOption[] {
  return COUNTRY_HOUSING[countryId] ?? [];
}

// По ID (с указанием страны)
export function getHousingById(id: string, countryId: string = 'us'): HousingOption | undefined {
  return getHousingForCountry(countryId).find(h => h.id === id);
}

// Доступное жильё по финансам (учитываем тип владения)
export function getAvailableHousing(
  playerMoney: number,
  playerSalary: number,
  countryId: string = 'us'
): HousingOption[] {
  const options = getHousingForCountry(countryId);

  return options.filter(housing => {
    // Аренда — проверяем, хватает ли на 3 квартала вперёд (безопасность)
    if (housing.type === 'rent') {
      const needed = housing.rentCostPerQuarter * 3;
      return playerMoney >= needed;
    }

    // Ипотека — нужен первоначальный взнос (обычно 20–30% от marketValue)
    if (housing.type === 'mortgage') {
      const downPayment = Math.round(housing.marketValue * 0.25); // можно вынести в конфиг
      return playerMoney >= downPayment;
    }

    // Своё жильё — нужна вся сумма
    if (housing.type === 'own') {
      return playerMoney >= housing.marketValue;
    }

    return false;
  });
}

// Лучшие инвестиционные варианты (по росту привлекательности)
export function getBestInvestmentHousing(
  countryId: string = 'us',
  limit: number = 5
): HousingOption[] {
  const housing = getHousingForCountry(countryId);

  return housing
    .map(h => {
      const totalBonus = h.nearbyConstructions.reduce((sum, c) => sum + c.attractivenessBonus, 0);
      return { housing: h, potentialGrowth: totalBonus };
    })
    .sort((a, b) => b.potentialGrowth - a.potentialGrowth)
    .slice(0, limit)
    .map(x => x.housing);
}

// Для обратной совместимости (старые компоненты)
export const HOUSING_OPTIONS = COUNTRY_HOUSING.us;

// Дефолтное жильё при старте (аренда комнаты)
export const DEFAULT_HOUSING_ID = 'rent_room_basic';