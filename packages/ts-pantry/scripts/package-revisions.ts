/**
 * A packaging repair needs a new identity even when the vendor release has not
 * changed. Numeric upstream tuples retain their original component count; one
 * additional component identifies a Pantry build revision. Existing package
 * identities and their installed/cache directories therefore remain immutable.
 */
export type PackageRevisions = Readonly<Record<string, number>>

function entries(revisions: PackageRevisions = {}): Array<[string, number]> {
  const result = Object.entries(revisions)
  const lengths = new Set<number>()
  for (const [upstream, revision] of result) {
    if (!/^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))+$/u.test(upstream)
      || !Number.isSafeInteger(revision) || revision <= 0 || revision > 0xFFFFFFFF)
      throw new Error(`Invalid package build revision: ${upstream}@${revision}`)
    lengths.add(upstream.split('.').length)
  }
  if (lengths.size > 1) throw new Error('Revised upstream versions must use a fixed numeric tuple length')
  return result
}

/** Discovery still asks the vendor for vendor versions; only package identities change. */
export function revisedPackageVersions(upstream: readonly string[], revisions?: PackageRevisions): string[] {
  const declared = entries(revisions)
  if (!declared.length) return [...upstream]
  const length = declared[0]![0].split('.').length
  for (const version of upstream) {
    if (!/^(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*))+$/u.test(version) || version.split('.').length !== length)
      throw new Error(`Upstream version ${version} conflicts with the recipe's package build revision format`)
  }
  return upstream.map(version => revisions?.[version] ? `${version}.${revisions[version]}` : version)
}

/** Resolve historical identities too, so reading a legacy runtime graph stays valid. */
export function recipeBuildVersion(packageVersion: string, revisions?: PackageRevisions): { upstream: string, current: string } {
  for (const [upstream, revision] of entries(revisions)) {
    const current = `${upstream}.${revision}`
    if (packageVersion === upstream) return { upstream, current }
    if (!packageVersion.startsWith(`${upstream}.`)) continue
    const suffix = packageVersion.slice(upstream.length + 1)
    if (!/^[1-9]\d*$/u.test(suffix) || !Number.isSafeInteger(Number(suffix)) || Number(suffix) > revision)
      throw new Error(`Undeclared package build revision: ${packageVersion}`)
    return { upstream, current }
  }
  return { upstream: packageVersion, current: packageVersion }
}

/** Never rebuild a superseded identity using a newer recipe. */
export function requireCurrentRecipeBuild(packageVersion: string, currentVersion: string): void {
  if (packageVersion !== currentVersion)
    throw new Error(`Recipe requires package build ${currentVersion}; refusing to replace ${packageVersion}`)
}

/** Vendor prebuilts cannot contain a Pantry packaging repair. */
export function recipeAllowsMirror(packageVersion: string, identity: { upstream: string, current: string }, requiresRecipeBuild = false): boolean {
  requireCurrentRecipeBuild(packageVersion, identity.current)
  return !requiresRecipeBuild && identity.upstream === packageVersion
}
