/** Additional executable interfaces supplied only on the named operating system. */
export type PlatformPrograms = Partial<Record<'darwin' | 'linux' | 'windows', readonly string[]>>

/** Major-release boundaries for tools introduced or removed by upstream. */
export type ProgramVersions = Readonly<Record<string, { readonly since?: number, readonly before?: number }>>

/** Keep package metadata and target-native recipes on the same executable contract. */
export function programsForPlatform(pkg: { programs: readonly string[], platformPrograms?: PlatformPrograms, platformProgramOverrides?: PlatformPrograms, programVersions?: ProgramVersions }, platform: string, version?: string): string[] {
  const operatingSystem = platform === 'win32' ? 'windows' : platform.split('-')[0]
  const additional = pkg.platformPrograms?.[operatingSystem as keyof PlatformPrograms] || []
  const common = pkg.platformProgramOverrides?.[operatingSystem as keyof PlatformPrograms] ?? pkg.programs
  const major = version && /^v?(\d+)(?:\.|$)/.exec(version)?.[1]
  return [...new Set([...common, ...additional])].filter((program) => {
    const bounds = pkg.programVersions?.[program]
    // Without an exact version, keep the complete interface rather than
    // weakening an install whose release has not been established.
    return !bounds || major === undefined || major === ''
      || ((bounds.since === undefined || Number(major) >= bounds.since) && (bounds.before === undefined || Number(major) < bounds.before))
  })
}
