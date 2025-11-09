const std = @import("std");
const http = std.http;

/// OIDC Token containing claims from the CI/CD provider
pub const OIDCToken = struct {
    /// Raw JWT token string
    raw_token: []const u8,

    /// Parsed claims from the token
    claims: Claims,

    /// OIDC Claims structure
    pub const Claims = struct {
        /// Issuer (e.g., "https://token.actions.githubusercontent.com")
        iss: []const u8,

        /// Subject (repository identifier, e.g., "repo:owner/name:ref:refs/heads/main")
        sub: []const u8,

        /// Audience (typically the registry URL)
        aud: []const u8,

        /// Expiration time (Unix timestamp)
        exp: i64,

        /// Issued at time (Unix timestamp)
        iat: i64,

        /// Not before time (Unix timestamp)
        nbf: ?i64 = null,

        /// JWT ID
        jti: ?[]const u8 = null,

        /// Repository owner (GitHub specific)
        repository_owner: ?[]const u8 = null,

        /// Repository name (GitHub specific)
        repository: ?[]const u8 = null,

        /// Repository owner ID (GitHub specific)
        repository_owner_id: ?[]const u8 = null,

        /// Workflow ref (GitHub specific, e.g., "owner/repo/.github/workflows/release.yml@refs/heads/main")
        workflow_ref: ?[]const u8 = null,

        /// Actor (user who triggered the workflow)
        actor: ?[]const u8 = null,

        /// Event name (e.g., "push", "release")
        event_name: ?[]const u8 = null,

        /// Git ref (e.g., "refs/heads/main", "refs/tags/v1.0.0")
        ref: ?[]const u8 = null,

        /// Git ref type (e.g., "branch", "tag")
        ref_type: ?[]const u8 = null,

        /// SHA of the commit
        sha: ?[]const u8 = null,

        /// Job workflow ref (GitHub specific)
        job_workflow_ref: ?[]const u8 = null,

        /// Runner environment (e.g., "github-hosted")
        runner_environment: ?[]const u8 = null,

        /// GitLab specific claims
        namespace_id: ?[]const u8 = null,
        namespace_path: ?[]const u8 = null,
        project_id: ?[]const u8 = null,
        project_path: ?[]const u8 = null,
        pipeline_id: ?[]const u8 = null,
        pipeline_source: ?[]const u8 = null,

        pub fn deinit(self: *Claims, allocator: std.mem.Allocator) void {
            allocator.free(self.iss);
            allocator.free(self.sub);
            allocator.free(self.aud);
            if (self.jti) |jti| allocator.free(jti);
            if (self.repository_owner) |ro| allocator.free(ro);
            if (self.repository) |r| allocator.free(r);
            if (self.repository_owner_id) |roi| allocator.free(roi);
            if (self.workflow_ref) |wr| allocator.free(wr);
            if (self.actor) |a| allocator.free(a);
            if (self.event_name) |en| allocator.free(en);
            if (self.ref) |r| allocator.free(r);
            if (self.ref_type) |rt| allocator.free(rt);
            if (self.sha) |s| allocator.free(s);
            if (self.job_workflow_ref) |jwr| allocator.free(jwr);
            if (self.runner_environment) |re| allocator.free(re);
            if (self.namespace_id) |nid| allocator.free(nid);
            if (self.namespace_path) |np| allocator.free(np);
            if (self.project_id) |pid| allocator.free(pid);
            if (self.project_path) |pp| allocator.free(pp);
            if (self.pipeline_id) |plid| allocator.free(plid);
            if (self.pipeline_source) |ps| allocator.free(ps);
        }
    };

    pub fn deinit(self: *OIDCToken, allocator: std.mem.Allocator) void {
        allocator.free(self.raw_token);
        self.claims.deinit(allocator);
    }
};

/// OIDC Provider configuration
pub const OIDCProvider = struct {
    /// Provider name (e.g., "GitHub Actions", "GitLab CI")
    name: []const u8,

    /// OIDC issuer URL
    issuer: []const u8,

    /// JWKS (JSON Web Key Set) endpoint URL
    jwks_uri: []const u8,

    /// Environment variable containing the OIDC token
    token_env_var: []const u8,

    /// Environment variable containing the request token (for GitHub Actions)
    request_token_env_var: ?[]const u8 = null,

    /// Environment variable containing the request URL (for GitHub Actions)
    request_url_env_var: ?[]const u8 = null,

    /// Claims mapping for provider-specific fields
    claims_mapping: ?std.StringHashMap([]const u8) = null,

    pub fn deinit(self: *OIDCProvider, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.issuer);
        allocator.free(self.jwks_uri);
        allocator.free(self.token_env_var);
        if (self.request_token_env_var) |rtev| allocator.free(rtev);
        if (self.request_url_env_var) |ruev| allocator.free(ruev);
        if (self.claims_mapping) |*cm| {
            var it = cm.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            cm.deinit();
        }
    }
};

/// Built-in OIDC provider configurations
pub const Providers = struct {
    /// GitHub Actions OIDC configuration
    pub fn github(allocator: std.mem.Allocator) !OIDCProvider {
        return OIDCProvider{
            .name = try allocator.dupe(u8, "GitHub Actions"),
            .issuer = try allocator.dupe(u8, "https://token.actions.githubusercontent.com"),
            .jwks_uri = try allocator.dupe(u8, "https://token.actions.githubusercontent.com/.well-known/jwks"),
            .token_env_var = try allocator.dupe(u8, "ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
            .request_token_env_var = try allocator.dupe(u8, "ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
            .request_url_env_var = try allocator.dupe(u8, "ACTIONS_ID_TOKEN_REQUEST_URL"),
            .claims_mapping = null,
        };
    }

    /// GitLab CI OIDC configuration
    pub fn gitlab(allocator: std.mem.Allocator) !OIDCProvider {
        return OIDCProvider{
            .name = try allocator.dupe(u8, "GitLab CI"),
            .issuer = try allocator.dupe(u8, "https://gitlab.com"),
            .jwks_uri = try allocator.dupe(u8, "https://gitlab.com/oauth/discovery/keys"),
            .token_env_var = try allocator.dupe(u8, "CI_JOB_JWT_V2"),
            .request_token_env_var = null,
            .request_url_env_var = null,
            .claims_mapping = null,
        };
    }

    /// Bitbucket Pipelines OIDC configuration
    pub fn bitbucket(allocator: std.mem.Allocator) !OIDCProvider {
        return OIDCProvider{
            .name = try allocator.dupe(u8, "Bitbucket Pipelines"),
            .issuer = try allocator.dupe(u8, "https://api.bitbucket.org/2.0/workspaces"),
            .jwks_uri = try allocator.dupe(u8, "https://api.bitbucket.org/2.0/workspaces/.well-known/jwks.json"),
            .token_env_var = try allocator.dupe(u8, "BITBUCKET_STEP_OIDC_TOKEN"),
            .request_token_env_var = null,
            .request_url_env_var = null,
            .claims_mapping = null,
        };
    }

    /// CircleCI OIDC configuration
    pub fn circleci(allocator: std.mem.Allocator) !OIDCProvider {
        return OIDCProvider{
            .name = try allocator.dupe(u8, "CircleCI"),
            .issuer = try allocator.dupe(u8, "https://oidc.circleci.com/org"),
            .jwks_uri = try allocator.dupe(u8, "https://oidc.circleci.com/org/.well-known/jwks"),
            .token_env_var = try allocator.dupe(u8, "CIRCLE_OIDC_TOKEN"),
            .request_token_env_var = null,
            .request_url_env_var = null,
            .claims_mapping = null,
        };
    }
};

/// Trusted Publisher configuration stored in package metadata
pub const TrustedPublisher = struct {
    /// Type of publisher (e.g., "github-action", "gitlab-ci")
    type: []const u8,

    /// Repository owner/organization
    owner: []const u8,

    /// Repository name
    repository: []const u8,

    /// Workflow path (GitHub) or pipeline path (GitLab)
    workflow: ?[]const u8 = null,

    /// Environment name (optional, for environment protection rules)
    environment: ?[]const u8 = null,

    /// Allowed refs (branches, tags) - if null, all refs are allowed
    allowed_refs: ?[][]const u8 = null,

    pub fn deinit(self: *TrustedPublisher, allocator: std.mem.Allocator) void {
        allocator.free(self.type);
        allocator.free(self.owner);
        allocator.free(self.repository);
        if (self.workflow) |w| allocator.free(w);
        if (self.environment) |e| allocator.free(e);
        if (self.allowed_refs) |refs| {
            for (refs) |ref| {
                allocator.free(ref);
            }
            allocator.free(refs);
        }
    }

    /// Validate if the OIDC claims match this trusted publisher
    pub fn validateClaims(self: *const TrustedPublisher, claims: *const OIDCToken.Claims) !bool {
        // For GitHub Actions
        if (std.mem.eql(u8, self.type, "github-action")) {
            // Validate repository owner
            if (claims.repository_owner) |repo_owner| {
                if (!std.mem.eql(u8, self.owner, repo_owner)) {
                    return false;
                }
            } else {
                return false;
            }

            // Validate repository
            if (claims.repository) |repo| {
                const expected = try std.fmt.allocPrint(
                    std.heap.page_allocator,
                    "{s}/{s}",
                    .{ self.owner, self.repository },
                );
                defer std.heap.page_allocator.free(expected);

                if (!std.mem.eql(u8, expected, repo)) {
                    return false;
                }
            } else {
                return false;
            }

            // Validate workflow if specified
            if (self.workflow) |workflow| {
                if (claims.job_workflow_ref) |job_workflow_ref| {
                    // job_workflow_ref format: "owner/repo/.github/workflows/release.yml@refs/heads/main"
                    if (std.mem.indexOf(u8, job_workflow_ref, workflow) == null) {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            // Validate allowed refs if specified
            if (self.allowed_refs) |allowed_refs| {
                if (claims.ref) |ref| {
                    var ref_allowed = false;
                    for (allowed_refs) |allowed_ref| {
                        if (std.mem.eql(u8, ref, allowed_ref)) {
                            ref_allowed = true;
                            break;
                        }
                    }
                    if (!ref_allowed) {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            return true;
        }

        // For GitLab CI
        if (std.mem.eql(u8, self.type, "gitlab-ci")) {
            // Validate namespace path (owner)
            if (claims.namespace_path) |namespace_path| {
                if (!std.mem.eql(u8, self.owner, namespace_path)) {
                    return false;
                }
            } else {
                return false;
            }

            // Validate project path
            if (claims.project_path) |project_path| {
                const expected = try std.fmt.allocPrint(
                    std.heap.page_allocator,
                    "{s}/{s}",
                    .{ self.owner, self.repository },
                );
                defer std.heap.page_allocator.free(expected);

                if (!std.mem.eql(u8, expected, project_path)) {
                    return false;
                }
            } else {
                return false;
            }

            // Validate allowed refs if specified
            if (self.allowed_refs) |allowed_refs| {
                if (claims.ref) |ref| {
                    var ref_allowed = false;
                    for (allowed_refs) |allowed_ref| {
                        if (std.mem.eql(u8, ref, allowed_ref)) {
                            ref_allowed = true;
                            break;
                        }
                    }
                    if (!ref_allowed) {
                        return false;
                    }
                } else {
                    return false;
                }
            }

            return true;
        }

        return false;
    }
};

/// OIDC Token validation errors
pub const ValidationError = error{
    InvalidToken,
    ExpiredToken,
    InvalidIssuer,
    InvalidAudience,
    MissingClaims,
    InvalidSignature,
    NetworkError,
    InvalidJWKS,
    UnsupportedAlgorithm,
    ClaimsMismatch,
};

/// Decode JWT token without validation (for inspection)
pub fn decodeTokenUnsafe(allocator: std.mem.Allocator, token: []const u8) !OIDCToken {
    // JWT format: header.payload.signature
    var parts = std.mem.splitScalar(u8, token, '.');

    const header_b64 = parts.next() orelse return error.InvalidToken;
    const payload_b64 = parts.next() orelse return error.InvalidToken;
    const signature_b64 = parts.next() orelse return error.InvalidToken;

    _ = header_b64;
    _ = signature_b64;

    // Decode base64url payload
    const payload = try base64UrlDecode(allocator, payload_b64);
    defer allocator.free(payload);

    // Parse JSON claims
    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        payload,
        .{},
    );
    defer parsed.deinit();

    const claims_obj = parsed.value.object;

    // Extract claims
    const claims = try extractClaims(allocator, claims_obj);

    return OIDCToken{
        .raw_token = try allocator.dupe(u8, token),
        .claims = claims,
    };
}

/// Base64URL decode helper
fn base64UrlDecode(allocator: std.mem.Allocator, encoded: []const u8) ![]u8 {
    // Convert base64url to base64
    const base64 = try allocator.alloc(u8, encoded.len);
    defer allocator.free(base64);

    for (encoded, 0..) |char, i| {
        base64[i] = switch (char) {
            '-' => '+',
            '_' => '/',
            else => char,
        };
    }

    // Add padding if needed
    const padding_needed = (4 - (base64.len % 4)) % 4;
    const padded_len = base64.len + padding_needed;
    const padded = try allocator.alloc(u8, padded_len);
    defer allocator.free(padded);

    @memcpy(padded[0..base64.len], base64);
    for (0..padding_needed) |i| {
        padded[base64.len + i] = '=';
    }

    // Decode base64
    const decoder = std.base64.standard.Decoder;
    const decoded_len = try decoder.calcSizeForSlice(padded);
    const decoded = try allocator.alloc(u8, decoded_len);
    try decoder.decode(decoded, padded);

    return decoded;
}

/// Extract claims from JSON object
fn extractClaims(allocator: std.mem.Allocator, obj: std.json.ObjectMap) !OIDCToken.Claims {
    const iss = obj.get("iss") orelse return error.MissingClaims;
    const sub = obj.get("sub") orelse return error.MissingClaims;
    const aud = obj.get("aud") orelse return error.MissingClaims;
    const exp = obj.get("exp") orelse return error.MissingClaims;
    const iat = obj.get("iat") orelse return error.MissingClaims;

    // Extract required claims
    const iss_str = try allocator.dupe(u8, iss.string);
    const sub_str = try allocator.dupe(u8, sub.string);

    const aud_str = if (aud == .string)
        try allocator.dupe(u8, aud.string)
    else if (aud == .array)
        try allocator.dupe(u8, aud.array.items[0].string)
    else
        return error.MissingClaims;

    const exp_int = if (exp == .integer) exp.integer else return error.MissingClaims;
    const iat_int = if (iat == .integer) iat.integer else return error.MissingClaims;

    // Extract optional claims
    const nbf_int: ?i64 = if (obj.get("nbf")) |nbf| if (nbf == .integer) nbf.integer else null else null;
    const jti_str: ?[]const u8 = if (obj.get("jti")) |jti| if (jti == .string) try allocator.dupe(u8, jti.string) else null else null;

    // GitHub specific claims
    const repository_owner = if (obj.get("repository_owner")) |ro| if (ro == .string) try allocator.dupe(u8, ro.string) else null else null;
    const repository = if (obj.get("repository")) |r| if (r == .string) try allocator.dupe(u8, r.string) else null else null;
    const repository_owner_id = if (obj.get("repository_owner_id")) |roi| if (roi == .string) try allocator.dupe(u8, roi.string) else null else null;
    const workflow_ref = if (obj.get("workflow_ref")) |wr| if (wr == .string) try allocator.dupe(u8, wr.string) else null else null;
    const actor = if (obj.get("actor")) |a| if (a == .string) try allocator.dupe(u8, a.string) else null else null;
    const event_name = if (obj.get("event_name")) |en| if (en == .string) try allocator.dupe(u8, en.string) else null else null;
    const ref = if (obj.get("ref")) |r| if (r == .string) try allocator.dupe(u8, r.string) else null else null;
    const ref_type = if (obj.get("ref_type")) |rt| if (rt == .string) try allocator.dupe(u8, rt.string) else null else null;
    const sha = if (obj.get("sha")) |s| if (s == .string) try allocator.dupe(u8, s.string) else null else null;
    const job_workflow_ref = if (obj.get("job_workflow_ref")) |jwr| if (jwr == .string) try allocator.dupe(u8, jwr.string) else null else null;
    const runner_environment = if (obj.get("runner_environment")) |re| if (re == .string) try allocator.dupe(u8, re.string) else null else null;

    // GitLab specific claims
    const namespace_id = if (obj.get("namespace_id")) |nid| if (nid == .string) try allocator.dupe(u8, nid.string) else null else null;
    const namespace_path = if (obj.get("namespace_path")) |np| if (np == .string) try allocator.dupe(u8, np.string) else null else null;
    const project_id = if (obj.get("project_id")) |pid| if (pid == .string) try allocator.dupe(u8, pid.string) else null else null;
    const project_path = if (obj.get("project_path")) |pp| if (pp == .string) try allocator.dupe(u8, pp.string) else null else null;
    const pipeline_id = if (obj.get("pipeline_id")) |plid| if (plid == .string) try allocator.dupe(u8, plid.string) else null else null;
    const pipeline_source = if (obj.get("pipeline_source")) |ps| if (ps == .string) try allocator.dupe(u8, ps.string) else null else null;

    return OIDCToken.Claims{
        .iss = iss_str,
        .sub = sub_str,
        .aud = aud_str,
        .exp = exp_int,
        .iat = iat_int,
        .nbf = nbf_int,
        .jti = jti_str,
        .repository_owner = repository_owner,
        .repository = repository,
        .repository_owner_id = repository_owner_id,
        .workflow_ref = workflow_ref,
        .actor = actor,
        .event_name = event_name,
        .ref = ref,
        .ref_type = ref_type,
        .sha = sha,
        .job_workflow_ref = job_workflow_ref,
        .runner_environment = runner_environment,
        .namespace_id = namespace_id,
        .namespace_path = namespace_path,
        .project_id = project_id,
        .project_path = project_path,
        .pipeline_id = pipeline_id,
        .pipeline_source = pipeline_source,
    };
}

/// Validate token expiration
pub fn validateExpiration(claims: *const OIDCToken.Claims) !void {
    const now = std.time.timestamp();

    // Check if token has expired
    if (now >= claims.exp) {
        return error.ExpiredToken;
    }

    // Check if token is not yet valid (nbf claim)
    if (claims.nbf) |nbf| {
        if (now < nbf) {
            return error.InvalidToken;
        }
    }
}

/// Get OIDC token from environment
pub fn getTokenFromEnvironment(allocator: std.mem.Allocator, provider: *const OIDCProvider) !?[]const u8 {
    // For GitHub Actions, we need to request the token from the OIDC endpoint
    if (provider.request_url_env_var != null and provider.request_token_env_var != null) {
        const request_url = std.process.getEnvVarOwned(
            allocator,
            provider.request_url_env_var.?,
        ) catch return null;
        defer allocator.free(request_url);

        const request_token = std.process.getEnvVarOwned(
            allocator,
            provider.request_token_env_var.?,
        ) catch return null;
        defer allocator.free(request_token);

        // Request OIDC token from GitHub Actions
        return try requestGitHubOIDCToken(allocator, request_url, request_token);
    }

    // For other providers, token is directly in environment variable
    return std.process.getEnvVarOwned(allocator, provider.token_env_var) catch null;
}

/// Request OIDC token from GitHub Actions
fn requestGitHubOIDCToken(allocator: std.mem.Allocator, request_url: []const u8, request_token: []const u8) ![]const u8 {
    var client = http.Client{ .allocator = allocator };
    defer client.deinit();

    // Add audience query parameter (default to "pantry")
    const url_with_audience = try std.fmt.allocPrint(
        allocator,
        "{s}&audience=pantry",
        .{request_url},
    );
    defer allocator.free(url_with_audience);

    // Parse URI
    const uri = try std.Uri.parse(url_with_audience);

    // Create authorization header
    const auth_header = try std.fmt.allocPrint(allocator, "Bearer {s}", .{request_token});
    defer allocator.free(auth_header);

    // Create extra headers
    const extra_headers = [_]http.Header{
        .{ .name = "Authorization", .value = auth_header },
    };

    // Make HTTP request using lower-level API
    var req = try client.request(.GET, uri, .{
        .extra_headers = &extra_headers,
    });
    defer req.deinit();

    try req.sendBodiless();

    var redirect_buffer: [4096]u8 = undefined;
    var response = try req.receiveHead(&redirect_buffer);

    // Check status
    if (response.head.status != .ok) {
        return error.NetworkError;
    }

    // Read response body
    const body_reader = response.reader(&.{});
    const body = try body_reader.allocRemaining(allocator, std.Io.Limit.limited(4096));
    defer allocator.free(body);

    // Parse JSON response
    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        body,
        .{},
    );
    defer parsed.deinit();

    const value_obj = parsed.value.object;
    const token_value = value_obj.get("value") orelse return error.InvalidToken;

    return try allocator.dupe(u8, token_value.string);
}

/// Detect OIDC provider from environment
pub fn detectProvider(allocator: std.mem.Allocator) !?OIDCProvider {
    // Check for GitHub Actions
    if (std.process.getEnvVarOwned(allocator, "GITHUB_ACTIONS") catch null) |_| {
        return try Providers.github(allocator);
    }

    // Check for GitLab CI
    if (std.process.getEnvVarOwned(allocator, "GITLAB_CI") catch null) |_| {
        return try Providers.gitlab(allocator);
    }

    // Check for Bitbucket Pipelines
    if (std.process.getEnvVarOwned(allocator, "BITBUCKET_BUILD_NUMBER") catch null) |_| {
        return try Providers.bitbucket(allocator);
    }

    // Check for CircleCI
    if (std.process.getEnvVarOwned(allocator, "CIRCLECI") catch null) |_| {
        return try Providers.circleci(allocator);
    }

    return null;
}
