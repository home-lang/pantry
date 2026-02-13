/**
 * **expected** - C++11/14/17 std::expected with functional-style extensions
 *
 * @domain `github.com/TartanLlama/expected`
 * @version `1.3.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/TartanLlama/expected`
 * @homepage https://tl.tartanllama.xyz
 * @buildDependencies `cmake.org@^3` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomtartanllamaexpected
 * console.log(pkg.name)        // "expected"
 * console.log(pkg.description) // "C++11/14/17 std::expected with functional-style..."
 * console.log(pkg.versions[0]) // "1.3.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/TartanLlama/expected.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const expectedPackage = {
  /**
   * The display name of this package.
   */
  name: 'expected' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/TartanLlama/expected' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'C++11/14/17 std::expected with functional-style extensions ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/TartanLlama/expected/package.yml' as const,
  homepageUrl: 'https://tl.tartanllama.xyz' as const,
  githubUrl: 'https://github.com/TartanLlama/expected' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/TartanLlama/expected' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/TartanLlama/expected -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/TartanLlama/expected' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.1',
    '1.3.0',
    '1.2.0',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type ExpectedPackage = typeof expectedPackage
