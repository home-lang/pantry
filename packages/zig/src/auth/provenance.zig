const std = @import("std");
const oidc = @import("oidc.zig");

/// SLSA Provenance v1.0 attestation
/// Follows the in-toto attestation framework: https://slsa.dev/provenance/v1
pub const ProvenanceAttestation = struct {
    /// in-toto statement type
    _type: []const u8 = "https://in-toto.io/Statement/v1",

    /// Subject - the artifact(s) being attested
    subject: []Subject,

    /// Predicate type (SLSA Provenance)
    predicateType: []const u8 = "https://slsa.dev/provenance/v1",

    /// The provenance predicate
    predicate: Predicate,

    pub const Subject = struct {
        /// Package name (e.g., "@scope/package")
        name: []const u8,
        /// Digest of the artifact
        digest: Digest,

        pub const Digest = struct {
            /// SHA-256 hash of the package tarball
            sha256: []const u8,
            /// Optional SHA-512 hash
            sha512: ?[]const u8 = null,
        };
    };

    pub const Predicate = struct {
        /// Build definition
        buildDefinition: BuildDefinition,
        /// Run details
        runDetails: RunDetails,
    };

    pub const BuildDefinition = struct {
        /// Build type identifier
        buildType: []const u8,
        /// External parameters (inputs to the build)
        externalParameters: ExternalParameters,
        /// Internal parameters (resolved dependencies, etc.)
        internalParameters: ?InternalParameters = null,
        /// Resolved dependencies
        resolvedDependencies: ?[]ResolvedDependency = null,

        pub const ExternalParameters = struct {
            /// Source repository
            repository: []const u8,
            /// Git ref (branch/tag)
            ref: []const u8,
            /// Workflow file path
            workflow: ?[]const u8 = null,
        };

        pub const InternalParameters = struct {
            /// GitHub-specific: workflow ref
            github_workflow_ref: ?[]const u8 = null,
            /// GitHub-specific: run ID
            github_run_id: ?[]const u8 = null,
        };

        pub const ResolvedDependency = struct {
            uri: []const u8,
            digest: ?Subject.Digest = null,
        };
    };

    pub const RunDetails = struct {
        /// Builder information
        builder: Builder,
        /// Build metadata
        metadata: Metadata,

        pub const Builder = struct {
            /// Builder ID (e.g., "https://github.com/actions/runner")
            id: []const u8,
            /// Builder version
            version: ?[]const u8 = null,
            /// Builder dependencies
            builderDependencies: ?[]BuildDefinition.ResolvedDependency = null,
        };

        pub const Metadata = struct {
            /// Invocation ID (unique build identifier)
            invocationId: []const u8,
            /// Start time (RFC 3339)
            startedOn: []const u8,
            /// Finish time (RFC 3339)
            finishedOn: ?[]const u8 = null,
        };
    };

    pub fn deinit(self: *ProvenanceAttestation, allocator: std.mem.Allocator) void {
        for (self.subject) |*subj| {
            allocator.free(subj.name);
            allocator.free(subj.digest.sha256);
            if (subj.digest.sha512) |sha512| allocator.free(sha512);
        }
        allocator.free(self.subject);

        allocator.free(self.predicate.buildDefinition.buildType);
        allocator.free(self.predicate.buildDefinition.externalParameters.repository);
        allocator.free(self.predicate.buildDefinition.externalParameters.ref);
        if (self.predicate.buildDefinition.externalParameters.workflow) |w| allocator.free(w);

        if (self.predicate.buildDefinition.internalParameters) |ip| {
            if (ip.github_workflow_ref) |gwr| allocator.free(gwr);
            if (ip.github_run_id) |gri| allocator.free(gri);
        }

        allocator.free(self.predicate.runDetails.builder.id);
        if (self.predicate.runDetails.builder.version) |v| allocator.free(v);
        allocator.free(self.predicate.runDetails.metadata.invocationId);
        allocator.free(self.predicate.runDetails.metadata.startedOn);
        if (self.predicate.runDetails.metadata.finishedOn) |fo| allocator.free(fo);
    }
};

/// Generate provenance attestation from OIDC token and build info
pub fn generateProvenance(
    allocator: std.mem.Allocator,
    token: *const oidc.OIDCToken,
    package_name: []const u8,
    tarball_sha256: []const u8,
    tarball_sha512: ?[]const u8,
) !ProvenanceAttestation {
    const claims = &token.claims;

    // Determine build type based on provider
    const build_type = if (std.mem.indexOf(u8, claims.iss, "github") != null)
        try allocator.dupe(u8, "https://github.com/actions/runner")
    else if (std.mem.indexOf(u8, claims.iss, "gitlab") != null)
        try allocator.dupe(u8, "https://gitlab.com/gitlab-org/gitlab-runner")
    else
        try allocator.dupe(u8, "https://slsa.dev/provenance/v1");

    // Build repository URL
    const repository = if (claims.repository) |repo|
        try std.fmt.allocPrint(allocator, "https://github.com/{s}", .{repo})
    else if (claims.project_path) |path|
        try std.fmt.allocPrint(allocator, "https://gitlab.com/{s}", .{path})
    else
        try allocator.dupe(u8, "unknown");

    // Get ref
    const ref = if (claims.ref) |r|
        try allocator.dupe(u8, r)
    else
        try allocator.dupe(u8, "unknown");

    // Get workflow
    const workflow: ?[]const u8 = if (claims.job_workflow_ref) |jwr|
        try allocator.dupe(u8, jwr)
    else
        null;

    // Builder ID
    const builder_id = if (claims.runner_environment) |_|
        try allocator.dupe(u8, "https://github.com/actions/runner")
    else
        try allocator.dupe(u8, claims.iss);

    // Generate invocation ID
    const invocation_id = if (claims.jti) |jti|
        try allocator.dupe(u8, jti)
    else
        try std.fmt.allocPrint(allocator, "{d}", .{claims.iat});

    // Get current timestamp in RFC 3339 format
    const started_on = try formatTimestamp(allocator, claims.iat);

    // Create subject
    var subjects = try allocator.alloc(ProvenanceAttestation.Subject, 1);
    subjects[0] = .{
        .name = try allocator.dupe(u8, package_name),
        .digest = .{
            .sha256 = try allocator.dupe(u8, tarball_sha256),
            .sha512 = if (tarball_sha512) |s| try allocator.dupe(u8, s) else null,
        },
    };

    // Build internal parameters for GitHub
    var internal_params: ?ProvenanceAttestation.BuildDefinition.InternalParameters = null;
    if (claims.job_workflow_ref != null or claims.sha != null) {
        internal_params = .{
            .github_workflow_ref = if (claims.job_workflow_ref) |jwr| try allocator.dupe(u8, jwr) else null,
            .github_run_id = if (claims.sha) |sha| try allocator.dupe(u8, sha) else null,
        };
    }

    return ProvenanceAttestation{
        .subject = subjects,
        .predicate = .{
            .buildDefinition = .{
                .buildType = build_type,
                .externalParameters = .{
                    .repository = repository,
                    .ref = ref,
                    .workflow = workflow,
                },
                .internalParameters = internal_params,
            },
            .runDetails = .{
                .builder = .{
                    .id = builder_id,
                },
                .metadata = .{
                    .invocationId = invocation_id,
                    .startedOn = started_on,
                },
            },
        },
    };
}

/// Format Unix timestamp as RFC 3339
fn formatTimestamp(allocator: std.mem.Allocator, timestamp: i64) ![]const u8 {
    // Convert to epoch seconds
    const epoch_seconds = std.time.epoch.EpochSeconds{ .secs = @intCast(timestamp) };
    const epoch_day = epoch_seconds.getEpochDay();
    const year_day = epoch_day.calculateYearDay();
    const month_day = year_day.calculateMonthDay();
    const day_seconds = epoch_seconds.getDaySeconds();

    return try std.fmt.allocPrint(
        allocator,
        "{d:0>4}-{d:0>2}-{d:0>2}T{d:0>2}:{d:0>2}:{d:0>2}Z",
        .{
            year_day.year,
            @as(u8, @intFromEnum(month_day.month)),
            month_day.day_index + 1,
            day_seconds.getHoursIntoDay(),
            day_seconds.getMinutesIntoHour(),
            day_seconds.getSecondsIntoMinute(),
        },
    );
}

/// Serialize provenance attestation to JSON
pub fn serializeProvenance(allocator: std.mem.Allocator, attestation: *const ProvenanceAttestation) ![]u8 {
    var json = std.ArrayList(u8).init(allocator);
    errdefer json.deinit();

    try json.appendSlice("{");

    // _type
    try json.appendSlice("\"_type\":\"");
    try json.appendSlice(attestation._type);
    try json.appendSlice("\",");

    // predicateType
    try json.appendSlice("\"predicateType\":\"");
    try json.appendSlice(attestation.predicateType);
    try json.appendSlice("\",");

    // subject
    try json.appendSlice("\"subject\":[");
    for (attestation.subject, 0..) |subj, i| {
        if (i > 0) try json.appendSlice(",");
        try json.appendSlice("{\"name\":\"");
        try json.appendSlice(subj.name);
        try json.appendSlice("\",\"digest\":{\"sha256\":\"");
        try json.appendSlice(subj.digest.sha256);
        try json.appendSlice("\"");
        if (subj.digest.sha512) |sha512| {
            try json.appendSlice(",\"sha512\":\"");
            try json.appendSlice(sha512);
            try json.appendSlice("\"");
        }
        try json.appendSlice("}}");
    }
    try json.appendSlice("],");

    // predicate
    try json.appendSlice("\"predicate\":{");

    // buildDefinition
    try json.appendSlice("\"buildDefinition\":{");
    try json.appendSlice("\"buildType\":\"");
    try json.appendSlice(attestation.predicate.buildDefinition.buildType);
    try json.appendSlice("\",");
    try json.appendSlice("\"externalParameters\":{");
    try json.appendSlice("\"repository\":\"");
    try json.appendSlice(attestation.predicate.buildDefinition.externalParameters.repository);
    try json.appendSlice("\",\"ref\":\"");
    try json.appendSlice(attestation.predicate.buildDefinition.externalParameters.ref);
    try json.appendSlice("\"");
    if (attestation.predicate.buildDefinition.externalParameters.workflow) |workflow| {
        try json.appendSlice(",\"workflow\":\"");
        try json.appendSlice(workflow);
        try json.appendSlice("\"");
    }
    try json.appendSlice("}");

    // internalParameters
    if (attestation.predicate.buildDefinition.internalParameters) |ip| {
        try json.appendSlice(",\"internalParameters\":{");
        var first = true;
        if (ip.github_workflow_ref) |gwr| {
            try json.appendSlice("\"github_workflow_ref\":\"");
            try json.appendSlice(gwr);
            try json.appendSlice("\"");
            first = false;
        }
        if (ip.github_run_id) |gri| {
            if (!first) try json.appendSlice(",");
            try json.appendSlice("\"github_run_id\":\"");
            try json.appendSlice(gri);
            try json.appendSlice("\"");
        }
        try json.appendSlice("}");
    }
    try json.appendSlice("},");

    // runDetails
    try json.appendSlice("\"runDetails\":{");
    try json.appendSlice("\"builder\":{\"id\":\"");
    try json.appendSlice(attestation.predicate.runDetails.builder.id);
    try json.appendSlice("\"");
    if (attestation.predicate.runDetails.builder.version) |v| {
        try json.appendSlice(",\"version\":\"");
        try json.appendSlice(v);
        try json.appendSlice("\"");
    }
    try json.appendSlice("},");
    try json.appendSlice("\"metadata\":{\"invocationId\":\"");
    try json.appendSlice(attestation.predicate.runDetails.metadata.invocationId);
    try json.appendSlice("\",\"startedOn\":\"");
    try json.appendSlice(attestation.predicate.runDetails.metadata.startedOn);
    try json.appendSlice("\"");
    if (attestation.predicate.runDetails.metadata.finishedOn) |fo| {
        try json.appendSlice(",\"finishedOn\":\"");
        try json.appendSlice(fo);
        try json.appendSlice("\"");
    }
    try json.appendSlice("}}");

    try json.appendSlice("}}");

    return json.toOwnedSlice();
}

/// Compute SHA-256 hash of data and return as hex string
pub fn computeSha256Hex(allocator: std.mem.Allocator, data: []const u8) ![]u8 {
    var hash: [32]u8 = undefined;
    std.crypto.hash.sha2.Sha256.hash(data, &hash, .{});

    const hex = try allocator.alloc(u8, 64);
    const hex_chars = "0123456789abcdef";
    for (hash, 0..) |byte, i| {
        hex[i * 2] = hex_chars[byte >> 4];
        hex[i * 2 + 1] = hex_chars[byte & 0x0F];
    }
    return hex;
}

/// Compute SHA-512 hash of data and return as hex string
pub fn computeSha512Hex(allocator: std.mem.Allocator, data: []const u8) ![]u8 {
    var hash: [64]u8 = undefined;
    std.crypto.hash.sha2.Sha512.hash(data, &hash, .{});

    const hex = try allocator.alloc(u8, 128);
    const hex_chars = "0123456789abcdef";
    for (hash, 0..) |byte, i| {
        hex[i * 2] = hex_chars[byte >> 4];
        hex[i * 2 + 1] = hex_chars[byte & 0x0F];
    }
    return hex;
}
