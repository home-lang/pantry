import { execFile } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { resolveNativeExecutable } from './native-executable'
import type { NativeServiceOptions, NativeServiceState } from './native-services'
import { checkpointNativeService, serviceAlive, spawnNativeService } from './native-services'
import type { ServiceSpec } from './services'

const execute = promisify(execFile)

/** Official mysqld initialization, private credentials and mandatory TCP TLS. */
export async function startNativeMysql(service: ServiceSpec, state: NativeServiceState, env: NodeJS.ProcessEnv, port: number, secret: () => string, onState?: NativeServiceOptions['onState']): Promise<{ state: NativeServiceState, environment: Record<string, string>, version: string }> {
  const server = resolveNativeExecutable(join(state.binDir, 'mysqld'))
  const base = dirname(dirname(server))
  const { stdout } = await execute(server, ['--no-defaults', '--version'], { env, timeout: 10_000 })
  const version = /\bVer\s+(\d+\.\d+\.\d+)/.exec(stdout)?.[1]
  if (!version || (service.expectedVersion && version !== service.expectedVersion)) throw new Error('MySQL version mismatch')
  const data = join(state.directory, 'data')
  mkdirSync(data, { mode: 0o700 })
  await execute(server, ['--no-defaults', '--initialize-insecure', `--basedir=${base}`, `--datadir=${data}`, ...(process.getuid?.() === 0 ? ['--user=root'] : [])], { env, timeout: 90_000 })
  const password = secret()
  const rootPassword = secret()
  const initialization = join(state.directory, 'initialize.sql')
  writeFileSync(initialization, [
    `ALTER USER 'root'@'localhost' IDENTIFIED BY '${rootPassword}';`,
    `CREATE USER 'pantry'@'127.0.0.1' IDENTIFIED BY '${password}' REQUIRE SSL;`,
    "GRANT ALL PRIVILEGES ON *.* TO 'pantry'@'127.0.0.1' WITH GRANT OPTION;",
    'CREATE DATABASE pantry_ci;',
  ].join('\n') + '\n', { mode: 0o600 })
  // macOS Unix sockets have a short path limit. Use a separate private, owned
  // directory rather than truncating an arbitrary runner temporary path.
  const sockets = realpathSync(mkdtempSync('/tmp/pantry-mysql-'))
  writeFileSync(join(sockets, '.pantry-service-owner'), state.owner, { mode: 0o600, flag: 'wx' })
  state.auxiliaryDirectories = [sockets]
  checkpointNativeService(state, onState)
  const args = [
    '--no-defaults', `--basedir=${base}`, `--datadir=${data}`,
    '--bind-address=127.0.0.1', `--port=${port}`, '--mysqlx=OFF',
    '--skip-name-resolve', '--skip-log-bin', '--require-secure-transport=ON',
    `--socket=${join(sockets, 's')}`, `--pid-file=${join(state.directory, 'mysqld.pid')}`,
    `--init-file=${initialization}`,
  ]
  // MySQL refuses to run as root unless the choice is explicit. Hosted action
  // jobs normally run as an unprivileged user; isolated root jobs remain owned.
  if (process.getuid?.() === 0) args.push('--user=root')
  await spawnNativeService(state, server, args, env, onState)
  const client = join(state.directory, 'client.cnf')
  writeFileSync(client, `[client]\nuser=pantry\npassword=${password}\nhost=127.0.0.1\nport=${port}\nprotocol=TCP\nssl-mode=REQUIRED\n`, { mode: 0o600 })
  const deadline = Date.now() + 60_000
  while (true) {
    if (!state.pid || !serviceAlive(state.pid)) throw new Error('MySQL exited before TLS readiness')
    try {
      const ready = await execute(join(state.binDir, 'mysql'), [`--defaults-file=${client}`, '--batch', '--skip-column-names', '--execute', "SELECT VERSION(), @@datadir; SHOW SESSION STATUS LIKE 'Ssl_cipher'"], { env, timeout: 3000 })
      const [identity, cipher] = ready.stdout.trim().split('\n')
      if (!identity?.startsWith(`${version}\t`) || !identity.endsWith(`${data}/`) || !/^Ssl_cipher\t\S+$/.test(cipher || ''))
        throw new Error('MySQL TLS or private data identity check failed')
      break
    }
    catch {
      if (Date.now() >= deadline) throw new Error('MySQL did not answer a private authenticated TLS query')
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }
  rmSync(initialization)
  // The CA belongs to this disposable cluster. Consumers can verify it using
  // an explicit TLS configuration. The URL carries ssl=true; the server
  // independently rejects unencrypted TCP connections.
  const ca = join(data, 'ca.pem')
  if (!readFileSync(ca, 'utf8').includes('BEGIN CERTIFICATE')) throw new Error('MySQL did not create its cluster CA')
  return {
    state, version,
    environment: {
      MYSQL_HOST: '127.0.0.1', MYSQL_PORT: String(port), MYSQL_USER: 'pantry',
      MYSQL_PASSWORD: password, MYSQL_DATABASE: 'pantry_ci', MYSQL_SSL_CA: ca,
      MYSQL_URL: `mysql://pantry:${password}@127.0.0.1:${port}/pantry_ci?ssl=true`,
      MYSQL_SERVICE_VERSION: version,
    },
  }
}
