// src/types/housing.types.ts
import type { StatEffect } from './stats.types';

/**
 * Тип владения жильём
 */
export type HousingOwnershipType =
  | 'rent'       // Аренда — платим rentCostPerQuarter
  | 'mortgage'   // Ипотека — платим rentCostPerQuarter + владеем
  | 'own';       // Полностью своё — только maintenance

/**
 * Физический тип жилья (для иконок, фильтров и визуала)
 */
export type HousingSubType =
  | 'studio'
  | 'apartment'
  | 'townhouse'
  | 'house'
  | 'penthouse'
  | 'villa'
  | 'favela_house'
  | 'khrushchevka'
  | 'communal'
  | 'cottage'
  | 'mansion';

/**
 * Строящийся рядом объект — главная инвестиционная фича
 */
export interface NearbyConstruction {
  id: string;                              // Уникальный ID стройки
  name: string;                            // "Метро", "Больница", "ТЦ", "Завод"
  buildTime: number;                       // Сколько кварталов всего строится
  currentProgress: number;                 // От 0 до buildTime (обновляется каждый ход)
  effectDuringConstruction: StatEffect;    // Эффекты пока идёт стройка (обычно негативные)
  effectOnCompletion: StatEffect;          // Постоянные бонусы после завершения
  attractivenessBonus: number;             // На сколько % вырастет привлекательность жилья после завершения
}

/**
 * Основной объект недвижимости в игре
 */
export interface HousingOption {
  id: string;                              // Уникальный идентификатор
  name: string;                            // Название для игрока
  description: string;                     // Подробное описание

  type: HousingOwnershipType;              // Как владеем: аренда / ипотека / своё
  subtype: HousingSubType;                 // Физический тип (квартира, дом, хрущёвка и т.д.)

  marketValue: number;                     // Текущая рыночная стоимость (меняется со временем!)
  rentCostPerQuarter: number;              // Платёж за квартал (аренда или ипотека). 0 — если своё
  maintenanceCost: number;                 // Обязательные расходы на содержание (коммуналка, ремонт, налог)

  capacity: number;                        // Сколько человек может жить
  effects: StatEffect;                     // Постоянные эффекты на статы персонажа (святая святых)

  attractiveness: number;                  // Привлекательность 0–100 — влияет на цену и желание купить
  nearbyConstructions: NearbyConstruction[]; // Строящиеся рядом объекты — причина роста цены

  isRentable: boolean;                     // Можно ли сдавать в субаренду?
  rentalIncomePerQuarter: number;          // Сколько получаем за квартал при сдаче

  yearBuilt?: number;                      // Год постройки — влияет на maintenance и attractiveness
  imageUrl?: string;                       // Фото / иконка для карточки
  isOwnedByPlayer?: boolean;               // Уже куплено игроком (для инвентаря)
}