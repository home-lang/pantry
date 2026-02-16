# Examples

This page provides practical examples of using pantry in real-world scenarios. These examples demonstrate common workflows and best practices.

## Getting Started Examples

### Quick Setup for a New Machine

```bash
# 1. Install pantry
bun add -g ts-pantry

# 2. Bootstrap your development environment
pantry bootstrap

# 3. Set up shell integration
echo 'eval "$(pantry dev:shellcode)"' >> ~/.zshrc
source ~/.zshrc

# 4. Install common development tools
pantry install node@22 python@3.12 go@1.21

# 5. Keep packages updated
pantry update
```

### Setting Up a New Project

```bash
# 1. Create project directory
mkdir my-new-project && cd my-new-project

# 2. Create dependencies file
cat > dependencies.yaml << EOF
dependencies:

  - node@22
  - typescript@5.0
  - yarn@1.22

env:
  NODE_ENV: development
  PROJECT_NAME: my-new-project
EOF

# 3. Environment automatically activates when you enter the directory
# ✅ Environment activated for /path/to/my-new-project

# 4. Verify packages are available
node --version
tsc --version
yarn --version
```

## Project-Specific Examples

### Node.js Web Application

```yaml
# dependencies.yaml
dependencies:

  - node@22
  - yarn@1.22
  - typescript@5.0

env:
  NODE_ENV: development
  PORT: 3000
  API_URL: http://localhost:3001
  DATABASE_URL: postgresql://localhost:5432/myapp
```

### Python Data Science Project

```yaml
# dependencies.yaml
dependencies:

  - python@3.12
  - pip
  - jupyter

env:
  PYTHONPATH: ./src
  JUPYTER_CONFIG_DIR: ./.jupyter
  DATA_DIR: ./data
  MODEL_DIR: ./models
```

### Global Tool Installation

Use the `global` flag to install development tools system-wide:

```yaml
# dependencies.yaml - Global development tools
global: true
dependencies:

  - node@22
  - python@3.12
  - go@1.21
  - bun@1.2.3

env:
# Global environment variables
  EDITOR: code
  PAGER: less
```

### Mixed Global and Local Packages

Combine global tools with project-specific dependencies:

```yaml
# dependencies.yaml - Mixed installation
global: true  # Default to global installation
dependencies:
# Global development tools

  - node@22
  - python@3.12
  - git@2.42

# Project-specific overrides
  typescript@5.0:
    version: 5.0.4
    global: false     # Install locally for this project

  eslint@8.50:
    version: 8.50.0
    global: false     # Project-specific linting config

env:
  NODE_ENV: development
  PROJECT_NAME: my-mixed-project
```

### Team Development Environment

Configure a standardized team environment with global shared tools:

```yaml
# dependencies.yaml - Team standard
dependencies:
# Global shared tools (available system-wide)
  node@22:
    version: 22.1.0
    global: true
  python@3.12:
    version: 3.12.1
    global: true
  docker@24:
    version: 24.0.0
    global: true

# Project-specific tools (isolated per project)

  - typescript@5.0
  - jest@29.0
  - eslint@8.50

env:
  NODE_ENV: development
  TEAM_CONFIG: standard-v2
  CI_ENVIRONMENT: local
```

### Full-Stack Development

```yaml
# dependencies.yaml
dependencies:

  - node@22
  - python@3.12
  - postgresql@15
  - redis@7

env:
  NODE_ENV: development
  PYTHON_ENV: development
  DATABASE_URL: postgresql://localhost:5432/fullstack_app
  REDIS_URL: redis://localhost:6379
  API_PORT: 3001
  FRONTEND_PORT: 3000
```

### DevOps/Infrastructure Project

```yaml
# dependencies.yaml
dependencies:

  - terraform@1.5
  - kubectl@1.28
  - helm@3.12
  - aws-cli@2.13

env:
  AWS_REGION: us-west-2
  KUBE_CONFIG_PATH: ./kubeconfig
  TF_VAR_environment: development
```

## Package Update Examples

### Basic Update Operations

```bash
# Update all installed packages
pantry update

# Update specific packages
pantry update node python go

# Use aliases for convenience
pantry upgrade bun
pantry up typescript
```

### Update with Options

```bash
# Preview what would be updated
pantry update --dry-run

# Force update to latest versions
pantry upgrade node --latest

# Verbose updates for debugging
pantry up --verbose python

# Update multiple packages to latest
pantry update node bun python --latest
```

### Development Workflow Updates

```bash
# Morning routine: check for updates
pantry update --dry-run
pantry update

# Update development tools before starting work
pantry upgrade typescript eslint prettier --latest

# Update runtime dependencies
pantry up node@22 bun --latest
```

### Project-Specific Updates

```bash
# Update packages for a Node.js project
cd my-node-project
pantry update node typescript

# Update packages for a Python project
cd my-python-project
pantry upgrade python pip

# Update all tools for full-stack development
pantry up node python postgresql redis --latest
```

## Advanced Configuration Examples

### Custom Installation Paths

```bash
# Install to a custom directory for a specific project
pantry install --path ./tools node@22 python@3.12

# Use the tools from the custom directory
export PATH="$PWD/tools/bin:$PATH"
node --version
```

### Environment-Specific Configuration

```typescript
// pantry.config.ts - Development environment
export default {
  verbose: true,
  installationPath: '~/.local',
  showShellMessages: true,
  shellActivationMessage: '🔧 DEV: {path}',
  shellDeactivationMessage: '🔧 DEV: closed',
}
```

```typescript
// pantry.config.ts - Production environment
export default {
  verbose: false,
  installationPath: '/usr/local',
  showShellMessages: false,
  maxRetries: 5,
  timeout: 120000,
}
```

### Complex Dependencies with Version Constraints

```yaml
# dependencies.yaml
dependencies:
# Exact versions for critical dependencies

  - node@22.1.0
  - typescript@5.0.4

# Semver ranges for flexibility

  - eslint@^8.40.0
  - prettier@~2.8.0

# Latest compatible versions

  - yarn@>=1.22.0
  - webpack@>=5.0.0

env:
# Multi-line environment variables
  NODE_OPTIONS: >
    --max-old-space-size=4096
    --experimental-modules

# Path extensions
  PATH_EXTENSION: ./node_modules/.bin:./scripts

# Conditional variables
  DEBUG: ${{ env.NODE_ENV == 'development' && 'app:_' || '' }}
```

### Individual Package Global Configuration

Fine-grained control over which packages are global vs local:

```yaml
# dependencies.yaml
dependencies:
# Core development tools - install globally
  node@22:
    version: 22.1.0
    global: true
  python@3.12:
    version: 3.12.1
    global: true
  git@2.42:
    version: 2.42.0
    global: true

# Project-specific tools - install locally
  typescript@5.0:
    version: 5.0.4
    global: false
  jest@29.0:
    version: 29.7.0
    global: false

# String format - defaults to local

  - eslint@8.50
  - prettier@3.0

env:
  NODE_ENV: development
  PROJECT_TYPE: mixed-environment
```

### Global Tools for Development Machine Setup

Use global flag to set up a development machine with system-wide tools:

```yaml
# dependencies.yaml - Development machine setup
global: true
dependencies:
# Core runtimes

  - node@22
  - python@3.12
  - go@1.21
  - bun@1.2.3

# Development tools

  - git@2.42
  - curl@8.4
  - wget@1.21

# Container tools

  - docker@24.0
  - kubectl@1.28

env:
# Global development settings
  DOCKER_DEFAULT_PLATFORM: linux/amd64
  KUBECTL_EXTERNAL_DIFF: code --wait --diff
```

## Scripting Examples

### Automated Project Setup Script

```bash
# !/bin/bash
# setup-project.sh

set -e

PROJECT_NAME="$1"
PROJECT_TYPE="$2"

if [ -z "$PROJECT_NAME" ] || [ -z "$PROJECT_TYPE" ]; then
  echo "Usage: $0 <project-name> <project-type>"
  echo "Types: node, python, fullstack"
  exit 1
fi

# Create project directory
mkdir "$PROJECT_NAME" && cd "$PROJECT_NAME"

# Create dependencies based on project type
case "$PROJECT_TYPE" in
  "node")
    cat > dependencies.yaml << EOF
dependencies:

  - node@22
  - yarn@1.22
  - typescript@5.0

env:
  NODE_ENV: development
  PROJECT_NAME: $PROJECT_NAME
EOF
    ;;
  "python")
    cat > dependencies.yaml << EOF
dependencies:

  - python@3.12
  - pip
  - poetry@1.5

env:
  PYTHONPATH: ./src
  PROJECT_NAME: $PROJECT_NAME
EOF
    ;;
  "fullstack")
    cat > dependencies.yaml << EOF
dependencies:

  - node@22
  - python@3.12
  - postgresql@15

env:
  NODE_ENV: development
  PROJECT_NAME: $PROJECT_NAME
  DATABASE_URL: postgresql://localhost:5432/$PROJECT_NAME
EOF
    ;;
esac

echo "✅ Project $PROJECT_NAME created with $PROJECT_TYPE configuration"
echo "💡 Run 'cd $PROJECT_NAME' to activate the environment"
```

### Environment Cleanup Script

```bash
# !/bin/bash
# cleanup-environments.sh

echo "🧹 Cleaning up old pantry environments..."

# Remove environments older than 30 days
pantry env:clean --older-than 30 --force

# Remove large environments (>500MB)
pantry env:list --format json | \
  jq -r '.[] | select(.size | test("^[5-9][0-9][0-9]M|^[0-9]+G")) | .hash' | \
  while read hash; do
    echo "Removing large environment: $hash"
    pantry env:remove "$hash" --force
  done

echo "✅ Cleanup complete"
```

### Package Update Script

```bash
# !/bin/bash
# update-packages.sh

echo "🔄 Checking for package updates..."

# Preview all available updates
echo "📋 Available updates:"
pantry update --dry-run

# Ask for confirmation
read -p "Do you want to proceed with updates? (y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
# Update all packages
  pantry update

# Update critical tools to latest
  echo "🚀 Updating critical tools to latest versions..."
  pantry upgrade node bun typescript --latest

  echo "✅ Package updates complete"
else
  echo "ℹ️ Updates skipped"
fi
```

## CI/CD Integration Examples

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test with pantry

on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        node-version: [18, 20, 22]
    runs-on: ${{ matrix.os }}

    steps:

      - uses: actions/checkout@v4

      - name: Install pantry

        run: npm install -g ts-pantry

      - name: Install project dependencies

        run: |
# Create temporary dependencies file for CI
          cat > dependencies.yaml << EOF
          dependencies:

            - node@${{ matrix.node-version }}
            - yarn@1.22

          env:
            NODE_ENV: test
            CI: true
          EOF

# Activate environment and install packages
          pantry dev:on

      - name: Run tests

        run: |
          node --version
          yarn install
          yarn test
```

### Docker Integration

```dockerfile
# Dockerfile
FROM ubuntu:22.04

# Install pantry
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://bun.sh/install | bash
RUN /root/.bun/bin/bun add -g ts-pantry

# Copy project files
COPY . /app
WORKDIR /app

# Install project dependencies using pantry
RUN pantry bootstrap --skip-shell-integration
RUN pantry dev:on

# Start application
CMD ["node", "server.js"]
```

## Troubleshooting Examples

### Debugging Environment Issues

```bash
# Check if shell integration is working
type _pkgx_chpwd_hook

# Verify dependency file syntax
pantry dev:dump --dryrun --verbose

# Check environment status
echo "Current environment: $pantry_ENV_HASH"
echo "Project name: $pantry_PROJECT_NAME"

# List all environments
pantry env:list --verbose

# Test manual activation
cd my-project
pantry dev:on
```

### Fixing Permission Issues

```bash
# Check current permissions
ls -la /usr/local/

# Fix permissions for user installation
sudo chown -R $(whoami) /usr/local/bin /usr/local/sbin

# Or use user-local installation
pantry install --path ~/.local node@22

# Verify PATH includes user directories
echo $PATH | grep -E "(\.local/bin|\.local/sbin)"
```

### Environment Collision Resolution

```bash
# List environments to identify conflicts
pantry env:list --format json | jq -r '.[] | "\(.projectName): \(.hash)"'

# Remove conflicting environment
pantry env:remove problematic_hash_here --force

# Clean up old environments
pantry env:clean --older-than 7 --force

# Recreate environment by re-entering directory
cd my-project && cd .. && cd my-project
```

## Migration Examples

### From Homebrew to pantry

```bash
# 1. List current Homebrew packages
brew list > homebrew-packages.txt

# 2. Install pantry
bun add -g ts-pantry

# 3. Bootstrap pantry (installs to /usr/local, separate from Homebrew)
pantry bootstrap

# 4. Install equivalent packages with pantry
pantry install node python go

# 5. Both package managers coexist peacefully
brew list    # Homebrew packages in /opt/homebrew
pantry list  # pantry packages in /usr/local
```

### From Node Version Manager to pantry

```bash
# 1. Check current Node versions
nvm list

# 2. Create project-specific dependencies
cat > dependencies.yaml << EOF
dependencies:

  - node@$(node --version | cut -c2-)  # Current version

env:
  NODE_ENV: development
EOF

# 3. Set up pantry environment
pantry dev:on

# 4. Gradually migrate projects to use dependencies.yaml files
# Each project can specify its own Node version
```

## Best Practices Examples

### Project Template with pantry

```bash
# create-project-template.sh
# !/bin/bash

TEMPLATE_DIR="$HOME/.pantry-templates"
mkdir -p "$TEMPLATE_DIR"

# Create Node.js template
cat > "$TEMPLATE_DIR/node.yaml" << EOF
dependencies:

  - node@22
  - yarn@1.22
  - typescript@5.0
  - eslint@8.40
  - prettier@2.8

env:
  NODE_ENV: development
  LOG_LEVEL: debug
EOF

# Create Python template
cat > "$TEMPLATE_DIR/python.yaml" << EOF
dependencies:

  - python@3.12
  - pip
  - poetry@1.5
  - black@23.0
  - pytest@7.0

env:
  PYTHONPATH: ./src
  PYTEST_ARGS: -v --tb=short
EOF

echo "✅ Templates created in $TEMPLATE_DIR"
echo "Usage: cp $TEMPLATE_DIR/node.yaml ./dependencies.yaml"
```

### Environment Monitoring

```bash
# monitor-environments.sh
# !/bin/bash

echo "📊 pantry Environment Report"
echo "================================"

# Total environments
total=$(pantry env:list --format json | jq length)
echo "Total environments: $total"

# Disk usage
total_size=$(pantry env:list --format json | jq -r '.[].size' | sed 's/[A-Z]//g' | awk '{sum += $1} END {print sum "M"}')
echo "Total disk usage: $total_size"

# Largest environments
echo -e "\n🗂️ Largest environments:"
pantry env:list --format json | jq -r 'sort_by(.size) | reverse | .[0:5] | .[] | "\(.projectName): \(.size)"'

# Oldest environments
echo -e "\n📅 Oldest environments:"
pantry env:list --format json | jq -r 'sort_by(.created) | .[0:5] | .[] | "\(.projectName): \(.created)"'
```

## Service Management Examples

### Database Development Setup

Set up a complete database development environment:

```bash
# Start essential database services
pantry service start postgres redis

# Start modern databases for specific use cases
pantry service start cockroachdb      # Distributed SQL
pantry service start neo4j            # Graph database
pantry service start clickhouse       # Analytics database

# Enable auto-start for core databases
pantry service enable postgres redis

# Check service status
pantry service list

# Connect to databases
psql postgresql://localhost:5432/postgres           # PostgreSQL
redis-cli -h localhost -p 6379                      # Redis
cockroach sql --insecure --port=26257               # CockroachDB
# Neo4j Browser: http://localhost:7474
# ClickHouse: curl http://localhost:8123/
```

### Full-Stack Development

Complete web development stack with monitoring:

```bash
# Start web development services
pantry service start postgres redis nginx

# Start monitoring stack
pantry service start prometheus grafana

# Check all service status
pantry service list

# Services available at
# PostgreSQL: localhost:5432
# Redis: localhost:6379
# Nginx: http://localhost:8080
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000 (admin/admin)
```

### Microservices Development

Infrastructure services for microservices development:

```bash
# Start service discovery and secrets management
pantry service start consul vault

# Start message queue and monitoring (choose based on needs)
pantry service start kafka jaeger prometheus       # Traditional stack
pantry service start pulsar jaeger prometheus      # Cloud-native messaging
pantry service start nats jaeger prometheus        # High-performance messaging

# Start storage services
pantry service start minio etcd

# Start identity and API services
pantry service start keycloak hasura

# Check all services
pantry service list

# Services available at
# Consul UI: http://localhost:8500
# Vault UI: http://localhost:8200
# Kafka: localhost:9092 / Pulsar: localhost:6650 / NATS: localhost:4222
# Jaeger UI: http://localhost:16686
# Prometheus: http://localhost:9090
# MinIO Console: http://localhost:9001
# etcd: localhost:2379
# Keycloak: http://localhost:8088
# Hasura: http://localhost:8085
```

### Development Environment with Services

Create a project with both packages and services:

```yaml
# dependencies.yaml
dependencies:

  - node@22
  - python@3.12

services:
  enabled: true
  autoStart:

    - postgres
    - redis
    - nginx

env:
  DATABASE_URL: postgresql://localhost:5432/myapp
  REDIS_URL: redis://localhost:6379
  WEB_SERVER: http://localhost:8080
```

### CI/CD Development Environment

Set up continuous integration and development tooling:

```bash
# Start CI/CD infrastructure
pantry service start jenkins          # CI/CD server
pantry service start verdaccio        # Private npm registry

# Start local cloud development
pantry service start localstack       # AWS services locally

# Start monitoring
pantry service start prometheus grafana

# Services available at
# Jenkins: http://localhost:8090
# Verdaccio: http://localhost:4873
# LocalStack: http://localhost:4566
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3000
```

```bash
# Activate environment (starts services automatically)
cd my-project/
# ✅ Environment activated for /path/to/my-project
# 🚀 Starting PostgreSQL
# 🚀 Starting Redis
# 🚀 Starting Nginx

# Services are available for your application
npm run dev
```

### Service Management Workflows

#### Daily Development Workflow

```bash
# Morning: Start essential services
pantry service start postgres redis

# Check what's running
pantry service list

# Work on projects

# Evening: Stop non-essential services
pantry service stop nginx grafana prometheus

# Keep databases running for next day
pantry service list
```

#### Project-Specific Services

```bash
# Web project: Start web stack
pantry service start postgres nginx redis

# API project: Start API stack
pantry service start postgres kafka vault

# Data project: Start data stack
pantry service start postgres influxdb grafana

# Stop all services when done
pantry service stop postgres nginx redis kafka vault influxdb grafana
```

#### Service Health Monitoring

```bash
# Check service health
pantry service status postgres
pantry service status redis

# Monitor logs in real-time
tail -f ~/.local/share/pantry/logs/postgres.log
tail -f ~/.local/share/pantry/logs/redis.log

# Restart unhealthy services
pantry service restart postgres
```

### Custom Service Configuration

#### Customizing Redis Configuration

```bash
# Edit Redis configuration
nano ~/.local/share/pantry/services/config/redis.conf

# Example customizations
# maxmemory 256mb
# maxmemory-policy allkeys-lru
# save 60 1000

# Restart to apply changes
pantry service restart redis
```

#### Customizing Nginx Configuration

```bash
# Edit Nginx configuration
nano ~/.local/share/pantry/services/config/nginx.conf

# Add custom server block
# server {
# listen 8081
# server_name api.localhost
# location / {
# proxy_pass http://localhost:3000
# }
# }

# Test configuration
nginx -t -c ~/.local/share/pantry/services/config/nginx.conf

# Restart to apply changes
pantry service restart nginx
```

### Service Backup and Migration

#### Backup Service Data

```bash
# Backup all service data
tar -czf services-backup-$(date +%Y%m%d).tar.gz \
  ~/.local/share/pantry/services/

# Backup specific service
tar -czf postgres-backup-$(date +%Y%m%d).tar.gz \
  ~/.local/share/pantry/services/postgres/

# Backup with compression
tar -czf services-backup.tar.gz \
  --exclude='_.log' \
  ~/.local/share/pantry/services/
```

#### Restore Service Data

```bash
# Stop services before restore
pantry service stop postgres redis

# Restore data
tar -xzf services-backup.tar.gz -C ~/

# Restart services
pantry service start postgres redis
```

### Troubleshooting Services

#### Common Diagnostics

```bash
# Check if service binaries are available
which postgres redis-server nginx

# Check port usage
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8080  # Nginx

# Check service logs
tail -f ~/.local/share/pantry/logs/postgres.log
tail -f ~/.local/share/pantry/logs/redis.log

# Test service connectivity
pg_isready -p 5432
redis-cli ping
curl http://localhost:8080/health
```

#### Service Recovery

```bash
# Stop all services
pantry service stop postgres redis nginx

# Clear problematic data (careful!)
rm -rf ~/.local/share/pantry/services/postgres/data/
rm -rf ~/.local/share/pantry/services/redis/data/

# Restart services (will reinitialize)
pantry service start postgres redis nginx
```

### Service Integration Examples

#### Node.js Application with Services

```javascript
// app.js
const { Pool } = require('pg')
const redis = require('redis')

// Connect to pantry-managed PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: process.env.USER,
})

// Connect to pantry-managed Redis
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
})

// Your application code...
```

#### Python Application with Services

```python
# app.py
import psycopg2
import redis

# Connect to pantry-managed services
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="postgres",
    user=os.getenv("USER")
)

r = redis.Redis(host='localhost', port=6379, db=0)

# Your application code
```

These examples demonstrate the versatility and power of pantry for various development scenarios. Use them as starting points for your own projects and workflows.
