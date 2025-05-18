// Simple class to represent semantic versions
export class Version {
  raw: string
  major: number
  minor: number
  patch: number

  constructor(version: string) {
    this.raw = version
    const parts = version.replace(/^v/, '').split('.')
    this.major = Number.parseInt(parts[0] || '0', 10)
    this.minor = Number.parseInt(parts[1] || '0', 10)
    this.patch = Number.parseInt(parts[2] || '0', 10)
  }

  toString(): string {
    return this.raw
  }
}

// Helper to parse a version string into a Version object
export function parseVersion(versionStr: string): Version | null {
  if (!versionStr || typeof versionStr !== 'string')
    return null
  if (!versionStr.match(/^v?\d+(\.\d+)?(\.\d+)?/))
    return null
  return new Version(versionStr)
}
