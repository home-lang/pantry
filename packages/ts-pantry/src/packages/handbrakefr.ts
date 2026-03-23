/**
 * **HandBrake** - An open-source video transcoder.
 *
 * @domain `handbrake.fr`
 * @programs `handbrake`
 * @version `1.9.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install handbrake.fr`
 * @homepage https://handbrake.fr
 */
export const handbrakefrPackage = {
  name: 'HandBrake' as const,
  domain: 'handbrake.fr' as const,
  description: 'An open-source video transcoder.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://handbrake.fr' as const,
  githubUrl: 'https://github.com/HandBrake/HandBrake' as const,
  installCommand: 'pantry install handbrake.fr' as const,
  programs: ['handbrake'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: ['1.9.0', '1.8.2', '1.8.1'] as const,
  aliases: ['handbrake'] as const,
}
export type HandbrakefrdesktopPackage = typeof handbrakefrPackage
