import type { RestActivity } from '@/core/types/rest.types'
import brRest from '@/shared/data/world/countries/brazil/rest.json'
import geRest from '@/shared/data/world/countries/germany/rest.json'
import usRest from '@/shared/data/world/countries/us/rest.json'

function validateRestActivity(item: unknown): item is RestActivity {
  const r = item as RestActivity
  if (!r.id || typeof r.id !== 'string') return false
  if (!r.title || typeof r.title !== 'string') return false
  if (typeof r.energyCost !== 'number') return false
  if (typeof r.cost !== 'number') return false
  if (!r.icon || typeof r.icon !== 'string') return false
  return true
}

function loadRestActivities(data: unknown[], source: string): RestActivity[] {
  const validated: RestActivity[] = []
  for (const item of data) {
    if (validateRestActivity(item)) {
      validated.push(item)
    } else {
      console.error(`Invalid rest activity in ${source}:`, item)
    }
  }
  return validated
}

const COUNTRY_REST: Record<string, RestActivity[]> = {
  us: loadRestActivities(usRest, 'us/rest.json'),
  germany: loadRestActivities(geRest, 'ge/rest.json'),
  brazil: loadRestActivities(brRest, 'br/rest.json')
}

export function getRestActivitiesForCountry(countryId: string): RestActivity[] {
  return COUNTRY_REST[countryId] || COUNTRY_REST['us'] || [];
}
