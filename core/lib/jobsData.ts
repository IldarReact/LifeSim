import type { JobInfo } from '@/core/types'

export const JOB_INFO: Record<string, JobInfo> = {
  investor: {
    archetype: 'investor',
    title: 'Инвестор',
    description: 'Управляете портфелем инвестиций, анализируете рынки и принимаете стратегические решения о вложениях капитала.',
    satisfaction: 75,
    energyCost: 20,
    mentalHealthImpact: -2,
    physicalHealthImpact: -1,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
  },
  specialist: {
    archetype: 'specialist',
    title: 'IT-специалист',
    description: 'Разрабатываете программное обеспечение, решаете сложные технические задачи и создаёте инновационные продукты.',
    satisfaction: 80,
    energyCost: 30,
    mentalHealthImpact: -3,
    physicalHealthImpact: -2,
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'
  },
  entrepreneur: {
    archetype: 'entrepreneur',
    title: 'Предприниматель',
    description: 'Развиваете собственный бизнес, принимаете риски и создаёте новые возможности на рынке.',
    satisfaction: 85,
    energyCost: 40,
    mentalHealthImpact: -5,
    physicalHealthImpact: -3,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop'
  },
  worker: {
    archetype: 'worker',
    title: 'Рабочий',
    description: 'Выполняете физическую работу, обеспечиваете производственные процессы и поддерживаете инфраструктуру.',
    satisfaction: 60,
    energyCost: 35,
    mentalHealthImpact: 0,
    physicalHealthImpact: -4,
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop'
  },
  indebted: {
    archetype: 'indebted',
    title: 'Офисный работник',
    description: 'Работаете в офисе, выполняете рутинные задачи и пытаетесь выбраться из долгов.',
    satisfaction: 50,
    energyCost: 25,
    mentalHealthImpact: -4,
    physicalHealthImpact: -1,
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=600&fit=crop'
  }
}
