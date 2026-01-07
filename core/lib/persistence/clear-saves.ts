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
    'artsurv-save-v1',
    'artsurv-checksum',
    'artsurv-backup'
  ]

  keys.forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
    }
  })

}

declare global {
  interface Window {
    clearAllSaves: typeof clearAllSaves
  }
}

// Экспортируем в window для удобства вызова из консоли браузера
if (typeof window !== 'undefined') {
  window.clearAllSaves = clearAllSaves
}
