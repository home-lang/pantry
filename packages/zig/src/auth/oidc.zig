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

    /// Azure Pipelines OIDC configuration
    pub fn azure(allocator: std.mem.Allocator) !OIDCProvider {
        return OIDCProvider{
            .name = try allocator.dupe(u8, "Azure Pipelines"),
            .issuer = try allocator.dupe(u8, "https://vstoken.actions.githubusercontent.com"),
            .jwks_uri = try allocator.dupe(u8, "https://vstoken.actions.githubusercontent.com/.well-known/jwks"),
            .token_env_var = try allocator.dupe(u8, "SYSTEM_OIDCTOKEN"),
            .request_token_env_var = try allocator.dupe(u8, "SYSTEM_OIDCREQUESTTOKEN"),
            .request_url_env_var = try allocator.dupe(u8, "SYSTEM_OIDCREQUESTURL"),
            .claims_mapping = null,
        };
    }

    /// Jenkins OIDC configuration
    pub fn jenkins(allocator: std.mem.Allocator) !OIDCProvider {
        return OIDCProvider{
            .name = try allocator.dupe(u8, "Jenkins"),
            .issuer = try allocator.dupe(u8, "https://jenkins.io"),
            .jwks_uri = try allocator.dupe(u8, "https://jenkins.io/.well-known/jwks.json"),
            .token_env_var = try allocator.dupe(u8, "JENKINS_OIDC_TOKEN"),
            .request_token_env_var = null,
            .request_url_env_var = null,
            .claims_mapping = null,
        };
    }

    /// Travis CI OIDC configuration
    pub fn travis(allocator: std.mem.Allocator) !OIDCProvider {
        return OIDCProvider{
            .name = try allocator.dupe(u8, "Travis CI"),
            .issuer = try allocator.dupe(u8, "https://api.travis-ci.com"),
            .jwks_uri = try allocator.dupe(u8, "https://api.travis-ci.com/.well-known/jwks.json"),
            .token_env_var = try allocator.dupe(u8, "TRAVIS_OIDC_TOKEN"),
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
    /// Uses stack-based buffer to avoid allocator dependency for simple string comparison
    pub fn validateClaims(self: *const TrustedPublisher, claims: *const OIDCToken.Claims) bool {
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

            // Validate repository - build expected format "owner/repo" using stack buffer
            if (claims.repository) |repo| {
                // Stack buffer large enough for reasonable owner/repo names
                var expected_buf: [512]u8 = undefined;
                const expected = std.fmt.bufPrint(&expected_buf, "{s}/{s}", .{ self.owner, self.repository }) catch {
                    return false; // Names too long
                };

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

            // Validate project path - build expected format "owner/repo" using stack buffer
            if (claims.project_path) |project_path| {
                var expected_buf: [512]u8 = undefined;
                const expected = std.fmt.bufPrint(&expected_buf, "{s}/{s}", .{ self.owner, self.repository }) catch {
                    return false; // Names too long
                };

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
    errdefer allocator.free(decoded);
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

/// Default clock skew tolerance in seconds (60 seconds)
/// This allows for minor clock differences between systems
pub const DEFAULT_CLOCK_SKEW_SECONDS: i64 = 60;

/// Validate token expiration with configurable clock skew tolerance
pub fn validateExpirationWithSkew(claims: *const OIDCToken.Claims, clock_skew_seconds: i64) !void {
    const now = (std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec;

    // Check if token has expired (with clock skew tolerance)
    if (now >= claims.exp + clock_skew_seconds) {
        return error.ExpiredToken;
    }

    // Check if token is not yet valid (nbf claim, with clock skew tolerance)
    if (claims.nbf) |nbf| {
        if (now < nbf - clock_skew_seconds) {
            return error.InvalidToken;
        }
    }
}

/// Validate token expiration using default clock skew tolerance
pub fn validateExpiration(claims: *const OIDCToken.Claims) !void {
    return validateExpirationWithSkew(claims, DEFAULT_CLOCK_SKEW_SECONDS);
}

/// Default audience for OIDC token requests
/// npm requires the audience to be "npm:registry.npmjs.org" for token exchange
pub const DEFAULT_OIDC_AUDIENCE: []const u8 = "npm:registry.npmjs.org";

/// Token refresh threshold in seconds (refresh if token expires within this time)
pub const TOKEN_REFRESH_THRESHOLD_SECONDS: i64 = 300; // 5 minutes

/// Token manager for handling token lifecycle including refresh
pub const TokenManager = struct {
    allocator: std.mem.Allocator,
    provider: OIDCProvider,
    audience: []const u8,
    current_token: ?OIDCToken,

    pub fn init(allocator: std.mem.Allocator, provider: OIDCProvider, audience: []const u8) TokenManager {
        return .{
            .allocator = allocator,
            .provider = provider,
            .audience = audience,
            .current_token = null,
        };
    }

    pub fn deinit(self: *TokenManager) void {
        if (self.current_token) |*token| {
            token.deinit(self.allocator);
        }
        self.provider.deinit(self.allocator);
    }

    /// Get a valid token, refreshing if necessary
    pub fn getValidToken(self: *TokenManager) !*const OIDCToken {
        // Check if we have a token and it's still valid
        if (self.current_token) |*token| {
            if (!self.isTokenExpiringSoon(token)) {
                return token;
            }
            // Token is expiring soon, free it and get a new one
            token.deinit(self.allocator);
            self.current_token = null;
        }

        // Get a fresh token
        const raw_token = try getTokenFromEnvironmentWithAudience(
            self.allocator,
            &self.provider,
            self.audience,
        ) orelse return error.NetworkError;
        defer self.allocator.free(raw_token);

        // Validate and store the token
        self.current_token = try validateTokenComplete(
            self.allocator,
            raw_token,
            &self.provider,
            self.audience,
        );

        return &self.current_token.?;
    }

    /// Check if token is expiring within the threshold
    fn isTokenExpiringSoon(self: *const TokenManager, token: *const OIDCToken) bool {
        _ = self;
        const now = (std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec;
        return now >= (token.claims.exp - TOKEN_REFRESH_THRESHOLD_SECONDS);
    }

    /// Force refresh the token
    pub fn refreshToken(self: *TokenManager) !*const OIDCToken {
        // Free existing token if any
        if (self.current_token) |*token| {
            token.deinit(self.allocator);
            self.current_token = null;
        }

        return self.getValidToken();
    }

    /// Get time until token expires (in seconds)
    pub fn getTokenTTL(self: *const TokenManager) ?i64 {
        if (self.current_token) |token| {
            const now = (std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec;
            const ttl = token.claims.exp - now;
            return if (ttl > 0) ttl else 0;
        }
        return null;
    }

    /// Check if refresh is needed before an operation that takes estimated_duration_seconds
    pub fn needsRefreshForOperation(self: *const TokenManager, estimated_duration_seconds: i64) bool {
        if (self.getTokenTTL()) |ttl| {
            // Need refresh if token will expire during the operation (with buffer)
            return ttl < (estimated_duration_seconds + TOKEN_REFRESH_THRESHOLD_SECONDS);
        }
        return true; // No token, definitely need to refresh
    }
};

/// Get OIDC token from environment with default audience
pub fn getTokenFromEnvironment(allocator: std.mem.Allocator, provider: *const OIDCProvider) !?[]const u8 {
    return getTokenFromEnvironmentWithAudience(allocator, provider, DEFAULT_OIDC_AUDIENCE);
}

/// Get OIDC token from environment with custom audience
pub fn getTokenFromEnvironmentWithAudience(allocator: std.mem.Allocator, provider: *const OIDCProvider, audience: []const u8) !?[]const u8 {
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

        // Request OIDC token from GitHub Actions with specified audience
        return try requestGitHubOIDCToken(allocator, request_url, request_token, audience);
    }

    // For other providers, token is directly in environment variable
    return std.process.getEnvVarOwned(allocator, provider.token_env_var) catch null;
}

/// Request OIDC token from GitHub Actions
fn requestGitHubOIDCToken(allocator: std.mem.Allocator, request_url: []const u8, request_token: []const u8, audience: []const u8) ![]const u8 {
    var io: std.Io.Threaded = .init_single_threaded;
    defer io.deinit();
    var client = http.Client{ .allocator = allocator, .io = io.io() };
    defer client.deinit();

    // Add audience query parameter
    const url_with_audience = try std.fmt.allocPrint(
        allocator,
        "{s}&audience={s}",
        .{ request_url, audience },
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
    if (std.process.getEnvVarOwned(allocator, "GITHUB_ACTIONS") catch null) |val| {
        allocator.free(val);
        return try Providers.github(allocator);
    }

    // Check for GitLab CI
    if (std.process.getEnvVarOwned(allocator, "GITLAB_CI") catch null) |val| {
        allocator.free(val);
        return try Providers.gitlab(allocator);
    }

    // Check for Azure Pipelines
    if (std.process.getEnvVarOwned(allocator, "AZURE_PIPELINES") catch null) |val| {
        allocator.free(val);
        return try Providers.azure(allocator);
    }

    // Check for Bitbucket Pipelines
    if (std.process.getEnvVarOwned(allocator, "BITBUCKET_BUILD_NUMBER") catch null) |val| {
        allocator.free(val);
        return try Providers.bitbucket(allocator);
    }

    // Check for CircleCI
    if (std.process.getEnvVarOwned(allocator, "CIRCLECI") catch null) |val| {
        allocator.free(val);
        return try Providers.circleci(allocator);
    }

    // Check for Jenkins
    if (std.process.getEnvVarOwned(allocator, "JENKINS_HOME") catch null) |val| {
        allocator.free(val);
        return try Providers.jenkins(allocator);
    }

    // Check for Travis CI
    if (std.process.getEnvVarOwned(allocator, "TRAVIS") catch null) |val| {
        allocator.free(val);
        return try Providers.travis(allocator);
    }

    return null;
}

// =============================================================================
// JWT Header and JWKS Support
// =============================================================================

/// JWT Header structure
pub const JWTHeader = struct {
    /// Algorithm used for signing (e.g., "RS256", "ES256")
    alg: []const u8,
    /// Key ID - identifies which key was used to sign
    kid: ?[]const u8 = null,
    /// Token type (usually "JWT")
    typ: ?[]const u8 = null,

    pub fn deinit(self: *JWTHeader, allocator: std.mem.Allocator) void {
        allocator.free(self.alg);
        if (self.kid) |kid| allocator.free(kid);
        if (self.typ) |typ| allocator.free(typ);
    }
};

/// JSON Web Key structure
pub const JWK = struct {
    /// Key type (e.g., "RSA", "EC")
    kty: []const u8,
    /// Key ID
    kid: ?[]const u8 = null,
    /// Algorithm
    alg: ?[]const u8 = null,
    /// Public key use (e.g., "sig" for signature)
    use: ?[]const u8 = null,
    /// RSA modulus (base64url encoded)
    n: ?[]const u8 = null,
    /// RSA exponent (base64url encoded)
    e: ?[]const u8 = null,
    /// EC curve (e.g., "P-256")
    crv: ?[]const u8 = null,
    /// EC x coordinate (base64url encoded)
    x: ?[]const u8 = null,
    /// EC y coordinate (base64url encoded)
    y: ?[]const u8 = null,

    pub fn deinit(self: *JWK, allocator: std.mem.Allocator) void {
        allocator.free(self.kty);
        if (self.kid) |kid| allocator.free(kid);
        if (self.alg) |alg| allocator.free(alg);
        if (self.use) |use| allocator.free(use);
        if (self.n) |n| allocator.free(n);
        if (self.e) |e| allocator.free(e);
        if (self.crv) |crv| allocator.free(crv);
        if (self.x) |x| allocator.free(x);
        if (self.y) |y| allocator.free(y);
    }
};

/// JSON Web Key Set structure
pub const JWKS = struct {
    keys: []JWK,
    allocator: std.mem.Allocator,

    pub fn deinit(self: *JWKS) void {
        for (self.keys) |*key| {
            key.deinit(self.allocator);
        }
        self.allocator.free(self.keys);
    }

    /// Find a key by its ID
    pub fn findKeyById(self: *const JWKS, kid: []const u8) ?*const JWK {
        for (self.keys) |*key| {
            if (key.kid) |key_kid| {
                if (std.mem.eql(u8, key_kid, kid)) {
                    return key;
                }
            }
        }
        return null;
    }

    /// Find a key by algorithm (fallback if no kid match)
    pub fn findKeyByAlg(self: *const JWKS, alg: []const u8) ?*const JWK {
        for (self.keys) |*key| {
            if (key.alg) |key_alg| {
                if (std.mem.eql(u8, key_alg, alg)) {
                    return key;
                }
            }
        }
        // If no alg match, return first RSA key for RS256
        if (std.mem.eql(u8, alg, "RS256")) {
            for (self.keys) |*key| {
                if (std.mem.eql(u8, key.kty, "RSA")) {
                    return key;
                }
            }
        }
        return null;
    }
};

/// Parse JWT header from token
pub fn parseJWTHeader(allocator: std.mem.Allocator, token: []const u8) !JWTHeader {
    // JWT format: header.payload.signature
    var parts = std.mem.splitScalar(u8, token, '.');
    const header_b64 = parts.next() orelse return error.InvalidToken;

    // Decode base64url header
    const header_json = base64UrlDecode(allocator, header_b64) catch return error.InvalidToken;
    defer allocator.free(header_json);

    // Parse JSON
    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        header_json,
        .{},
    );
    defer parsed.deinit();

    const obj = parsed.value.object;

    // Extract algorithm (required)
    const alg_value = obj.get("alg") orelse return error.InvalidToken;
    const alg = try allocator.dupe(u8, alg_value.string);

    // Extract kid (optional)
    const kid: ?[]const u8 = if (obj.get("kid")) |kid_value|
        if (kid_value == .string) try allocator.dupe(u8, kid_value.string) else null
    else
        null;

    // Extract typ (optional)
    const typ: ?[]const u8 = if (obj.get("typ")) |typ_value|
        if (typ_value == .string) try allocator.dupe(u8, typ_value.string) else null
    else
        null;

    return JWTHeader{
        .alg = alg,
        .kid = kid,
        .typ = typ,
    };
}

/// Network retry configuration
pub const RetryConfig = struct {
    /// Maximum number of retry attempts
    max_retries: u32 = 3,
    /// Initial delay between retries in milliseconds
    initial_delay_ms: u64 = 100,
    /// Maximum delay between retries in milliseconds
    max_delay_ms: u64 = 5000,
    /// Multiplier for exponential backoff
    backoff_multiplier: u32 = 2,
};

/// Default retry configuration
pub const DEFAULT_RETRY_CONFIG = RetryConfig{};

/// Fetch JWKS from provider's JWKS URI with retry logic
pub fn fetchJWKS(allocator: std.mem.Allocator, jwks_uri: []const u8) !JWKS {
    return fetchJWKSWithRetry(allocator, jwks_uri, DEFAULT_RETRY_CONFIG);
}

/// Fetch JWKS with configurable retry behavior
pub fn fetchJWKSWithRetry(allocator: std.mem.Allocator, jwks_uri: []const u8, config: RetryConfig) !JWKS {
    var last_error: anyerror = error.NetworkError;
    var delay_ms: u64 = config.initial_delay_ms;

    var attempt: u32 = 0;
    while (attempt <= config.max_retries) : (attempt += 1) {
        // Try to fetch JWKS
        const result = fetchJWKSOnce(allocator, jwks_uri);

        if (result) |jwks| {
            return jwks;
        } else |err| {
            last_error = err;

            // Don't retry on non-transient errors
            if (err == error.InvalidJWKS or err == error.OutOfMemory) {
                return err;
            }

            // If we've exhausted retries, return the error
            if (attempt >= config.max_retries) {
                break;
            }

            // Sleep before retry (exponential backoff)
            const delay_ns = delay_ms * std.time.ns_per_ms;
            std.posix.nanosleep(delay_ns / std.time.ns_per_s, delay_ns % std.time.ns_per_s);

            // Increase delay for next attempt
            delay_ms = @min(delay_ms * config.backoff_multiplier, config.max_delay_ms);
        }
    }

    return last_error;
}

/// Single attempt to fetch JWKS (internal helper)
fn fetchJWKSOnce(allocator: std.mem.Allocator, jwks_uri: []const u8) !JWKS {
    var io: std.Io.Threaded = .init_single_threaded;
    defer io.deinit();
    var client = http.Client{ .allocator = allocator, .io = io.io() };
    defer client.deinit();

    // Parse URI
    const uri = std.Uri.parse(jwks_uri) catch return error.NetworkError;

    // Make HTTP request
    var req = client.request(.GET, uri, .{}) catch return error.NetworkError;
    defer req.deinit();

    req.sendBodiless() catch return error.NetworkError;

    var redirect_buffer: [4096]u8 = undefined;
    var response = req.receiveHead(&redirect_buffer) catch return error.NetworkError;

    // Check status
    if (response.head.status != .ok) {
        return error.NetworkError;
    }

    // Read response body
    const body_reader = response.reader(&.{});
    const body = body_reader.allocRemaining(allocator, std.Io.Limit.limited(65536)) catch return error.NetworkError;
    defer allocator.free(body);

    // Parse JWKS JSON
    return try parseJWKS(allocator, body);
}

/// Parse JWKS from JSON string
fn parseJWKS(allocator: std.mem.Allocator, json_str: []const u8) !JWKS {
    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        json_str,
        .{},
    );
    defer parsed.deinit();

    const obj = parsed.value.object;
    const keys_array = obj.get("keys") orelse return error.InvalidJWKS;

    if (keys_array != .array) {
        return error.InvalidJWKS;
    }

    var keys = std.ArrayList(JWK){};
    errdefer {
        for (keys.items) |*key| {
            key.deinit(allocator);
        }
        keys.deinit(allocator);
    }

    for (keys_array.array.items) |key_value| {
        if (key_value != .object) continue;

        const key_obj = key_value.object;

        // kty is required
        const kty_value = key_obj.get("kty") orelse continue;
        if (kty_value != .string) continue;

        const jwk = JWK{
            .kty = try allocator.dupe(u8, kty_value.string),
            .kid = if (key_obj.get("kid")) |v| if (v == .string) try allocator.dupe(u8, v.string) else null else null,
            .alg = if (key_obj.get("alg")) |v| if (v == .string) try allocator.dupe(u8, v.string) else null else null,
            .use = if (key_obj.get("use")) |v| if (v == .string) try allocator.dupe(u8, v.string) else null else null,
            .n = if (key_obj.get("n")) |v| if (v == .string) try allocator.dupe(u8, v.string) else null else null,
            .e = if (key_obj.get("e")) |v| if (v == .string) try allocator.dupe(u8, v.string) else null else null,
            .crv = if (key_obj.get("crv")) |v| if (v == .string) try allocator.dupe(u8, v.string) else null else null,
            .x = if (key_obj.get("x")) |v| if (v == .string) try allocator.dupe(u8, v.string) else null else null,
            .y = if (key_obj.get("y")) |v| if (v == .string) try allocator.dupe(u8, v.string) else null else null,
        };

        try keys.append(allocator, jwk);
    }

    return JWKS{
        .keys = try keys.toOwnedSlice(allocator),
        .allocator = allocator,
    };
}

/// Verify JWT signature against JWKS
/// Returns true if signature is valid, false otherwise
pub fn verifyTokenSignature(allocator: std.mem.Allocator, token: []const u8, provider: *const OIDCProvider) !bool {
    // Parse JWT header to get algorithm and key ID
    var header = try parseJWTHeader(allocator, token);
    defer header.deinit(allocator);

    // Fetch JWKS from provider
    var jwks = try fetchJWKS(allocator, provider.jwks_uri);
    defer jwks.deinit();

    // Find the appropriate key
    const key = if (header.kid) |kid|
        jwks.findKeyById(kid) orelse jwks.findKeyByAlg(header.alg)
    else
        jwks.findKeyByAlg(header.alg);

    if (key == null) {
        return error.InvalidJWKS;
    }

    // Split token into parts
    var parts = std.mem.splitScalar(u8, token, '.');
    const header_b64 = parts.next() orelse return error.InvalidToken;
    const payload_b64 = parts.next() orelse return error.InvalidToken;
    const signature_b64 = parts.next() orelse return error.InvalidToken;

    // The signed data is "header.payload"
    const signed_data = try std.fmt.allocPrint(allocator, "{s}.{s}", .{ header_b64, payload_b64 });
    defer allocator.free(signed_data);

    // Decode signature
    const signature = try base64UrlDecode(allocator, signature_b64);
    defer allocator.free(signature);

    // Verify based on algorithm
    if (std.mem.eql(u8, header.alg, "RS256")) {
        return try verifyRS256(allocator, key.?, signed_data, signature);
    } else if (std.mem.eql(u8, header.alg, "ES256")) {
        return try verifyES256(allocator, key.?, signed_data, signature);
    } else {
        return error.UnsupportedAlgorithm;
    }
}

/// Verify RS256 (RSA-SHA256) signature using PKCS#1 v1.5
fn verifyRS256(allocator: std.mem.Allocator, key: *const JWK, data: []const u8, signature: []const u8) !bool {
    // Ensure we have RSA key components
    if (!std.mem.eql(u8, key.kty, "RSA")) {
        return error.InvalidJWKS;
    }

    const n_b64 = key.n orelse return error.InvalidJWKS;
    const e_b64 = key.e orelse return error.InvalidJWKS;

    // Decode modulus and exponent
    const n_bytes = try base64UrlDecode(allocator, n_b64);
    defer allocator.free(n_bytes);

    const e_bytes = try base64UrlDecode(allocator, e_b64);
    defer allocator.free(e_bytes);

    // Signature length must match modulus length
    if (signature.len != n_bytes.len) {
        return false;
    }

    // Compute SHA-256 hash of the signed data
    var hash: [32]u8 = undefined;
    std.crypto.hash.sha2.Sha256.hash(data, &hash, .{});

    // Perform RSA verification: decrypt signature using public key (s^e mod n)
    const decrypted = try rsaPublicOp(allocator, signature, e_bytes, n_bytes);
    defer allocator.free(decrypted);

    // Verify PKCS#1 v1.5 signature padding and extract hash
    // Format: 0x00 0x01 [0xFF padding] 0x00 [DigestInfo] [Hash]
    // DigestInfo for SHA-256: 30 31 30 0d 06 09 60 86 48 01 65 03 04 02 01 05 00 04 20
    const sha256_digest_info = [_]u8{
        0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86,
        0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, 0x05,
        0x00, 0x04, 0x20,
    };

    // Check minimum length: 0x00 + 0x01 + at least 8 bytes of 0xFF + 0x00 + DigestInfo + hash
    const min_len = 2 + 8 + 1 + sha256_digest_info.len + 32;
    if (decrypted.len < min_len) {
        return false;
    }

    // Verify padding format
    if (decrypted[0] != 0x00 or decrypted[1] != 0x01) {
        return false;
    }

    // Find end of 0xFF padding
    var i: usize = 2;
    while (i < decrypted.len and decrypted[i] == 0xFF) : (i += 1) {}

    // Must have at least 8 bytes of 0xFF padding (per PKCS#1 v1.5)
    if (i < 10) {
        return false;
    }

    // Next byte must be 0x00 separator
    if (i >= decrypted.len or decrypted[i] != 0x00) {
        return false;
    }
    i += 1;

    // Check DigestInfo
    const remaining = decrypted.len - i;
    if (remaining != sha256_digest_info.len + 32) {
        return false;
    }

    if (!std.mem.eql(u8, decrypted[i .. i + sha256_digest_info.len], &sha256_digest_info)) {
        return false;
    }
    i += sha256_digest_info.len;

    // Compare hash
    if (!std.mem.eql(u8, decrypted[i .. i + 32], &hash)) {
        return false;
    }

    return true;
}

/// Helper: Convert a big int to big-endian bytes (Zig 0.16 compatible)
fn bigIntToBytes(big_int: *const std.math.big.int.Managed, out_bytes: []u8) void {
    const Limb = std.math.big.Limb;
    const limb_bytes = @sizeOf(Limb);

    // Zero the output first
    @memset(out_bytes, 0);

    const limbs = big_int.toConst().limbs;
    const num_limbs = big_int.len();

    if (num_limbs == 0) return;

    // Convert little-endian limbs to big-endian bytes
    var byte_idx: usize = out_bytes.len;

    for (limbs[0..num_limbs]) |limb| {
        var remaining = limb;
        var i: usize = 0;
        while (i < limb_bytes and byte_idx > 0) : (i += 1) {
            byte_idx -= 1;
            out_bytes[byte_idx] = @truncate(remaining);
            remaining >>= 8;
        }
    }
}

/// Helper: Set a Managed big int from big-endian bytes (Zig 0.16 compatible)
fn setBigIntFromBytes(big_int: *std.math.big.int.Managed, bytes: []const u8) !void {
    const Limb = std.math.big.Limb;
    const limb_bytes = @sizeOf(Limb);

    // Skip leading zeros
    var start: usize = 0;
    while (start < bytes.len and bytes[start] == 0) : (start += 1) {}

    if (start >= bytes.len) {
        // All zeros
        try big_int.set(@as(usize, 0));
        return;
    }

    const significant_bytes = bytes[start..];
    const num_limbs = (significant_bytes.len + limb_bytes - 1) / limb_bytes;

    // Ensure we have enough capacity
    try big_int.ensureCapacity(num_limbs);

    // Clear existing limbs
    @memset(big_int.limbs[0..big_int.limbs.len], 0);

    // Convert big-endian bytes to little-endian limbs
    var limb_idx: usize = 0;
    var byte_idx: usize = significant_bytes.len;

    while (byte_idx > 0) {
        var limb: Limb = 0;
        var shift: u8 = 0;

        while (shift < @bitSizeOf(Limb) and byte_idx > 0) {
            byte_idx -= 1;
            limb |= @as(Limb, significant_bytes[byte_idx]) << @truncate(shift);
            shift += 8;
        }

        if (limb_idx < big_int.limbs.len) {
            big_int.limbs[limb_idx] = limb;
        }
        limb_idx += 1;
    }

    // Set the length metadata (positive, num_limbs used)
    big_int.setLen(num_limbs);
}

/// RSA public key operation: compute (base ^ exp) mod modulus
/// Uses square-and-multiply algorithm with big integers
fn rsaPublicOp(allocator: std.mem.Allocator, base_bytes: []const u8, exp_bytes: []const u8, mod_bytes: []const u8) ![]u8 {
    const BigInt = std.math.big.int.Managed;

    // Initialize big integers
    var base = try BigInt.init(allocator);
    defer base.deinit();
    var exp = try BigInt.init(allocator);
    defer exp.deinit();
    var modulus = try BigInt.init(allocator);
    defer modulus.deinit();
    var result = try BigInt.init(allocator);
    defer result.deinit();
    var temp = try BigInt.init(allocator);
    defer temp.deinit();

    // Convert bytes to big integers (big-endian)
    try setBigIntFromBytes(&base, base_bytes);
    try setBigIntFromBytes(&exp, exp_bytes);
    try setBigIntFromBytes(&modulus, mod_bytes);

    // Check that modulus is not zero
    if (modulus.eqlZero()) {
        return error.InvalidJWKS;
    }

    // Check that base < modulus
    if (base.order(modulus) != .lt) {
        return error.InvalidSignature;
    }

    // Square-and-multiply modular exponentiation
    try result.set(1);

    // Get exponent limbs for bit iteration
    const exp_limbs = exp.toConst().limbs;
    const limb_bits = @bitSizeOf(std.math.big.Limb);

    // Process each bit of the exponent from most significant to least significant
    var started = false;
    var limb_idx: usize = exp_limbs.len;
    while (limb_idx > 0) {
        limb_idx -= 1;
        const limb = exp_limbs[limb_idx];

        var bit_idx: usize = limb_bits;
        while (bit_idx > 0) {
            bit_idx -= 1;

            if (started) {
                // Square: result = result^2 mod modulus
                try temp.mul(&result, &result);
                try result.divFloor(&temp, &temp, &modulus);
                result.swap(&temp);
            }

            // Check if current bit is set
            const bit_set = (limb >> @intCast(bit_idx)) & 1 == 1;
            if (bit_set) {
                started = true;
                // Multiply: result = result * base mod modulus
                try temp.mul(&result, &base);
                try result.divFloor(&temp, &temp, &modulus);
                result.swap(&temp);
            }
        }
    }

    // Convert result back to bytes
    const result_bytes = try allocator.alloc(u8, mod_bytes.len);
    errdefer allocator.free(result_bytes);

    // Convert big int to big-endian bytes
    bigIntToBytes(&result, result_bytes);

    return result_bytes;
}

/// Verify ES256 (ECDSA-SHA256) signature
fn verifyES256(allocator: std.mem.Allocator, key: *const JWK, data: []const u8, signature: []const u8) !bool {
    // Ensure we have EC key components
    if (!std.mem.eql(u8, key.kty, "EC")) {
        return error.InvalidJWKS;
    }

    const crv = key.crv orelse return error.InvalidJWKS;
    if (!std.mem.eql(u8, crv, "P-256")) {
        return error.UnsupportedAlgorithm;
    }

    const x_b64 = key.x orelse return error.InvalidJWKS;
    const y_b64 = key.y orelse return error.InvalidJWKS;

    // Decode x and y coordinates
    const x = try base64UrlDecode(allocator, x_b64);
    defer allocator.free(x);

    const y = try base64UrlDecode(allocator, y_b64);
    defer allocator.free(y);

    // ES256 signature is 64 bytes (r: 32, s: 32)
    if (signature.len != 64) {
        return false;
    }

    // P-256 coordinates should be 32 bytes each
    if (x.len != 32 or y.len != 32) {
        return false;
    }

    // Use Zig's built-in ECDSA verification (Zig 0.16 API)
    const EcdsaP256Sha256 = std.crypto.sign.ecdsa.EcdsaP256Sha256;

    // Construct the public key from x and y coordinates
    var public_key_bytes: [65]u8 = undefined;
    public_key_bytes[0] = 0x04; // Uncompressed point format
    @memcpy(public_key_bytes[1..33], x);
    @memcpy(public_key_bytes[33..65], y);

    const public_key = EcdsaP256Sha256.PublicKey.fromSec1(&public_key_bytes) catch return false;

    // Parse the signature (r || s format)
    var sig_bytes: [64]u8 = undefined;
    @memcpy(&sig_bytes, signature);
    const sig = EcdsaP256Sha256.Signature.fromBytes(sig_bytes);

    // Verify the signature - Zig 0.16 API: verify takes message, not hash
    sig.verify(data, public_key) catch return false;

    return true;
}

/// Complete token validation: header + signature + claims + expiration
pub fn validateTokenComplete(
    allocator: std.mem.Allocator,
    token: []const u8,
    provider: *const OIDCProvider,
    expected_audience: ?[]const u8,
) !OIDCToken {
    // 1. Parse and validate header
    var header = try parseJWTHeader(allocator, token);
    defer header.deinit(allocator);

    // Validate algorithm is supported
    if (!std.mem.eql(u8, header.alg, "RS256") and !std.mem.eql(u8, header.alg, "ES256")) {
        return error.UnsupportedAlgorithm;
    }

    // 2. Verify signature
    const sig_valid = try verifyTokenSignature(allocator, token, provider);
    if (!sig_valid) {
        return error.InvalidSignature;
    }

    // 3. Decode and extract claims
    var oidc_token = try decodeTokenUnsafe(allocator, token);
    errdefer oidc_token.deinit(allocator);

    // 4. Validate issuer matches provider
    if (!std.mem.eql(u8, oidc_token.claims.iss, provider.issuer)) {
        return error.InvalidIssuer;
    }

    // 5. Validate audience if provided
    if (expected_audience) |aud| {
        if (!std.mem.eql(u8, oidc_token.claims.aud, aud)) {
            return error.InvalidAudience;
        }
    }

    // 6. Validate expiration
    try validateExpiration(&oidc_token.claims);

    return oidc_token;
}

// =============================================================================
// JWKS Caching (for performance optimization)
// =============================================================================

/// Cached JWKS with TTL
pub const CachedJWKS = struct {
    jwks: JWKS,
    fetched_at: i64,
    ttl_seconds: i64,

    const DEFAULT_TTL: i64 = 3600; // 1 hour

    pub fn isExpired(self: *const CachedJWKS) bool {
        const now = (std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec;
        return now >= (self.fetched_at + self.ttl_seconds);
    }

    pub fn deinit(self: *CachedJWKS) void {
        self.jwks.deinit();
    }
};

/// Global JWKS cache (thread-local for safety)
threadlocal var jwks_cache: ?struct {
    uri: []const u8,
    cached: CachedJWKS,
} = null;

/// Fetch JWKS with caching
pub fn fetchJWKSCached(allocator: std.mem.Allocator, jwks_uri: []const u8) !JWKS {
    // Check cache
    if (jwks_cache) |*cache| {
        if (std.mem.eql(u8, cache.uri, jwks_uri) and !cache.cached.isExpired()) {
            // Return a reference to cached JWKS (caller should not deinit)
            return cache.cached.jwks;
        }
        // Cache expired or different URI, clear it
        cache.cached.deinit();
        allocator.free(cache.uri);
        jwks_cache = null;
    }

    // Fetch fresh JWKS
    const jwks = try fetchJWKS(allocator, jwks_uri);
    const now = (std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec;

    // Cache it
    jwks_cache = .{
        .uri = try allocator.dupe(u8, jwks_uri),
        .cached = .{
            .jwks = jwks,
            .fetched_at = now,
            .ttl_seconds = CachedJWKS.DEFAULT_TTL,
        },
    };

    return jwks;
}

/// Clear JWKS cache (useful for testing or key rotation)
pub fn clearJWKSCache(allocator: std.mem.Allocator) void {
    if (jwks_cache) |*cache| {
        cache.cached.deinit();
        allocator.free(cache.uri);
        jwks_cache = null;
    }
}
