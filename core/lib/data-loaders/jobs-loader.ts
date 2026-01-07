import type { Job } from '@/core/types/job.types'

// Country imports
import brJobs from '@/shared/data/world/countries/brazil/jobs.json'
import geJobs from '@/shared/data/world/countries/germany/jobs.json'
import usJobs from '@/shared/data/world/countries/us/jobs.json'

function validateJob(item: unknown): item is Job {
  const j = item as Job

  if (!j.id || typeof j.id !== 'string') return false
  if (!j.title || typeof j.title !== 'string') return false
  if (!j.company || typeof j.company !== 'string') return false
  if (typeof j.salary !== 'number' || j.salary < 0) return false

  return true
}

function loadJobs(data: unknown[], source: string): Job[] {
  const validated: Job[] = []

  for (const item of data) {
    if (validateJob(item)) {
      validated.push(item)
    } else {
      console.error(`Invalid job in ${source}:`, item)
      throw new Error(`Job data validation failed for ${source}`)
    }
  }

  return validated
}

// Country Data Registry
const COUNTRY_JOBS: Record<string, Job[]> = {
  us: loadJobs(usJobs, 'us/jobs.json'),
  germany: loadJobs(geJobs, 'germany/jobs.json'),
  brazil: loadJobs(brJobs, 'brazil/jobs.json')
}

// Get jobs for specific country
function getCountryJobs(countryId: string): Job[] {
  if (!COUNTRY_JOBS[countryId]) {
    console.error(`No jobs data found for country: ${countryId}`)
    return []
  }
  return COUNTRY_JOBS[countryId]
}

// Export for backward compatibility (defaults to US)
export const ALL_JOBS = COUNTRY_JOBS.us || []

export function getJobById(id: string, countryId: string = 'us'): Job | undefined {
  const jobs = getCountryJobs(countryId)
  return jobs.find(j => j.id === id)
}

export function getJobsByCategory(category: string, countryId: string = 'us'): Job[] {
  const jobs = getCountryJobs(countryId)
  return jobs.filter(j => j.category === category)
}

export function getAllJobsForCountry(countryId: string): Job[] {
  return getCountryJobs(countryId)
}

/**
 * Получить подходящую стартовую вакансию для персонажа
 * Выбирает вакансию без требований или с минимальными требованиями
 */
export function getStartingJob(countryId: string, characterSkills: { id: string; level: number }[] = []): Job | null {
  const jobs = getCountryJobs(countryId)

  if (jobs.length === 0) {
    console.error(`No jobs available for country: ${countryId}`)
    return null
  }

  // Сначала ищем вакансии без требований
  const noRequirementsJobs = jobs.filter(j =>
    !j.requirements ||
    (!j.requirements.skills || j.requirements.skills.length === 0) &&
    (!j.requirements.education) &&
    (!j.requirements.experience || j.requirements.experience === 0)
  )

  if (noRequirementsJobs.length > 0) {
    // Возвращаем первую вакансию без требований
    return noRequirementsJobs[0]
  }

  // Если нет вакансий без требований, ищем с минимальными требованиями (level 1)
  const minRequirementsJobs = jobs.filter(j => {
    if (!j.requirements?.skills) return false
    return j.requirements.skills.every(req => req.level <= 1)
  })

  if (minRequirementsJobs.length > 0) {
    return minRequirementsJobs[0]
  }

  // В крайнем случае возвращаем первую доступную вакансию
  return jobs[0]
}
