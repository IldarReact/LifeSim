import { GameState, GameStateSchema } from '@/core/schemas/game.schema'
import superjson from 'superjson'
import { z } from 'zod'
import CryptoJS from 'crypto-js'

const SAVE_KEY = 'lifesim_save_v1'
const CURRENT_VERSION = 1

// Secret key for HMAC (в продакшене должен быть в .env)
const SECRET_KEY = process.env.NEXT_PUBLIC_SAVE_SECRET || 'lifesim-default-secret-key-change-in-production'

// Strict mode: reject corrupted/modified saves
const STRICT_MODE = process.env.NODE_ENV === 'production'

interface SaveData {
  version: number
  data: string // SuperJSON string
  checksum: string
}

// HMAC-SHA256 checksum for anti-tampering
function calculateChecksum(data: string): string {
  return CryptoJS.HmacSHA256(data, SECRET_KEY).toString()
}

export const saveManager = {
  save(state: GameState): void {
    if (typeof window === 'undefined') {
      console.warn('⚠️ Cannot save on server side')
      return
    }

    try {
      // Skip saving if state is empty or incomplete (during setup/menu)
      if (!state || Object.keys(state).length === 0) {
        console.log('⏭️ Skipping save (empty state)')
        return
      }

      // Skip if in setup/menu phase (before game fully initialized)
      if (state.gameStatus === 'menu' ||
        state.gameStatus === 'setup' ||
        state.gameStatus === 'select_country' ||
        state.gameStatus === 'select_character') {
        console.log(`⏭️ Skipping save (game status: ${state.gameStatus})`)
        return
      }

      // Skip if player not initialized yet
      if (!state.player) {
        console.log('⏭️ Skipping save (player not initialized)')
        return
      }

      // 1. Validate before saving (ensure we don't save broken state)
      const validation = GameStateSchema.safeParse(state)
      if (!validation.success) {
        console.error('❌ Save validation failed:')
        console.error('Detailed errors:', validation.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
          received: (e as any).received
        })))
        console.error('First 3 errors in detail:', validation.error.errors.slice(0, 3))

        if (STRICT_MODE) {
          throw new Error('Cannot save invalid game state')
        } else {
          console.warn('⚠️ Saving anyway in dev mode (validation disabled)')
        }
      }

      // 2. Serialize
      const serialized = superjson.stringify(state)

      // 3. Checksum
      const checksum = calculateChecksum(serialized)

      // 4. Wrap
      const saveData: SaveData = {
        version: CURRENT_VERSION,
        data: serialized,
        checksum
      }

      // 5. Write
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
      console.log('✅ Game saved successfully')
    } catch (error) {
      console.error('❌ Failed to save game:', error)
      throw error
    }
  },

  async load(): Promise<GameState | null> {
    if (typeof window === 'undefined') {
      console.warn('⚠️ Cannot load on server side')
      return null
    }

    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return null

      const saveData: SaveData = JSON.parse(raw)

      // 1. Checksum validation
      const currentChecksum = calculateChecksum(saveData.data)
      if (currentChecksum !== saveData.checksum) {
        const errorMsg = '🚨 SAVE FILE CORRUPTED OR MODIFIED (checksum mismatch)'
        console.error(errorMsg)

        if (STRICT_MODE) {
          throw new Error(errorMsg)
        } else {
          console.warn('⚠️ Loading anyway (dev mode)')
        }
      }

      // 2. Version check / Migration
      if (saveData.version !== CURRENT_VERSION) {
        console.warn(`⚠️ Save version mismatch: ${saveData.version} vs ${CURRENT_VERSION}`)
        const { migrateState } = await import('./migrations')
        const migratedData = migrateState(
          superjson.parse(saveData.data),
          saveData.version,
          CURRENT_VERSION
        )
        // Re-serialize after migration
        saveData.data = superjson.stringify(migratedData)
      }

      // 3. Deserialize
      const state = superjson.parse<GameState>(saveData.data)

      // 4. Schema Validation
      const validation = GameStateSchema.safeParse(state)
      if (!validation.success) {
        console.error('❌ Loaded state schema validation failed:')
        console.error('Errors:', validation.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code
        })))
        console.warn('💡 Hint: If you recently updated the game, your old save might be incompatible.')
        console.warn('💡 Try clearing localStorage or starting a new game.')

        if (STRICT_MODE) {
          throw new Error('Save file is corrupted or incompatible')
        } else {
          console.warn('⚠️ Auto-clearing incompatible save in dev mode...')
          // Автоматически очищаем несовместимое сохранение
          this.clear()
          // Устанавливаем флаг для UI
          if (typeof window !== 'undefined') {
            (window as any).__saveClearedFlag = true
          }
          console.log('✅ Save cleared. Please refresh the page to start fresh.')
          return null
        }
      }

      console.log('✅ Game loaded successfully')
      return validation.data
    } catch (error) {
      console.error('❌ Failed to load game:', error)
      return null
    }
  },

  hasSave(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(SAVE_KEY)
  },

  clear(): void {
    if (typeof window === 'undefined') {
      console.warn('⚠️ Cannot clear on server side')
      return
    }
    localStorage.removeItem(SAVE_KEY)
    console.log('🗑️ Save cleared')
  }
}
