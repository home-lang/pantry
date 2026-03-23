/**
 * **AltTab** - A window switcher for macOS that brings the power of alt-tab from Windows.
 *
 * @domain `alttab.app`
 * @programs `alttab`
 * @version `7.10.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install alttab.app`
 * @homepage https://alt-tab-macos.netlify.app
 */
export const alttabappPackage = {
  name: 'AltTab' as const,
  domain: 'alttab.app' as const,
  description: 'A window switcher for macOS that brings the power of alt-tab from Windows.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://alt-tab-macos.netlify.app' as const,
  githubUrl: 'https://github.com/lwouis/alt-tab-macos' as const,
  installCommand: 'pantry install alttab.app' as const,
  programs: ['alttab'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['7.10.0', '7.9.0', '7.8.0'] as const,
  aliases: ['alttab', 'alt-tab'] as const,
}
export type AlttabappPackage = typeof alttabappPackage
