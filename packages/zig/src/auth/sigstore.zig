const std = @import("std");
const http = std.http;
const io_helper = @import("../io_helper.zig");
const oidc = @import("oidc.zig");

/// Sigstore public good instance URLs
pub const FULCIO_URL = "https://fulcio.sigstore.dev";
pub const REKOR_URL = "https://rekor.sigstore.dev";

/// Sigstore bundle media types
/// npm uses v0.2 format
pub const BUNDLE_V02_MEDIA_TYPE = "application/vnd.dev.sigstore.bundle+json;version=0.2";

/// In-toto statement types
pub const INTOTO_PAYLOAD_TYPE = "application/vnd.in-toto+json";
pub const SLSA_PREDICATE_TYPE_V02 = "https://slsa.dev/provenance/v0.2";
pub const SLSA_PREDICATE_TYPE_V1 = "https://slsa.dev/provenance/v1";

/// Signing certificate from Fulcio
pub const SigningCertificate = struct {
    /// PEM-encoded certificate chain
    certificate_chain: []const u8,
    /// The signing certificate (first in chain)
    signing_cert: []const u8,

    pub fn deinit(self: *SigningCertificate, allocator: std.mem.Allocator) void {
        allocator.free(self.certificate_chain);
        allocator.free(self.signing_cert);
    }
};

/// Rekor log entry
pub const RekorEntry = struct {
    /// UUID of the log entry
    uuid: []const u8,
    /// Log index
    log_index: i64,
    /// Integrated time (Unix timestamp)
    integrated_time: i64,
    /// Log ID
    log_id: []const u8,
    /// Signed entry timestamp (SET)
    signed_entry_timestamp: []const u8,
    /// Inclusion proof
    inclusion_proof: ?InclusionProof,

    pub const InclusionProof = struct {
        log_index: i64,
        root_hash: []const u8,
        tree_size: i64,
        hashes: []const []const u8,
    };

    pub fn deinit(self: *RekorEntry, allocator: std.mem.Allocator) void {
        allocator.free(self.uuid);
        allocator.free(self.log_id);
        allocator.free(self.signed_entry_timestamp);
        if (self.inclusion_proof) |proof| {
            allocator.free(proof.root_hash);
            for (proof.hashes) |h| allocator.free(h);
            allocator.free(proof.hashes);
        }
    }
};

/// DSSE (Dead Simple Signing Envelope)
pub const DSSEEnvelope = struct {
    payload: []const u8, // Base64-encoded
    payload_type: []const u8,
    signatures: []const DSSESignature,

    pub const DSSESignature = struct {
        keyid: []const u8,
        sig: []const u8, // Base64-encoded
    };
};

/// Sigstore bundle containing signature and verification material
pub const SigstoreBundle = struct {
    media_type: []const u8,
    verification_material: VerificationMaterial,
    dsse_envelope: DSSEEnvelope,

    pub const VerificationMaterial = struct {
        certificate: []const u8, // Base64(DER)
        tlog_entries: []const TlogEntry,
    };

    pub const TlogEntry = struct {
        log_index: i64,
        log_id: []const u8,
        integrated_time: i64,
        signed_entry_timestamp: []const u8,
        inclusion_proof: ?RekorEntry.InclusionProof,
    };
};

/// Fulcio client for requesting signing certificates
pub const FulcioClient = struct {
    allocator: std.mem.Allocator,
    base_url: []const u8,
    http_client: http.Client,
    io: *std.Io.Threaded,

    pub fn init(allocator: std.mem.Allocator, base_url: ?[]const u8) !FulcioClient {
        const io = try allocator.create(std.Io.Threaded);
        io.* = std.Io.Threaded.init_single_threaded;
        return FulcioClient{
            .allocator = allocator,
            .base_url = base_url orelse FULCIO_URL,
            .io = io,
            .http_client = http.Client{ .allocator = allocator, .io = io.io() },
        };
    }

    pub fn deinit(self: *FulcioClient) void {
        self.http_client.deinit();
        self.io.deinit();
        self.allocator.destroy(self.io);
    }

    /// Request a signing certificate from Fulcio using OIDC token
    /// Returns a short-lived certificate bound to the OIDC identity
    pub fn requestSigningCertificate(
        self: *FulcioClient,
        oidc_token: []const u8,
        public_key_pem: []const u8,
        private_key: []const u8,
    ) !SigningCertificate {
        // Construct the Fulcio v2 signing cert request
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/api/v2/signingCert",
            .{self.base_url},
        );
        defer self.allocator.free(url);

        // Escape newlines in the PEM key for JSON embedding
        var escaped_pem = std.ArrayList(u8){};
        defer escaped_pem.deinit(self.allocator);
        for (public_key_pem) |c| {
            if (c == '\n') {
                try escaped_pem.appendSlice(self.allocator, "\\n");
            } else if (c == '\r') {
                try escaped_pem.appendSlice(self.allocator, "\\r");
            } else {
                try escaped_pem.append(self.allocator, c);
            }
        }

        // Create proof of possession by signing the `sub` claim from the OIDC token
        // (Per Fulcio spec: signature of the sub claim proves key possession)
        const sub_claim = try extractSubClaim(self.allocator, oidc_token);
        defer self.allocator.free(sub_claim);

        const signature = try signData(self.allocator, sub_claim, private_key);
        defer self.allocator.free(signature);

        // Base64 encode the signature for JSON
        const encoder = std.base64.standard.Encoder;
        const sig_b64_len = encoder.calcSize(signature.len);
        const sig_b64 = try self.allocator.alloc(u8, sig_b64_len);
        defer self.allocator.free(sig_b64);
        _ = encoder.encode(sig_b64, signature);

        // Create request body (Fulcio expects specific format)
        const request_body = try std.fmt.allocPrint(
            self.allocator,
            \\{{
            \\  "credentials": {{
            \\    "oidcIdentityToken": "{s}"
            \\  }},
            \\  "publicKeyRequest": {{
            \\    "publicKey": {{
            \\      "algorithm": "ECDSA",
            \\      "content": "{s}"
            \\    }},
            \\    "proofOfPossession": "{s}"
            \\  }}
            \\}}
        ,
            .{ oidc_token, escaped_pem.items, sig_b64 },
        );
        defer self.allocator.free(request_body);

        std.debug.print("Requesting signing certificate from Fulcio...\n", .{});

        const uri = try std.Uri.parse(url);

        const extra_headers = [_]http.Header{
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/pem-certificate-chain" },
        };

        var req = try self.http_client.request(.POST, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = request_body.len };
        try req.sendBodyComplete(@constCast(request_body));

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        const body_reader = response.reader(&.{});
        const body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
        defer self.allocator.free(body);

        if (response.head.status != .ok and response.head.status != .created) {
            std.debug.print("Fulcio request failed with status {d}: {s}\n", .{ @intFromEnum(response.head.status), body });
            return error.FulcioCertificateRequestFailed;
        }

        std.debug.print("✓ Received signing certificate from Fulcio\n", .{});

        // The response may have escaped newlines (\n as literal characters)
        // Unescape them to get proper PEM format
        const unescaped_body = try unescapeNewlines(self.allocator, body);
        defer self.allocator.free(unescaped_body);

        // Parse the certificate chain (PEM format)
        // First cert is the signing cert, rest are the chain
        const cert_chain = try self.allocator.dupe(u8, unescaped_body);
        errdefer self.allocator.free(cert_chain);

        // Extract just the first certificate
        const signing_cert = try extractFirstCertificate(self.allocator, cert_chain);

        return SigningCertificate{
            .certificate_chain = cert_chain,
            .signing_cert = signing_cert,
        };
    }
};

/// Unescape literal \n and \r sequences to actual newlines
fn unescapeNewlines(allocator: std.mem.Allocator, input: []const u8) ![]const u8 {
    var result = std.ArrayList(u8){};
    errdefer result.deinit(allocator);

    var i: usize = 0;
    while (i < input.len) {
        if (i + 1 < input.len and input[i] == '\\') {
            if (input[i + 1] == 'n') {
                try result.append(allocator, '\n');
                i += 2;
                continue;
            } else if (input[i + 1] == 'r') {
                try result.append(allocator, '\r');
                i += 2;
                continue;
            }
        }
        try result.append(allocator, input[i]);
        i += 1;
    }

    return try result.toOwnedSlice(allocator);
}

/// Extract the first PEM certificate from a chain
fn extractFirstCertificate(allocator: std.mem.Allocator, pem_chain: []const u8) ![]const u8 {
    const begin_marker = "-----BEGIN CERTIFICATE-----";
    const end_marker = "-----END CERTIFICATE-----";

    const begin_idx = std.mem.indexOf(u8, pem_chain, begin_marker) orelse return error.InvalidCertificate;
    const end_idx = std.mem.indexOf(u8, pem_chain[begin_idx..], end_marker) orelse return error.InvalidCertificate;

    const cert_end = begin_idx + end_idx + end_marker.len;
    return try allocator.dupe(u8, pem_chain[begin_idx..cert_end]);
}

/// Rekor client for submitting to transparency log
pub const RekorClient = struct {
    allocator: std.mem.Allocator,
    base_url: []const u8,
    http_client: http.Client,
    io: *std.Io.Threaded,

    pub fn init(allocator: std.mem.Allocator, base_url: ?[]const u8) !RekorClient {
        const io = try allocator.create(std.Io.Threaded);
        io.* = std.Io.Threaded.init_single_threaded;
        return RekorClient{
            .allocator = allocator,
            .base_url = base_url orelse REKOR_URL,
            .io = io,
            .http_client = http.Client{ .allocator = allocator, .io = io.io() },
        };
    }

    pub fn deinit(self: *RekorClient) void {
        self.http_client.deinit();
        self.io.deinit();
        self.allocator.destroy(self.io);
    }

    /// Submit a DSSE envelope to Rekor transparency log
    pub fn submitDSSE(
        self: *RekorClient,
        dsse_envelope_json: []const u8,
        certificate_pem: []const u8,
    ) !RekorEntry {
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/api/v1/log/entries",
            .{self.base_url},
        );
        defer self.allocator.free(url);

        // Escape the DSSE envelope JSON for embedding in another JSON string
        // Need to escape: \ -> \\, " -> \", newlines, etc.
        const escaped_envelope = try escapeJsonString(self.allocator, dsse_envelope_json);
        defer self.allocator.free(escaped_envelope);

        // Base64 encode the full PEM certificate (Rekor expects base64 -> PEM)
        const encoder = std.base64.standard.Encoder;
        const cert_b64_len = encoder.calcSize(certificate_pem.len);
        const cert_b64 = try self.allocator.alloc(u8, cert_b64_len);
        defer self.allocator.free(cert_b64);
        _ = encoder.encode(cert_b64, certificate_pem);

        // Debug: print certificate info
        std.debug.print("Certificate PEM length: {d}, Base64 length: {d}\n", .{ certificate_pem.len, cert_b64.len });
        std.debug.print("Certificate starts with: {s}\n", .{certificate_pem[0..@min(50, certificate_pem.len)]});

        // Create Rekor entry request (using "dsse" type with verifiers)
        // The envelope must be a "stringified JSON object" (escaped JSON string, NOT base64)
        // The verifier is base64(PEM certificate)
        const request_body = try std.fmt.allocPrint(
            self.allocator,
            \\{{
            \\  "kind": "dsse",
            \\  "apiVersion": "0.0.1",
            \\  "spec": {{
            \\    "proposedContent": {{
            \\      "envelope": "{s}",
            \\      "verifiers": ["{s}"]
            \\    }}
            \\  }}
            \\}}
        ,
            .{ escaped_envelope, cert_b64 },
        );
        defer self.allocator.free(request_body);

        std.debug.print("Submitting attestation to Rekor transparency log...\n", .{});

        const uri = try std.Uri.parse(url);

        const extra_headers = [_]http.Header{
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
        };

        var req = try self.http_client.request(.POST, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = request_body.len };
        try req.sendBodyComplete(@constCast(request_body));

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        const body_reader = response.reader(&.{});
        const body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
        defer self.allocator.free(body);

        if (response.head.status != .ok and response.head.status != .created) {
            std.debug.print("Rekor submission failed with status {d}: {s}\n", .{ @intFromEnum(response.head.status), body });
            return error.RekorSubmissionFailed;
        }

        std.debug.print("✓ Attestation recorded in Rekor transparency log\n", .{});

        // Parse the response to extract log entry details
        return try parseRekorResponse(self.allocator, body);
    }
};

/// Parse Rekor API response to extract log entry
fn parseRekorResponse(allocator: std.mem.Allocator, response_body: []const u8) !RekorEntry {
    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        response_body,
        .{},
    );
    defer parsed.deinit();

    // Rekor returns { "uuid": { ...entry... } }
    // We need to extract the first (and only) entry
    if (parsed.value != .object) return error.InvalidRekorResponse;

    var entry_iter = parsed.value.object.iterator();
    const first_entry = entry_iter.next() orelse return error.InvalidRekorResponse;

    const uuid = try allocator.dupe(u8, first_entry.key_ptr.*);
    errdefer allocator.free(uuid);

    const entry_obj = first_entry.value_ptr.*;
    if (entry_obj != .object) return error.InvalidRekorResponse;

    const log_index = if (entry_obj.object.get("logIndex")) |li|
        if (li == .integer) li.integer else return error.InvalidRekorResponse
    else
        return error.InvalidRekorResponse;

    const integrated_time = if (entry_obj.object.get("integratedTime")) |it|
        if (it == .integer) it.integer else return error.InvalidRekorResponse
    else
        return error.InvalidRekorResponse;

    const log_id_obj = entry_obj.object.get("logID") orelse return error.InvalidRekorResponse;
    const log_id = if (log_id_obj == .string)
        try allocator.dupe(u8, log_id_obj.string)
    else
        return error.InvalidRekorResponse;
    errdefer allocator.free(log_id);

    // Get verification object for SET
    var signed_entry_timestamp: []const u8 = "";
    if (entry_obj.object.get("verification")) |verification| {
        if (verification == .object) {
            if (verification.object.get("signedEntryTimestamp")) |set| {
                if (set == .string) {
                    signed_entry_timestamp = try allocator.dupe(u8, set.string);
                }
            }
        }
    }

    return RekorEntry{
        .uuid = uuid,
        .log_index = log_index,
        .integrated_time = integrated_time,
        .log_id = log_id,
        .signed_entry_timestamp = signed_entry_timestamp,
        .inclusion_proof = null, // Would need to fetch separately or be included in response
    };
}

/// Create an in-toto SLSA provenance statement for npm package
/// This matches the format npm expects for GitHub Actions provenance
pub fn createSLSAProvenanceFromToken(
    allocator: std.mem.Allocator,
    token: *const oidc.OIDCToken,
    package_name: []const u8,
    package_version: []const u8,
    tarball_sha512: []const u8,
) ![]const u8 {
    const claims = &token.claims;

    // Create the PURL (Package URL) for npm
    const purl = try std.fmt.allocPrint(
        allocator,
        "pkg:npm/{s}@{s}",
        .{ package_name, package_version },
    );
    defer allocator.free(purl);

    // Extract workflow path from job_workflow_ref
    // Format: "owner/repo/.github/workflows/file.yml@refs/tags/v1.0.0"
    const workflow_path: []const u8 = if (claims.job_workflow_ref) |jwr| blk: {
        // Find the .github/workflows part
        if (std.mem.indexOf(u8, jwr, ".github/workflows/")) |start| {
            // Find the @ that separates path from ref
            if (std.mem.indexOf(u8, jwr[start..], "@")) |end| {
                break :blk jwr[start .. start + end];
            }
            break :blk jwr[start..];
        }
        break :blk ".github/workflows/publish.yml";
    } else ".github/workflows/publish.yml";

    const repository = claims.repository orelse "unknown";
    const ref = claims.ref orelse "refs/heads/main";
    const sha = claims.sha orelse "unknown";
    const event_name = claims.event_name orelse "push";
    const repository_id = claims.repository_id orelse "";
    const repository_owner_id = claims.repository_owner_id orelse "";
    const run_id = claims.run_id orelse "0";
    const run_attempt = claims.run_attempt orelse "1";

    // Create SLSA v1.0 provenance predicate matching npm's expected format
    const statement = try std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "_type": "https://in-toto.io/Statement/v1",
        \\  "subject": [
        \\    {{
        \\      "name": "{s}",
        \\      "digest": {{
        \\        "sha512": "{s}"
        \\      }}
        \\    }}
        \\  ],
        \\  "predicateType": "{s}",
        \\  "predicate": {{
        \\    "buildDefinition": {{
        \\      "buildType": "https://github.com/npm/cli/gha/v2",
        \\      "externalParameters": {{
        \\        "workflow": {{
        \\          "ref": "{s}",
        \\          "repository": "https://github.com/{s}",
        \\          "path": "{s}"
        \\        }}
        \\      }},
        \\      "internalParameters": {{
        \\        "github": {{
        \\          "event_name": "{s}",
        \\          "repository_id": "{s}",
        \\          "repository_owner_id": "{s}"
        \\        }}
        \\      }},
        \\      "resolvedDependencies": [
        \\        {{
        \\          "uri": "git+https://github.com/{s}@{s}",
        \\          "digest": {{
        \\            "gitCommit": "{s}"
        \\          }}
        \\        }}
        \\      ]
        \\    }},
        \\    "runDetails": {{
        \\      "builder": {{
        \\        "id": "https://github.com/actions/runner"
        \\      }},
        \\      "metadata": {{
        \\        "invocationId": "https://github.com/{s}/actions/runs/{s}/attempts/{s}"
        \\      }}
        \\    }}
        \\  }}
        \\}}
    ,
        .{
            purl, // subject.name
            tarball_sha512, // subject.digest.sha512
            SLSA_PREDICATE_TYPE_V1, // predicateType
            ref, // workflow.ref
            repository, // workflow.repository
            workflow_path, // workflow.path
            event_name, // github.event_name
            repository_id, // github.repository_id
            repository_owner_id, // github.repository_owner_id
            repository, // resolvedDependencies.uri (repo part)
            ref, // resolvedDependencies.uri (ref part) - npm expects ref, not commit
            sha, // resolvedDependencies.digest.gitCommit
            repository, // invocationId (repo part)
            run_id, // invocationId (run_id part)
            run_attempt, // invocationId (attempt part)
        },
    );

    return statement;
}

/// Create DSSE PAE (Pre-Authentication Encoding) for signing
/// Format: "DSSEv1 " + len(type) + " " + type + " " + len(body) + " " + body
fn createDSSEPAE(allocator: std.mem.Allocator, payload_type: []const u8, payload: []const u8) ![]const u8 {
    // PAE format: "DSSEv1 {len_type} {type} {len_body} {body}"
    var pae = std.ArrayList(u8){};
    errdefer pae.deinit(allocator);

    // "DSSEv1 "
    try pae.appendSlice(allocator, "DSSEv1 ");

    // Length of payload type as decimal ASCII
    var len_buf: [20]u8 = undefined;
    const type_len_str = std.fmt.bufPrint(&len_buf, "{d}", .{payload_type.len}) catch unreachable;
    try pae.appendSlice(allocator, type_len_str);
    try pae.append(allocator, ' ');

    // Payload type
    try pae.appendSlice(allocator, payload_type);
    try pae.append(allocator, ' ');

    // Length of payload as decimal ASCII
    const payload_len_str = std.fmt.bufPrint(&len_buf, "{d}", .{payload.len}) catch unreachable;
    try pae.appendSlice(allocator, payload_len_str);
    try pae.append(allocator, ' ');

    // Payload
    try pae.appendSlice(allocator, payload);

    return try pae.toOwnedSlice(allocator);
}

/// Create a DSSE envelope from an in-toto statement and signature
pub fn createDSSEEnvelope(
    allocator: std.mem.Allocator,
    payload: []const u8,
    signature: []const u8,
) ![]const u8 {
    // Base64 encode payload and signature
    const encoder = std.base64.standard.Encoder;

    const payload_b64_len = encoder.calcSize(payload.len);
    const payload_b64 = try allocator.alloc(u8, payload_b64_len);
    defer allocator.free(payload_b64);
    _ = encoder.encode(payload_b64, payload);

    const sig_b64_len = encoder.calcSize(signature.len);
    const sig_b64 = try allocator.alloc(u8, sig_b64_len);
    defer allocator.free(sig_b64);
    _ = encoder.encode(sig_b64, signature);

    const envelope = try std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "payload": "{s}",
        \\  "payloadType": "{s}",
        \\  "signatures": [
        \\    {{
        \\      "keyid": "",
        \\      "sig": "{s}"
        \\    }}
        \\  ]
        \\}}
    ,
        .{ payload_b64, INTOTO_PAYLOAD_TYPE, sig_b64 },
    );

    return envelope;
}

/// Create a Sigstore bundle from signing certificate, DSSE envelope, and Rekor entry
pub fn createSigstoreBundle(
    allocator: std.mem.Allocator,
    certificate_pem: []const u8,
    dsse_envelope: []const u8,
    rekor_entry: *const RekorEntry,
) ![]const u8 {
    // Convert PEM certificate to DER then base64
    const cert_der_b64 = try pemToBase64Der(allocator, certificate_pem);
    defer allocator.free(cert_der_b64);

    // Parse the DSSE envelope to extract fields
    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, dsse_envelope, .{});
    defer parsed.deinit();

    const payload = parsed.value.object.get("payload").?.string;
    const payload_type = parsed.value.object.get("payloadType").?.string;
    const sig = parsed.value.object.get("signatures").?.array.items[0].object.get("sig").?.string;

    // npm expects bundle v0.2 format with:
    // - logIndex/integratedTime as STRINGS (quoted numbers)
    // - x509CertificateChain instead of certificate
    // - kindVersion.kind = "intoto" not "dsse"
    const bundle = try std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "mediaType": "{s}",
        \\  "verificationMaterial": {{
        \\    "x509CertificateChain": {{
        \\      "certificates": [
        \\        {{
        \\          "rawBytes": "{s}"
        \\        }}
        \\      ]
        \\    }},
        \\    "tlogEntries": [
        \\      {{
        \\        "logIndex": "{d}",
        \\        "logId": {{
        \\          "keyId": "{s}"
        \\        }},
        \\        "kindVersion": {{
        \\          "kind": "intoto",
        \\          "version": "0.0.2"
        \\        }},
        \\        "integratedTime": "{d}",
        \\        "inclusionPromise": {{
        \\          "signedEntryTimestamp": "{s}"
        \\        }}
        \\      }}
        \\    ],
        \\    "timestampVerificationData": {{
        \\      "rfc3161Timestamps": []
        \\    }}
        \\  }},
        \\  "dsseEnvelope": {{
        \\    "payload": "{s}",
        \\    "payloadType": "{s}",
        \\    "signatures": [
        \\      {{
        \\        "keyid": "",
        \\        "sig": "{s}"
        \\      }}
        \\    ]
        \\  }}
        \\}}
    ,
        .{
            BUNDLE_V02_MEDIA_TYPE,
            cert_der_b64,
            rekor_entry.log_index,
            rekor_entry.log_id,
            rekor_entry.integrated_time,
            rekor_entry.signed_entry_timestamp,
            payload,
            payload_type,
            sig,
        },
    );

    return bundle;
}

/// Convert PEM certificate to base64-encoded DER
/// This decodes the PEM content and re-encodes as standard base64
fn pemToBase64Der(allocator: std.mem.Allocator, pem: []const u8) ![]const u8 {
    // Extract the base64 content between BEGIN and END markers
    const begin_marker = "-----BEGIN CERTIFICATE-----";
    const end_marker = "-----END CERTIFICATE-----";

    const begin_idx = (std.mem.indexOf(u8, pem, begin_marker) orelse return error.InvalidPEM) + begin_marker.len;
    const end_idx = std.mem.indexOf(u8, pem[begin_idx..], end_marker) orelse return error.InvalidPEM;

    // The content between markers is base64 (may have newlines)
    // First, clean it to remove whitespace
    var clean = std.ArrayList(u8){};
    defer clean.deinit(allocator);

    for (pem[begin_idx .. begin_idx + end_idx]) |c| {
        if (c != '\n' and c != '\r' and c != ' ') {
            try clean.append(allocator, c);
        }
    }

    // Decode the base64 to get raw DER bytes
    const decoder = std.base64.standard.Decoder;
    const der_len = decoder.calcSizeForSlice(clean.items) catch return error.InvalidBase64;
    const der_bytes = try allocator.alloc(u8, der_len);
    defer allocator.free(der_bytes);
    decoder.decode(der_bytes, clean.items) catch return error.InvalidBase64;

    // Re-encode as standard base64 (clean, no line breaks)
    const encoder = std.base64.standard.Encoder;
    const b64_len = encoder.calcSize(der_bytes.len);
    const b64 = try allocator.alloc(u8, b64_len);
    _ = encoder.encode(b64, der_bytes);

    return b64;
}

/// Calculate SHA-512 hash of data and return as hex string
pub fn sha512Hex(allocator: std.mem.Allocator, data: []const u8) ![]const u8 {
    var hash: [64]u8 = undefined;
    std.crypto.hash.sha2.Sha512.hash(data, &hash, .{});

    const hex_chars = "0123456789abcdef";
    var hex_buf: [128]u8 = undefined;
    for (hash, 0..) |byte, i| {
        hex_buf[i * 2] = hex_chars[byte >> 4];
        hex_buf[i * 2 + 1] = hex_chars[byte & 0x0F];
    }

    return try allocator.dupe(u8, &hex_buf);
}

/// Main function to create signed provenance for npm package
/// This orchestrates the full Sigstore signing flow
pub fn createSignedProvenance(
    allocator: std.mem.Allocator,
    oidc_token: *const oidc.OIDCToken,
    package_name: []const u8,
    package_version: []const u8,
    tarball_data: []const u8,
) ![]const u8 {
    // 1. Calculate tarball hash
    const tarball_hash = try sha512Hex(allocator, tarball_data);
    defer allocator.free(tarball_hash);

    // 1b. Get a separate OIDC token with "sigstore" audience for Fulcio
    // Fulcio requires the token to have audience "sigstore"
    var provider = try oidc.detectProvider(allocator) orelse return error.NoOIDCProvider;
    defer provider.deinit(allocator);

    const sigstore_token = try oidc.getTokenFromEnvironmentWithAudience(allocator, &provider, "sigstore") orelse return error.NoOIDCToken;
    defer allocator.free(sigstore_token);

    // 2. Generate ephemeral ECDSA keypair
    // Note: Zig's std.crypto has ECDSA support
    // For now, we'll use a simplified approach
    std.debug.print("Generating ephemeral signing key...\n", .{});

    // TODO: Generate actual ECDSA P-256 keypair
    // For now, this is a placeholder - real implementation needs crypto
    const keypair = try generateEphemeralKeypair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.private_key);

    // 3. Request signing certificate from Fulcio
    var fulcio = try FulcioClient.init(allocator, null);
    defer fulcio.deinit();

    const cert = try fulcio.requestSigningCertificate(
        sigstore_token,
        keypair.public_key_pem,
        keypair.private_key,
    );
    defer {
        var mut_cert = cert;
        mut_cert.deinit(allocator);
    }

    // 4. Create SLSA provenance statement using full token claims
    const provenance = try createSLSAProvenanceFromToken(
        allocator,
        oidc_token,
        package_name,
        package_version,
        tarball_hash,
    );
    defer allocator.free(provenance);

    // 5. Create PAE (Pre-Authentication Encoding) for DSSE signing
    // DSSE signs: "DSSEv1 " + len(type) + " " + type + " " + len(body) + " " + body
    const pae_message = try createDSSEPAE(allocator, INTOTO_PAYLOAD_TYPE, provenance);
    defer allocator.free(pae_message);

    // 6. Sign the PAE message with private key
    const signature = try signData(allocator, pae_message, keypair.private_key);
    defer allocator.free(signature);

    // 7. Create DSSE envelope
    const dsse_envelope = try createDSSEEnvelope(allocator, provenance, signature);
    defer allocator.free(dsse_envelope);

    // 8. Submit to Rekor (pass certificate for verification)
    var rekor = try RekorClient.init(allocator, null);
    defer rekor.deinit();

    var rekor_entry = try rekor.submitDSSE(dsse_envelope, cert.signing_cert);
    defer rekor_entry.deinit(allocator);

    // 9. Create Sigstore bundle
    const bundle = try createSigstoreBundle(
        allocator,
        cert.signing_cert,
        dsse_envelope,
        &rekor_entry,
    );

    std.debug.print("✓ Created Sigstore bundle with provenance attestation\n", .{});

    return bundle;
}

/// Ephemeral keypair for signing
const EphemeralKeypair = struct {
    public_key_pem: []const u8,
    private_key: []const u8,
};

/// Generate an ephemeral ECDSA P-256 keypair
fn generateEphemeralKeypair(allocator: std.mem.Allocator) !EphemeralKeypair {
    // Use Zig's crypto for ECDSA P-256
    const EcdsaP256 = std.crypto.sign.ecdsa.EcdsaP256Sha256;

    // Generate random seed
    var seed: [EcdsaP256.KeyPair.seed_length]u8 = undefined;
    io_helper.randomBytes(&seed);

    // Generate keypair deterministically from seed
    const keypair = try EcdsaP256.KeyPair.generateDeterministic(seed);

    // Serialize public key to SPKI (SubjectPublicKeyInfo) DER format
    // ECDSA P-256 public key is 65 bytes (uncompressed: 04 || x || y)
    const pub_key_bytes = keypair.public_key.toUncompressedSec1();

    // Create SPKI DER structure for EC P-256 public key
    const spki_der = try encodeECP256PublicKeySPKI(allocator, &pub_key_bytes);
    defer allocator.free(spki_der);

    // Base64 encode and wrap in PEM
    const encoder = std.base64.standard.Encoder;
    const pub_b64_len = encoder.calcSize(spki_der.len);
    const pub_b64 = try allocator.alloc(u8, pub_b64_len);
    _ = encoder.encode(pub_b64, spki_der);
    defer allocator.free(pub_b64);

    const public_key_pem = try std.fmt.allocPrint(
        allocator,
        "-----BEGIN PUBLIC KEY-----\n{s}\n-----END PUBLIC KEY-----",
        .{pub_b64},
    );

    // Store private key (secret scalar)
    const private_key = try allocator.dupe(u8, &keypair.secret_key.toBytes());

    return EphemeralKeypair{
        .public_key_pem = public_key_pem,
        .private_key = private_key,
    };
}

/// Sign data with ECDSA P-256
fn signData(allocator: std.mem.Allocator, data: []const u8, private_key: []const u8) ![]const u8 {
    const EcdsaP256 = std.crypto.sign.ecdsa.EcdsaP256Sha256;

    // Recreate keypair from private key bytes
    var secret_key_bytes: [32]u8 = undefined;
    @memcpy(&secret_key_bytes, private_key[0..32]);
    const secret_key = try EcdsaP256.SecretKey.fromBytes(secret_key_bytes);
    const keypair = try EcdsaP256.KeyPair.fromSecretKey(secret_key);

    // Sign the data
    const signature = try keypair.sign(data, null);

    // Return raw signature bytes (r||s) - Fulcio expects this format
    return try allocator.dupe(u8, &signature.toBytes());
}

/// Encode ECDSA signature (r||s) to DER format
fn encodeSigToDER(allocator: std.mem.Allocator, sig: []const u8) ![]const u8 {
    // sig is 64 bytes: r (32 bytes) || s (32 bytes)
    const r = sig[0..32];
    const s = sig[32..64];

    // Encode each integer, adding leading 0x00 if high bit is set (to keep positive)
    var r_der: [33]u8 = undefined;
    var r_len: usize = 32;
    var r_start: usize = 0;

    // Skip leading zeros in r
    while (r_start < 32 and r[r_start] == 0) : (r_start += 1) {}
    if (r_start == 32) {
        r_start = 31;
    } // Keep at least one byte
    r_len = 32 - r_start;

    // Add leading 0x00 if high bit set
    const r_needs_pad = r[r_start] >= 0x80;
    if (r_needs_pad) {
        r_der[0] = 0x00;
        @memcpy(r_der[1..][0..r_len], r[r_start..32]);
        r_len += 1;
    } else {
        @memcpy(r_der[0..r_len], r[r_start..32]);
    }

    var s_der: [33]u8 = undefined;
    var s_len: usize = 32;
    var s_start: usize = 0;

    // Skip leading zeros in s
    while (s_start < 32 and s[s_start] == 0) : (s_start += 1) {}
    if (s_start == 32) {
        s_start = 31;
    }
    s_len = 32 - s_start;

    // Add leading 0x00 if high bit set
    const s_needs_pad = s[s_start] >= 0x80;
    if (s_needs_pad) {
        s_der[0] = 0x00;
        @memcpy(s_der[1..][0..s_len], s[s_start..32]);
        s_len += 1;
    } else {
        @memcpy(s_der[0..s_len], s[s_start..32]);
    }

    // Build DER: 0x30 <len> 0x02 <r_len> <r> 0x02 <s_len> <s>
    const inner_len = 2 + r_len + 2 + s_len;
    const total_len = 2 + inner_len;

    const der = try allocator.alloc(u8, total_len);
    var idx: usize = 0;

    der[idx] = 0x30;
    idx += 1; // SEQUENCE
    der[idx] = @intCast(inner_len);
    idx += 1;
    der[idx] = 0x02;
    idx += 1; // INTEGER (r)
    der[idx] = @intCast(r_len);
    idx += 1;
    @memcpy(der[idx..][0..r_len], r_der[0..r_len]);
    idx += r_len;
    der[idx] = 0x02;
    idx += 1; // INTEGER (s)
    der[idx] = @intCast(s_len);
    idx += 1;
    @memcpy(der[idx..][0..s_len], s_der[0..s_len]);
    idx += s_len;

    return der;
}

/// Extract the `sub` claim from a JWT token
fn extractSubClaim(allocator: std.mem.Allocator, jwt: []const u8) ![]const u8 {
    // JWT format: header.payload.signature
    // Split by '.' and decode the payload (second part)
    var parts = std.mem.splitScalar(u8, jwt, '.');

    _ = parts.next(); // Skip header
    const payload_b64 = parts.next() orelse return error.InvalidJWT;

    // Base64url decode the payload
    const decoder = std.base64.url_safe_no_pad.Decoder;
    const payload_len = decoder.calcSizeForSlice(payload_b64) catch return error.InvalidJWT;
    const payload = try allocator.alloc(u8, payload_len);
    defer allocator.free(payload);

    decoder.decode(payload, payload_b64) catch return error.InvalidJWT;

    // Parse JSON to extract "sub" claim
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, payload, .{}) catch return error.InvalidJWT;
    defer parsed.deinit();

    const sub = parsed.value.object.get("sub") orelse return error.NoSubClaim;
    if (sub != .string) return error.InvalidSubClaim;

    return try allocator.dupe(u8, sub.string);
}

/// Escape a string for embedding in a JSON string value
/// Handles: \ -> \\, " -> \", control characters, etc.
fn escapeJsonString(allocator: std.mem.Allocator, input: []const u8) ![]const u8 {
    var result = std.ArrayList(u8){};
    errdefer result.deinit(allocator);

    for (input) |c| {
        switch (c) {
            '\\' => try result.appendSlice(allocator, "\\\\"),
            '"' => try result.appendSlice(allocator, "\\\""),
            '\n' => try result.appendSlice(allocator, "\\n"),
            '\r' => try result.appendSlice(allocator, "\\r"),
            '\t' => try result.appendSlice(allocator, "\\t"),
            else => {
                if (c < 0x20) {
                    // Control character - encode as \uXXXX
                    var buf: [6]u8 = undefined;
                    _ = std.fmt.bufPrint(&buf, "\\u{x:0>4}", .{c}) catch unreachable;
                    try result.appendSlice(allocator, &buf);
                } else {
                    try result.append(allocator, c);
                }
            },
        }
    }

    return try result.toOwnedSlice(allocator);
}

/// Encode EC P-256 public key to SPKI (SubjectPublicKeyInfo) DER format
fn encodeECP256PublicKeySPKI(allocator: std.mem.Allocator, pub_key: []const u8) ![]const u8 {
    // SPKI structure for EC P-256:
    // SEQUENCE {
    //   SEQUENCE {
    //     OBJECT IDENTIFIER ecPublicKey (1.2.840.10045.2.1)
    //     OBJECT IDENTIFIER prime256v1 (1.2.840.10045.3.1.7)
    //   }
    //   BIT STRING (public key)
    // }

    // Fixed header for EC P-256 SPKI (26 bytes before the public key)
    // 30 59 - SEQUENCE, 89 bytes total
    // 30 13 - SEQUENCE, 19 bytes (algorithm identifier)
    // 06 07 2a 86 48 ce 3d 02 01 - OID ecPublicKey
    // 06 08 2a 86 48 ce 3d 03 01 07 - OID prime256v1
    // 03 42 00 - BIT STRING, 66 bytes, 0 unused bits
    const spki_header = [_]u8{
        0x30, 0x59, // SEQUENCE, 89 bytes
        0x30, 0x13, // SEQUENCE, 19 bytes (AlgorithmIdentifier)
        0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID 1.2.840.10045.2.1 (ecPublicKey)
        0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID 1.2.840.10045.3.1.7 (prime256v1)
        0x03, 0x42, 0x00, // BIT STRING, 66 bytes (1 + 65), 0 unused bits
    };

    // Total length: header (26 bytes) + public key (65 bytes) = 91 bytes
    const total_len = spki_header.len + pub_key.len;
    const spki = try allocator.alloc(u8, total_len);

    @memcpy(spki[0..spki_header.len], &spki_header);
    @memcpy(spki[spki_header.len..], pub_key);

    return spki;
}
