# Contributing Guide

Thank you for your interest in contributing to the Launchpad Installer! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/stacksjs/launchpad.git
   cd launchpad/packages/action
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Build the action:**
   ```bash
   bun run build
   ```

## Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

3. **Run the build to ensure everything compiles:**
   ```bash
   bun run build
   ```

4. **Testing your changes:**
   - For local testing, you can manually run the compiled action against your test repo
   - For GitHub Actions testing, you can set up a test workflow in a test repository

5. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

6. **Submit a Pull Request:**
   - Push your branch to your fork
   - Create a pull request to the main repository

## Pull Request Guidelines

- Begin the PR title with a semantic prefix (e.g., `feat:`, `fix:`, `docs:`, `chore:`)
- Include a clear description of the changes in the PR description
- Link any related issues
- Keep PRs focused on a single responsibility
- Add tests for new features

## Code Style Guidelines

- Follow TypeScript best practices
- Use consistent formatting (the project uses ESLint)
- Include proper JSDoc comments for public APIs
- Ensure code passes the TypeScript compiler

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

- Patch (`0.0.x`): Bug fixes and minor updates that don't affect the API
- Minor (`0.x.0`): New features that don't break backward compatibility
- Major (`x.0.0`): Breaking changes to the public API

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](../../LICENSE.md).
