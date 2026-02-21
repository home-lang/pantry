# Service Management

Pantry manages background services (databases, caches, web servers) with simple commands and automatic startup.

## Overview

Pantry includes 68 pre-configured services and supports:

- **launchd** on macOS
- **systemd** on Linux
- Manual start/stop/restart
- Auto-start on environment activation
- Health checks
- Custom environment variables

## Supported Services

Pantry comes with 68 pre-configured services:

**Databases**:

- postgres, mysql, mariadb, mongodb
- cassandra, couchdb

**Caches**:

- redis, memcached

**Message Queues**:

- rabbitmq, kafka

**Search/Analytics**:

- elasticsearch

**Infrastructure**:

- nginx, apache, caddy, traefik, haproxy, varnish, squid
- php-fpm

**Service Discovery**:

- etcd, consul

**Secrets**:

- vault

**Storage**:

- minio

**Monitoring**:

- prometheus, grafana, jaeger, zipkin
- node-exporter, blackbox-exporter, alertmanager, loki

## Quick Start

### Manual service control

```bash
# Start a service
pantry start postgres

# Stop a service
pantry stop postgres

# Restart a service
pantry restart postgres

# Check service status
pantry status postgres

# Enable auto-start on boot
pantry enable postgres

# Disable auto-start on boot
pantry disable postgres
```

### Auto-start from config

Define services in `pantry.json` to start them automatically:

```json
{
  "name": "my-app",
  "services": {
    "postgres": true,
    "redis": true
  }
}
```

```bash
cd my-app
# 🚀 Starting service: postgres
# ✅ postgres started
# 🚀 Starting service: redis
# ✅ redis started
```

## Configuration

### Boolean syntax

Simplest form - just enable auto-start:

```json
{
  "services": {
    "postgres": true,
    "redis": true,
    "nginx": false
  }
}
```

### Object syntax

Full configuration with ports, environment, and health checks:

```json
{
  "services": {
    "postgres": {
      "autoStart": true,
      "port": 5432,
      "healthCheck": "pg_isready"
    },
    "redis": {
      "autoStart": true,
      "port": 6379,
      "healthCheck": "redis-cli ping",
      "env": {
        "REDIS_PASSWORD": "secret123",
        "REDIS_MAXMEMORY": "256mb"
      }
    },
    "nginx": {
      "autoStart": true,
      "port": 8080,
      "env": {
        "NGINX_HOST": "localhost",
        "NGINX_PORT": "8080"
      }
    }
  }
}
```

## Examples

### PostgreSQL database

```json
{
  "name": "postgres-app",
  "dependencies": {
    "node": "20.10.0"
  },
  "services": {
    "postgres": {
      "autoStart": true,
      "port": 5432,
      "healthCheck": "pg_isready"
    }
  },
  "scripts": {
    "dev": "node server.js",
    "db:migrate": "node scripts/migrate.js"
  }
}
```

```bash
cd postgres-app
# 🚀 Starting service: postgres
# ✅ postgres started

pantry run dev
```

### Full stack application

```json
{
  "name": "full-stack-app",
  "dependencies": {
    "node": "20.10.0"
  },
  "services": {
    "postgres": {
      "autoStart": true,
      "port": 5432
    },
    "redis": {
      "autoStart": true,
      "port": 6379,
      "env": {
        "REDIS_MAXMEMORY": "512mb"
      }
    },
    "nginx": {
      "autoStart": true,
      "port": 8080,
      "env": {
        "NGINX_HOST": "localhost"
      }
    }
  },
  "scripts": {
    "dev": "node server.js",
    "start": "node server.js"
  }
}
```

```bash
cd full-stack-app
# 🚀 Starting service: postgres
# ✅ postgres started
# 🚀 Starting service: redis
# ✅ redis started
# 🚀 Starting service: nginx
# ✅ nginx started

pantry run dev
```

### Development environment

```json
{
  "name": "dev-env",
  "services": {
    "postgres": true,
    "redis": true,
    "mongodb": true,
    "elasticsearch": true
  }
}
```

Start all services at once:

```bash
cd dev-env
# All services auto-start
```

## Custom Services

You can define custom services by creating service definition files.

### Service definition format

Create a service definition file in `~/.pantry/services/myservice.json`:

```json
{
  "name": "myservice",
  "displayName": "My Custom Service",
  "command": "/path/to/myservice",
  "args": ["--port", "3000"],
  "workingDirectory": "/var/lib/myservice",
  "env": {
    "MY_SERVICE_ENV": "production"
  },
  "launchd": {
    "Label": "com.mycompany.myservice",
    "RunAtLoad": true,
    "KeepAlive": true
  },
  "systemd": {
    "Description": "My Custom Service",
    "Type": "simple",
    "Restart": "always"
  }
}
```

Then use it like any built-in service:

```bash
pantry start myservice
```

## Service Lifecycle

### Auto-start behavior

When you `cd` into a project with services configured:

1. Pantry reads `pantry.json`
2. Parses the `services` section
3. For each service with `autoStart: true`:
   - Checks if service is already running
   - Starts the service if not running
   - Shows console feedback (🚀, ✅, ⚠️)
   - Continues on error (doesn't block activation)

### Manual control

```bash
# Start service
pantry start postgres
# Service starts in background

# Stop service
pantry stop postgres
# Service stops gracefully

# Restart service
pantry restart postgres
# Service stops then starts

# Check status
pantry status postgres
# Shows: Running/Stopped + PID + uptime
```

### Boot persistence

```bash
# Enable auto-start on system boot
pantry enable postgres

# Disable auto-start on system boot
pantry disable postgres
```

## Platform Integration

### macOS (launchd)

Pantry creates launchd plists in `~/Library/LaunchAgents/`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.pantry.postgres</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/postgres</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

### Linux (systemd)

Pantry creates systemd units in `~/.config/systemd/user/`:

```ini
[Unit]
Description=PostgreSQL Database
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/postgres
Restart=always

[Install]
WantedBy=default.target
```

## Best Practices

### 1. Use auto-start for development

Configure services to start automatically in development:

```json
{
  "services": {
    "postgres": true,
    "redis": true
  }
}
```

### 2. Document service requirements

Add README section explaining service requirements:

```markdown
## Services

This project requires:

- PostgreSQL 15+ (auto-started by Pantry)
- Redis 7+ (auto-started by Pantry)

```

### 3. Use health checks

Always define health checks for critical services:

```json
{
  "services": {
    "postgres": {
      "autoStart": true,
      "healthCheck": "pg_isready"
    }
  }
}
```

### 4. Configure service ports

Explicitly configure ports to avoid conflicts:

```json
{
  "services": {
    "postgres": {
      "autoStart": true,
      "port": 5433
    },
    "redis": {
      "autoStart": true,
      "port": 6380
    }
  }
}
```

### 5. Use environment variables

Configure services with environment variables:

```json
{
  "services": {
    "postgres": {
      "autoStart": true,
      "env": {
        "PGDATA": "/var/lib/postgresql/data",
        "POSTGRES_PASSWORD": "dev_password"
      }
    }
  }
}
```

## Troubleshooting

### Service won't start

```bash
# Check service status
pantry status postgres

# Check logs (macOS)
tail -f ~/Library/Logs/pantry/postgres.log

# Check logs (Linux)
journalctl --user -u pantry-postgres -f
```

### Port already in use

```bash
# Check what's using the port
lsof -i :5432

# Kill the process or use a different port
```

### Service crashes on start

```bash
# Check service definition
cat ~/.pantry/services/postgres.json

# Test service command manually
/usr/local/bin/postgres
```

## Service Inspection

Inspect a service's full configuration, status, and paths:

```bash
pantry inspect postgres
```

Output includes:

- Service name and status
- PID (if running)
- Port
- Config file path (plist/systemd unit)
- Data directory
- Log paths (stdout/stderr)
- Health check command
- Start command

When run from a project directory (with `deps.yaml`), paths are project-scoped.

## Exec Command

Run a command in a service's environment context (PORT, SERVICE_NAME, DATA_DIR, env vars):

```bash
pantry exec postgres -- psql -c "SELECT 1"
pantry exec redis -- redis-cli info
```

## Port Overrides

Override default service ports in `deps.yaml` using map-style entries:

```yaml
services:
  enabled: true
  autoStart:
    - postgres
    - name: redis
      port: 6380
    - name: mysql
      port: 3307
```

Both simple (`- postgres`) and map-style (`- name: redis`) entries are supported.

## Dependency Ordering

Custom services can declare dependencies using `dependsOn`. Services are started in topological order:

```yaml
services:
  enabled: true
  autoStart:
    - postgres
    - redis
    - my-api
  custom:
    my-api:
      command: "node api.js"
      port: 3000
      dependsOn:
        - postgres
        - redis
```

Postgres and Redis start first. After their health checks pass, `my-api` starts.

## Per-Project Isolation

When services are started from a project directory (via `deps.yaml` autoStart), Pantry automatically scopes them to that project using a hash of the project path. This means:

- **Separate service labels**: `com.pantry.{hash}.redis` (macOS) / `pantry-{hash}-redis.service` (Linux)
- **Separate data directories**: `~/.local/share/pantry/data/{hash}/redis/`
- **Separate log files**: `~/.local/share/pantry/logs/{hash}/redis.log`

Multiple projects can run the same service simultaneously on different ports without conflicts.

## Service Snapshots

Backup and restore service data:

```bash
# Create a snapshot
pantry snapshot postgres
# → ~/.local/share/pantry/snapshots/postgres/postgres-20260220-143000.tar.gz

# List all snapshots
pantry snapshots postgres

# Restore from latest snapshot
pantry restore postgres

# Restore a specific snapshot
pantry restore postgres postgres-20260220-143000.tar.gz
```

The service is automatically stopped before snapshot/restore and restarted afterward.

## Starter Presets

Initialize a new project with a pre-configured scaffold:

```bash
# TypeScript project
pantry init --preset typescript

# Monorepo TypeScript project
pantry init --preset monorepo-typescript

# Laravel project (with postgres, redis, meilisearch services)
pantry init --preset laravel

# Next.js project
pantry init --preset next
```

Available presets: `typescript` (alias: `ts`), `monorepo-typescript` (alias: `monorepo-ts`, `monorepo`), `laravel`, `next` (alias: `nextjs`).

## Next Steps

- [Scripts](./scripts.md) - Run scripts from package.json
- [Runtime Management](./runtime-management.md) - Manage runtime versions
- [Environment Management](./environments.md) - Understand environment lifecycle
