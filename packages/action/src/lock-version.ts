import { parseInstallerConstraint, satisfiesInstallerConstraint } from '../../ts-pantry/src/installer'

/**
 * Lightweight "does this concrete version satisfy this spec?" check for the
 * dependency operators accepted by Pantry's action.
 */
export function versionSatisfiesSpec(version: string, spec: string): boolean {
  if (!spec || spec === 'latest' || spec === '*')
    return true
  // Preserve prerelease/build identifiers for exact pins. Reducing both sides
  // to major.minor.patch would make every 0.17.0-dev.N snapshot appear equal.
  if (/^v?\d/.test(spec) && spec.includes('-'))
    return version.replace(/^v/, '') === spec.replace(/^v/, '')
  // The installer owns version ordering and prerelease eligibility. Reusing
  // it prevents a lock entry from overriding a stable request with a dev build
  // merely because parseInt erased the prerelease suffix.
  const normalized = spec.replace(/^v/, '').replace(/^==/, '=')
  const constraint = parseInstallerConstraint(/^\d/.test(normalized) ? `=${normalized}` : normalized)
  return constraint !== null && satisfiesInstallerConstraint(version.replace(/^v/, ''), constraint)
}

export function isRollingVersionSpec(domain: string, spec: string): boolean {
  return domain === 'ziglang.org' && spec.endsWith('-dev')
}

/**
 * Pantry lockfiles encode Zig build metadata with an underscore so the
 * version is safe to reuse as a filesystem segment. Restore the canonical
 * semver spelling before comparing it with, or passing it to, the installer.
 */
export function normalizeLockedVersion(domain: string, version: string): string {
  if (domain !== 'ziglang.org')
    return version
  return version.replace(/(-dev\.\d+)_([0-9A-Za-z-]+)$/, '$1+$2')
}

/**
 * Decide whether the action may reuse a concrete lock entry.
 *
 * A short Zig development version is a rolling channel, not an immutable
 * version, and the original rule refused every pin on that channel: Zig removes
 * older development archives from its own download index, so yesterday's
 * concrete result could turn a healthy setup into a 404.
 *
 * That hazard is upstream's. The action installs Zig from our registry, which
 * retains every dev build it has published, and taking the newest one on every
 * run meant each of the several dev builds published per week invalidated the
 * cached toolchain on every runner — an ~89 MB re-download per CI job, and by
 * a wide margin the largest single line on our object-storage bill.
 *
 * So a rolling pin is reusable exactly when the pinned build is still published
 * for this platform. `availableVersions` is the registry's list; pass it as
 * undefined (unknown) to keep the old always-resolve behaviour.
 */
export function shouldUseLockedVersion(
  domain: string,
  pinned: string,
  spec: string,
  availableVersions?: readonly string[],
): boolean {
  if (isRollingVersionSpec(domain, spec)) {
    if (!availableVersions)
      return false
    const normalized = normalizeLockedVersion(domain, pinned)
    // A pin from a different channel (0.16.0-dev under a 0.17.0-dev spec) is
    // not a stale pin, it is the wrong package.
    if (!normalized.startsWith(`${spec}.`))
      return false
    return availableVersions.includes(normalized)
  }
  return versionSatisfiesSpec(
    normalizeLockedVersion(domain, pinned),
    normalizeLockedVersion(domain, spec),
  )
}

/**
 * Re-assert an already installed system package with its concrete resolution.
 * This keeps rolling channels fresh on the first install without resolving or
 * downloading the floating alias again after workspace installation.
 */
export function reassertVersionSpec(
  domain: string,
  declaredVersion: string,
  resolvedVersions: ReadonlyMap<string, string>,
): string {
  return resolvedVersions.get(domain) || declaredVersion
}
