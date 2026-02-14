/**
 * **yasm** - Yasm Assembler mainline development tree
 *
 * @domain `yasm.tortall.net`
 * @programs `yasm`
 * @version `1.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install yasm.tortall.net`
 * @homepage https://yasm.tortall.net/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.yasmtortallnet
 * console.log(pkg.name)        // "yasm"
 * console.log(pkg.description) // "Yasm Assembler mainline development tree"
 * console.log(pkg.programs)    // ["yasm"]
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/yasm-tortall-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const yasmtortallnetPackage = {
  /**
  * The display name of this package.
  */
  name: 'yasm' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'yasm.tortall.net' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Yasm Assembler mainline development tree' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/yasm.tortall.net/package.yml' as const,
  homepageUrl: 'https://yasm.tortall.net/' as const,
  githubUrl: 'https://github.com/yasm/yasm' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install yasm.tortall.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +yasm.tortall.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install yasm.tortall.net' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'yasm',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.0',
  ] as const,
  aliases: [] as const,
}

export type YasmtortallnetPackage = typeof yasmtortallnetPackage
