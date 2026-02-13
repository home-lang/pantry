/**
 * **gitlab-runner** - Official GitLab CI runner
 *
 * @domain `gitlab.com/gitlab-org/gitlab-runner`
 * @programs `gitlab-runner`
 * @version `18.8.0` (100 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gitlab.com/gitlab-org/gitlab-runner`
 * @homepage https://gitlab.com/gitlab-org/gitlab-runner
 * @buildDependencies `go.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gitlabcomgitlaborggitlabrunner
 * console.log(pkg.name)        // "gitlab-runner"
 * console.log(pkg.description) // "Official GitLab CI runner"
 * console.log(pkg.programs)    // ["gitlab-runner"]
 * console.log(pkg.versions[0]) // "18.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gitlab-com/gitlab-org/gitlab-runner.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gitlabcomgitlaborggitlabrunnerPackage = {
  /**
   * The display name of this package.
   */
  name: 'gitlab-runner' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gitlab.com/gitlab-org/gitlab-runner' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Official GitLab CI runner' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gitlab.com/gitlab-org/gitlab-runner/package.yml' as const,
  homepageUrl: 'https://gitlab.com/gitlab-org/gitlab-runner' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gitlab.com/gitlab-org/gitlab-runner' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gitlab.com/gitlab-org/gitlab-runner -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gitlab.com/gitlab-org/gitlab-runner' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gitlab-runner',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '18.8.0',
    '18.7.2',
    '18.7.1',
    '18.7.0',
    '18.6.6',
    '18.6.5',
    '18.6.4',
    '18.6.3',
    '18.6.2',
    '18.6.1',
    '18.6.0',
    '18.5.0',
    '18.4.0',
    '18.3.1',
    '18.3.0',
    '18.2.2',
    '18.2.1',
    '18.2.0',
    '18.1.3',
    '18.1.2',
    '18.1.1',
    '18.1.0',
    '18.0.5',
    '18.0.4',
    '18.0.3',
    '18.0.2',
    '18.0.1',
    '18.0.0',
    '17.11.4',
    '17.11.3',
    '17.11.2',
    '17.11.1',
    '17.11.0',
    '17.10.2',
    '17.10.1',
    '17.10.0',
    '17.9.3',
    '17.9.2',
    '17.9.1',
    '17.9.0',
    '17.8.5',
    '17.8.4',
    '17.8.3',
    '17.8.2',
    '17.8.1',
    '17.8.0',
    '17.7.1',
    '17.7.0',
    '17.6.0',
    '17.5.5',
    '17.5.4',
    '17.5.3',
    '17.5.2',
    '17.5.1',
    '17.5.0',
    '17.4.2',
    '17.4.1',
    '17.4.0',
    '17.3.3',
    '17.3.2',
    '17.3.1',
    '17.3.0',
    '17.2.3',
    '17.2.2',
    '17.2.1',
    '17.2.0',
    '17.1.2',
    '17.1.1',
    '17.1.0',
    '17.0.3',
    '17.0.2',
    '17.0.1',
    '17.0.0',
    '16.11.4',
    '16.11.3',
    '16.11.2',
    '16.11.1',
    '16.11.0',
    '16.10.1',
    '16.10.0',
    '16.9.2',
    '16.9.1',
    '16.9.0',
    '16.8.1',
    '16.8.0',
    '16.7.0',
    '16.6.2',
    '16.6.1',
    '16.6.0',
    '16.5.0',
    '16.4.2',
    '16.4.1',
    '16.4.0',
    '16.3.3',
    '16.3.2',
    '16.3.1',
    '16.3.0',
    '16.2.3',
    '16.2.2',
    '16.2.1',
  ] as const,
  aliases: [] as const,
}

export type GitlabcomgitlaborggitlabrunnerPackage = typeof gitlabcomgitlaborggitlabrunnerPackage
