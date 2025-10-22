/* eslint-disable no-console */
import type { Command } from '../cli/types'
import type { ValidationResult } from '../config-validation'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { config, defaultConfig } from '../config'
import { applyProfile, getEffectiveConfig, validateConfig } from '../config-validation'

interface ConfigArgs {
  get?: string
  set?: string
  value?: string
  unset?: string
  profile?: string
  validate?: boolean
  list?: boolean
  reset?: boolean
  json?: boolean
  help?: boolean
  action?: 'get' | 'set' | 'unset' | 'validate' | 'list' | 'reset' | 'profiles'
}

function parseArgs(argv: string[]): ConfigArgs {
  const opts: ConfigArgs = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--help' || a === '-h') {
      opts.help = true
    }
    else if (a === '--json') {
      opts.json = true
    }
    else if (a === '--validate') {
      opts.validate = true
    }
    else if (a === '--list') {
      opts.list = true
    }
    else if (a === '--reset') {
      opts.reset = true
    }
    else if (a.startsWith('--get=')) {
      opts.get = a.slice('--get='.length)
    }
    else if (a === '--get' && i + 1 < argv.length) {
      opts.get = argv[++i]
    }
    else if (a.startsWith('--set=')) {
      const parts = a.slice('--set='.length).split('=', 2)
      opts.set = parts[0]
      opts.value = parts[1] || ''
    }
    else if (a === '--set' && i + 2 < argv.length) {
      opts.set = argv[++i]
      opts.value = argv[++i]
    }
    else if (a.startsWith('--unset=')) {
      opts.unset = a.slice('--unset='.length)
    }
    else if (a === '--unset' && i + 1 < argv.length) {
      opts.unset = argv[++i]
    }
    else if (a.startsWith('--profile=')) {
      opts.profile = a.slice('--profile='.length)
    }
    else if (a === '--profile' && i + 1 < argv.length) {
      opts.profile = argv[++i]
    }
    else if (a === 'get' && !opts.action) {
      opts.action = 'get'
    }
    else if (a === 'set' && !opts.action) {
      opts.action = 'set'
    }
    else if (a === 'unset' && !opts.action) {
      opts.action = 'unset'
    }
    else if (a === 'validate' && !opts.action) {
      opts.action = 'validate'
    }
    else if (a === 'list' && !opts.action) {
      opts.action = 'list'
    }
    else if (a === 'reset' && !opts.action) {
      opts.action = 'reset'
    }
    else if (a === 'profiles' && !opts.action) {
      opts.action = 'profiles'
    }
    else if (!opts.action && (opts.get || opts.set || opts.validate || opts.list || opts.reset)) {
      // Legacy support - action inferred from flags
    }
    else if (!opts.action && !opts.get && !opts.set && !opts.unset) {
      // Positional argument for get
      if (a && !a.startsWith('-'))
        opts.get = a
    }
  }
  return opts
}

function getByPath(obj: any, path: string): any {
  const parts = path.split('.').filter(Boolean)
  let cur: any = obj
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur)
      cur = cur[p]
    else return undefined
  }
  return cur
}

function printValidationResult(result: ValidationResult, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(result, null, 2))
  }
  else {
    if (result.valid) {
      console.log('✅ Configuration is valid')
    }
    else {
      console.log('❌ Configuration has errors:')
      for (const error of result.errors) {
        console.log(`  • ${error}`)
      }
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️ Warnings:')
      for (const warning of result.warnings) {
        console.log(`  • ${warning}`)
      }
    }
  }
}

function setByPath(obj: any, path: string, value: any): boolean {
  const parts = path.split('.').filter(Boolean)
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part]
  }

  const lastPart = parts[parts.length - 1]
  if (!lastPart)
    return false

  // Try to parse the value appropriately
  let parsedValue = value
  if (value === 'true') {
    parsedValue = true
  }
  else if (value === 'false') {
    parsedValue = false
  }
  else if (value === 'null') {
    parsedValue = null
  }
  else if (value === 'undefined') {
    parsedValue = undefined
  }
  else if (!Number.isNaN(Number(value)) && value !== '') {
    parsedValue = Number(value)
  }
  else if (value.startsWith('[') || value.startsWith('{')) {
    try {
      parsedValue = JSON.parse(value)
    }
    catch {
      // Keep as string if JSON parsing fails
    }
  }

  current[lastPart] = parsedValue
  return true
}

function unsetByPath(obj: any, path: string): boolean {
  const parts = path.split('.').filter(Boolean)
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current))
      return false
    current = current[part]
  }

  const lastPart = parts[parts.length - 1]
  if (!lastPart || !(lastPart in current))
    return false

  delete current[lastPart]
  return true
}

function getConfigPath(): string {
  return path.join(homedir(), '.config', 'launchpad', 'config.json')
}

function loadUserConfig(): any {
  const configPath = getConfigPath()
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'))
    }
  }
  catch (error) {
    console.error(`Warning: Failed to load user config: ${(error as Error).message}`)
  }
  return {}
}

function saveUserConfig(config: any): boolean {
  const configPath = getConfigPath()
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    return true
  }
  catch (error) {
    console.error(`Error saving config: ${(error as Error).message}`)
    return false
  }
}

const command: Command = {
  name: 'config',
  description: 'Manage Launchpad configuration',
  async run(ctx) {
    const args = parseArgs(ctx.argv)

    if (args.help) {
      console.log('Usage: launchpad config [action] [options]')
      console.log('\nActions:')
      console.log('  get <key>        Get configuration value')
      console.log('  set <key> <val>  Set configuration value')
      console.log('  unset <key>      Remove configuration value')
      console.log('  validate         Validate current configuration')
      console.log('  list             List all configuration')
      console.log('  reset            Reset to default configuration')
      console.log('  profiles         List available profiles')
      console.log('\nOptions:')
      console.log('  --json           Output in JSON format')
      console.log('  --profile <name> Use specific profile')
      console.log('\nExamples:')
      console.log('  launchpad config get installPath')
      console.log('  launchpad config set verbose true')
      console.log('  launchpad config validate')
      console.log('  launchpad config list --json')
      console.log('  launchpad config --profile production validate')
      return 0
    }

    // Determine effective configuration
    let effectiveConfig = getEffectiveConfig(config)
    if (args.profile) {
      effectiveConfig = applyProfile(config, args.profile)
    }

    // Handle different actions
    if (args.action === 'validate' || args.validate) {
      const result = validateConfig(effectiveConfig, {
        checkPaths: true,
        checkPermissions: true,
      })
      printValidationResult(result, args.json || false)
      return result.valid ? 0 : 1
    }

    if (args.action === 'profiles') {
      const profiles = {
        active: effectiveConfig.profiles?.active || 'development',
        available: ['development', 'production', 'ci'],
        custom: Object.keys(effectiveConfig.profiles?.custom || {}),
      }

      if (args.json) {
        console.log(JSON.stringify(profiles, null, 2))
      }
      else {
        console.log(`Active profile: ${profiles.active}`)
        console.log(`Available profiles: ${profiles.available.join(', ')}`)
        if (profiles.custom.length > 0) {
          console.log(`Custom profiles: ${profiles.custom.join(', ')}`)
        }
      }
      return 0
    }

    if (args.action === 'reset' || args.reset) {
      const configPath = getConfigPath()
      try {
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath)
          console.log('✅ Configuration reset to defaults')
        }
        else {
          console.log('ℹ️ No user configuration found, already using defaults')
        }
      }
      catch (error) {
        console.error(`Error resetting config: ${(error as Error).message}`)
        return 1
      }
      return 0
    }

    if (args.action === 'set' || args.set) {
      const key = args.set
      const value = args.value

      if (!key || value === undefined) {
        console.error('Error: set requires both key and value')
        console.error('Usage: launchpad config set <key> <value>')
        return 1
      }

      const userConfig = loadUserConfig()
      if (!setByPath(userConfig, key, value)) {
        console.error(`Error: Invalid key path: ${key}`)
        return 1
      }

      if (saveUserConfig(userConfig)) {
        console.log(`✅ Set ${key} = ${value}`)

        // Validate the new configuration
        const newConfig = { ...defaultConfig, ...userConfig }
        const result = validateConfig(newConfig)
        if (!result.valid) {
          console.log('\n⚠️ Warning: Configuration now has validation errors:')
          for (const error of result.errors) {
            console.log(`  • ${error}`)
          }
        }
      }
      return 0
    }

    if (args.action === 'unset' || args.unset) {
      const key = args.unset

      if (!key) {
        console.error('Error: unset requires a key')
        console.error('Usage: launchpad config unset <key>')
        return 1
      }

      const userConfig = loadUserConfig()
      if (!unsetByPath(userConfig, key)) {
        console.error(`Error: Key not found: ${key}`)
        return 1
      }

      if (saveUserConfig(userConfig)) {
        console.log(`✅ Unset ${key}`)
      }
      return 0
    }

    if (args.action === 'get' || args.get) {
      const key = args.get
      if (!key) {
        console.error('Key is required for get operation')
        return 1
      }
      const val = getByPath(effectiveConfig, key)
      const out = val === undefined ? getByPath(defaultConfig, key) : val

      if (args.json) {
        console.log(JSON.stringify(out))
      }
      else if (typeof out === 'object') {
        console.log(JSON.stringify(out, null, 2))
      }
      else {
        console.log(String(out))
      }
      return 0
    }

    if (args.action === 'list' || args.list) {
      if (args.json) {
        console.log(JSON.stringify(effectiveConfig))
      }
      else {
        console.log(JSON.stringify(effectiveConfig, null, 2))
      }
      return 0
    }

    // Default: show effective config
    if (args.json) {
      console.log(JSON.stringify(effectiveConfig))
    }
    else {
      console.log(JSON.stringify(effectiveConfig, null, 2))
    }
    return 0
  },
}

export default command
