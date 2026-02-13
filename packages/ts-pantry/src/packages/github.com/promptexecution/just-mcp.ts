/**
 * **just-mcp** - pkgx package
 *
 * @domain `github.com/promptexecution/just-mcp`
 * @version `0.1.5` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/promptexecution/just-mcp`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompromptexecutionjustmcp
 * console.log(pkg.name)        // "just-mcp"
 * console.log(pkg.versions[0]) // "0.1.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/promptexecution/just-mcp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const justmcpPackage = {
  /**
   * The display name of this package.
   */
  name: 'just-mcp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/promptexecution/just-mcp' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/promptexecution/just-mcp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/promptexecution/just-mcp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/promptexecution/just-mcp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/promptexecution/just-mcp' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.5',
  ] as const,
  aliases: [] as const,
}

export type JustmcpPackage = typeof justmcpPackage
