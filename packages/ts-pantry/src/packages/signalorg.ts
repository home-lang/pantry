/**
 * **Signal** - A private messenger for encrypted communications.
 *
 * @domain `signal.org`
 * @programs `signal`
 * @version `7.36.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install signal.org`
 * @homepage https://signal.org
 */
export const signalorgPackage = {
  name: 'Signal' as const,
  domain: 'signal.org' as const,
  description: 'A private messenger for encrypted communications.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://signal.org' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install signal.org' as const,
  programs: ['signal'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['7.36.0', '7.35.0'] as const,
  aliases: ['signal'] as const,
}
export type SignalorgPackage = typeof signalorgPackage
