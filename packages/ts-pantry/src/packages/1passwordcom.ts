/**
 * **1Password** - A password manager and secure vault.
 *
 * @domain `1password.com`
 * @programs `1password`
 * @version `8.10.56` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install 1password.com`
 * @homepage https://1password.com
 */
export const _1passwordcomPackage = {
  name: '1Password' as const,
  domain: '1password.com' as const,
  description: 'A password manager and secure vault.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://1password.com' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install 1password.com' as const,
  programs: ['1password'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['8.10.56', '8.10.55', '8.10.54'] as const,
  aliases: ['1password', 'onepassword'] as const,
}
export type _1passwordcomPackage = typeof _1passwordcomPackage
