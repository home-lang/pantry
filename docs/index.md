---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Launchpad"
  text: "Modern Package Manager"
  tagline: "Simplify package installation and management, similar to Homebrew."
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
    details: "Install and manage packages directly using pkgx with a clean interface."
  - title: "Executable Shims"
    icon: "🔄"
    details: "Create executable shims for packages automatically for easier access."
  - title: "pkgx Installation"
    icon: "🛠️"
    details: "Install and manage the pkgx utility itself without needing Homebrew or other tools."
  - title: "Dev Environment"
    icon: "💻"
    details: "Dedicated command for the dev package to setup development environments quickly."
  - title: "Bun Installation"
    icon: "🚀"
    details: "Install Bun runtime directly from GitHub releases with automatic platform detection."
---

<Home />
