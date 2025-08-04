import type { LaunchdPlist, ServiceInstance, SystemdService } from '../types'
import fs from 'node:fs'
import { homedir, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { findBinaryInPath } from '../utils'

/**
 * Generate launchd plist file for macOS
 */
export function generateLaunchdPlist(service: ServiceInstance): LaunchdPlist {
  const { definition } = service
  const logDir = service.logFile ? path.dirname(service.logFile) : config.services.logDir
  const dataDir = service.dataDir || definition.dataDirectory

  // Resolve template variables in arguments
  const resolvedArgs = definition.args.map((arg) => {
    let resolved = arg
      .replace('{dataDir}', dataDir || '')
      .replace('{configFile}', service.configFile || definition.configFile || '')
      .replace('{logFile}', service.logFile || definition.logFile || '')
      .replace('{pidFile}', definition.pidFile || '')
      .replace('{port}', String(definition.port || 5432))

    // Replace service-specific config variables
    for (const [key, value] of Object.entries(service.config)) {
      resolved = resolved.replace(new RegExp(`{${key}}`, 'g'), String(value))
    }

    return resolved
  })

  // Find the executable path
  const executablePath = findBinaryInPath(definition.executable) || definition.executable

  return {
    Label: `com.launchpad.${definition.name}`,
    ProgramArguments: [executablePath, ...resolvedArgs],
    WorkingDirectory: definition.workingDirectory || dataDir,
    EnvironmentVariables: {
      ...Object.fromEntries(Object.entries(definition.env).map(([k, v]) => {
        let resolved = String(v)
          .replace('{dataDir}', dataDir || '')
          .replace('{configFile}', service.configFile || definition.configFile || '')
          .replace('{logFile}', service.logFile || definition.logFile || '')
          .replace('{pidFile}', definition.pidFile || '')
          .replace('{port}', String(definition.port || 5432))

        // Replace service-specific config variables
        for (const [key, value] of Object.entries(service.config)) {
          resolved = resolved.replace(new RegExp(`{${key}}`, 'g'), String(value))
        }

        return [k, resolved]
      })),
      ...Object.fromEntries(Object.entries(service.config).map(([k, v]) => [k, String(v)])),
    },
    StandardOutPath: service.logFile || path.join(logDir, `${definition.name}.log`),
    StandardErrorPath: service.logFile || path.join(logDir, `${definition.name}.log`),
    RunAtLoad: service.enabled,
    KeepAlive: {
      SuccessfulExit: false, // Restart if process exits
      NetworkState: definition.port ? true : undefined, // Wait for network if service has a port
    },
    UserName: process.env.USER || 'root',
  }
}

/**
 * Generate systemd service file for Linux
 */
export function generateSystemdService(service: ServiceInstance): SystemdService {
  const { definition } = service
  const _logDir = service.logFile ? path.dirname(service.logFile) : config.services.logDir
  const dataDir = service.dataDir || definition.dataDirectory

  // Resolve template variables in arguments
  const resolvedArgs = definition.args.map((arg) => {
    let resolved = arg
      .replace('{dataDir}', dataDir || '')
      .replace('{configFile}', service.configFile || definition.configFile || '')
      .replace('{logFile}', service.logFile || definition.logFile || '')
      .replace('{pidFile}', definition.pidFile || '')
      .replace('{port}', String(definition.port || 5432))

    // Replace service-specific config variables
    for (const [key, value] of Object.entries(service.config)) {
      resolved = resolved.replace(new RegExp(`{${key}}`, 'g'), String(value))
    }

    return resolved
  })

  // Find the executable path
  const executablePath = findBinaryInPath(definition.executable) || definition.executable

  // Environment variables as array of KEY=value strings
  const envVars = Object.entries({
    ...Object.fromEntries(Object.entries(definition.env).map(([k, v]) => {
      let resolved = String(v)
        .replace('{dataDir}', dataDir || '')
        .replace('{configFile}', service.configFile || definition.configFile || '')
        .replace('{logFile}', service.logFile || definition.logFile || '')
        .replace('{pidFile}', definition.pidFile || '')
        .replace('{port}', String(definition.port || 5432))

      // Replace service-specific config variables
      for (const [key, value] of Object.entries(service.config)) {
        resolved = resolved.replace(new RegExp(`{${key}}`, 'g'), String(value))
      }

      return [k, resolved]
    })),
    ...Object.fromEntries(Object.entries(service.config).map(([k, v]) => [k, String(v)])),
  }).map(([key, value]) => `${key}=${value}`)

  return {
    Unit: {
      Description: `${definition.displayName} - ${definition.description}`,
      After: ['network.target', ...definition.dependencies.map(dep => `launchpad-${dep}.service`)],
      Wants: definition.dependencies.map(dep => `launchpad-${dep}.service`),
    },
    Service: {
      Type: 'simple',
      ExecStart: `${executablePath} ${resolvedArgs.join(' ')}`,
      ExecStop: definition.supportsGracefulShutdown
        ? `${findBinaryInPath('pkill') || 'pkill'} -TERM -f ${definition.executable}`
        : undefined,
      WorkingDirectory: definition.workingDirectory || dataDir,
      Environment: envVars.length > 0 ? envVars : undefined,
      User: process.env.USER || 'root',
      Restart: config.services.autoRestart ? 'on-failure' : 'no',
      RestartSec: 5,
      TimeoutStartSec: config.services.startupTimeout,
      TimeoutStopSec: config.services.shutdownTimeout,
      PIDFile: definition.pidFile,
    },
    Install: {
      WantedBy: ['multi-user.target'],
    },
  }
}

/**
 * Write launchd plist file to disk
 */
export async function writeLaunchdPlist(service: ServiceInstance, plist: LaunchdPlist): Promise<string> {
  const plistDir = path.join(homedir(), 'Library', 'LaunchAgents')
  await fs.promises.mkdir(plistDir, { recursive: true })

  const plistPath = path.join(plistDir, `${plist.Label}.plist`)

  // Convert to XML plist format
  const plistXml = generatePlistXml(plist)

  await fs.promises.writeFile(plistPath, plistXml, 'utf8')

  if (config.verbose) {
    console.log(`✅ Created launchd plist: ${plistPath}`)
  }

  return plistPath
}

/**
 * Write systemd service file to disk
 */
export async function writeSystemdService(service: ServiceInstance, systemdService: SystemdService): Promise<string> {
  const systemdDir = path.join(homedir(), '.config', 'systemd', 'user')
  await fs.promises.mkdir(systemdDir, { recursive: true })

  const servicePath = path.join(systemdDir, `launchpad-${service.definition.name}.service`)

  // Convert to INI format
  const serviceContent = generateSystemdIni(systemdService)

  await fs.promises.writeFile(servicePath, serviceContent, 'utf8')

  if (config.verbose) {
    console.log(`✅ Created systemd service: ${servicePath}`)
  }

  return servicePath
}

/**
 * Remove service file from disk
 */
export async function removeServiceFile(serviceName: string): Promise<void> {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    const plistPath = path.join(homedir(), 'Library', 'LaunchAgents', `com.launchpad.${serviceName}.plist`)
    if (fs.existsSync(plistPath)) {
      await fs.promises.unlink(plistPath)
      if (config.verbose) {
        console.warn(`🗑️  Removed launchd plist: ${plistPath}`)
      }
    }
  }
  else if (currentPlatform === 'linux') {
    const servicePath = path.join(homedir(), '.config', 'systemd', 'user', `launchpad-${serviceName}.service`)
    if (fs.existsSync(servicePath)) {
      await fs.promises.unlink(servicePath)
      if (config.verbose) {
        console.warn(`🗑️  Removed systemd service: ${servicePath}`)
      }
    }
  }
}

/**
 * Get the path to the service file for a given service
 */
export function getServiceFilePath(serviceName: string): string | null {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    return path.join(homedir(), 'Library', 'LaunchAgents', `com.launchpad.${serviceName}.plist`)
  }
  else if (currentPlatform === 'linux') {
    return path.join(homedir(), '.config', 'systemd', 'user', `launchpad-${serviceName}.service`)
  }

  return null
}

/**
 * Check if platform supports service management
 */
export function isPlatformSupported(): boolean {
  const currentPlatform = platform()
  return currentPlatform === 'darwin' || currentPlatform === 'linux'
}

/**
 * Get platform-specific service manager name
 */
export function getServiceManagerName(): string {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    return 'launchd'
  }
  else if (currentPlatform === 'linux') {
    return 'systemd'
  }

  return 'unknown'
}

// Helper functions for file format generation

/**
 * Convert LaunchdPlist object to XML plist format
 */
function generatePlistXml(plist: LaunchdPlist): string {
  const xmlParts: string[] = []

  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>')
  xmlParts.push('<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">')
  xmlParts.push('<plist version="1.0">')
  xmlParts.push('<dict>')

  // Helper function to add key-value pairs
  const addKeyValue = (key: string, value: unknown, indent = 1) => {
    const indentStr = '  '.repeat(indent)
    xmlParts.push(`${indentStr}<key>${key}</key>`)

    if (typeof value === 'string') {
      xmlParts.push(`${indentStr}<string>${escapeXml(value)}</string>`)
    }
    else if (typeof value === 'boolean') {
      xmlParts.push(`${indentStr}<${value ? 'true' : 'false'}/>`)
    }
    else if (typeof value === 'number') {
      xmlParts.push(`${indentStr}<integer>${value}</integer>`)
    }
    else if (Array.isArray(value)) {
      xmlParts.push(`${indentStr}<array>`)
      value.forEach((item) => {
        if (typeof item === 'string') {
          xmlParts.push(`${indentStr}  <string>${escapeXml(item)}</string>`)
        }
      })
      xmlParts.push(`${indentStr}</array>`)
    }
    else if (typeof value === 'object' && value !== null) {
      xmlParts.push(`${indentStr}<dict>`)
      Object.entries(value).forEach(([k, v]) => {
        addKeyValue(k, v, indent + 1)
      })
      xmlParts.push(`${indentStr}</dict>`)
    }
  }

  // Add all plist properties
  Object.entries(plist).forEach(([key, value]) => {
    if (value !== undefined) {
      addKeyValue(key, value)
    }
  })

  xmlParts.push('</dict>')
  xmlParts.push('</plist>')

  return xmlParts.join('\n')
}

/**
 * Convert SystemdService object to INI format
 */
function generateSystemdIni(service: SystemdService): string {
  const iniParts: string[] = []

  // Helper function to add section
  const addSection = (sectionName: string, sectionData: Record<string, unknown>) => {
    iniParts.push(`[${sectionName}]`)

    Object.entries(sectionData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            iniParts.push(`${key}=${item}`)
          })
        }
        else {
          iniParts.push(`${key}=${value}`)
        }
      }
    })

    iniParts.push('')
  }

  // Add sections
  addSection('Unit', service.Unit)
  addSection('Service', service.Service)

  if (service.Install) {
    addSection('Install', service.Install)
  }

  return iniParts.join('\n')
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
