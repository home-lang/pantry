# PHP Auto-Detection Examples

This document shows how Launchpad's smart PHP auto-detection works in real projects.

## Example 1: Laravel with MySQL

**Project Structure:**
```
my-laravel-app/
├── artisan
├── composer.json
├── .env
├── routes/
│   ├── web.php
│   └── api.php
└── app/
    └── Http/
        └── Controllers/
```

**`.env` file:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=myapp
DB_USERNAME=root
DB_PASSWORD=password
```

**Launchpad Analysis:**
```
🎯 Recommended PHP Configuration: laravel-mysql

📋 Analysis:
  • Detected laravel framework
  • Detected databases: mysql

🔧 Configuration Details:
  • Optimized for Laravel with MySQL/MariaDB
  • Includes: CLI, FPM, MySQL drivers, web extensions
```

## Example 2: Laravel with PostgreSQL

**Project Structure:**
```
my-laravel-app/
├── artisan
├── composer.json
├── .env
└── app/
    └── Http/
        └── Controllers/
```

**`.env` file:**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=myapp
DB_USERNAME=postgres
DB_PASSWORD=password
```

**Launchpad Analysis:**
```
🎯 Recommended PHP Configuration: laravel-postgres

📋 Analysis:
  • Detected laravel framework
  • Detected databases: postgres

🔧 Configuration Details:
  • Optimized for Laravel with PostgreSQL
  • Includes: CLI, FPM, PostgreSQL drivers, web extensions
```

## Example 3: API-Only Laravel

**Project Structure:**
```
my-api-app/
├── artisan
├── composer.json
├── routes/
│   └── api.php          # ✅ API routes only
├── app/
│   └── Http/
│       └── Controllers/
│           └── Api/      # ✅ API controllers
└── .env
```

**Launchpad Analysis:**
```
🎯 Recommended PHP Configuration: api-only

📋 Analysis:
  • Detected laravel framework
  • Detected databases: mysql
  • API-only project detected

🔧 Configuration Details:
  • Minimal configuration for API-only applications
  • Includes: CLI, FPM, basic web extensions
```

## Example 4: WordPress Site

**Project Structure:**
```
my-wordpress-site/
├── wp-config.php
├── wp-content/
├── wp-admin/
├── wp-includes/
└── index.php
```

**Launchpad Analysis:**
```
🎯 Recommended PHP Configuration: wordpress

📋 Analysis:
  • Detected wordpress framework
  • Detected databases: mysql

🔧 Configuration Details:
  • Optimized for WordPress applications
  • Includes: WordPress-specific extensions
```

## Example 5: Enterprise Laravel

**Project Structure:**
```
my-enterprise-app/
├── artisan
├── composer.json
├── .env
├── app/
│   ├── Services/         # ✅ Enterprise features
│   ├── Jobs/            # ✅ Enterprise features
│   ├── Events/          # ✅ Enterprise features
│   ├── Listeners/       # ✅ Enterprise features
│   └── Http/
│       └── Controllers/
├── config/
│   ├── queue.php        # ✅ Enterprise features
│   └── cache.php        # ✅ Enterprise features
└── routes/
    ├── web.php
    └── api.php
```

**Launchpad Analysis:**
```
🎯 Recommended PHP Configuration: enterprise

📋 Analysis:
  • Detected laravel framework
  • Detected databases: mysql
  • Enterprise features detected

🔧 Configuration Details:
  • Full-featured configuration for enterprise applications
  • Includes: All major extensions and database drivers
```

## Example 6: Multi-Database Project

**Project Structure:**
```
my-multi-db-app/
├── artisan
├── composer.json
├── .env
└── app/
    └── Http/
        └── Controllers/
```

**`.env` file:**
```env
# Primary database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=primary

# Secondary database
DB_CONNECTION_SECONDARY=pgsql
DB_HOST_SECONDARY=127.0.0.1
DB_PORT_SECONDARY=5432
DB_DATABASE_SECONDARY=secondary
```

**Launchpad Analysis:**
```
🎯 Recommended PHP Configuration: enterprise

📋 Analysis:
  • Detected laravel framework
  • Detected databases: mysql, postgres

🔧 Configuration Details:
  • Full-featured configuration for enterprise applications
  • Includes: All major extensions and database drivers
```

## Example 7: Development with SQLite

**Project Structure:**
```
my-dev-app/
├── artisan
├── composer.json
├── .env
└── database/
    └── database.sqlite   # ✅ SQLite database file
```

**`.env` file:**
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

**Launchpad Analysis:**
```
🎯 Recommended PHP Configuration: laravel-sqlite

📋 Analysis:
  • Detected laravel framework
  • Detected databases: sqlite

🔧 Configuration Details:
  • Optimized for Laravel with SQLite (development)
  • Includes: CLI, FPM, SQLite drivers, web extensions
```

## Environment Variable Examples

### Force PostgreSQL Preference
```bash
export LAUNCHPAD_PREFERRED_DATABASE=postgres
# Launchpad will prefer PostgreSQL even if MySQL is detected
```

### Force All Database Support
```bash
export LAUNCHPAD_PHP_ALL_DATABASES=true
# Launchpad will use full-stack configuration with all database drivers
```

### Force Enterprise Features
```bash
export LAUNCHPAD_PHP_ENTERPRISE=true
# Launchpad will use enterprise configuration even for simple projects
```

### Disable Auto-Detection
```bash
export LAUNCHPAD_PHP_AUTO_DETECT=false
# Launchpad will fall back to basic detection
```

## What Launchpad Detects

### Framework Detection
- **Laravel**: `artisan` + `composer.json` with `laravel/framework`
- **WordPress**: `wp-config.php` or `wp-config-sample.php`
- **Symfony**: `symfony.lock` or `config/bundles.php`

### Database Detection
- **MySQL**: `DB_CONNECTION=mysql` in `.env`
- **PostgreSQL**: `DB_CONNECTION=pgsql` in `.env`
- **SQLite**: `database.sqlite` files or `DB_CONNECTION=sqlite`

### Feature Detection
- **API**: `routes/api.php` or `app/Http/Controllers/Api/`
- **Web**: `routes/web.php` or `resources/views/`
- **Enterprise**: `app/Services/`, `app/Jobs/`, `app/Events/`, `config/queue.php`

### Configuration Logic
1. **WordPress** → `wordpress`
2. **Laravel + PostgreSQL only** → `laravel-postgres`
3. **Laravel + SQLite only** → `laravel-sqlite`
4. **API-only** → `api-only`
5. **Enterprise features** → `enterprise`
6. **Multiple databases** → `enterprise`
7. **User wants all databases** → `full-stack`
8. **User wants enterprise** → `enterprise`
9. **Default** → `laravel-mysql`
