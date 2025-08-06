# PHP Configuration Guide

This guide explains how PHP configuration works in Launchpad and how the smart auto-detection system works.

## Overview

Launchpad uses a **smart auto-detection system** for PHP installation:
1. **Project Analysis**: Automatically analyzes your project structure
2. **Framework Detection**: Identifies Laravel, WordPress, Symfony, etc.
3. **Database Detection**: Determines which databases you're using
4. **Optimal Configuration**: Selects the best precompiled binary for your needs

## Configuration Strategies

Launchpad supports two strategies for PHP installation:

### 1. Auto-Detect (Recommended)
```typescript
services: {
  php: {
    enabled: true,
    strategy: 'auto-detect',
    version: '8.4.11',
    autoDetect: {
      enabled: true,
      preferredDatabase: 'auto',
      includeAllDatabases: false,
      includeEnterprise: false,
    },
  },
}
```

**How it works:**
- Analyzes your project structure
- Detects framework and database usage
- Automatically selects the optimal configuration
- Provides clear explanation of the choice

### 2. Manual Configuration
```typescript
services: {
  php: {
    enabled: true,
    strategy: 'precompiled-binary',
    version: '8.4.11',
    manual: {
      configuration: 'laravel-mysql', // Choose specific configuration
    },
  },
}
```

**When to use:**
- You know exactly which configuration you need
- Auto-detection doesn't work for your project
- You want to override the automatic choice

## Environment Variables

You can configure PHP behavior using environment variables:

```bash
# Strategy selection
export LAUNCHPAD_PHP_STRATEGY=auto-detect          # Default: auto-detect
export LAUNCHPAD_PHP_STRATEGY=precompiled-binary   # Manual configuration

# Auto-detection settings
export LAUNCHPAD_PHP_AUTO_DETECT=true              # Enable auto-detection
export LAUNCHPAD_PREFERRED_DATABASE=postgres       # Preferred database
export LAUNCHPAD_PHP_ALL_DATABASES=true            # Force all database support
export LAUNCHPAD_PHP_ENTERPRISE=true               # Force enterprise features

# Manual configuration
export LAUNCHPAD_PHP_CONFIGURATION=laravel-postgres # Specific configuration
export LAUNCHPAD_PHP_VERSION=8.4.11                # PHP version
```

## Available Configurations

| Configuration | Description | Use Case | Database Support |
|---------------|-------------|----------|------------------|
| `laravel-mysql` | Laravel with MySQL/MariaDB | Laravel applications using MySQL or MariaDB | MySQL, MariaDB |
| `laravel-postgres` | Laravel with PostgreSQL | Laravel applications using PostgreSQL | PostgreSQL |
| `laravel-sqlite` | Laravel with SQLite | Laravel applications using SQLite (development) | SQLite |
| `api-only` | API-only applications | Minimal footprint for API-only applications | MySQL |
| `enterprise` | Enterprise applications | Full-featured configuration for enterprise applications | MySQL, PostgreSQL, SQLite |
| `wordpress` | WordPress applications | WordPress optimized build | MySQL |
| `full-stack` | Complete PHP build | Complete PHP build with major extensions and database drivers | MySQL, PostgreSQL, SQLite |

## Smart Auto-Detection

### How It Works

Launchpad analyzes your project to determine the optimal PHP configuration:

```typescript
// Launchpad automatically detects:
const analysis = {
  framework: 'laravel',           // Laravel, WordPress, Symfony, etc.
  databases: ['mysql', 'sqlite'], // MySQL, PostgreSQL, SQLite
  hasApi: true,                   // API endpoints detected
  hasWebInterface: true,          // Web interface detected
  hasImageProcessing: false,      // Image processing needed
  hasEnterpriseFeatures: false,   // Enterprise features detected
  recommendedConfig: 'laravel-mysql'
}
```

### Detection Logic

#### Framework Detection
- **Laravel**: Detects `artisan` + `composer.json` with `laravel/framework`
- **WordPress**: Detects `wp-config.php` or `wp-config-sample.php`
- **Symfony**: Detects `symfony.lock` or `config/bundles.php`

#### Database Detection
- **Laravel**: Reads `.env` file for `DB_CONNECTION` setting
- **WordPress**: Checks `wp-config.php` for database settings
- **SQLite**: Looks for `database.sqlite` files
- **User Preference**: Respects `LAUNCHPAD_PREFERRED_DATABASE` environment variable

#### Feature Detection
- **API**: Checks for `routes/api.php` or `app/Http/Controllers/Api`
- **Web Interface**: Checks for `routes/web.php` or `resources/views`
- **Image Processing**: Checks for image directories
- **Enterprise**: Checks for Services, Jobs, Events, Listeners

## Configuration Examples

### Auto-Detection (Recommended)
```typescript
// Let Launchpad figure it out
services: {
  php: {
    enabled: true,
    strategy: 'auto-detect',
    autoDetect: {
      enabled: true,
      preferredDatabase: 'auto',
      includeAllDatabases: false,
      includeEnterprise: false,
    },
  },
}
```

### Manual Configuration
```typescript
// Choose specific configuration
services: {
  php: {
    enabled: true,
    strategy: 'precompiled-binary',
    manual: {
      configuration: 'laravel-postgres',
    },
  },
}
```

### Environment Variables Only
```bash
# No config file needed - use environment variables
export LAUNCHPAD_PHP_STRATEGY=auto-detect
export LAUNCHPAD_PHP_AUTO_DETECT=true
export LAUNCHPAD_PREFERRED_DATABASE=postgres
```

## Best Practices

### For Development
1. **Use auto-detection**: Let Launchpad analyze your project
2. **Check the explanation**: Launchpad explains why it chose each configuration
3. **Use environment variables**: Simple way to influence the choice

### For Production
1. **Use specific configurations**: `laravel-mysql` is smaller than `full-stack`
2. **Test with same config**: Ensure dev and prod use same PHP configuration
3. **Monitor performance**: Enterprise config has more extensions but larger binary

## Troubleshooting

### "No precompiled binary found"
This means no binary is available for your platform/architecture.

**Solutions:**
1. **Check platform support**: Linux x86_64, macOS ARM64, macOS Intel
2. **Use fallback**: Launchpad will try alternative configurations
3. **Request support**: Open an issue for your platform

### "Auto-detection failed"
The smart detection couldn't analyze your project.

**Solutions:**
1. **Check project structure**: Ensure framework files are present
2. **Check file permissions**: Launchpad needs to read project files
3. **Use manual configuration**: Set `LAUNCHPAD_PHP_STRATEGY=precompiled-binary`

### "Configuration not found"
The manual configuration you specified doesn't exist.

**Solutions:**
1. **Check available configurations**: See the table above
2. **Use auto-detection**: Set `LAUNCHPAD_PHP_STRATEGY=auto-detect`
3. **Use environment variable**: Set `LAUNCHPAD_PHP_CONFIGURATION=laravel-mysql`

## Migration from Old Configuration

If you were using the old extension-based configuration:

### Before (Deprecated)
```typescript
// This no longer works
services: {
  php: {
    extensions: {
      core: ['cli', 'fpm', 'mbstring'],
      database: ['pdo-mysql', 'pdo-pgsql'],
      web: ['curl', 'openssl'],
    },
  },
}
```

### After (Recommended)
```typescript
// Use auto-detection
services: {
  php: {
    strategy: 'auto-detect',
    autoDetect: {
      enabled: true,
      preferredDatabase: 'auto',
    },
  },
}
```

### After (Manual)
```typescript
// Or choose specific configuration
services: {
  php: {
    strategy: 'precompiled-binary',
    manual: {
      configuration: 'full-stack', // Includes all databases
    },
  },
}
```

## Future Improvements

1. **More Framework Support**: Symfony, CodeIgniter, etc.
2. **Custom Configurations**: User-defined configuration profiles
3. **Performance Optimization**: Smaller binaries for specific use cases
4. **Platform Expansion**: Windows, ARM Linux support
