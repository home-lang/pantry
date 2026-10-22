/**
 * **claude-code** - Claude Code, Anthropic's agentic coding CLI
 *
 * @domain `anthropic.com/claude-code`
 * @programs `claude`
 * @version `2.1.185` (1 version available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install anthropic.com/claude-code`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.anthropiccomclaudecode
 * console.log(pkg.name)        // "claude-code"
 * console.log(pkg.programs)    // ["claude"]
 * console.log(pkg.versions[0]) // "2.1.308" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/anthropic-com/claude-code.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const anthropiccomclaudecodePackage = {
  /**
  * The display name of this package.
  */
  name: 'claude-code' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'anthropic.com/claude-code' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Claude Code — Anthropic\'s agentic coding CLI that lives in your terminal.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://github.com/anthropics/claude-code' as const,
  githubUrl: 'https://github.com/anthropics/claude-code' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install anthropic.com/claude-code' as const,
  pantryInstallCommand: 'pantry install anthropic.com/claude-code' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'claude',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.1.308',
    '2.1.307',
    '2.1.306',
    '2.1.305',
    '2.1.304',
    '2.1.303',
    '2.1.302',
    '2.1.301',
    '2.1.300',
    '2.1.299',
    '2.1.296',
    '2.1.295',
    '2.1.294',
    '2.1.293',
    '2.1.292',
    '2.1.291',
    '2.1.290',
    '2.1.289',
    '2.1.288',
    '2.1.287',
    '2.1.286',
    '2.1.285',
    '2.1.284',
    '2.1.283',
    '2.1.282',
    '2.1.281',
    '2.1.280',
    '2.1.278',
    '2.1.277',
    '2.1.276',
    '2.1.275',
    '2.1.274',
    '2.1.273',
    '2.1.272',
    '2.1.271',
    '2.1.270',
    '2.1.269',
    '2.1.268',
    '2.1.267',
    '2.1.266',
    '2.1.265',
    '2.1.263',
    '2.1.261',
    '2.1.258',
    '2.1.257',
    '2.1.252',
    '2.1.251',
    '2.1.250',
    '2.1.248',
    '2.1.247',
    '2.1.246',
    '2.1.245',
    '2.1.243',
    '2.1.241',
    '2.1.240',
    '2.1.239',
    '2.1.238',
    '2.1.237',
    '2.1.236',
    '2.1.235',
    '2.1.234',
    '2.1.233',
    '2.1.232',
    '2.1.231',
    '2.1.229',
    '2.1.228',
    '2.1.227',
    '2.1.226',
    '2.1.224',
    '2.1.223',
    '2.1.222',
    '2.1.221',
    '2.1.220',
    '2.1.219',
    '2.1.218',
    '2.1.217',
    '2.1.216',
    '2.1.215',
    '2.1.214',
    '2.1.212',
    '2.1.211',
    '2.1.210',
    '2.1.209',
    '2.1.208',
    '2.1.207',
    '2.1.206',
    '2.1.205',
    '2.1.204',
    '2.1.203',
    '2.1.202',
    '2.1.201',
    '2.1.200',
    '2.1.199',
    '2.1.198',
    '2.1.197',
    '2.1.196',
    '2.1.195',
    '2.1.193',
    '2.1.191',
    '2.1.190',
    '2.1.187',
    '2.1.186',
    '2.1.185',
  ] as const,
  aliases: [] as const,
}

export type AnthropiccomclaudecodePackage = typeof anthropiccomclaudecodePackage
