# Data Architecture

## Overview
All game data is now **country-specific**. Each country has its own set of items, jobs, courses, businesses, etc.

## Directory Structure

```
shared/data/
├── schemas/                    # JSON Schemas for validation
│   ├── shop-item.schema.json
│   ├── housing.schema.json
│   ├── job.schema.json
│   ├── course.schema.json
│   └── business-type.schema.json
│
└── world/
    ├── commons/                # Universal data (skills, etc)
    │   └── skills.json        # (to be implemented)
    │
    └── countries/              # Country-specific data
        ├── us/                 # United States
        │   ├── food.json
        │   ├── transport.json
        │   ├── health.json
        │   ├── services.json
        │   ├── housing.json
        │   ├── jobs.json
        │   ├── courses.json
        │   └── businesses.json
        │
        ├── germany/            # Germany
        │   └── (same structure)
        │
        └── brazil/             # Brazil
            └── (same structure)
```

## Data Loaders

All data loaders are located in `core/lib/data-loaders/`:

- `shop-loader.ts` - Food, transport, health, services, housing
- `housing-loader.ts` - Housing options (separate for convenience)
- `jobs-loader.ts` - Job vacancies
- `courses-loader.ts` - Educational courses
- `businesses-loader.ts` - Business types

### Usage Example

```typescript
import { getShopItemById } from '@/core/lib/data-loaders/shop-loader'
import { getHousingById } from '@/core/lib/data-loaders/housing-loader'

// Always pass countryId
const food = getShopItemById('food_homemade', player.countryId)
const housing = getHousingById('rent_room', player.countryId)
```

## Key Principles

1. **No Commons Fallback**: Data is loaded ONLY from country folders. No merging with commons.
2. **Country ID Required**: All loader functions require `countryId` parameter (defaults to 'us').
3. **Type Safety**: All data is validated at load time using TypeScript type guards.
4. **JSON Schemas**: All data files should conform to their respective JSON schemas.

## Country IDs

- `us` - United States
- `ge` - Germany  
- `br` - Brazil

## Adding New Country

1. Create folder: `shared/data/world/countries/{country_id}/`
2. Add all required JSON files (food, transport, health, services, housing, jobs, courses, businesses)
3. Update all data loaders to import and register the new country
4. Add country to `INITIAL_COUNTRIES` in `core/lib/initialState.ts`
