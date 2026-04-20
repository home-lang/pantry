/**
 * **Visual Studio Code** - A lightweight but powerful source code editor.
 *
 * @domain `code.visualstudio.com`
 * @programs `code`
 * @version `1.96.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install code.visualstudio.com`
 * @homepage https://code.visualstudio.com
 */
export const codevisualstudiocomPackage = {
  name: 'Visual Studio Code' as const,
  domain: 'code.visualstudio.com' as const,
  description: 'A lightweight but powerful source code editor.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://code.visualstudio.com' as const,
  githubUrl: 'https://github.com/microsoft/vscode' as const,
  installCommand: 'pantry install code.visualstudio.com' as const,
  programs: ['code'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [
    '1.96.4',
    '1.96.3',
    '1.96.2',
    '0.44.2',
    '0.44.1',
  ] as const,
  aliases: ['vscode', 'code'] as const,
}
export type CodevisualstudiocomPackage = typeof codevisualstudiocomPackage
