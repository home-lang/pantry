import type { Platform } from './types'

/** Reconcile with the current CLI after restoring identical native artifacts. */
export function dependencyCacheKeys(
  platform: Platform,
  artifactIdentity: string,
  cliVersion: string,
  lockHash: string,
  depsHash: string,
  packages: string,
): { key: string, restoreKeys: string[] } {
  const prefix = `pantry-v5-${platform.os}-${platform.arch}-${artifactIdentity}-`
  return {
    key: `${prefix}${cliVersion}-${lockHash}-${depsHash}-${packages || 'all'}`,
    // Keep the artifact digest in every prefix: rebuilt packages must never
    // restore old bytes. CLI patch releases alone do not require re-downloading
    // the entire toolchain. A prefix hit runs the normal install reconciliation.
    restoreKeys: [
      `${prefix}${cliVersion}-`,
      prefix,
      `pantry-v4-${cliVersion}-${platform.os}-${platform.arch}-${artifactIdentity}-`,
    ],
  }
}
