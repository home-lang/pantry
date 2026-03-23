/**
 * **iTerm2** - A terminal emulator for macOS with advanced features.
 *
 * @domain `iterm2.com`
 * @programs `iterm2`
 * @version `3.5.6` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install iterm2.com`
 * @homepage https://iterm2.com
 */
export const iterm2comPackage = {
  name: 'iTerm2' as const,
  domain: 'iterm2.com' as const,
  description: 'A terminal emulator for macOS with advanced features.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://iterm2.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install iterm2.com' as const,
  programs: ['iterm2'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['3.5.6', '3.5.5', '3.5.4'] as const,
  aliases: ['iterm', 'iterm2'] as const,
}
export type Iterm2comPackage = typeof iterm2comPackage
