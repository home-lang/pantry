import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mergeServicePackages, nativeServiceEnvironment, pantryLibraryPaths, parseRedisVersion, parseServiceSpecs, readRedisPid, readServiceLog, redisLaunchArgs, waitForRedisPid } from './services'
import type { ServiceSpec } from './services'

describe('GitHub Actions services', () => {
  test('finds the selected JDK through native executable forwarding activation', () => {
    const directory = mkdtempSync(join(tmpdir(), 'pantry-action-forwarded-java-'))
    const pantryBin = join(directory, 'pantry', '.bin')
    const home = join(directory, 'pantry', 'openjdk.org', 'v17.0.20.8')
    try {
      mkdirSync(pantryBin, { recursive: true })
      mkdirSync(join(home, 'bin'), { recursive: true })
      mkdirSync(join(home, 'lib'), { recursive: true })
      writeFileSync(join(home, 'release'), 'JAVA_VERSION="fixture"\n')
      writeFileSync(join(home, 'bin/java'), '')
      writeFileSync(join(pantryBin, 'java'), `#!/bin/sh\nexec "${join(home, 'bin/java')}" "$@"\n`, { mode: 0o755 })
      const environment = nativeServiceEnvironment(pantryBin, 'linux', { JAVA_HOME: '/host/jdk21' })
      expect(environment.JAVA_HOME).toBe(realpathSync(home))
      expect(environment.LD_LIBRARY_PATH?.split(':')[0]).toBe(join(realpathSync(home), 'lib'))
    }
    finally { rmSync(directory, { recursive: true, force: true }) }
  })

  test('activates the selected JDK for launchers that honor an inherited JAVA_HOME', () => {
    const directory = mkdtempSync(join(tmpdir(), 'pantry-action-java-'))
    const pantryBin = join(directory, 'pantry', '.bin')
    const homes = [join(directory, 'pantry', 'openjdk.org', 'v17.0.20.8'), join(directory, 'global-cache', 'openjdk.org', 'v27.0.0.35')]
    try {
      mkdirSync(pantryBin, { recursive: true })
      for (const home of homes) {
        mkdirSync(join(home, 'bin'), { recursive: true })
        mkdirSync(join(home, 'lib'), { recursive: true })
        writeFileSync(join(home, 'bin', 'java'), '')
        writeFileSync(join(home, 'release'), 'JAVA_VERSION="fixture"\n')
      }
      for (const home of homes) {
        const java = join(pantryBin, 'java')
        rmSync(java, { force: true })
        symlinkSync(join(home, 'bin', 'java'), java)
        for (const platform of ['darwin', 'linux'] as const) {
          const variable = platform === 'darwin' ? 'DYLD_LIBRARY_PATH' : 'LD_LIBRARY_PATH'
          const base = { JAVA_HOME: '/host/jdk21', [variable]: '/host/jdk21/lib' }
          const environment = nativeServiceEnvironment(pantryBin, platform, base)
          expect(environment.JAVA_HOME).toBe(realpathSync(home))
          expect(environment[variable]?.split(':')[0]).toBe(join(realpathSync(home), 'lib'))
          expect(nativeServiceEnvironment(pantryBin, platform, environment)).toEqual(environment)
          expect(base.JAVA_HOME).toBe('/host/jdk21')
        }
      }
      rmSync(join(pantryBin, 'java'))
      expect(nativeServiceEnvironment(pantryBin, 'darwin', { JAVA_HOME: '/host/jdk21' }).JAVA_HOME).toBe('/host/jdk21')
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  test('parses an exact Redis service and rejects ambiguous declarations', () => {
    expect(parseServiceSpecs('redis@8.8.0')).toEqual([{ name: 'redis', packageSpec: 'redis@8.8.0', expectedVersion: '8.8.0' }])
    expect(() => parseServiceSpecs('redis@7.4')).toThrow('exact semantic versions')
    expect(() => parseServiceSpecs('redis redis')).toThrow('Duplicate')
    expect(() => parseServiceSpecs('unknown@17.5.0')).toThrow('Unsupported')
  })

  test('supports exact PostgreSQL and Typesense versions and canonical aliases', () => {
    expect(parseServiceSpecs('postgres@17.10 typesense@30.2')).toEqual([
      { name: 'postgres', packageSpec: 'postgresql.org@17.10', expectedVersion: '17.10' },
      { name: 'typesense', packageSpec: 'typesense.org@30.2', expectedVersion: '30.2' },
    ])
    expect(() => parseServiceSpecs('postgres@17.10 postgresql.org@17.10')).toThrow('Duplicate')
    expect(() => parseServiceSpecs('typesense@^30.2')).toThrow('exact semantic versions')
    expect(() => parseServiceSpecs('typesense@30.2@other')).toThrow('Invalid')
    expect(mergeServicePackages('postgres@17.10', parseServiceSpecs('postgres@17.10'))).toBe('postgres@17.10')
    expect(() => mergeServicePackages('postgresql.org@18.0', parseServiceSpecs('postgres@17.10'))).toThrow('Conflicting')
  })

  test('installs declared services without overriding an explicit package version', () => {
    const services = parseServiceSpecs('redis@8.8.0')
    expect(mergeServicePackages('bun@1.3.14', services)).toBe('bun@1.3.14 redis@8.8.0')
    expect(mergeServicePackages('bun@1.3.14 redis@8.8.0', services)).toBe('bun@1.3.14 redis@8.8.0')
    expect(() => mergeServicePackages('redis@8.0.4', services)).toThrow('Conflicting')
  })

  test('builds a loopback-only, non-persistent CI service and parses its version', () => {
    const args = redisLaunchArgs('/runner/temp')
    expect(args).toContain('127.0.0.1')
    expect(args).toContain('yes')
    expect(args).toContain('no')
    expect(args.join(' ')).toContain('/runner/temp/pantry-services/redis/redis.pid')
    expect(parseRedisVersion('Redis server v=8.8.0 sha=00000000:0 malloc=libc')).toBe('8.8.0')
  })

  test('exposes native dependency libraries to service processes', () => {
    const directory = mkdtempSync(join(tmpdir(), 'pantry-action-libraries-'))
    const pantryBin = join(directory, 'pantry', '.bin')
    const openssl = join(directory, 'pantry', 'openssl.org', 'v1.1.1w', 'lib')
    const curl = join(directory, 'pantry', 'curl.se', 'ca-certs', 'v2026.3.19', 'lib')
    const unrelated = join(directory, 'pantry', 'node_modules', 'example', 'lib')
    try {
      mkdirSync(pantryBin, { recursive: true })
      mkdirSync(openssl, { recursive: true })
      mkdirSync(curl, { recursive: true })
      mkdirSync(unrelated, { recursive: true })

      expect(pantryLibraryPaths(pantryBin)).toEqual([curl, openssl])
      expect(nativeServiceEnvironment(pantryBin, 'linux', { LD_LIBRARY_PATH: '/system/lib' }).LD_LIBRARY_PATH)
        .toBe(`${curl}:${openssl}:/system/lib`)
      expect(nativeServiceEnvironment(pantryBin, 'darwin', {}).DYLD_LIBRARY_PATH)
        .toBe(`${curl}:${openssl}`)
      const environment = nativeServiceEnvironment(pantryBin, 'linux', { LD_LIBRARY_PATH: '/system/lib' })
      expect(environment.PATH).toBe(pantryBin)
      expect(nativeServiceEnvironment(pantryBin, 'linux', { PATH: '/system/bin' }).PATH).toBe(`${pantryBin}:/system/bin`)
      expect(nativeServiceEnvironment(pantryBin, 'linux', environment)).toEqual(environment)
      expect(nativeServiceEnvironment(pantryBin, 'windows', { PATH: 'C:\\Windows' }))
        .toEqual({ PATH: 'C:\\Windows' })
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  test('accepts only a live Redis process pidfile', () => {
    const directory = mkdtempSync(join(tmpdir(), 'pantry-action-redis-'))
    const pidfile = join(directory, 'redis.pid')
    try {
      expect(() => readRedisPid(pidfile)).toThrow('did not create')
      writeFileSync(pidfile, 'not-a-pid')
      expect(() => readRedisPid(pidfile)).toThrow('invalid')
      writeFileSync(pidfile, String(process.pid))
      expect(readRedisPid(pidfile)).toBe(process.pid)
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  test('waits for a daemonized Redis pidfile instead of racing startup', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'pantry-action-redis-wait-'))
    const pidfile = join(directory, 'redis.pid')
    try {
      setTimeout(() => writeFileSync(pidfile, String(process.pid)), 25)
      expect(await waitForRedisPid(pidfile, { timeoutMs: 500, intervalMs: 5 })).toBe(process.pid)
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  test('reports bounded pid readiness failures and startup logs', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'pantry-action-redis-log-'))
    const pidfile = join(directory, 'redis.pid')
    const logfile = join(directory, 'redis.log')
    try {
      await expect(waitForRedisPid(pidfile, { timeoutMs: 10, intervalMs: 2 })).rejects.toThrow('within 10ms')
      expect(readServiceLog(logfile)).toBe('Redis did not create a logfile')
      writeFileSync(logfile, 'Could not create server TCP listening socket')
      expect(readServiceLog(logfile)).toContain('TCP listening socket')
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})


test('MySQL service versions are exact and install the canonical native package', () => {
  expect(parseServiceSpecs('mysql@26.7.0')).toEqual([{ name: 'mysql', packageSpec: 'mysql.com@26.7.0', expectedVersion: '26.7.0' }])
  expect(parseServiceSpecs('mysql.com@26.7.0')).toEqual(parseServiceSpecs('mysql@26.7.0'))
  expect(() => parseServiceSpecs('mysql@26.7')).toThrow('exact semantic versions')
  expect(() => parseServiceSpecs('mysql mysql.com')).toThrow('Duplicate')
  expect(() => mergeServicePackages('mysql.com@8.0.43', parseServiceSpecs('mysql@26.7.0'))).toThrow('Conflicting')
})

test('DynamoDB Local services use the native provider for every supported alias', () => {
  const expected: ServiceSpec[] = [{ name: 'dynamodb', packageSpec: 'aws.amazon.com/dynamodb-local@3.3.0', expectedVersion: '3.3.0' }]
  for (const alias of ['dynamodb', 'dynamodb-local', 'aws.amazon.com/dynamodb-local']) {
    expect(parseServiceSpecs(`${alias}@3.3.0`)).toEqual(expected)
    expect(mergeServicePackages(`${alias}@3.3.0`, parseServiceSpecs('dynamodb@3.3.0'))).toBe(`${alias}@3.3.0`)
    expect(() => mergeServicePackages(`${alias}@3.2.0`, parseServiceSpecs('dynamodb@3.3.0'))).toThrow('Conflicting')
  }
  expect(() => parseServiceSpecs('dynamodb dynamodb-local')).toThrow('Duplicate')
  expect(() => parseServiceSpecs('dynamodb@3.3')).toThrow('exact semantic versions')
  expect(() => parseServiceSpecs('dynamodb@^3.3.0')).toThrow('exact semantic versions')
})
