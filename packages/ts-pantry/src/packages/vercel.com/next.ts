/**
 * **next** - pkgx package
 *
 * @domain `vercel.com/next`
 * @programs `next`
 * @version `16.2.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install vercel.com/next`
 * @dependencies `nodejs.org^20.9.0`
 * @buildDependencies `npmjs.com@^11` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.vercelcomnext
 * console.log(pkg.name)        // "next"
 * console.log(pkg.programs)    // ["next"]
 * console.log(pkg.versions[0]) // "16.2.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/vercel-com/next.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const vercelcomnextPackage = {
  /**
  * The display name of this package.
  */
  name: 'next' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'vercel.com/next' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/vercel.com/next/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install vercel.com/next' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +vercel.com/next -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install vercel.com/next' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'next',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'nodejs.org^20.9.0',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'npmjs.com@^11',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '16.2.0',
    '16.1.7',
    '16.1.6',
    '15.5.14',
    '15.5.13',
  ] as const,
  aliases: [] as const,
}

export type VercelcomnextPackage = typeof vercelcomnextPackage
