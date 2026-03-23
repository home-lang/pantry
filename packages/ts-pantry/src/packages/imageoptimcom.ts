/**
 * **ImageOptim** - An image optimizer for macOS.
 *
 * @domain `imageoptim.com`
 * @programs `imageoptim`
 * @version `1.9.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install imageoptim.com`
 * @homepage https://imageoptim.com
 */
export const imageoptimcomPackage = {
  name: 'ImageOptim' as const,
  domain: 'imageoptim.com' as const,
  description: 'An image optimizer for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://imageoptim.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install imageoptim.com' as const,
  programs: ['imageoptim'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.9.1', '1.9.0'] as const,
  aliases: ['imageoptim'] as const,
}
export type ImageoptimcomPackage = typeof imageoptimcomPackage
