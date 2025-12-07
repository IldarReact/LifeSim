// Country imports
import usCourses from '@/shared/data/world/countries/us/courses.json'
import geCourses from '@/shared/data/world/countries/germany/courses.json'
import brCourses from '@/shared/data/world/countries/brazil/courses.json'

export interface Course {
  id: string
  name: string
  description?: string
  cost: number
  duration: number
  skillName: string
  skillGain: number
  costPerTurn?: {
    energy?: number
    sanity?: number
  }
  requirements?: {
    education?: string
    skills?: Array<{ name: string; level: number }>
  }
}

function validateCourse(item: unknown): item is Course {
  const c = item as Course

  if (!c.id || typeof c.id !== 'string') return false
  if (!c.name || typeof c.name !== 'string') return false
  if (typeof c.cost !== 'number' || c.cost < 0) return false
  if (typeof c.duration !== 'number' || c.duration < 1) return false
  if (!c.skillName || typeof c.skillName !== 'string') return false
  if (typeof c.skillGain !== 'number' || c.skillGain < 1) return false

  return true
}

function loadCourses(data: unknown[], source: string): Course[] {
  const validated: Course[] = []

  for (const item of data) {
    if (validateCourse(item)) {
      validated.push(item)
    } else {
      console.error(`Invalid course in ${source}:`, item)
      throw new Error(`Course data validation failed for ${source}`)
    }
  }

  return validated
}

// Country Data Registry
const COUNTRY_COURSES: Record<string, Course[]> = {
  us: loadCourses(usCourses, 'us/courses.json'),
  ge: loadCourses(geCourses, 'ge/courses.json'),
  br: loadCourses(brCourses, 'br/courses.json')
}

// Get courses for specific country
function getCountryCourses(countryId: string): Course[] {
  if (!COUNTRY_COURSES[countryId]) {
    console.error(`No courses data found for country: ${countryId}`)
    return []
  }
  return COUNTRY_COURSES[countryId]
}

// Export for backward compatibility (defaults to US)
export const ALL_COURSES = COUNTRY_COURSES.us || []

export function getCourseById(id: string, countryId: string = 'us'): Course | undefined {
  const courses = getCountryCourses(countryId)
  return courses.find(c => c.id === id)
}

export function getCoursesBySkill(skillName: string, countryId: string = 'us'): Course[] {
  const courses = getCountryCourses(countryId)
  return courses.filter(c => c.skillName === skillName)
}

export function getAllCoursesForCountry(countryId: string): Course[] {
  return getCountryCourses(countryId)
}
