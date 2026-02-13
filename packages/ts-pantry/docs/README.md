# ts-pkgx Documentation

Welcome to the ts-pkgx documentation! This directory contains comprehensive documentation for all packages available in the ts-pkgx ecosystem.

## 📚 Documentation Structure

- **[Package Catalog](./package-catalog.md)** - Complete catalog of all 866+ packages organized by category
- **[Individual Package Pages](./package-catalog.md#packages)** - Detailed documentation for each package
- **[Category Pages](./package-catalog.md#categories)** - Packages grouped by functionality
- **[API Reference](./api-reference.md)** - TypeScript API documentation
- **[CLI Reference](./cli-reference.md)** - Command-line interface documentation
- **[Launchpad Integration](./launchpad-integration.md)** - Dependency resolution API for package managers

## 🚀 Auto-Generated Documentation

The package documentation is automatically generated from the latest package data using our comprehensive documentation generation system.

### Generated Content Includes:

- **Package Catalog**: Organized by categories with quick stats and search functionality
- **Individual Package Pages**: Detailed information for each package including:
  - Installation instructions
  - Available programs and commands
  - Version history and compatibility
  - Dependencies and related packages
  - Usage examples and TypeScript integration
- **Category Pages**: Packages grouped by functionality (Programming Languages, Databases, DevOps, etc.)

### Regenerating Documentation

To update the documentation with the latest package information:

```bash
# Using npm/bun scripts
bun run pkgx:docs

# Using the CLI directly
bun bin/cli.ts generate-docs

# Using the convenience script
./scripts/generate-docs.sh
```

### Documentation Features

- **📊 Quick Stats**: Total package count, categories, and last updated date
- **🔍 Searchable**: Easy navigation with table of contents and category organization
- **📱 VitePress Compatible**: Optimized for VitePress static site generation
- **🔗 Cross-Referenced**: Links between related packages and categories
- **💻 Code Examples**: TypeScript usage examples for each package
- **📦 Installation Commands**: Ready-to-use pkgx installation commands

## 🌐 Viewing Documentation

### Local Development

```bash
# Start the development server
bun run dev:docs

# Build for production
bun run build:docs

# Preview production build
bun run preview:docs
```

### Online

Visit the live documentation at [your-docs-url.com](https://your-docs-url.com)

## 📝 Contributing

The documentation is automatically generated from package data. To contribute:

1. **Package Updates**: Modify package files in `src/packages/`
2. **Documentation Generator**: Improve the generator in `bin/generate-docs.ts`
3. **Manual Pages**: Edit static documentation files directly

## 🔄 Automation

The documentation generation is integrated into the build process and can be automated in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Generate Documentation
  run: bun run pkgx:docs

- name: Deploy to GitHub Pages
  run: bun run build:docs
```

## 📊 Package Statistics

- **Total Packages**: 866+
- **Categories**: 13
- **Programming Languages**: 20+
- **Databases**: 15+
- **DevOps Tools**: 25+
- **CLI Utilities**: 100+

---

*This documentation is automatically updated when packages are modified.*
