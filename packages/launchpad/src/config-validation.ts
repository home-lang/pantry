import type { LaunchpadConfig } from './types'
import fs from 'node:fs'
import path from 'node:path'

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface ConfigValidationOptions {
  strict?: boolean
  checkPaths?: boolean
  checkPermissions?: boolean
}

/**
 * Validates a LaunchpadConfig object
 */
export function validateConfig(
  config: Partial<LaunchpadConfig>,
  options: ConfigValidationOptions = {}
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const { strict = false, checkPaths = true, checkPermissions = true } = options

  // Validate basic types and ranges
  if (config.maxRetries !== undefined) {
    if (!Number.isInteger(config.maxRetries) || config.maxRetries < 0 || config.maxRetries > 10) {
      errors.push('maxRetries must be an integer between 0 and 10')
    }
  }

  if (config.timeout !== undefined) {
    if (!Number.isInteger(config.timeout) || config.timeout < 1000 || config.timeout > 600000) {
      errors.push('timeout must be an integer between 1000ms and 600000ms (10 minutes)')
    }
  }

  // Validate paths
  if (checkPaths) {
    if (config.installPath) {
      validatePath(config.installPath, 'installPath', errors, warnings, checkPermissions)
    }
    if (config.shimPath) {
      validatePath(config.shimPath, 'shimPath', errors, warnings, checkPermissions)
    }
    if (config.cache?.directory) {
      validatePath(config.cache.directory, 'cache.directory', errors, warnings, checkPermissions)
    }
    if (config.logging?.filePath) {
      validatePath(path.dirname(config.logging.filePath), 'logging.filePath (directory)', errors, warnings, checkPermissions)
    }
  }

  // Validate cache configuration
  if (config.cache) {
    if (config.cache.maxSize !== undefined) {
      if (!Number.isInteger(config.cache.maxSize) || config.cache.maxSize < 1 || config.cache.maxSize > 100000) {
        errors.push('cache.maxSize must be an integer between 1MB and 100000MB')
      }
    }
    if (config.cache.ttlHours !== undefined) {
      if (!Number.isInteger(config.cache.ttlHours) || config.cache.ttlHours < 1 || config.cache.ttlHours > 8760) {
        errors.push('cache.ttlHours must be an integer between 1 hour and 8760 hours (1 year)')
      }
    }
  }

  // Validate network configuration
  if (config.network) {
    if (config.network.timeout !== undefined) {
      if (!Number.isInteger(config.network.timeout) || config.network.timeout < 1000 || config.network.timeout > 300000) {
        errors.push('network.timeout must be an integer between 1000ms and 300000ms (5 minutes)')
      }
    }
    if (config.network.maxConcurrent !== undefined) {
      if (!Number.isInteger(config.network.maxConcurrent) || config.network.maxConcurrent < 1 || config.network.maxConcurrent > 20) {
        errors.push('network.maxConcurrent must be an integer between 1 and 20')
      }
    }
    if (config.network.retries !== undefined) {
      if (!Number.isInteger(config.network.retries) || config.network.retries < 0 || config.network.retries > 10) {
        errors.push('network.retries must be an integer between 0 and 10')
      }
    }
    if (config.network.proxy?.http && !isValidUrl(config.network.proxy.http)) {
      errors.push('network.proxy.http must be a valid URL')
    }
    if (config.network.proxy?.https && !isValidUrl(config.network.proxy.https)) {
      errors.push('network.proxy.https must be a valid URL')
    }
  }

  // Validate security configuration
  if (config.security) {
    if (config.security.trustedSources) {
      for (const source of config.security.trustedSources) {
        if (!isValidDomain(source)) {
          errors.push(`security.trustedSources contains invalid domain: ${source}`)
        }
      }
    }
  }

  // Validate logging configuration
  if (config.logging) {
    if (config.logging.level && !['debug', 'info', 'warn', 'error'].includes(config.logging.level)) {
      errors.push('logging.level must be one of: debug, info, warn, error')
    }
    if (config.logging.maxFileSize !== undefined) {
      if (!Number.isInteger(config.logging.maxFileSize) || config.logging.maxFileSize < 1 || config.logging.maxFileSize > 1000) {
        errors.push('logging.maxFileSize must be an integer between 1MB and 1000MB')
      }
    }
    if (config.logging.keepFiles !== undefined) {
      if (!Number.isInteger(config.logging.keepFiles) || config.logging.keepFiles < 1 || config.logging.keepFiles > 100) {
        errors.push('logging.keepFiles must be an integer between 1 and 100')
      }
    }
  }

  // Validate updates configuration
  if (config.updates) {
    if (config.updates.checkFrequency !== undefined) {
      if (!Number.isInteger(config.updates.checkFrequency) || config.updates.checkFrequency < 1 || config.updates.checkFrequency > 8760) {
        errors.push('updates.checkFrequency must be an integer between 1 hour and 8760 hours (1 year)')
      }
    }
    if (config.updates.channels) {
      for (const channel of config.updates.channels) {
        if (!['stable', 'beta', 'nightly'].includes(channel)) {
          errors.push(`updates.channels contains invalid channel: ${channel}`)
        }
      }
    }
  }

  // Validate resources configuration
  if (config.resources) {
    if (config.resources.maxDiskUsage !== undefined) {
      if (!Number.isInteger(config.resources.maxDiskUsage) || config.resources.maxDiskUsage < 100) {
        errors.push('resources.maxDiskUsage must be an integer greater than 100MB')
      }
    }
    if (config.resources.maxMemoryUsage !== undefined) {
      if (!Number.isInteger(config.resources.maxMemoryUsage) || config.resources.maxMemoryUsage < 50) {
        errors.push('resources.maxMemoryUsage must be an integer greater than 50MB')
      }
    }
    if (config.resources.keepVersions !== undefined) {
      if (!Number.isInteger(config.resources.keepVersions) || config.resources.keepVersions < 1 || config.resources.keepVersions > 50) {
        errors.push('resources.keepVersions must be an integer between 1 and 50')
      }
    }
  }

  // Validate services configuration
  if (config.services?.database) {
    const { username, password, authMethod } = config.services.database
    if (username && typeof username !== 'string') {
      errors.push('services.database.username must be a string')
    }
    if (password && typeof password !== 'string') {
      errors.push('services.database.password must be a string')
    }
    if (authMethod && !['trust', 'md5', 'scram-sha-256'].includes(authMethod)) {
      errors.push('services.database.authMethod must be one of: trust, md5, scram-sha-256')
    }
  }

  // Warnings for potential issues
  if (config.cache?.enabled === false && config.network?.maxConcurrent && config.network.maxConcurrent > 3) {
    warnings.push('High network.maxConcurrent with cache disabled may cause rate limiting')
  }

  if (config.security?.allowUntrusted === true) {
    warnings.push('security.allowUntrusted=true reduces security - use with caution')
  }

  if (config.updates?.autoUpdate === true) {
    warnings.push('updates.autoUpdate=true may cause unexpected changes - consider manual updates')
  }

  if (strict && warnings.length > 0) {
    errors.push(...warnings.map(w => `Strict mode: ${w}`))
    warnings.length = 0
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates a path and checks permissions if requested
 */
function validatePath(
  pathToCheck: string,
  fieldName: string,
  errors: string[],
  warnings: string[],
  checkPermissions: boolean
): void {
  if (!path.isAbsolute(pathToCheck)) {
    warnings.push(`${fieldName} should be an absolute path: ${pathToCheck}`)
  }

  if (checkPermissions) {
    try {
      // Check if parent directory exists and is writable
      const dir = fs.statSync(pathToCheck).isDirectory() ? pathToCheck : path.dirname(pathToCheck)
      if (!fs.existsSync(dir)) {
        warnings.push(`${fieldName} directory does not exist: ${dir}`)
      } else {
        // Try to create a test file to check write permissions
        const testFile = path.join(dir, '.launchpad-write-test')
        try {
          fs.writeFileSync(testFile, 'test', { flag: 'wx' })
          fs.unlinkSync(testFile)
        } catch {
          warnings.push(`${fieldName} directory may not be writable: ${dir}`)
        }
      }
    } catch (error) {
      warnings.push(`${fieldName} path validation failed: ${(error as Error).message}`)
    }
  }
}

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validates if a string is a valid domain name
 */
function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return domainRegex.test(domain)
}

/**
 * Applies profile settings to a config
 */
export function applyProfile(
  config: LaunchpadConfig,
  profileName: string
): LaunchpadConfig {
  if (!config.profiles) {
    return config
  }

  let profileConfig: Partial<LaunchpadConfig> | undefined

  if (profileName === 'development') {
    profileConfig = config.profiles.development
  } else if (profileName === 'production') {
    profileConfig = config.profiles.production
  } else if (profileName === 'ci') {
    profileConfig = config.profiles.ci
  } else if (config.profiles.custom && config.profiles.custom[profileName]) {
    profileConfig = config.profiles.custom[profileName]
  }

  if (!profileConfig) {
    return config
  }

  // Deep merge the profile config
  return deepMerge(config, profileConfig)
}

/**
 * Deep merges two objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
        targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
      result[key] = deepMerge(targetValue, sourceValue)
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>]
    }
  }

  return result
}

/**
 * Gets effective configuration with profile applied
 */
export function getEffectiveConfig(config: LaunchpadConfig): LaunchpadConfig {
  const profileName = config.profiles?.active
  if (!profileName) {
    return config
  }

  return applyProfile(config, profileName)
}

/**
 * Normalizes environment variables to config format
 */
export function normalizeEnvVars(): Partial<LaunchpadConfig> {
  const config: Partial<LaunchpadConfig> = {}

  // This could be expanded to handle complex env var mappings
  // For now, the main config.ts handles most env vars directly

  return config
}