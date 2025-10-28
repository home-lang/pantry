---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "pantry"
  text: "Modern Package Management"
  tagline: "Fast, isolated, and clean package management that works alongside your existing tools."
  image: /images/logo-white.png
  actions:
    - theme: brand
      text: Get Started
      link: /intro
    - theme: alt
      text: View on GitHub
      link: https://github.com/stacksjs/pantry

features:
  - title: "Package Management"
    icon: "📦"
    details: "Install, update, and manage packages with automatic environment isolation. Smart update system keeps packages current while respecting version constraints."
  - title: "Service Management"
    icon: "⚡"
    details: "Start, stop, and manage 30+ development services like PostgreSQL, Redis, Kafka, Prometheus, and more. Automatic configuration, health monitoring, and cross-platform support."
  - title: "Environment Isolation"
    icon: "🌍"
    details: "Project-specific, version-aware environments with automatic activation/deactivation. Each project gets its own isolated package installations and PATH management."
  - title: "Executable Shims"
    icon: "🔄"
    details: "Create lightweight executable scripts that automatically run the correct versions of your tools with full environment context."
  - title: "Custom & Pantry-Powered"
    icon: "🛠️"
    details: "Custom builds, powered by pkgx's Pantry, for fast, reliable package installations."
  - title: "Runtime Installation"
    icon: "🚀"
    details: "Direct installation of development runtimes like Bun and Node.js from official sources with automatic platform detection."
  - title: "Shell Integration"
    icon: "🐚"
    details: "Seamless shell integration with customizable activation messages and automatic PATH management. Works with Zsh and Bash."
  - title: "Cross-Platform"
    icon: "🌐"
    details: "Works consistently across macOS, Linux, and Windows with platform-specific optimizations and path handling."
  - title: "Environment Management"
    icon: "🔧"
    details: "Comprehensive tools for listing, inspecting, cleaning, and managing development environments with human-readable, version-aware identifiers."
---

<Home />
