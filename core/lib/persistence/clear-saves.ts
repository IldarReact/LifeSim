/**
 * Утилита для очистки localStorage от старых сохранений
 * Используйте это после обновления структуры данных
 */

export function clearAllSaves() {
  if (typeof window === 'undefined') {
    console.warn('clearAllSaves can only be called in browser')
    return
  }

  const keys = [
    'lifesim-save-v1',
    'lifesim-checksum',
    'lifesim-backup'
  ]

  keys.forEach(key => {
    try {
      localStorage.removeItem(key)
      console.log(`✅ Cleared: ${key}`)
    } catch (error) {
      console.error(`❌ Failed to clear ${key}:`, error)
    }
  })

  console.log('🎉 All saves cleared! Refresh the page to start fresh.')
}

// Экспортируем в window для удобства вызова из консоли браузера
if (typeof window !== 'undefined') {
  (window as any).clearAllSaves = clearAllSaves
  console.log('💡 To clear all saves, run: clearAllSaves()')
}
