/**
 * **Warp** - A modern, Rust-based terminal with AI built in.
 *
 * @domain `warp.dev`
 * @programs `warp`
 * @version `0.2025.01.21` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install warp.dev`
 * @homepage https://warp.dev
 */
export const warpdevPackage = {
  name: 'Warp' as const,
  domain: 'warp.dev' as const,
  description: 'A modern, Rust-based terminal with AI built in.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://warp.dev' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install warp.dev' as const,
  programs: ['warp'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['0.2025.01.21', '0.2025.01.14', '0.2025.01.07'] as const,
  aliases: ['warp'] as const,
}
export type WarpdevPackage = typeof warpdevPackage
