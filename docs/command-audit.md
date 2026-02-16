# pantry audit

> Check your installed packages for known security vulnerabilities

The `pantry audit` command scans your project dependencies for known security vulnerabilities by querying the NPM registry's vulnerability database. It helps protect your applications from supply chain attacks and known security issues.

## Usage

```bash
pantry audit
```

Run the command in a project with a `package.json` or `pantry.json` file. Pantry sends the list of installed packages and versions to NPM, and prints a report of any vulnerabilities that were found.

## Output

### No Vulnerabilities

If no vulnerabilities are found, the command prints:

```
No vulnerabilities found
```

### Vulnerabilities Detected

When vulnerabilities are detected, each affected package is listed along with the severity, a short description, and a link to the advisory:

```
CVE-2023-26136 (high)
Package: tough-cookie
Vulnerable: <4.1.3
Patched: >=4.1.3
Prototype pollution in tough-cookie
More info: https://github.com/advisories/GHSA-72xf-g2v4-qvf3

CVE-2022-25883 (moderate)
Package: semver
Vulnerable: <7.5.2
Patched: >=7.5.2
Regular expression denial of service in semver
More info: https://github.com/advisories/GHSA-c2qf-rxjj-qqgw

3 vulnerabilities (1 high, 2 moderate)
To update all dependencies to the latest compatible versions:
  pantry update
To update all dependencies to the latest versions (including breaking changes):
  pantry update --latest
```

## Options

### `--audit-level <level>`

Only show vulnerabilities at this severity level or higher.

**Levels**: `low`, `moderate`, `high`, `critical`

```bash
pantry audit --audit-level=high
```

This will only display `high` and `critical` vulnerabilities, hiding `low` and `moderate` ones.

### `--prod`

Audit only production dependencies, excluding devDependencies.

```bash
pantry audit --prod
```

Useful for checking what goes into your production build without noise from development tools.

### `--ignore <CVE>`

Ignore specific CVE IDs. Can be used multiple times to ignore multiple CVEs.

```bash
pantry audit --ignore CVE-2022-25883 --ignore CVE-2023-26136
```

Helpful when you've assessed a vulnerability and determined it doesn't affect your usage, or when waiting for an upstream fix.

### `--json`

Output the raw JSON response instead of the formatted report.

```bash
pantry audit --json
```

Example JSON output:

```json
{
  "vulnerabilities": [
    {
      "id": "CVE-2023-26136",
      "title": "Prototype pollution in tough-cookie",
      "severity": "high",
      "package": "tough-cookie",
      "vulnerable_versions": "<4.1.3",
      "patched_versions": ">=4.1.3",
      "url": "https://github.com/advisories/GHSA-72xf-g2v4-qvf3",
      "cwe": "CWE-1321"
    }
  ],
  "summary": {
    "total": 1,
    "low": 0,
    "moderate": 0,
    "high": 1,
    "critical": 0
  }
}
```

## Exit Codes

- `0`: No vulnerabilities found
- `1`: Vulnerabilities were found in the report

This behavior persists even when using `--json`, making it suitable for CI/CD pipelines.

## Examples

### Basic Audit

Check all dependencies for vulnerabilities:

```bash
$ pantry audit

No vulnerabilities found
```

### Production-Only Audit

Audit only production dependencies:

```bash
$ pantry audit --prod

2 vulnerabilities (1 high, 1 moderate)
To update all dependencies to the latest compatible versions:
  pantry update
```

### High-Severity Only

Show only high and critical vulnerabilities:

```bash
$ pantry audit --audit-level=high

CVE-2023-26136 (high)
Package: tough-cookie
...

1 vulnerabilities (1 high)
```

### Ignore Known CVEs

Ignore specific CVEs you've already assessed:

```bash
$ pantry audit --ignore CVE-2022-25883

CVE-2023-26136 (high)
Package: tough-cookie
...

1 vulnerabilities (1 high)
```

### JSON Output for Tooling

Get machine-readable output for integration with other tools:

```bash
$ pantry audit --json > audit-report.json
$ cat audit-report.json | jq '.summary'
{
  "total": 2,
  "low": 0,
  "moderate": 1,
  "high": 1,
  "critical": 0
}
```

### CI/CD Integration

Use in continuous integration to fail builds with vulnerabilities:

```bash
# !/bin/bash
# .github/workflows/security.yml

pantry audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "High or critical vulnerabilities found!"
  exit 1
fi
```

## Security Scanner API

Pantry supports custom security scanners that can analyze packages before installation and during audits. This allows integration with enterprise security tools and custom vulnerability databases.

### Configuring a Security Scanner

Add a security scanner to your `pantry.json` or `package.json`:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "security": {
    "scanner": "@acme/bun-security-scanner"
  },
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

### How It Works

When a security scanner is configured:

1. **Before Installation**: Scanner analyzes packages during `pantry install` and `pantry add`
2. **During Audit**: Scanner provides additional vulnerability data during `pantry audit`
3. **Security Levels**:
   - `fatal`: Installation stops immediately, exits with non-zero code
   - `warn`: In interactive terminals, prompts to continue; in CI, exits immediately

### Using Pre-built Scanners

Many security vendors publish pantry-compatible scanners as npm packages.

#### Installing a Scanner

```bash
pantry add -d @acme/bun-security-scanner
```

#### Configuration

After installation, add it to your config:

```json
{
  "security": {
    "scanner": "@acme/bun-security-scanner"
  }
}
```

### Enterprise Configuration

Some enterprise scanners support authentication via environment variables:

```bash
# Add to ~/.bashrc or ~/.zshrc
export SECURITY_API_KEY="your-api-key"
export SECURITY_SCANNER_ENDPOINT="https://security.yourcompany.com"

# Scanner uses these credentials automatically
pantry install
pantry audit
```

Consult your security scanner's documentation for specific environment variables and configuration options.

### Scanner Capabilities

Security scanners can detect:

- **Known Vulnerabilities**: CVEs from multiple databases (NPM, NVD, etc.)
- **Malicious Packages**: Typosquatting, backdoors, suspicious code
- **License Issues**: GPL violations, incompatible licenses
- **Supply Chain Risks**: Compromised maintainers, suspicious updates
- **Custom Policies**: Company-specific security rules

### Creating Your Own Scanner

For a complete example with tests and CI setup, see the official template:

[github.com/oven-sh/security-scanner-template](https://github.com/oven-sh/security-scanner-template)

## Common Use Cases

### 1. Regular Security Audits

Run audits regularly to catch new vulnerabilities:

```bash
# Weekly security check
pantry audit
```

### 2. Pre-Deployment Checks

Ensure production code has no high-severity vulnerabilities:

```bash
pantry audit --prod --audit-level=high
```

### 3. Dependency Update Planning

Before updating dependencies, check current vulnerabilities:

```bash
pantry audit --json > before.json
pantry update
pantry audit --json > after.json
diff before.json after.json
```

### 4. CI/CD Pipeline Integration

Fail builds when vulnerabilities are detected:

```yaml
# .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v3
      - run: pantry install
      - run: pantry audit --audit-level=moderate

```

### 5. False Positive Management

Ignore assessed vulnerabilities that don't affect your code:

```bash
# Create audit script with known exceptions
# !/bin/bash
pantry audit \
  --ignore CVE-2022-25883 \
  --ignore CVE-2023-26136 \
  --audit-level=moderate
```

## Comparison with npm/yarn/bun

| Feature | pantry | npm | yarn | bun |
|---------|--------|-----|------|-----|
| Basic audit |  |  `npm audit` |  `yarn audit` |  `bun audit` |
| Severity filtering |  |  |  |  |
| Prod-only |  `--prod` |  `--production` |  `--production` |  `--prod` |
| Ignore CVEs |  `--ignore` | L | L |  `--ignore` |
| JSON output |  |  |  |  |
| Custom scanners |  | L | L |  |
| JSONC support |  | L | L | L |

## Troubleshooting

### Issue: False Positives

**Problem**: Vulnerability reported but doesn't affect your code

**Solution**: Use `--ignore` to suppress after assessment:

```bash
pantry audit --ignore CVE-XXXX-XXXXX
```

### Issue: Too Many Low-Severity Warnings

**Problem**: Audit output is too noisy with low-severity issues

**Solution**: Filter by severity level:

```bash
pantry audit --audit-level=moderate
```

### Issue: DevDependencies Noise

**Problem**: Don't care about development tool vulnerabilities in production

**Solution**: Use `--prod` flag:

```bash
pantry audit --prod
```

### Issue: CI Pipeline Failing

**Problem**: Audit exits with code 1 when vulnerabilities found

**Solution**: This is intentional. Either fix the vulnerabilities or adjust your CI to accept the exit code:

```bash
# Warn but don't fail
pantry audit || echo "Vulnerabilities found, review required"
```

### Issue: Scanner Not Found

**Problem**: Configured scanner package not installed

**Solution**: Install the scanner package:

```bash
pantry add -d @acme/security-scanner
```

## Performance Tips

1. **Use `--prod` in CI**: Faster audits by skipping dev dependencies
2. **Filter severity early**: Use `--audit-level` to reduce output processing
3. **Cache audit results**: In CI, cache results between runs when dependencies haven't changed
4. **Ignore assessed CVEs**: Keep a list of verified false positives to reduce noise

## Related Commands

- [`pantry install`](./install.md) - Install packages (runs scanner if configured)
- [`pantry update`](./update.md) - Update packages to fix vulnerabilities
- [`pantry list`](./list.md) - List installed packages
- [`pantry why`](./command-why.md) - Explain why a vulnerable package is installed

## Security Best Practices

1. **Run Audits Regularly**: Schedule weekly or monthly audits
2. **Audit Before Deployment**: Make it part of your CI/CD pipeline
3. **Keep Dependencies Updated**: Use `pantry update` to patch vulnerabilities
4. **Use Scanners**: Configure enterprise scanners for additional protection
5. **Monitor Severity**: Pay attention to high and critical vulnerabilities
6. **Document Exceptions**: Keep track of ignored CVEs and why
7. **Review Transitive Dependencies**: Use `pantry why` to understand dependency chains

## See Also

- [Security Scanner API](#security-scanner-api)
- [Configuration Guide](./config.md)
- [Update Command](./update.md)
- [CLI Reference](./cli.md)
- [Scanner Template](https://github.com/oven-sh/security-scanner-template)
