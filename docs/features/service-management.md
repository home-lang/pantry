# Service Management

Launchpad provides comprehensive service management capabilities for common development services like databases, web servers, and infrastructure tools. This feature allows you to easily start, stop, and manage services across different platforms with automatic configuration and health monitoring.

## Overview

Service management in Launchpad includes:

- **19+ Pre-configured Services**: PostgreSQL, Redis, MySQL, Nginx, Kafka, Vault, Prometheus, Grafana, and more
- **Cross-Platform Support**: Works on macOS (launchd) and Linux (systemd)
- **Automatic Configuration**: Default configuration files for each service
- **Health Monitoring**: Built-in health checks with automatic status detection
- **Environment Isolation**: Service-specific data directories and configurations
- **Template Variables**: Dynamic configuration with path substitution

## Quick Start

```bash
# Start a database service
launchpad service start postgres

# Start multiple services
launchpad service start redis nginx

# Check service status
launchpad service status postgres

# Stop a service
launchpad service stop postgres

# List all available services
launchpad service list

# Restart a service
launchpad service restart redis
```

## Available Services

Launchpad includes pre-configured definitions for these services:

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
launchpad service start postgres

# Start multiple services
launchpad service start redis postgres nginx

# Services are initialized automatically on first start
# PostgreSQL: Creates database cluster with initdb
# MySQL: Initializes database with mysql_install_db
```

### Stopping Services

Stop running services:

```bash
# Stop a single service
launchpad service stop postgres

# Stop multiple services
launchpad service stop redis postgres nginx

# All services support graceful shutdown
```

### Restarting Services

Restart services (stop then start):

```bash
# Restart a service
launchpad service restart postgres

# Includes automatic health checks after restart
```

### Service Status

Check the status of services:

```bash
# Check specific service status
launchpad service status postgres
# Output: stopped | starting | running | stopping | failed | unknown

# List all services and their status
launchpad service list
```

### Enabling/Disabling Auto-Start

Configure services to start automatically:

```bash
# Enable auto-start (starts with system)
launchpad service enable postgres

# Disable auto-start
launchpad service disable postgres

# Check if service is enabled
launchpad service status postgres
```

## Service Configuration

### Automatic Configuration

Launchpad automatically creates default configuration files for services:

```bash
# Service configurations are stored in:
~/.local/share/launchpad/services/config/

# Examples:
# ~/.local/share/launchpad/services/config/redis.conf
# ~/.local/share/launchpad/services/config/nginx.conf
# ~/.local/share/launchpad/services/config/prometheus.yml
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
dir ~/.local/share/launchpad/services/redis/data
logfile ~/.local/share/launchpad/logs/redis.log
loglevel notice
```

#### Nginx Configuration
```nginx
# Generated Nginx configuration
worker_processes auto;
error_log ~/.local/share/launchpad/logs/nginx-error.log;

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
            root ~/.local/share/launchpad/services/nginx/html;
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
nano ~/.local/share/launchpad/services/config/redis.conf

# Edit Nginx configuration
nano ~/.local/share/launchpad/services/config/nginx.conf

# Restart service to apply changes
launchpad service restart redis
```

## Health Monitoring

### Automatic Health Checks

All services include built-in health checks:

```bash
# Health checks run automatically every 30 seconds
# Check results are cached and displayed in status commands

launchpad service status postgres
# Includes health check results and last check time
```

### Health Check Examples

Different services use appropriate health check methods:

- **PostgreSQL**: `pg_isready -p 5432`
- **Redis**: `redis-cli ping`
- **MySQL**: `mysqladmin ping`
- **Nginx**: `curl -f http://localhost:8080/health`
- **Prometheus**: `curl -f http://localhost:9090/-/healthy`
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
# Service files created at:
~/Library/LaunchAgents/com.launchpad.{service}.plist

# Manual launchd operations:
launchctl load ~/Library/LaunchAgents/com.launchpad.postgres.plist
launchctl start com.launchpad.postgres
```

### Linux (systemd)

Services are managed using systemd user services:

```bash
# Service files created at:
~/.config/systemd/user/launchpad-{service}.service

# Manual systemd operations:
systemctl --user start launchpad-postgres
systemctl --user enable launchpad-postgres
```

### Windows Support

Service management is currently not supported on Windows. Services can be run manually but without automatic management features.

## Data Management

### Data Directories

Each service gets its own isolated data directory:

```bash
# Service data is stored in:
~/.local/share/launchpad/services/{service}/data/

# Examples:
~/.local/share/launchpad/services/postgres/data/
~/.local/share/launchpad/services/redis/data/
~/.local/share/launchpad/services/mongodb/data/
```

### Log Files

Service logs are centrally managed:

```bash
# Logs are stored in:
~/.local/share/launchpad/logs/

# Examples:
~/.local/share/launchpad/logs/postgres.log
~/.local/share/launchpad/logs/redis.log
~/.local/share/launchpad/logs/nginx-error.log
~/.local/share/launchpad/logs/nginx-access.log
```

### Backup and Migration

Service data can be easily backed up:

```bash
# Backup all service data
tar -czf services-backup.tar.gz ~/.local/share/launchpad/services/

# Backup specific service
tar -czf postgres-backup.tar.gz ~/.local/share/launchpad/services/postgres/

# Restore service data
tar -xzf services-backup.tar.gz -C ~/
```

## Environment Variables

Services support custom environment variables:

### Built-in Environment Variables

Services automatically receive environment variables:

```bash
# PostgreSQL
PGDATA=~/.local/share/launchpad/services/postgres/data

# MongoDB
MONGODB_DATA_DIR=~/.local/share/launchpad/services/mongodb/data

# Grafana
GF_PATHS_DATA=~/.local/share/launchpad/services/grafana/data
GF_PATHS_LOGS=~/.local/share/launchpad/logs

# Kafka
KAFKA_HEAP_OPTS=-Xmx1G -Xms1G
LOG_DIR=~/.local/share/launchpad/logs
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

Launchpad ensures no port conflicts:

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
   tail -f ~/.local/share/launchpad/logs/postgres.log
   ```

3. Check port availability:
   ```bash
   lsof -i :5432  # Check if PostgreSQL port is in use
   ```

4. Verify configuration:
   ```bash
   cat ~/.local/share/launchpad/services/config/postgres.conf
   ```

### Permission Issues

1. Check data directory permissions:
   ```bash
   ls -la ~/.local/share/launchpad/services/
   ```

2. Fix ownership if needed:
   ```bash
   chown -R $USER ~/.local/share/launchpad/services/
   ```

### Platform-Specific Issues

#### macOS
- Ensure you have necessary permissions for launchd
- Check Console.app for system-level errors

#### Linux
- Ensure systemd user services are enabled
- Check journal logs: `journalctl --user -u launchpad-postgres`

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
   launchpad service start postgres redis
   ```

2. **Enable auto-start for essential services**:
   ```bash
   launchpad service enable postgres
   ```

3. **Monitor service health**:
   ```bash
   launchpad service list
   ```

4. **Stop unused services to save resources**:
   ```bash
   launchpad service stop mongodb
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
# dependencies.yaml
dependencies:
  - node@22
  - postgresql@15

services:
  - postgres
  - redis

env:
  DATABASE_URL: postgresql://localhost:5432/myapp
  REDIS_URL: redis://localhost:6379
```

### Database Development

```bash
# Start database services
launchpad service start postgres redis

# Connect to PostgreSQL
psql postgresql://localhost:5432/postgres

# Connect to Redis
redis-cli -h localhost -p 6379
```

### Web Development Stack

```bash
# Start web development stack
launchpad service start postgres redis nginx

# Services are now available at:
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# Nginx: http://localhost:8080
```

### Microservices Development

```bash
# Start infrastructure services
launchpad service start consul vault prometheus grafana

# Service discovery: http://localhost:8500
# Secrets management: http://localhost:8200
# Metrics: http://localhost:9090
# Dashboards: http://localhost:3000
```

This comprehensive service management system makes it easy to run development services locally while maintaining clean separation from system services and other package managers.
