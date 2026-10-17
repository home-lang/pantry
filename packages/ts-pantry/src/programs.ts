/** Additional executable interfaces supplied only on the named operating system. */
export type PlatformPrograms = Partial<Record<'darwin' | 'linux' | 'windows', readonly string[]>>

/** Keep package metadata and target-native recipes on the same executable contract. */
export function programsForPlatform(pkg: { programs: readonly string[], platformPrograms?: PlatformPrograms }, platform: string): string[] {
  const operatingSystem = platform === 'win32' ? 'windows' : platform.split('-')[0]
  const additional = pkg.platformPrograms?.[operatingSystem as keyof PlatformPrograms] || []
  return [...new Set([...pkg.programs, ...additional])]
}
