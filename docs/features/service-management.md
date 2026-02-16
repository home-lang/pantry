# Service Management

pantry provides comprehensive service management capabilities for common development services like databases, web servers, and infrastructure tools. This feature allows you to easily start, stop, and manage services across different platforms with automatic configuration and health monitoring.

## Overview

Service management in pantry includes:

- **19+ Pre-configured Services**: PostgreSQL, Redis, MySQL, Nginx, Kafka, Vault, Prometheus, Grafana, and more
- **Cross-Platform Support**: Works on macOS (launchd) and Linux (systemd)
- **Automatic Configuration**: Default configuration files for each service
- **Health Monitoring**: Built-in health checks with automatic status detection
- **Environment Isolation**: Service-specific data directories and configurations
- **Template Variables**: Dynamic configuration with path substitution

## Quick Start

```bash
# Start a database service
pantry service start postgres

# Start multiple services
pantry service start redis nginx

# Check service status
pantry service status postgres

# Stop a service
pantry service stop postgres

# List all available services
pantry service list

# Restart a service
pantry service restart redis
```

## Configure Services in dependencies.yaml

You can declare services in your project `deps.yaml`/`dependencies.yaml` to auto-start when your environment activates:

```yaml
# deps.yaml
dependencies:
  bun: ^1.2.19
  node: ^22.17.0
  php: ^8.4.11
  composer: ^2.8.10
  postgres: ^17.2.0
  redis: ^8.0.4

services:
  enabled: true
  autoStart:

    - postgres
    - redis

```

### Shorthand: services.infer: true

For Stacks & Laravel projects, you can enable a shorthand that auto-detects DB & cache from your `.env` and auto-starts the right services:

```yaml
# deps.yaml
dependencies:
  php: ^8.4.11
  postgres: ^17.2.0
  redis: ^8.0.4

# Shorthand that infers services from Stacks/Laravel .env
services:
  infer: true
```

Behavior:

- Reads `DB_CONNECTION` and `CACHE_DRIVER` or `CACHE_STORE` from `.env` when a Stacks or Laravel app is detected (`buddy` or `artisan` present).
- Maps to services: `pgsql` → `postgres`, `mysql`/`mariadb` → `mysql`, `redis` → `redis`, `memcached` → `memcached`.
- Equivalent to specifying `services.enabled: true` with an `autoStart` list of detected services.
- Can be disabled via env: set `pantry_AUTO_START_FROM_FRAMEWORK=false`.

Notes:

- **services.enabled**: turn service management on for the project.
- **services.autoStart**: list of services to start automatically (supported values are listed below in Available Services). These start when the environment activates (e.g. upon `cd` into the project with shell integration).

## Available Services

pantry includes pre-configured definitions for these services:

### Databases

- **PostgreSQL** (`postgres`) - Advanced relational database (port 5432)
- **MySQL** (`mysql`) - Popular relational database (port 3306)
- **MongoDB** (`mongodb`) - Document database (port 27017)
- **Redis** (`redis`) - In-memory data store (port 6379)
- **InfluxDB** (`influxdb`) - Time series database (port 8086)
- **CockroachDB** (`cockroachdb`) - Distributed SQL database (port 26257)
- **Neo4j** (`neo4j`) - Graph database (port 7474)
- **ClickHouse** (`clickhouse`) - Columnar analytics database (port 8123)

### Web Servers

- **Nginx** (`nginx`) - High-performance web server (port 8080)
- **Caddy** (`caddy`) - Web server with automatic HTTPS (port 2015)

### Message Queues & Streaming

- **Apache Kafka** (`kafka`) - Distributed event streaming (port 9092)
- **RabbitMQ** (`rabbitmq`) - Message broker (port 5672)
- **Apache Pulsar** (`pulsar`) - Cloud-native messaging platform (port 6650)
- **NATS** (`nats`) - High-performance messaging system (port 4222)

### Monitoring & Observability

- **Prometheus** (`prometheus`) - Metrics collection (port 9090)
- **Grafana** (`grafana`) - Visualization dashboard (port 3000)
- **Jaeger** (`jaeger`) - Distributed tracing (port 16686)

### Infrastructure & Tools

- **HashiCorp Vault** (`vault`) - Secrets management (port 8200)
- **HashiCorp Consul** (`consul`) - Service discovery (port 8500)
- **etcd** (`etcd`) - Distributed key-value store (port 2379)
- **MinIO** (`minio`) - S3-compatible object storage (port 9000)
- **SonarQube** (`sonarqube`) - Code quality analysis (port 9001)
- **Temporal** (`temporal`) - Workflow orchestration (port 7233)

### Development & CI/CD

- **Jenkins** (`jenkins`) - CI/CD automation server (port 8090)
- **LocalStack** (`localstack`) - Local AWS cloud stack (port 4566)
- **Verdaccio** (`verdaccio`) - Private npm registry (port 4873)

### API & Backend Services

- **Hasura** (`hasura`) - GraphQL API with real-time subscriptions (port 8085)
- **Keycloak** (`keycloak`) - Identity and access management (port 8088)

### Caching & Storage

- **Memcached** (`memcached`) - Memory caching system (port 11211)
- **Elasticsearch** (`elasticsearch`) - Search engine (port 9200)

## Service Operations

### Starting Services

Start one or more services:

```bash
# Start a single service
pantry service start postgres

# Start multiple services
pantry service start redis postgres nginx

# Services are initialized automatically on first start
# PostgreSQL: Creates database cluster with initdb
# MySQL: Initializes database with mysql_install_db
```

### Stopping Services

Stop running services:

```bash
# Stop a single service
pantry service stop postgres

# Stop multiple services
pantry service stop redis postgres nginx

# All services support graceful shutdown
```

### Restarting Services

Restart services (stop then start):

```bash
# Restart a service
pantry service restart postgres

# Includes automatic health checks after restart
```

### Service Status

Check the status of services:

```bash
# Check specific service status
pantry service status postgres
# Output: stopped | starting | running | stopping | failed | unknown

# List all services and their status
pantry service list
```

### Enabling/Disabling Auto-Start

Configure services to start automatically:

```bash
# Enable auto-start (starts with system)
pantry service enable postgres

# Disable auto-start
pantry service disable postgres

# Check if service is enabled
pantry service status postgres
```

## Service Configuration

### Automatic Configuration

pantry automatically creates default configuration files for services:

```bash
# Service configurations are stored in
~/.local/share/pantry/services/config/

# Examples
# ~/.local/share/pantry/services/config/redis.conf
# ~/.local/share/pantry/services/config/nginx.conf
# ~/.local/share/pantry/services/config/prometheus.yml
```

### Configuration Examples

#### Redis Configuration

```ini
# Generated Redis configuration
port 6379
bind 127.0.0.1
save 900 1
save 300 10
save 60 10000
rdbcompression yes
dbfilename dump.rdb
dir ~/.local/share/pantry/services/redis/data
logfile ~/.local/share/pantry/logs/redis.log
loglevel notice
```

#### Nginx Configuration

```nginx
# Generated Nginx configuration
worker_processes auto;
error_log ~/.local/share/pantry/logs/nginx-error.log;

events {
    worker_connections 1024;
}

http {
    server {
        listen 8080;
        server_name localhost;

        location /health {
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        location / {
            root ~/.local/share/pantry/services/nginx/html;
            index index.html;
        }
    }
}
```

#### Prometheus Configuration

```yaml
# Generated Prometheus configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:

  - job_name: 'prometheus'

    static_configs:

      - targets: ['localhost:9090']

  - job_name: 'node'

    static_configs:

      - targets: ['localhost:9100']

```

### Custom Configuration

You can customize service configurations by editing the generated files:

```bash
# Edit Redis configuration
nano ~/.local/share/pantry/services/config/redis.conf

# Edit Nginx configuration
nano ~/.local/share/pantry/services/config/nginx.conf

# Restart service to apply changes
pantry service restart redis
```

## Database Configuration

pantry provides configurable database credentials for all database services. These settings allow you to customize database authentication while maintaining secure defaults.

### Default Database Credentials

By default, all database services use these standardized credentials:

| Setting | Default Value | Description |
|---------|---------------|-------------|
| Username | `root` | Default database user |
| Password | `password` | Default database password |
| Auth Method | `trust` | PostgreSQL authentication method |

### Configuring Database Credentials

#### Environment Variables

Set database credentials globally using environment variables:

```bash
# Database username (default: 'root')
export pantry_DB_USERNAME="myuser"

# Database password (default: 'password')
export pantry_DB_PASSWORD="mypassword"

# Database authentication method (default: 'trust')
export pantry_DB_AUTH_METHOD="md5"  # PostgreSQL only
```

#### Configuration File

Configure credentials in your `pantry.config.ts`:

```typescript
// pantry.config.ts
const config: pantryConfig = {
  services: {
    database: {
      username: 'myuser',
      password: 'mypassword',
      authMethod: 'md5'  // 'trust' | 'md5' | 'scram-sha-256'
    }
  }
}
```

### Database-Specific Configuration

#### PostgreSQL

PostgreSQL services support all configuration options:

```bash
# Start PostgreSQL with custom credentials
export pantry_DB_USERNAME="postgres_user"
export pantry_DB_PASSWORD="secure_password"
export pantry_DB_AUTH_METHOD="md5"
pantry service start postgres
```

**Authentication Methods:**

- `trust` - No password required (development)
- `md5` - MD5-hashed password authentication
- `scram-sha-256` - Modern SCRAM authentication (recommended for production)

#### MySQL

MySQL services use username and password configuration:

```bash
# Start MySQL with custom credentials
export pantry_DB_USERNAME="mysql_user"
export pantry_DB_PASSWORD="mysql_password"
pantry service start mysql
```

#### Database Creation

Each service automatically creates a project-specific database:

```bash
# For project "my-app", databases are created as
# PostgreSQL: my_app
# MySQL: my_app
# With the configured username having full access
```

### Security Considerations

#### Development Setup

- Default `trust` authentication is suitable for local development
- Credentials are simple and predictable for quick setup

#### Production-like Setup

- Use `md5` or `scram-sha-256` for PostgreSQL authentication
- Set strong, unique passwords
- Consider per-project credentials

#### Best Practices

- Store sensitive credentials in `.env` files (never commit)
- Use environment variables for production deployments
- Avoid hardcoding passwords in configuration files
- Regularly rotate database passwords in production

### Examples

#### Default Development Setup

```bash
# Uses: username=root, password=password, authMethod=trust
pantry service start postgres
# Database URL: postgresql://root:password@localhost:5432/my_project
```

#### Custom Development Setup

```bash
export pantry_DB_USERNAME="dev_user"
export pantry_DB_PASSWORD="dev_password"
pantry service start postgres mysql
# PostgreSQL: postgresql://dev_user:dev_password@localhost:5432/my_project
# MySQL: mysql://dev_user:dev_password@localhost:3306/my_project
```

#### Production-like Setup

```bash
export pantry_DB_USERNAME="app_user"
export pantry_DB_PASSWORD="$(openssl rand -base64 32)"
export pantry_DB_AUTH_METHOD="scram-sha-256"
pantry service start postgres
```

## Health Monitoring

### Automatic Health Checks

All services include built-in health checks:

```bash
# Health checks run automatically every 30 seconds
# Check results are cached and displayed in status commands

pantry service status postgres
# Includes health check results and last check time
```

### Health Check Examples

Different services use appropriate health check methods:

- **PostgreSQL**: `pg_isready -p 5432`
- **Redis**: `redis-cli ping`
- **MySQL**: `mysqladmin ping`
- **Nginx**: `curl -f <http://localhost:8080/health>`
- **Prometheus**: `curl -f <http://localhost:9090/-/healthy>`
- **Vault**: `vault status` (exit code 2 when sealed but running)

### Health Check Configuration

Health checks are pre-configured with sensible defaults:

```typescript
// Example health check configuration
healthCheck: {
  command: ['redis-cli', 'ping'],
  expectedExitCode: 0,
  timeout: 5,        // 5 second timeout
  interval: 30,      // Check every 30 seconds
  retries: 3         // 3 consecutive failures = unhealthy
}
```

## Platform Support

### macOS (launchd)

Services are managed using launchd plists:

```bash
# Service files created at
~/Library/LaunchAgents/com.pantry.{service}.plist

# Manual launchd operations
launchctl load ~/Library/LaunchAgents/com.pantry.postgres.plist
launchctl start com.pantry.postgres
```

### Linux (systemd)

Services are managed using systemd user services:

```bash
# Service files created at
~/.config/systemd/user/pantry-{service}.service

# Manual systemd operations
systemctl --user start pantry-postgres
systemctl --user enable pantry-postgres
```

### Windows Support

Service management is currently not supported on Windows. Services can be run manually but without automatic management features.

## Data Management

### Data Directories

Each service gets its own isolated data directory:

```bash
# Service data is stored in
~/.local/share/pantry/services/{service}/data/

# Examples
~/.local/share/pantry/services/postgres/data/
~/.local/share/pantry/services/redis/data/
~/.local/share/pantry/services/mongodb/data/
```

### Log Files

Service logs are centrally managed:

```bash
# Logs are stored in
~/.local/share/pantry/logs/

# Examples
~/.local/share/pantry/logs/postgres.log
~/.local/share/pantry/logs/redis.log
~/.local/share/pantry/logs/nginx-error.log
~/.local/share/pantry/logs/nginx-access.log
```

### Backup and Migration

Service data can be easily backed up:

```bash
# Backup all service data
tar -czf services-backup.tar.gz ~/.local/share/pantry/services/

# Backup specific service
tar -czf postgres-backup.tar.gz ~/.local/share/pantry/services/postgres/

# Restore service data
tar -xzf services-backup.tar.gz -C ~/
```

## Environment Variables

Services support custom environment variables:

### Built-in Environment Variables

Services automatically receive environment variables:

```bash
# PostgreSQL
PGDATA=~/.local/share/pantry/services/postgres/data

# MongoDB
MONGODB_DATA_DIR=~/.local/share/pantry/services/mongodb/data

# Grafana
GF_PATHS_DATA=~/.local/share/pantry/services/grafana/data
GF_PATHS_LOGS=~/.local/share/pantry/logs

# Kafka
KAFKA_HEAP_OPTS=-Xmx1G -Xms1G
LOG_DIR=~/.local/share/pantry/logs
```

### Custom Environment Variables

You can set custom environment variables in service configurations:

```typescript
// Service definition with custom environment
env: {
  CUSTOM_VAR: 'value',
  API_KEY: 'your-api-key',
  DEBUG_LEVEL: 'info'
}
```

## Advanced Features

### Service Dependencies

Some services can depend on others:

```bash
# Services with dependencies will start dependencies first
# Currently all services are independent, but infrastructure
# exists for dependency management
```

### Template Variables

Service configurations support template variables:

- `{dataDir}` - Service data directory
- `{configFile}` - Service configuration file path
- `{logFile}` - Service log file path
- `{pidFile}` - Service PID file path

Example usage in service arguments:

```bash
postgres -D {dataDir} --config-file={configFile}
```

### Port Management

pantry ensures no port conflicts:

- Each service has a default port
- Standard ports are used for well-known services
- Port conflicts are detected and reported

### Service Initialization

Services are automatically initialized on first start:

```bash
# PostgreSQL: Runs initdb to create database cluster
# MySQL: Runs mysql_install_db to initialize database
# Services only initialize once, subsequent starts are fast
```

## Troubleshooting

### Service Won't Start

1. Check if the service binary is installed:

   ```bash
   which postgres
   which redis-server
   ```

2. Check service logs:

   ```bash
   tail -f ~/.local/share/pantry/logs/postgres.log
   ```

3. Check port availability:

   ```bash
   lsof -i :5432  # Check if PostgreSQL port is in use
   ```

4. Verify configuration:

   ```bash
   cat ~/.local/share/pantry/services/config/postgres.conf
   ```

### Permission Issues

1. Check data directory permissions:

   ```bash
   ls -la ~/.local/share/pantry/services/
   ```

2. Fix ownership if needed:

   ```bash
   chown -R $USER ~/.local/share/pantry/services/
   ```

### Platform-Specific Issues

#### macOS

- Ensure you have necessary permissions for launchd
- Check Console.app for system-level errors

#### Linux

- Ensure systemd user services are enabled
- Check journal logs: `journalctl --user -u pantry-postgres`

### Health Check Failures

1. Check if health check commands are available:

   ```bash
   which pg_isready
   which redis-cli
   ```

2. Test health check manually:

   ```bash
   pg_isready -p 5432
   redis-cli ping
   ```

3. Verify service is actually running:

   ```bash
   ps aux | grep postgres
   netstat -an | grep 5432
   ```

## Best Practices

### Development Workflow

1. **Start services you need**:

   ```bash
   pantry service start postgres redis
   ```

2. **Enable auto-start for essential services**:

   ```bash
   pantry service enable postgres
   ```

3. **Monitor service health**:

   ```bash
   pantry service list
   ```

4. **Stop unused services to save resources**:

   ```bash
   pantry service stop mongodb
   ```

### Production Considerations

- Service management is designed for **development environments**
- For production, use proper service managers (systemd, Docker, etc.)
- Backup service data directories regularly
- Monitor logs for errors and performance issues

### Resource Management

- Services consume system resources (CPU, memory, disk)
- Stop unused services to free resources
- Monitor disk usage in data directories
- Configure service memory limits in configuration files

### Security

- Services run with user permissions (not root)
- Default configurations are development-friendly (not production-hardened)
- Change default passwords and authentication settings
- Use firewall rules to restrict network access if needed

## Integration Examples

### Using with Development Projects

Service management integrates well with project environments:

```yaml
# deps.yaml
dependencies:

  - node@22
  - postgresql@15

services:
  enabled: true
  autoStart:

    - postgres
    - redis

env:
  DATABASE_URL: postgresql://localhost:5432/myapp
  REDIS_URL: redis://localhost:6379
```

### Database Development

```bash
# Start database services
pantry service start postgres redis

# Connect to PostgreSQL
psql postgresql://localhost:5432/postgres

# Connect to Redis
redis-cli -h localhost -p 6379
```

### Web Development Stack

```bash
# Start web development stack
pantry service start postgres redis nginx

# Services are now available at
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# Nginx: http://localhost:8080
```

### Microservices Development

```bash
# Start infrastructure services
pantry service start consul vault prometheus grafana

# Service discovery: http://localhost:8500
# Secrets management: http://localhost:8200
# Metrics: http://localhost:9090
# Dashboards: http://localhost:3000
```

This comprehensive service management system makes it easy to run development services locally while maintaining clean separation from system services and other package managers.
