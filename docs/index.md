---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Launchpad"
  text: "Modern Package Management"
  tagline: "Fast, isolated, and clean package management that works alongside your existing tools."
  image: /images/logo-white.png
  actions:
    - theme: brand
      text: Get Started
      link: /intro
    - theme: alt
      text: View on GitHub
      link: https://github.com/stacksjs/launchpad

features:
  - title: "Package Management"
    icon: "📦"
    details: "Install and manage packages with automatic environment isolation. Uses /usr/local (never /opt/homebrew) for clean separation from Homebrew."
  - title: "Environment Isolation"
    icon: "🌍"
    details: "Project-specific environments with automatic activation/deactivation. Each project gets its own isolated package installations and PATH management."
  - title: "Executable Shims"
    icon: "🔄"
    details: "Create lightweight executable scripts that automatically run the correct versions of your tools with full environment context."
  - title: "Pantry-Powered"
    icon: "🛠️"
    details: "Built on top of pkgx's Pantry for fast package installations."
  - title: "Runtime Installation"
    icon: "🚀"
    details: "Direct installation of development runtimes like Bun and Node.js from official sources with automatic platform detection."
  - title: "Shell Integration"
    icon: "🐚"
    details: "Seamless shell integration with customizable activation messages. Install shells like Zsh with automatic PATH management."
  - title: "Cross-Platform"
    icon: "🌐"
    details: "Works consistently across macOS, Linux, and Windows with platform-specific optimizations and path handling."
  - title: "Environment Management"
    icon: "🔧"
    details: "Comprehensive tools for listing, inspecting, cleaning, and managing development environments with human-readable identifiers."
  - title: "Clean Coexistence"
    icon: "🔗"
    details: "Peaceful coexistence with Homebrew, system package managers, and other tools. Never conflicts with existing installations."
---

<Home />
