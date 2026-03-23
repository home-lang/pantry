/**
 * **GitHub Desktop** - A desktop application for contributing to projects on GitHub.
 *
 * @domain `github.com/desktop`
 * @programs `github-desktop`
 * @version `3.4.12` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install github.com/desktop`
 * @homepage https://desktop.github.com
 */
export const githubcomdesktopPackage = {
  name: 'GitHub Desktop' as const,
  domain: 'github.com/desktop' as const,
  description: 'A desktop application for contributing to projects on GitHub.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://desktop.github.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install github.com/desktop' as const,
  programs: ['github-desktop'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['3.4.12', '3.4.11'] as const,
  aliases: ['github-desktop', 'gh-desktop'] as const,
}
export type GithubcomdesktopPackage = typeof githubcomdesktopPackage
