//! Initialize a new pantry.json file
//!
//! Creates a new pantry.json with sensible defaults.
//! Supports --preset flag for scaffolding pre-configured projects:
//!   typescript, laravel, next, monorepo-typescript

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const style = @import("../style.zig");

const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
    }
};

pub fn initCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Check for --preset flag
    var preset: ?[]const u8 = null;
    for (args) |arg| {
        if (std.mem.startsWith(u8, arg, "--preset=")) {
            preset = arg["--preset=".len..];
        } else if (std.mem.eql(u8, arg, "--preset")) {
            // Next arg would be the value, but zig-cli passes it as --preset=value
            continue;
        }
    }

    // If preset is specified, skip interactive prompts and generate from preset
    if (preset) |preset_name| {
        return generatePreset(allocator, preset_name, cwd);
    }

    // Check if pantry.json already exists
    const file_exists = blk: {
        io_helper.cwd().access(io_helper.io, "pantry.json", .{}) catch |err| {
            if (err == error.FileNotFound) break :blk false;
            return err;
        };
        break :blk true;
    };

    if (file_exists) {
        // File exists
        style.print("pantry.json already exists\n", .{});
        style.print("Do you want to overwrite it? (y/N): ", .{});

        var buf: [10]u8 = undefined;
        const bytes_read = try io_helper.readStdin(&buf);

        if (bytes_read == 0 or buf[0] != 'y') {
            return .{
                .exit_code = 0,
                .message = try allocator.dupe(u8, "Cancelled"),
            };
        }
    }

    // Get project name from directory
    const dir_name = std.fs.path.basename(cwd);

    // Interactive prompts
    style.print("\n Initializing pantry.json\n\n", .{});

    style.print("Project name ({s}): ", .{dir_name});
    var name_buf: [256]u8 = undefined;
    const name_bytes = try io_helper.readStdin(&name_buf);
    const project_name = blk: {
        if (name_bytes == 0) break :blk dir_name;
        const trimmed = std.mem.trim(u8, name_buf[0..name_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else dir_name;
    };

    style.print("Version (1.0.0): ", .{});
    var version_buf: [64]u8 = undefined;
    const version_bytes = try io_helper.readStdin(&version_buf);
    const version = blk: {
        if (version_bytes == 0) break :blk "1.0.0";
        const trimmed = std.mem.trim(u8, version_buf[0..version_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else "1.0.0";
    };

    style.print("Description: ", .{});
    var desc_buf: [512]u8 = undefined;
    const desc_bytes = try io_helper.readStdin(&desc_buf);
    const description = blk: {
        if (desc_bytes == 0) break :blk "";
        const trimmed = std.mem.trim(u8, desc_buf[0..desc_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else "";
    };

    // Detect if TypeScript project
    const has_tsconfig = blk: {
        io_helper.cwd().access(io_helper.io, "tsconfig.json", .{}) catch break :blk false;
        break :blk true;
    };

    const has_package_json = blk: {
        io_helper.cwd().access(io_helper.io, "package.json", .{}) catch break :blk false;
        break :blk true;
    };

    // Generate pantry.json
    const template = if (has_tsconfig or has_package_json)
        try generateNodeTemplate(allocator, project_name, version, description)
    else
        try generateBasicTemplate(allocator, project_name, version, description);
    defer allocator.free(template);

    // Write file
    const file = try io_helper.cwd().createFile(io_helper.io, "pantry.json", .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, template);

    style.print("\n Created pantry.json\n", .{});
    style.print("\n Next steps:\n", .{});
    style.print("   1. Add dependencies: pantry add <package>@<version>\n", .{});
    style.print("   2. Install packages: pantry install\n", .{});
    style.print("   3. Add scripts to the 'scripts' section\n", .{});
    if (!has_package_json) {
        style.print("   4. Consider adding services in 'services' section\n", .{});
    }

    return .{ .exit_code = 0 };
}

// ============================================================================
// Preset Dispatcher
// ============================================================================

fn generatePreset(allocator: std.mem.Allocator, preset_name: []const u8, cwd: []const u8) !CommandResult {
    const project_name = std.fs.path.basename(cwd);

    if (std.mem.eql(u8, preset_name, "typescript") or std.mem.eql(u8, preset_name, "ts")) {
        return generateTypescriptPreset(allocator, project_name);
    } else if (std.mem.eql(u8, preset_name, "laravel")) {
        return generateLaravelPreset(allocator, project_name);
    } else if (std.mem.eql(u8, preset_name, "next") or std.mem.eql(u8, preset_name, "nextjs")) {
        return generateNextPreset(allocator, project_name);
    } else if (std.mem.eql(u8, preset_name, "monorepo-typescript") or std.mem.eql(u8, preset_name, "monorepo-ts") or std.mem.eql(u8, preset_name, "monorepo")) {
        return generateMonorepoTypescriptPreset(allocator, project_name);
    } else {
        const msg = try std.fmt.allocPrint(allocator, "Unknown preset: {s}\nAvailable presets: typescript, laravel, next, monorepo-typescript", .{preset_name});
        return .{ .exit_code = 1, .message = msg };
    }
}

// ============================================================================
// TypeScript Preset (equivalent to ts-starter)
// ============================================================================

fn generateTypescriptPreset(allocator: std.mem.Allocator, project_name: []const u8) !CommandResult {
    style.print("Generating TypeScript project: {s}\n\n", .{project_name});

    // deps.yaml
    writeFileContent("deps.yaml",
        \\dependencies:
        \\  bun.sh: ^1.3.1
        \\
    ) catch {};

    // package.json
    {
        const pkg = try std.fmt.allocPrint(allocator,
            \\{{
            \\  "name": "{s}",
            \\  "type": "module",
            \\  "version": "0.1.0",
            \\  "description": "",
            \\  "exports": {{
            \\    ".": {{
            \\      "types": "./dist/index.d.ts",
            \\      "import": "./dist/index.js"
            \\    }},
            \\    "./*": {{
            \\      "import": "./dist/*"
            \\    }}
            \\  }},
            \\  "module": "./dist/index.js",
            \\  "types": "./dist/index.d.ts",
            \\  "scripts": {{
            \\    "build": "bun --bun build.ts",
            \\    "dev": "bun run --watch src/index.ts",
            \\    "test": "bun test",
            \\    "typecheck": "bun --bun tsc --noEmit",
            \\    "lint": "bunx --bun pickier lint .",
            \\    "lint:fix": "bunx --bun pickier lint . --fix",
            \\    "fresh": "bunx rimraf node_modules/ bun.lock && bun i",
            \\    "changelog": "bunx logsmith --verbose",
            \\    "release": "bun run changelog:generate && bunx bumpx prompt --recursive",
            \\    "dev:docs": "bun --bun bunpress dev docs",
            \\    "format": "bunx --bun pickier format .",
            \\    "format:fix": "bunx --bun pickier format . --write"
            \\  }},
            \\  "devDependencies": {{
            \\    "better-dx": "^0.2.5"
            \\  }}
            \\}}
            \\
        , .{project_name});
        defer allocator.free(pkg);
        writeFileContent("package.json", pkg) catch {};
    }

    // tsconfig.json
    writeFileContent("tsconfig.json",
        \\{
        \\  "compilerOptions": {
        \\    "target": "esnext",
        \\    "lib": ["esnext"],
        \\    "moduleDetection": "force",
        \\    "module": "esnext",
        \\    "moduleResolution": "bundler",
        \\    "resolveJsonModule": true,
        \\    "types": ["bun"],
        \\    "allowImportingTsExtensions": true,
        \\    "strict": true,
        \\    "strictNullChecks": true,
        \\    "noFallthroughCasesInSwitch": true,
        \\    "declaration": true,
        \\    "noEmit": true,
        \\    "esModuleInterop": true,
        \\    "forceConsistentCasingInFileNames": true,
        \\    "isolatedDeclarations": true,
        \\    "isolatedModules": true,
        \\    "verbatimModuleSyntax": true,
        \\    "skipDefaultLibCheck": true,
        \\    "skipLibCheck": true
        \\  }
        \\}
        \\
    ) catch {};

    // .editorconfig
    writeFileContent(".editorconfig",
        \\root = true
        \\
        \\[*]
        \\charset = utf-8
        \\indent_style = space
        \\indent_size = 2
        \\end_of_line = lf
        \\insert_final_newline = true
        \\trim_trailing_whitespace = true
        \\
    ) catch {};

    // bunfig.toml
    writeFileContent("bunfig.toml",
        \\[install]
        \\registry = { url = "https://registry.npmjs.org/", token = "$BUN_AUTH_TOKEN" }
        \\linker = "hoisted"
        \\
    ) catch {};

    // src/index.ts
    io_helper.makePath("src") catch {};
    {
        const src_path = "src/index.ts";
        const src_content = "export function hello(name: string): string {\n  return `Hello, ${name}!`\n}\n\nconsole.log(hello('world'))\n";
        writeFileContent(src_path, src_content) catch {};
    }

    style.print("Created TypeScript project scaffold:\n", .{});
    style.print("  deps.yaml\n", .{});
    style.print("  package.json\n", .{});
    style.print("  tsconfig.json\n", .{});
    style.print("  .editorconfig\n", .{});
    style.print("  bunfig.toml\n", .{});
    style.print("  src/index.ts\n", .{});
    style.print("\nNext steps:\n", .{});
    style.print("  pantry install\n", .{});
    style.print("  bun run dev\n", .{});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Monorepo TypeScript Preset (equivalent to ts-starter-monorepo)
// ============================================================================

fn generateMonorepoTypescriptPreset(allocator: std.mem.Allocator, project_name: []const u8) !CommandResult {
    style.print("Generating Monorepo TypeScript project: {s}\n\n", .{project_name});

    // deps.yaml
    writeFileContent("deps.yaml",
        \\dependencies:
        \\  bun.sh: ^1.3.9
        \\
    ) catch {};

    // package.json
    {
        const pkg = try std.fmt.allocPrint(allocator,
            \\{{
            \\  "name": "{s}",
            \\  "type": "module",
            \\  "version": "0.0.0",
            \\  "description": "",
            \\  "scripts": {{
            \\    "fresh": "bunx rimraf node_modules/ bun.lock && bun i",
            \\    "test": "bun test",
            \\    "lint": "bunx --bun pickier .",
            \\    "lint:fix": "bunx --bun pickier . --fix",
            \\    "changelog": "bunx logsmith --verbose",
            \\    "changelog:generate": "bunx logsmith --output CHANGELOG.md",
            \\    "release": "bun run changelog:generate && bunx bumpx prompt --recursive",
            \\    "dev:docs": "bun --bun bunpress dev docs",
            \\    "build:docs": "bun --bun bunpress build docs",
            \\    "preview:docs": "bun --bun bunpress preview docs",
            \\    "typecheck": "bun --bun tsc --noEmit"
            \\  }},
            \\  "devDependencies": {{
            \\    "better-dx": "^0.2.5"
            \\  }},
            \\  "workspaces": [
            \\    "packages/*"
            \\  ]
            \\}}
            \\
        , .{project_name});
        defer allocator.free(pkg);
        writeFileContent("package.json", pkg) catch {};
    }

    // tsconfig.json
    writeFileContent("tsconfig.json",
        \\{
        \\  "compilerOptions": {
        \\    "target": "esnext",
        \\    "lib": ["esnext"],
        \\    "moduleDetection": "force",
        \\    "module": "esnext",
        \\    "moduleResolution": "bundler",
        \\    "resolveJsonModule": true,
        \\    "types": ["bun"],
        \\    "allowImportingTsExtensions": true,
        \\    "strict": true,
        \\    "strictNullChecks": true,
        \\    "noFallthroughCasesInSwitch": true,
        \\    "declaration": true,
        \\    "noEmit": true,
        \\    "esModuleInterop": true,
        \\    "forceConsistentCasingInFileNames": true,
        \\    "isolatedDeclarations": true,
        \\    "isolatedModules": true,
        \\    "verbatimModuleSyntax": true,
        \\    "skipDefaultLibCheck": true,
        \\    "skipLibCheck": true
        \\  }
        \\}
        \\
    ) catch {};

    // .editorconfig
    writeFileContent(".editorconfig",
        \\root = true
        \\
        \\[*]
        \\charset = utf-8
        \\indent_style = space
        \\indent_size = 2
        \\end_of_line = lf
        \\insert_final_newline = true
        \\trim_trailing_whitespace = true
        \\
    ) catch {};

    // bunfig.toml
    writeFileContent("bunfig.toml",
        \\[install]
        \\registry = { url = "https://registry.npmjs.org/", token = "$BUN_AUTH_TOKEN" }
        \\
    ) catch {};

    // Create packages directory structure
    io_helper.makePath("packages") catch {};

    style.print("Created Monorepo TypeScript project scaffold:\n", .{});
    style.print("  deps.yaml\n", .{});
    style.print("  package.json\n", .{});
    style.print("  tsconfig.json\n", .{});
    style.print("  .editorconfig\n", .{});
    style.print("  bunfig.toml\n", .{});
    style.print("  packages/\n", .{});
    style.print("\nNext steps:\n", .{});
    style.print("  pantry install\n", .{});
    style.print("  mkdir packages/my-package && cd packages/my-package\n", .{});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Laravel Preset
// ============================================================================

fn generateLaravelPreset(allocator: std.mem.Allocator, project_name: []const u8) !CommandResult {
    style.print("Generating Laravel project: {s}\n\n", .{project_name});

    // deps.yaml with services
    writeFileContent("deps.yaml",
        \\dependencies:
        \\  php.net: ^8.3
        \\
        \\services:
        \\  enabled: true
        \\  autoStart:
        \\    - postgres
        \\    - redis
        \\    - meilisearch
        \\
    ) catch {};

    // .editorconfig
    writeFileContent(".editorconfig",
        \\root = true
        \\
        \\[*]
        \\charset = utf-8
        \\indent_style = space
        \\indent_size = 4
        \\end_of_line = lf
        \\insert_final_newline = true
        \\trim_trailing_whitespace = true
        \\
        \\[*.md]
        \\trim_trailing_whitespace = false
        \\
        \\[*.{yml,yaml}]
        \\indent_size = 2
        \\
    ) catch {};

    _ = allocator;

    style.print("Created Laravel project scaffold:\n", .{});
    style.print("  deps.yaml (with postgres, redis, meilisearch services)\n", .{});
    style.print("  .editorconfig\n", .{});
    style.print("\nNext steps:\n", .{});
    style.print("  composer create-project laravel/laravel .\n", .{});
    style.print("  pantry install\n", .{});
    style.print("  php artisan serve\n", .{});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Next.js Preset
// ============================================================================

fn generateNextPreset(allocator: std.mem.Allocator, project_name: []const u8) !CommandResult {
    style.print("Generating Next.js project: {s}\n\n", .{project_name});

    // deps.yaml
    writeFileContent("deps.yaml",
        \\dependencies:
        \\  bun.sh: ^1.3.1
        \\
    ) catch {};

    // package.json
    {
        const pkg = try std.fmt.allocPrint(allocator,
            \\{{
            \\  "name": "{s}",
            \\  "type": "module",
            \\  "version": "0.1.0",
            \\  "private": true,
            \\  "scripts": {{
            \\    "dev": "next dev",
            \\    "build": "next build",
            \\    "start": "next start",
            \\    "lint": "next lint",
            \\    "typecheck": "bun --bun tsc --noEmit",
            \\    "test": "bun test"
            \\  }},
            \\  "dependencies": {{
            \\    "next": "latest",
            \\    "react": "latest",
            \\    "react-dom": "latest"
            \\  }},
            \\  "devDependencies": {{
            \\    "@types/react": "latest",
            \\    "@types/react-dom": "latest",
            \\    "typescript": "latest"
            \\  }}
            \\}}
            \\
        , .{project_name});
        defer allocator.free(pkg);
        writeFileContent("package.json", pkg) catch {};
    }

    // tsconfig.json
    writeFileContent("tsconfig.json",
        \\{
        \\  "compilerOptions": {
        \\    "target": "es5",
        \\    "lib": ["dom", "dom.iterable", "esnext"],
        \\    "allowJs": true,
        \\    "skipLibCheck": true,
        \\    "strict": true,
        \\    "noEmit": true,
        \\    "esModuleInterop": true,
        \\    "module": "esnext",
        \\    "moduleResolution": "bundler",
        \\    "resolveJsonModule": true,
        \\    "isolatedModules": true,
        \\    "jsx": "preserve",
        \\    "incremental": true,
        \\    "plugins": [
        \\      {
        \\        "name": "next"
        \\      }
        \\    ],
        \\    "paths": {
        \\      "@/*": ["./src/*"]
        \\    }
        \\  },
        \\  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        \\  "exclude": ["node_modules"]
        \\}
        \\
    ) catch {};

    // .editorconfig
    writeFileContent(".editorconfig",
        \\root = true
        \\
        \\[*]
        \\charset = utf-8
        \\indent_style = space
        \\indent_size = 2
        \\end_of_line = lf
        \\insert_final_newline = true
        \\trim_trailing_whitespace = true
        \\
    ) catch {};

    style.print("Created Next.js project scaffold:\n", .{});
    style.print("  deps.yaml\n", .{});
    style.print("  package.json\n", .{});
    style.print("  tsconfig.json\n", .{});
    style.print("  .editorconfig\n", .{});
    style.print("\nNext steps:\n", .{});
    style.print("  pantry install\n", .{});
    style.print("  bun run dev\n", .{});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Template Helpers
// ============================================================================

fn generateBasicTemplate(allocator: std.mem.Allocator, name: []const u8, version: []const u8, description: []const u8) ![]const u8 {
    return std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "name": "{s}",
        \\  "version": "{s}",
        \\  "description": "{s}",
        \\  "dependencies": {{}},
        \\  "devDependencies": {{}},
        \\  "scripts": {{
        \\    "dev": "echo 'Add your dev command here'",
        \\    "build": "echo 'Add your build command here'",
        \\    "test": "echo 'Add your test command here'"
        \\  }},
        \\  "services": {{}},
        \\  "workspaces": []
        \\}}
        \\
    ,
        .{ name, version, description },
    );
}

fn generateNodeTemplate(allocator: std.mem.Allocator, name: []const u8, version: []const u8, description: []const u8) ![]const u8 {
    return std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "name": "{s}",
        \\  "version": "{s}",
        \\  "description": "{s}",
        \\  "dependencies": {{
        \\    "bun": "latest"
        \\  }},
        \\  "devDependencies": {{}},
        \\  "scripts": {{
        \\    "dev": "bun run --watch src/index.ts",
        \\    "build": "bun build src/index.ts --outdir dist",
        \\    "test": "bun test",
        \\    "start": "bun run src/index.ts"
        \\  }},
        \\  "services": {{
        \\    "redis": {{
        \\      "autoStart": false,
        \\      "port": 6379
        \\    }}
        \\  }},
        \\  "workspaces": []
        \\}}
        \\
    ,
        .{ name, version, description },
    );
}

/// Write content to a file in the current working directory
fn writeFileContent(path: []const u8, content: []const u8) !void {
    const file = try io_helper.cwd().createFile(io_helper.io, path, .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, content);
}
