# Custom Output Formats

ts-pkgx generates TypeScript or JSON files by default, but you can customize the output format to suit your specific needs.

## Custom Markdown Output

You can generate markdown documentation for packages:

```typescript
import type { PkgxPackage } from 'ts-pkgx'
import fs from 'node:fs'
import path from 'node:path'
import { fetchPantryPackage } from 'ts-pkgx'

async function saveAsMarkdown(packageName: string, outputDir: string): Promise<void> {
  const { packageInfo } = await fetchPantryPackage(packageName)
  const mdContent = generateMarkdown(packageInfo)

  const fileName = `${packageInfo.domain.replace(/\./g, '-')}.md`
  const filePath = path.join(outputDir, fileName)

  fs.writeFileSync(filePath, mdContent)
  console.log(`Saved markdown to ${filePath}`)
}

function generateMarkdown(pkg: PkgxPackage): string {
  return `# ${pkg.name} (${pkg.domain})

${pkg.description}

## Installation

\`\`\`bash
${pkg.installCommand}
\`\`\`

## Programs

${pkg.programs.map(p => `- ${p}`).join('\n')}

## Dependencies

${pkg.dependencies.length ? pkg.dependencies.map(d => `- ${d}`).join('\n') : 'No dependencies'}

## Links

- [Homepage](${pkg.homepageUrl || 'N/A'})
- [GitHub](${pkg.githubUrl || 'N/A'})
- [Package YAML](${pkg.packageYmlUrl || 'N/A'})
`
}
```

This allows you to generate human-readable documentation for your packages.

## HTML Output

You can generate HTML files for web display:

```typescript
function generateHtml(pkg: PkgxPackage): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pkg.name} - ${pkg.domain}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { color: #0A0ABC; }
    .programs { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .program { background: #f0f0f0; padding: 0.25rem 0.5rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${pkg.name}</h1>
  <p><strong>Domain:</strong> ${pkg.domain}</p>
  <p>${pkg.description}</p>

  <h2>Installation</h2>
  <pre><code>${pkg.installCommand}</code></pre>

  <h2>Programs</h2>
  <div class="programs">
    ${pkg.programs.map(p => `<span class="program">${p}</span>`).join('\n    ')}
  </div>

  <h2>Dependencies</h2>
  <ul>
    ${pkg.dependencies.length
      ? pkg.dependencies.map(d => `<li>${d}</li>`).join('\n    ')
      : '<li>No dependencies</li>'}
  </ul>

  <h2>Links</h2>
  <ul>
    <li><a href="${pkg.homepageUrl || '#'}">Homepage</a></li>
    <li><a href="${pkg.githubUrl || '#'}">GitHub</a></li>
    <li><a href="${pkg.packageYmlUrl || '#'}">Package YAML</a></li>
  </ul>
</body>
</html>`
}

async function saveAsHtml(packageName: string, outputDir: string): Promise<void> {
  const { packageInfo } = await fetchPantryPackage(packageName)
  const htmlContent = generateHtml(packageInfo)

  const fileName = `${packageInfo.domain.replace(/\./g, '-')}.html`
  const filePath = path.join(outputDir, fileName)

  fs.writeFileSync(filePath, htmlContent)
  console.log(`Saved HTML to ${filePath}`)
}
```

## CSV Export

For data analysis or import into spreadsheets:

```typescript
function generateCsv(packages: PkgxPackage[]): string {
  // CSV header
  let csv = 'domain,name,description,programs,dependencies,versions\n'

  // Add a row for each package
  for (const pkg of packages) {
    const row = [
      `"${pkg.domain}"`,
      `"${pkg.name.replace(/"/g, '""')}"`,
      `"${pkg.description.replace(/"/g, '""')}"`,
      `"${pkg.programs.join(', ').replace(/"/g, '""')}"`,
      `"${pkg.dependencies.join(', ').replace(/"/g, '""')}"`,
      `"${pkg.versions.join(', ').replace(/"/g, '""')}"`
    ]

    csv += `${row.join(',')}\n`
  }

  return csv
}

async function exportPackagesToCsv(outputPath: string): Promise<void> {
  // Import pantry dynamically to avoid circular dependencies
  const { pantry } = await import('../src/packages')

  // Convert pantry object to array
  const packages = Object.values(pantry)

  // Generate CSV content
  const csvContent = generateCsv(packages)

  // Write to file
  fs.writeFileSync(outputPath, csvContent)
  console.log(`Exported ${packages.length} packages to ${outputPath}`)
}
```

## YAML Output

For configuration-friendly format:

```typescript
import yaml from 'yaml' // You'll need to install this package

function generateYaml(pkg: PkgxPackage): string {
  // Simplify the package structure if needed
  const yamlObj = {
    name: pkg.name,
    domain: pkg.domain,
    description: pkg.description,
    installCommand: pkg.installCommand,
    programs: pkg.programs,
    dependencies: pkg.dependencies,
    companions: pkg.companions,
    versions: pkg.versions,
    links: {
      homepage: pkg.homepageUrl,
      github: pkg.githubUrl,
      packageYml: pkg.packageYmlUrl
    }
  }

  return yaml.stringify(yamlObj)
}

async function saveAsYaml(packageName: string, outputDir: string): Promise<void> {
  const { packageInfo } = await fetchPantryPackage(packageName)
  const yamlContent = generateYaml(packageInfo)

  const fileName = `${packageInfo.domain.replace(/\./g, '-')}.yaml`
  const filePath = path.join(outputDir, fileName)

  fs.writeFileSync(filePath, yamlContent)
  console.log(`Saved YAML to ${filePath}`)
}
```

## SQLite Database

For more complex querying capabilities:

```typescript
import { open } from 'sqlite' // You'll need to install this package
import sqlite3 from 'sqlite3' // You'll need to install this package

async function createPackageDatabase(dbPath: string): Promise<void> {
  // Import pantry dynamically
  const { pantry } = await import('../src/packages')

  // Open database
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT UNIQUE,
      name TEXT,
      description TEXT,
      install_command TEXT,
      homepage_url TEXT,
      github_url TEXT,
      package_yml_url TEXT
    );

    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER,
      name TEXT,
      FOREIGN KEY (package_id) REFERENCES packages(id)
    );

    CREATE TABLE IF NOT EXISTS dependencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      package_id INTEGER,
      dependency TEXT,
      FOREIGN KEY (package_id) REFERENCES packages(id)
    );
  `)

  // Insert packages
  for (const pkg of Object.values(pantry)) {
    // Insert package
    const result = await db.run(
      `INSERT INTO packages (domain, name, description, install_command, homepage_url, github_url, package_yml_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      pkg.domain,
      pkg.name,
      pkg.description,
      pkg.installCommand,
      pkg.homepageUrl,
      pkg.githubUrl,
      pkg.packageYmlUrl
    )

    const packageId = result.lastID

    // Insert programs
    for (const program of pkg.programs) {
      await db.run(
        `INSERT INTO programs (package_id, name) VALUES (?, ?)`,
        packageId,
        program
      )
    }

    // Insert dependencies
    for (const dependency of pkg.dependencies) {
      await db.run(
        `INSERT INTO dependencies (package_id, dependency) VALUES (?, ?)`,
        packageId,
        dependency
      )
    }
  }

  await db.close()
  console.log(`Created SQLite database at ${dbPath}`)
}
```

## Command-Line Integration

You can add support for custom output formats to the CLI:

```typescript
cli
  .command('export <format>', 'Export packages to a custom format')
  .option('-o, --output <path>', 'Output file path')
  .action(async (format, options) => {
    const outputPath = options.output || `./packages-export.${format}`

    switch (format) {
      case 'md':
      case 'markdown':
        await exportPackagesToMarkdown(outputPath)
        break
      case 'html':
        await exportPackagesToHtml(outputPath)
        break
      case 'csv':
        await exportPackagesToCsv(outputPath)
        break
      case 'yaml':
        await exportPackagesToYaml(outputPath)
        break
      case 'sqlite':
        await createPackageDatabase(outputPath)
        break
      default:
        console.error(`Unsupported format: ${format}`)
        process.exit(1)
    }
  })
```

These custom output formats allow you to integrate ts-pkgx with other tools in your workflow.
