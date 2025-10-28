# pantry Scripts

This document describes the utility scripts available in the pantry project for development and maintenance tasks.

## Dynamic PHP Version Management

### `scripts/get-php-versions.ts`

A TypeScript script that dynamically fetches the latest PHP versions from the ts-pkgx registry and generates configuration descriptions.

### `scripts/check-php-updates.ts`

A TypeScript script that checks if there are new PHP versions available and determines if a rebuild is needed. This script is used by the GitHub workflow to avoid unnecessary builds.

#### Usage

```bash
# Run the script to get latest PHP versions and configuration info
bun scripts/get-php-versions.ts

# Check if there are new PHP versions available
bun scripts/check-php-updates.ts
```

#### Features

- **Dynamic Version Fetching**: Retrieves the latest PHP versions from ts-pkgx registry
- **Version Filtering**: Automatically filters to stable versions and sorts by version number
- **Configuration Descriptions**: Generates improved descriptions for all PHP configurations
- **Multiple Output Formats**:
  - Human-readable output for development
  - JSON output for GitHub Actions
  - Markdown tables for documentation

#### Update Checking Features

- **Version Comparison**: Compares current versions with latest available versions
- **Smart Rebuild Logic**: Determines if a rebuild is needed based on version changes
- **GitHub Actions Integration**: Provides outputs for workflow decision making
- **Detailed Reporting**: Shows what changed and why a rebuild is needed

#### Output

The script provides three types of output:

1. **Human-readable summary**:

   ```
   🔍 Dynamic PHP versions: 8.4.11, 8.3.24, 8.2.29, 8.1.32

   📋 Configuration Descriptions:
     • laravel-mysql: Laravel with MySQL/MariaDB
       Use case: Laravel applications using MySQL or MariaDB
       Databases: MySQL, MariaDB
   ```

2. **JSON for GitHub Actions**:

   ```json
   ["8.4.11","8.3.24","8.2.29","8.1.32"]
   ```

3. **Markdown table for documentation**:

   ```markdown
   | Configuration | Description | Use Case | Database Support |
   |---------------|-------------|----------|------------------|
   | `laravel-mysql` | Laravel with MySQL/MariaDB | Laravel applications using MySQL or MariaDB | MySQL, MariaDB |
   ```

#### Update Check Output

The update checking script provides:

1. **Human-readable summary**:

   ```
   🔍 PHP Version Update Check

   📊 Version Comparison:
     Current: 8.4.11, 8.3.14, 8.2.26, 8.1.30
     Latest:  8.4.11, 8.3.24, 8.2.29, 8.1.32

   🔄 Rebuild Required: YES
      Reason: New versions available: 8.3.24, 8.2.29, 8.1.32
   ```

2. **GitHub Actions outputs**:

   ```
   rebuild_needed=true
   reason=New versions available: 8.3.24, 8.2.29, 8.1.32
   current_versions=["8.4.11","8.3.14","8.2.26","8.1.30"]
   latest_versions=["8.4.11","8.3.24","8.2.29","8.1.32"]
   new_versions=["8.3.24","8.2.29","8.1.32"]
   ```

#### Configuration Descriptions

The script provides improved descriptions for all PHP configurations:

| Configuration | Description | Use Case | Database Support |
|---------------|-------------|----------|------------------|
| `laravel-mysql` | Laravel with MySQL/MariaDB | Laravel applications using MySQL or MariaDB | MySQL, MariaDB |
| `laravel-postgres` | Laravel with PostgreSQL | Laravel applications using PostgreSQL | PostgreSQL |
| `laravel-sqlite` | Laravel with SQLite | Laravel applications using SQLite (development) | SQLite |
| `api-only` | API-only applications | Minimal footprint for API-only applications | MySQL |
| `enterprise` | Enterprise applications | Full-featured configuration for enterprise applications | MySQL, PostgreSQL, SQLite |
| `wordpress` | WordPress applications | WordPress optimized build | MySQL |
| `full-stack` | Complete PHP build | Complete PHP build with major extensions and database drivers | MySQL, PostgreSQL, SQLite |

#### Integration with GitHub Actions

The script is integrated into the GitHub workflow for PHP binary compilation:

```yaml
- name: Get PHP versions from ts-pkgx
  id: get-versions
  run: |
    # Get dynamic PHP versions using our custom script
    PHP_VERSIONS=$(bun scripts/get-php-versions.ts | grep "JSON output for GitHub Actions:" -A 1 | tail -1)
    echo "php_versions=$PHP_VERSIONS" >> $GITHUB_OUTPUT
    echo "🔍 Dynamic PHP versions: $PHP_VERSIONS"
```

#### Error Handling

The script includes robust error handling:

- **Fallback Versions**: If ts-pkgx is unavailable, falls back to hardcoded versions
- **Version Validation**: Filters out invalid version strings
- **Sorting**: Automatically sorts versions by major.minor.patch
- **Limit**: Keeps only the 4 most recent stable versions

#### Dependencies

- **Bun**: Required for execution
- **ts-pkgx**: Used to fetch PHP versions from the registry
- **child_process**: Used to execute external commands

## Contributing

When adding new scripts:

1. **Documentation**: Update this file with script description and usage
2. **Error Handling**: Include proper error handling and fallbacks
3. **Testing**: Test the script locally before committing
4. **Integration**: Update relevant workflows or documentation if needed
