/**
 * **node** - JavaScript runtime built on Chrome's V8 JavaScript engine
 *
 * @domain `nodejs.org`
 * @programs `node`, `npm`, `npx`
 * @version `18.0.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pkgx nodejs.org`
 * @aliases `node`
 * @homepage https://nodejs.org
 * @companions `npm`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.node
 * // Or access via domain
 * const samePkg = pantry.nodejsorg
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "Node.js"
 * console.log(pkg.description) // "JavaScript runtime built on Chrome's V8 JavaScr..."
 * console.log(pkg.programs)    // ["node", "npm", ...]
 * console.log(pkg.versions[0]) // "18.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/nodejs-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const nodePackage = {
  /**
   * The display name of this package.
   */
  name: 'Node.js' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'nodejs.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/nodejs.org/package.yml' as const,
  homepageUrl: 'https://nodejs.org' as const,
  githubUrl: 'https://github.com/nodejs/node' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'pkgx nodejs.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) nodejs.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install nodejs.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'node',
    'npm',
    'npx',
  ] as const,
  /**
   * Related packages that work well with this package.
   * Consider installing these for enhanced functionality.
   */
  companions: [
    'npm',
  ] as const,
  dependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '18.0.0',
    '20.0.0',
    '16.0.0',
  ] as const,
  /**
   * Alternative names for this package.
   * You can use any of these names to access the package.
   */
  aliases: [
    'node',
  ] as const,
  fullPath: 'nodejs.org' as const,
}

export type NodePackage = typeof nodePackage
