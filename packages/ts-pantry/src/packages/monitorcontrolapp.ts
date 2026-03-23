/**
 * **MonitorControl** - A tool to control external monitor brightness and volume on macOS.
 *
 * @domain `monitorcontrol.app`
 * @programs `monitorcontrol`
 * @version `4.3.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install monitorcontrol.app`
 * @homepage https://github.com/MonitorControl/MonitorControl
 */
export const monitorcontrolappPackage = {
  name: 'MonitorControl' as const,
  domain: 'monitorcontrol.app' as const,
  description: 'A tool to control external monitor brightness and volume on macOS.' as const,
  packageYmlUrl: '' as const,
  homepageUrl: 'https://github.com/MonitorControl/MonitorControl' as const,
  githubUrl: '' as const,
  installCommand: 'pantry install monitorcontrol.app' as const,
  programs: ['monitorcontrol'] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  versions: [
    '4.3.3',
    '4.3.2',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '4.0.0-rc1',
    '3.1.1',
    '3.1.0',
    '3.0.0',
    '2.1.0',
    '2.0.0',
    '1.7.1',
    '1.7.0',
    '1.6.0',
    '1.5.2',
    '1.5.0',
    '1.4.0',
  ] as const,
  aliases: ['monitorcontrol', 'monitor-control'] as const,
}
export type MonitorcontrolappPackage = typeof monitorcontrolappPackage
