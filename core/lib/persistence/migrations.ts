import type { GameState } from '@/core/schemas/game.schema'

// Migration functions for each version upgrade
type MigrationFn = (oldState: any) => any

const migrations: Record<number, MigrationFn> = {
  // Example: v1 -> v2
  // Uncomment and modify when you need to add a new field or change structure
  /*
  2: (state) => {
    console.log('📦 Migrating save from v1 to v2')
    return {
      ...state,
      // Example: Add new field with default value
      newFeature: {
        enabled: false,
        value: 0
      },
      // Example: Rename field
      player: state.player ? {
        ...state.player,
        newFieldName: state.player.oldFieldName || 'default'
      } : null
    }
  },
  */

  // Example: v2 -> v3
  /*
  3: (state) => {
    console.log('📦 Migrating save from v2 to v3')
    return {
      ...state,
      // Add another field
      anotherNewField: []
    }
  }
  */
}

export function migrateState(state: any, fromVersion: number, toVersion: number): GameState {
  let migratedState = state

  for (let v = fromVersion + 1; v <= toVersion; v++) {
    const migrationFn = migrations[v]
    if (migrationFn) {
      console.log(`📦 Migrating save from v${v - 1} to v${v}`)
      migratedState = migrationFn(migratedState)
    } else {
      console.warn(`⚠️ No migration defined for version ${v}, skipping`)
    }
  }

  console.log(`✅ Migration complete: v${fromVersion} → v${toVersion}`)
  return migratedState
}
