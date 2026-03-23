/**
 * **Karabiner-Elements** - A powerful keyboard customizer for macOS.
 *
 * @domain `karabiner-elements.pqrs.org`
 * @programs `karabiner`
 * @version `15.3.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install karabiner-elements.pqrs.org`
 * @homepage https://karabiner-elements.pqrs.org
 */
export const karabinerelementspqrsorgPackage = {
  name: 'Karabiner-Elements' as const,
  domain: 'karabiner-elements.pqrs.org' as const,
  description: 'A powerful keyboard customizer for macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://karabiner-elements.pqrs.org' as const,
  githubUrl: 'https://github.com/pqrs-org/Karabiner-Elements' as const,
  installCommand: 'pantry install karabiner-elements.pqrs.org' as const,
  programs: ['karabiner'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['15.3.0', '15.2.0', '15.1.0'] as const,
  aliases: ['karabiner', 'karabiner-elements'] as const,
}
export type KarabinerelementspqrsorgPackage = typeof karabinerelementspqrsorgPackage
