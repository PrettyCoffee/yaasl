import { getWindow, log } from "@yaasl/utils"

import { createEffect } from "./create-effect"
import { Atom, CONFIG } from "../base"

export interface MigrationStep<
  Version extends string = string,
  PreviousVersion extends string | null = string | null,
  OldData = any,
  NewData = any,
> {
  /** Previous version of the data, before performing the migration */
  previous: PreviousVersion
  /** Version of the data after the migration */
  version: Version
  /** Function to migrate the data */
  migrate: (data: OldData) => NewData
  /** Function to validate the data before migrating */
  validate?: (data: unknown) => data is OldData
}

const sortMigrations = (migrations: MigrationStep[]) => {
  const first = migrations.find(migration => migration.previous === null)
  if (!first) {
    log.error("No migration with previous version null found")
    return []
  }

  return migrations.reduce(
    sorted => {
      const last = sorted.at(-1)
      const next = migrations.find(
        migration => migration.previous === last?.version
      )
      if (next) {
        sorted.push(next)
      }
      return sorted
    },
    [first]
  )
}

const getVersion = (atom: Atom) => {
  const key = CONFIG.name ? `${CONFIG.name}/${atom.name}` : atom.name
  return getWindow()?.localStorage.getItem(`${key}-version`) ?? null
}

const setVersion = (atom: Atom, version: string) => {
  const key = CONFIG.name ? `${CONFIG.name}/${atom.name}` : atom.name
  getWindow()?.localStorage.setItem(`${key}-version`, version)
}

interface Result {
  data?: unknown
  version?: string | null
  error?: string
}
const migrateVersion = (
  atom: Atom,
  data: unknown,
  migration: MigrationStep
): Result => {
  if (migration.validate && !migration.validate(data)) {
    return {
      error: `The data of the "${atom.name}" atom does not match its version.`,
    }
  }

  try {
    return {
      data: migration.migrate(data) as unknown,
      version: migration.version,
    }
  } catch {
    return {
      error: `Something went wrong while migrating the data of the "${atom.name}" atom.`,
    }
  }
}

const performMigration = (
  atom: Atom,
  version: string | null,
  migrations: MigrationStep[]
) => {
  const currentState: Result = {
    version,
    data: atom.get(),
  }

  return migrations.reduce<Result>((result, migration) => {
    const { data, version, error } = result
    if (error || version !== migration.previous) {
      return result
    }
    return migrateVersion(atom, data, migration)
  }, currentState)
}

export interface MigrationOptions {
  /** An array of migration steps to perform for outdated values.
   *
   *  __Note:__ One step must have a `previous` version set to null as entry point.
   **/
  steps: MigrationStep[]
}

/** Effect to migrate the persisted value of an atom to a newer version.
 *  You can use the `createMigrationStep` helper to create migration steps.
 *
 *  @param {MigrationOptions} options
 *  @param options.steps An array of migration steps to perform for outdated values.
 *
 * __Note:__ One step must have a `previous` version set to null as entry point.
 *
 *  @returns The effect to be used on atoms.
 **/
export const migration = createEffect<MigrationOptions, unknown>({
  didInit: ({ atom, options, set }) => {
    const steps = sortMigrations(options.steps)
    const currentVersion = getVersion(atom)
    const isLatestVersion = currentVersion === steps.at(-1)?.version
    if (steps.length === 0 || isLatestVersion) {
      return
    }

    if (atom.get() === atom.defaultValue) {
      const version = steps.at(-1)?.version
      if (version) setVersion(atom, version)
      return
    }

    const { data, version, error } = performMigration(
      atom,
      currentVersion,
      steps
    )

    if (error) {
      log.error(error, {
        version: currentVersion,
        data: atom.get(),
      })
      return
    }
    if (version == null) return

    setVersion(atom, version)
    set(data)
  },
})

/** Helper to create a step for the migration effect.
 *
 *  @param migration Migration step to create.
 *
 *  @returns The migration step.
 **/
export const createMigrationStep = <
  Version extends string,
  PreviousVersion extends string | null,
  OldData,
  NewData,
>(
  migration: MigrationStep<Version, PreviousVersion, OldData, NewData>
) => migration
