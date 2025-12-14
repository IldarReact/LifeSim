# Event System Analysis

This document outlines how events are generated and how they impact the gameplay, identifying current implementations and missing links.

## 1. Global Market Events (Мировые события)
*   **Trigger:** `core/model/logic/turns/market-processor.ts` -> `generateMarketEvent`
*   **Frequency:** 30% chance per quarter.
*   **Flow:**
    1.  `processTurn` calls `processMarket`.
    2.  `processMarket` generates an event (e.g., "Economic Boom", "Financial Collapse").
    3.  Event is added to `state.marketEvents`.
    4.  Notification is displayed to the player.
*   **Impact (⚠️ BROKEN):**
    *   **Intended Behavior:** The event should update `state.globalMarket.value` (e.g., 1.0 -> 1.5). This value is passed to `calculateBusinessFinancials` to boost/reduce sales.
    *   **Current Behavior:** `state.globalMarket.value` is **NEVER UPDATED** in `processTurn`. It remains static (default 1.0).
    *   **Result:** Players see the event notification, but their business income **does not change**.

## 2. Economic Events (События страны)
*   **Trigger:** `core/lib/financial-crisis.ts` -> `generateCrisisEconomicEvent` / `core/lib/calculations/generate-global-events.ts`
*   **Frequency:** Should be checked periodically.
*   **Flow:**
    *   Logic for generating crises (Pandemic, Tech Boom) exists in `generate-global-events.ts` and `financial-crisis.ts`.
    *   **Missing Link:** These generation functions are **NOT CALLED** in the main `processTurn` loop.
*   **Impact (⚠️ BROKEN):**
    *   `country.activeEvents` remains empty.
    *   Inflation, GDP, and Unemployment do not react to major economic shifts because these shifts are never triggered.

## 3. Business Events (События бизнеса)
*   **Trigger:** `core/model/logic/business-turn-processor.ts` -> `generateBusinessEvents`
*   **Frequency:** 0-3 events per business per quarter.
*   **Flow:**
    1.  `processBusinessTurn` calls `generateBusinessEvents`.
    2.  Events are generated based on business Efficiency and Reputation (lower stats = higher chance of negative events).
    3.  **Effects Applied:**
        *   **Money:** Added/subtracted from quarterly profit.
        *   **Efficiency/Reputation:** Stats updated immediately.
    4.  Notification displayed.
*   **Impact (✅ WORKING):**
    *   Directly affects business profitability and metrics.

## 4. Personal Events (Личные события)
*   **Trigger:** `core/model/logic/turns/personal-processor.ts`
*   **Scope:**
    *   **Dating:** Logic for finding a partner exists and works.
    *   **Pregnancy:** Logic for childbirth exists and works.
*   **Missing (⚠️ PARTIAL):**
    *   Random events defined in `apply-random-personal-events.ts` (e.g., Sickness, Accidents) are **NOT CALLED** in `processTurn`.
    *   Players currently do not face random health/happiness drops from these events.

## 5. Inflation System (Инфляция)
*   **Trigger:** `core/model/logic/turns/inflation-processor.ts` -> `processInflation`
*   **Frequency:** Once per year (Q1).
*   **Flow:**
    1.  `processTurn` calls `processInflation`.
    2.  `generateYearlyInflation` calculates new rate based on:
        *   **Trend:** Follows previous year's inflation.
        *   **Random:** Small fluctuation.
        *   **Events:** Checks `country.activeEvents` (currently empty).
    3.  `country.inflation` is updated.
    4.  **Price Updates:**
        *   Shop prices, Rent, and Expenses are calculated using `getInflatedPrice` which uses the new inflation.
*   **Impact (⚠️ PARTIALLY WORKING):**
    *   Inflation fluctuates and affects prices.
    *   **Limitation:** Since Economic Events (Crises) are broken, inflation never spikes due to a crisis, only via random drift.

## Summary of Fixes Needed
1.  **Fix Market Impact:** Update `processTurn` to calculate `globalMarket.value` based on active `marketEvents` and save it to state.
2.  **Enable Economic Events:** Add a step in `processTurn` to call `generateGlobalEvents` or `generateCrisisEconomicEvent` and update `country.activeEvents`.
3.  **Enable Personal Random Events:** Call `applyRandomPersonalEvents` in `processPersonal`.
