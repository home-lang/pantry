const std = @import("std");
const io_helper = @import("../io_helper.zig");
const http = std.http;

/// GitHub context detected from environment or git
pub const GitHubContext = struct {
    owner: []const u8,
    repo: []const u8,
    tag: []const u8,

    pub fn deinit(self: *GitHubContext, allocator: std.mem.Allocator) void {
        allocator.free(self.owner);
        allocator.free(self.repo);
        allocator.free(self.tag);
    }
};

/// Info about a discovered release asset
pub const AssetInfo = struct {
    path: []const u8,
    name: []const u8,

    pub fn deinit(self: *AssetInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.path);
        allocator.free(self.name);
    }
};

/// Response from creating a release
pub const ReleaseResponse = struct {
    success: bool,
    release_id: ?u64 = null,
    html_url: ?[]const u8 = null,
    message: ?[]const u8 = null,

    pub fn deinit(self: *ReleaseResponse, allocator: std.mem.Allocator) void {
        if (self.html_url) |u| allocator.free(u);
        if (self.message) |m| allocator.free(m);
    }
};

/// Response from uploading an asset
pub const AssetUploadResponse = struct {
    success: bool,
    name: ?[]const u8 = null,
    message: ?[]const u8 = null,

    pub fn deinit(self: *AssetUploadResponse, allocator: std.mem.Allocator) void {
        if (self.name) |n| allocator.free(n);
        if (self.message) |m| allocator.free(m);
    }
};

/// GitHub Release API client
pub const GitHubClient = struct {
    allocator: std.mem.Allocator,
    http_client: http.Client,
    io: *std.Io.Threaded,
    token: []const u8,
    api_url: []const u8,

    pub fn init(allocator: std.mem.Allocator, token: []const u8) !GitHubClient {
        const io = try allocator.create(std.Io.Threaded);
        io.* = .init_single_threaded;
        return GitHubClient{
            .allocator = allocator,
            .io = io,
            .http_client = http.Client{ .allocator = allocator, .io = io.io() },
            .token = token,
            .api_url = "https://api.github.com",
        };
    }

    pub fn deinit(self: *GitHubClient) void {
        self.http_client.deinit();
        self.io.deinit();
        self.allocator.destroy(self.io);
    }

    /// Check if a release already exists for the given tag.
    /// Returns the release ID if found, null on 404.
    pub fn getReleaseByTag(self: *GitHubClient, owner: []const u8, repo: []const u8, tag: []const u8) !?u64 {
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/repos/{s}/{s}/releases/tags/{s}",
            .{ self.api_url, owner, repo, tag },
        );
        defer self.allocator.free(url);

        const uri = try std.Uri.parse(url);

        const auth_header = try std.fmt.allocPrint(self.allocator, "token {s}", .{self.token});
        defer self.allocator.free(auth_header);

        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Accept", .value = "application/vnd.github+json" },
            .{ .name = "User-Agent", .value = "pantry" },
            .{ .name = "X-GitHub-Api-Version", .value = "2022-11-28" },
        };

        var req = try self.http_client.request(.GET, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        try req.sendBodiless();

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        if (response.head.status == .not_found) {
            return null;
        }

        if (response.head.status != .ok) {
            return null;
        }

        const body_reader = response.reader(&.{});
        const body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch {
            return null;
        };
        defer self.allocator.free(body);

        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, body, .{}) catch {
            return null;
        };
        defer parsed.deinit();

        if (parsed.value != .object) return null;
        const id_val = parsed.value.object.get("id") orelse return null;
        if (id_val != .integer) return null;
        return @intCast(id_val.integer);
    }

    /// Create a new GitHub release.
    pub fn createRelease(
        self: *GitHubClient,
        owner: []const u8,
        repo: []const u8,
        tag: []const u8,
        name: []const u8,
        body_text: []const u8,
        draft: bool,
        prerelease: bool,
    ) !ReleaseResponse {
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/repos/{s}/{s}/releases",
            .{ self.api_url, owner, repo },
        );
        defer self.allocator.free(url);

        const uri = try std.Uri.parse(url);

        const auth_header = try std.fmt.allocPrint(self.allocator, "token {s}", .{self.token});
        defer self.allocator.free(auth_header);

        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Accept", .value = "application/vnd.github+json" },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "User-Agent", .value = "pantry" },
            .{ .name = "X-GitHub-Api-Version", .value = "2022-11-28" },
        };

        // Build JSON body
        const request_body = try std.fmt.allocPrint(
            self.allocator,
            \\{{"tag_name":"{s}","name":"{s}","body":"{s}","draft":{s},"prerelease":{s}}}
        ,
            .{
                tag,
                name,
                body_text,
                if (draft) "true" else "false",
                if (prerelease) "true" else "false",
            },
        );
        defer self.allocator.free(request_body);

        var req = try self.http_client.request(.POST, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = request_body.len };
        try req.sendBodyComplete(@constCast(request_body));

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        const body_reader = response.reader(&.{});
        const resp_body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return .{ .success = false, .message = try self.allocator.dupe(u8, "Response too large") },
            else => |e| return e,
        };
        defer self.allocator.free(resp_body);

        const success = response.head.status == .ok or response.head.status == .created;

        if (!success) {
            return .{
                .success = false,
                .message = if (resp_body.len > 0) try self.allocator.dupe(u8, resp_body) else null,
            };
        }

        // Parse response for release_id and html_url
        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, resp_body, .{}) catch {
            return .{ .success = true };
        };
        defer parsed.deinit();

        var result = ReleaseResponse{ .success = true };

        if (parsed.value == .object) {
            if (parsed.value.object.get("id")) |id_val| {
                if (id_val == .integer) {
                    result.release_id = @intCast(id_val.integer);
                }
            }
            if (parsed.value.object.get("html_url")) |url_val| {
                if (url_val == .string) {
                    result.html_url = try self.allocator.dupe(u8, url_val.string);
                }
            }
        }

        return result;
    }

    /// Upload a file as a release asset.
    /// Note: uploads go to uploads.github.com, not api.github.com.
    pub fn uploadReleaseAsset(
        self: *GitHubClient,
        owner: []const u8,
        repo: []const u8,
        release_id: u64,
        file_path: []const u8,
        file_name: []const u8,
    ) !AssetUploadResponse {
        const url = try std.fmt.allocPrint(
            self.allocator,
            "https://uploads.github.com/repos/{s}/{s}/releases/{d}/assets?name={s}",
            .{ owner, repo, release_id, file_name },
        );
        defer self.allocator.free(url);

        const uri = try std.Uri.parse(url);

        // Read the file
        const file_data = io_helper.readFileAlloc(self.allocator, file_path, 500 * 1024 * 1024) catch |err| {
            const msg = try std.fmt.allocPrint(self.allocator, "Failed to read asset file: {any}", .{err});
            return .{ .success = false, .message = msg };
        };
        defer self.allocator.free(file_data);

        const auth_header = try std.fmt.allocPrint(self.allocator, "token {s}", .{self.token});
        defer self.allocator.free(auth_header);

        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Accept", .value = "application/vnd.github+json" },
            .{ .name = "Content-Type", .value = "application/octet-stream" },
            .{ .name = "User-Agent", .value = "pantry" },
            .{ .name = "X-GitHub-Api-Version", .value = "2022-11-28" },
        };

        var req = try self.http_client.request(.POST, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = file_data.len };
        try req.sendBodyComplete(@constCast(file_data));

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        const body_reader = response.reader(&.{});
        const resp_body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch {
            return .{ .success = false, .message = try self.allocator.dupe(u8, "Response too large") };
        };
        defer self.allocator.free(resp_body);

        const success = response.head.status == .ok or response.head.status == .created;

        if (!success) {
            return .{
                .success = false,
                .message = if (resp_body.len > 0) try self.allocator.dupe(u8, resp_body) else null,
            };
        }

        return .{
            .success = true,
            .name = try self.allocator.dupe(u8, file_name),
        };
    }
};

/// Detect GitHub context from environment variables, with git CLI fallback.
/// Returns owner, repo, and tag.
pub fn detectGitHubContext(allocator: std.mem.Allocator) ?GitHubContext {
    // Try environment variables first (GitHub Actions sets these)
    const tag = getEnvOwned(allocator, "GITHUB_REF_NAME") orelse
        getGitTag(allocator) orelse return null;

    const gh_repo = getEnvOwned(allocator, "GITHUB_REPOSITORY");
    if (gh_repo) |repo_str| {
        // Format: "owner/repo"
        if (std.mem.indexOf(u8, repo_str, "/")) |sep| {
            const owner = allocator.dupe(u8, repo_str[0..sep]) catch {
                allocator.free(repo_str);
                allocator.free(tag);
                return null;
            };
            const repo = allocator.dupe(u8, repo_str[sep + 1 ..]) catch {
                allocator.free(owner);
                allocator.free(repo_str);
                allocator.free(tag);
                return null;
            };
            allocator.free(repo_str);
            return .{ .owner = owner, .repo = repo, .tag = tag };
        }
        allocator.free(repo_str);
    }

    // Fallback: parse git remote URL
    const remote = getGitRemoteOwnerRepo(allocator);
    if (remote) |r| {
        return .{ .owner = r.owner, .repo = r.repo, .tag = tag };
    }

    allocator.free(tag);
    return null;
}

/// Detect release assets from the given directory paths.
/// Scans for common release file types (.zip, .tar.gz, .tgz, .dmg, .exe, .msi, .deb, .rpm, .AppImage).
pub fn detectReleaseAssets(allocator: std.mem.Allocator, dirs: []const []const u8) []AssetInfo {
    var assets = std.ArrayList(AssetInfo).empty;

    for (dirs) |dir_path| {
        var dir = io_helper.cwd().openDir(io_helper.io, dir_path, .{ .iterate = true }) catch continue;
        defer dir.close(io_helper.io);

        var iter = dir.iterate();
        while (iter.next(io_helper.io) catch null) |entry| {
            if (entry.kind != .file) continue;
            if (isReleaseAsset(entry.name)) {
                const full_path = std.fs.path.join(allocator, &[_][]const u8{ dir_path, entry.name }) catch continue;
                const name_copy = allocator.dupe(u8, entry.name) catch {
                    allocator.free(full_path);
                    continue;
                };
                assets.append(allocator, .{ .path = full_path, .name = name_copy }) catch {
                    allocator.free(full_path);
                    allocator.free(name_copy);
                    continue;
                };
            }
        }
    }

    return assets.toOwnedSlice(allocator) catch &.{};
}

/// Detect release assets from explicit file paths (--files flag).
pub fn detectReleaseAssetsFromFiles(allocator: std.mem.Allocator, files_csv: []const u8) []AssetInfo {
    var assets = std.ArrayList(AssetInfo).empty;

    var iter = std.mem.splitScalar(u8, files_csv, ',');
    while (iter.next()) |raw_path| {
        const file_path = std.mem.trim(u8, raw_path, " \t");
        if (file_path.len == 0) continue;

        // Verify the file exists
        io_helper.accessAbsolute(file_path, .{}) catch {
            // Try as relative path
            const abs_path = std.fs.path.join(allocator, &[_][]const u8{ ".", file_path }) catch continue;
            io_helper.accessAbsolute(abs_path, .{}) catch {
                allocator.free(abs_path);
                continue;
            };
            const basename = std.fs.path.basename(file_path);
            const name_copy = allocator.dupe(u8, basename) catch {
                allocator.free(abs_path);
                continue;
            };
            assets.append(allocator, .{ .path = abs_path, .name = name_copy }) catch {
                allocator.free(abs_path);
                allocator.free(name_copy);
                continue;
            };
            continue;
        };

        const path_copy = allocator.dupe(u8, file_path) catch continue;
        const basename = std.fs.path.basename(file_path);
        const name_copy = allocator.dupe(u8, basename) catch {
            allocator.free(path_copy);
            continue;
        };
        assets.append(allocator, .{ .path = path_copy, .name = name_copy }) catch {
            allocator.free(path_copy);
            allocator.free(name_copy);
            continue;
        };
    }

    return assets.toOwnedSlice(allocator) catch &.{};
}

// ============================================================================
// Private helpers
// ============================================================================

fn isReleaseAsset(name: []const u8) bool {
    const extensions = [_][]const u8{
        ".zip", ".tar.gz", ".tgz", ".dmg", ".exe", ".msi", ".deb", ".rpm", ".AppImage",
    };
    for (extensions) |ext| {
        if (std.mem.endsWith(u8, name, ext)) return true;
    }
    return false;
}

fn getEnvOwned(allocator: std.mem.Allocator, key: []const u8) ?[]const u8 {
    return io_helper.getEnvVarOwned(allocator, key) catch null;
}

fn getGitTag(allocator: std.mem.Allocator) ?[]const u8 {
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "git", "describe", "--tags", "--exact-match", "HEAD",
    }) catch return null;
    defer allocator.free(result.stderr);

    if (result.term != .exited or result.term.exited != 0) {
        allocator.free(result.stdout);
        return null;
    }

    const trimmed = std.mem.trim(u8, result.stdout, " \t\r\n");
    if (trimmed.len == 0) {
        allocator.free(result.stdout);
        return null;
    }

    const tag = allocator.dupe(u8, trimmed) catch {
        allocator.free(result.stdout);
        return null;
    };
    allocator.free(result.stdout);
    return tag;
}

const OwnerRepo = struct {
    owner: []const u8,
    repo: []const u8,
};

fn getGitRemoteOwnerRepo(allocator: std.mem.Allocator) ?OwnerRepo {
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "git", "remote", "get-url", "origin",
    }) catch return null;
    defer allocator.free(result.stderr);

    if (result.term != .exited or result.term.exited != 0) {
        allocator.free(result.stdout);
        return null;
    }

    const url = std.mem.trim(u8, result.stdout, " \t\r\n");
    defer allocator.free(result.stdout);

    return parseGitRemoteUrl(allocator, url);
}

fn parseGitRemoteUrl(allocator: std.mem.Allocator, url: []const u8) ?OwnerRepo {
    // Handle SSH: git@github.com:owner/repo.git
    if (std.mem.indexOf(u8, url, "git@")) |_| {
        if (std.mem.indexOf(u8, url, ":")) |colon| {
            const path = url[colon + 1 ..];
            return parseOwnerRepoFromPath(allocator, path);
        }
    }

    // Handle HTTPS: https://github.com/owner/repo.git
    if (std.mem.indexOf(u8, url, "github.com/")) |idx| {
        const path = url[idx + "github.com/".len ..];
        return parseOwnerRepoFromPath(allocator, path);
    }

    return null;
}

fn parseOwnerRepoFromPath(allocator: std.mem.Allocator, path: []const u8) ?OwnerRepo {
    const sep = std.mem.indexOf(u8, path, "/") orelse return null;
    const owner_str = path[0..sep];
    var repo_str = path[sep + 1 ..];

    // Strip .git suffix
    if (std.mem.endsWith(u8, repo_str, ".git")) {
        repo_str = repo_str[0 .. repo_str.len - 4];
    }

    if (owner_str.len == 0 or repo_str.len == 0) return null;

    const owner = allocator.dupe(u8, owner_str) catch return null;
    const repo = allocator.dupe(u8, repo_str) catch {
        allocator.free(owner);
        return null;
    };

    return .{ .owner = owner, .repo = repo };
}
