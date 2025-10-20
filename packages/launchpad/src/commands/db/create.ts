import type { Command } from '../../cli/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * Parse environment variables from .env file
 */
function parseEnvFile(filePath: string): Record<string, string> {
  const envVars: Record<string, string> = {}

  if (!fs.existsSync(filePath)) {
    return envVars
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '') // Remove quotes
        envVars[key] = value
      }
    }
  }

  return envVars
}

/**
 * Read database configuration from deps.yaml if available
 */
function readDepsYamlConfig(): { type?: string, name?: string, username?: string, password?: string } {
  try {
    const depsPath = path.join(process.cwd(), 'deps.yaml')
    if (fs.existsSync(depsPath)) {
      const content = fs.readFileSync(depsPath, 'utf-8')
      const lines = content.split('\n')
      let inDatabase = false
      const config: { type?: string, name?: string, username?: string, password?: string } = {}

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === 'database:') {
          inDatabase = true
          continue
        }
        if (inDatabase && trimmed.startsWith('  ')) {
          const [key, ...valueParts] = trimmed.replace(/^ {2}/, '').split(':')
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim()
            if (key === 'type')
              config.type = value
            if (key === 'name')
              config.name = value
            if (key === 'username')
              config.username = value
            if (key === 'password')
              config.password = value
          }
        }
        else if (inDatabase && !trimmed.startsWith('  ')) {
          break // End of database section
        }
      }
      return config
    }
  }
  catch (error) {
    // Ignore errors reading deps.yaml
  }
  return {}
}

const command: Command = {
  name: 'db:create',
  description: 'Create a database for the current project',
  async run({ options }) {
    const { createProjectDatabase, generateLaravelConfig } = await import('../../services/database')

    // Read environment variables from .env file
    const envVars = parseEnvFile('.env')

    // Read configuration from deps.yaml
    const depsConfig = readDepsYamlConfig()

    // Priority: command line options > .env file > deps.yaml > defaults
    const typeRaw = options?.type as string | undefined || envVars.DB_CONNECTION || depsConfig.type
    const type = (typeRaw && ['postgres', 'mysql', 'sqlite', 'auto'].includes(typeRaw)) ? typeRaw as 'postgres' | 'mysql' | 'sqlite' | 'auto' : undefined

    const portRaw = options?.port || envVars.DB_PORT
    const port = portRaw ? (typeof portRaw === 'string' ? Number.parseInt(portRaw, 10) : portRaw) : undefined

    const name = options?.name as string | undefined || envVars.DB_NAME || envVars.DB_DATABASE || depsConfig.name
    const host = options?.host as string | undefined || envVars.DB_HOST || '127.0.0.1'
    const user = options?.user as string | undefined || envVars.DB_USERNAME || depsConfig.username || 'root'
    const password = options?.password as string | undefined || envVars.DB_PASSWORD || depsConfig.password

    const dbName = name || path.basename(process.cwd()).replace(/\W/g, '_')

    // Show configuration source information
    const configSources: string[] = []
    if (envVars.DB_CONNECTION || envVars.DB_NAME || envVars.DB_HOST || envVars.DB_USERNAME || envVars.DB_PASSWORD) {
      configSources.push('.env file')
    }
    if (depsConfig.type || depsConfig.name || depsConfig.username || depsConfig.password) {
      configSources.push('deps.yaml')
    }
    if (configSources.length > 0) {
      console.warn(`📋 Using database configuration from: ${configSources.join(', ')}`)
    }

    const dbOptions = {
      host,
      port,
      user,
      password,
      type: type === 'auto' ? undefined : (type as any),
    }

    const connectionInfo = await createProjectDatabase(dbName, dbOptions)

    console.warn('\n📋 Database Connection Details:')
    console.warn(`   Type: ${connectionInfo.type}`)
    if (connectionInfo.host)
      console.warn(`   Host: ${connectionInfo.host}`)
    if (connectionInfo.port)
      console.warn(`   Port: ${connectionInfo.port}`)
    console.warn(`   Database: ${connectionInfo.database}`)
    if (connectionInfo.username)
      console.warn(`   Username: ${connectionInfo.username}`)
    if (connectionInfo.path)
      console.warn(`   Path: ${connectionInfo.path}`)

    // Generate Laravel .env configuration
    const envConfig = generateLaravelConfig(connectionInfo)
    console.warn('\n🔧 Laravel .env configuration:')
    console.warn(envConfig)

    // Check if this is a Laravel project and offer to update .env
    if (fs.existsSync('artisan') && fs.existsSync('.env')) {
      console.warn('\n💡 Laravel project detected! You can update your .env file with the configuration above.')
    }

    return 0
  },
}

export default command
