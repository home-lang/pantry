/**
 * **Zed** - A high-performance, multiplayer code editor.
 *
 * @domain `zed.dev`
 * @programs `zed`
 * @version `0.170.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install zed.dev`
 * @homepage https://zed.dev
 */
export const zeddevPackage = {
  name: 'Zed' as const,
  domain: 'zed.dev' as const,
  description: 'A high-performance, multiplayer code editor.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://zed.dev' as const,
  githubUrl: 'https://github.com/zed-industries/zed' as const,
  installCommand: 'pantry install zed.dev' as const,
  programs: ['zed'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [
    '0.228.0',
    '0.227.1',
    '0.226.5',
    '0.226.4',
    '0.225.13',
    '0.225.12',
    '0.225.10',
    '0.225.9',
    '0.224.11',
    '0.224.10',
    '0.224.9',
    '0.224.8',
    '0.224.7',
    '0.224.6',
    '0.224.5',
    '0.224.4',
    '0.223.5',
    '0.223.4',
    '0.223.3',
    '0.222.4',
    '0.222.3',
    '0.222.2',
  ] as const,
  aliases: ['zed'] as const,
}
export type ZeddevPackage = typeof zeddevPackage
