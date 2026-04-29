//! AWS Signature Version 4 signing + native S3 PUT and DynamoDB PutItem.
//!
//! Replaces the previous `aws s3 cp` / `aws dynamodb put-item` shell-outs in
//! the publish path. Pantry's a self-sufficient CLI; depending on AWS's
//! Python CLI for two API calls was always a bit of a smell — and as we
//! found in the field, `std.process.run`'s PATH lookup occasionally returns
//! a generic `error.FileNotFound` that's hard to distinguish from a real
//! filesystem miss. Native HTTP + SigV4 removes the dependency entirely.
//!
//! Spec: https://docs.aws.amazon.com/IAM/latest/UserGuide/create-signed-request.html

const std = @import("std");
const io_helper = @import("../io_helper.zig");
const Sha256 = std.crypto.hash.sha2.Sha256;
const HmacSha256 = std.crypto.auth.hmac.sha2.HmacSha256;
const http = std.http;

pub const Credentials = struct {
    access_key_id: []const u8,
    secret_access_key: []const u8,
    /// Optional STS session token. Required when running under temporary
    /// credentials (e.g. EC2 instance roles, GitHub Actions OIDC roles).
    session_token: ?[]const u8 = null,
};

/// Read AWS credentials from the standard env vars. Returns `null` if
/// `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` aren't set.
pub fn credentialsFromEnv() ?Credentials {
    const ak = io_helper.getenv("AWS_ACCESS_KEY_ID") orelse return null;
    const sk = io_helper.getenv("AWS_SECRET_ACCESS_KEY") orelse return null;
    return .{
        .access_key_id = ak,
        .secret_access_key = sk,
        .session_token = io_helper.getenv("AWS_SESSION_TOKEN"),
    };
}

/// PUT a single object to S3.
///
/// `region` is e.g. "us-east-1". `bucket` and `key` are the S3 path
/// components. `body` is the object bytes. `content_type` is set on the
/// object's `Content-Type` metadata.
///
/// Uses path-style addressing (`https://s3.{region}.amazonaws.com/{bucket}/{key}`)
/// so it works with bucket names containing dots. Returns `error.HttpError`
/// when S3 returns a non-2xx response (the body is logged via stderr).
pub fn s3PutObject(
    allocator: std.mem.Allocator,
    creds: Credentials,
    region: []const u8,
    bucket: []const u8,
    key: []const u8,
    body: []const u8,
    content_type: []const u8,
) !void {
    const host = try std.fmt.allocPrint(allocator, "s3.{s}.amazonaws.com", .{region});
    defer allocator.free(host);

    // Path-style: /{bucket}/{key}. The key may contain '/'; each segment
    // gets URI-encoded except for slashes (S3's canonical encoding rules).
    const encoded_key = try uriEncodePath(allocator, key);
    defer allocator.free(encoded_key);
    const path = try std.fmt.allocPrint(allocator, "/{s}/{s}", .{ bucket, encoded_key });
    defer allocator.free(path);

    try signedRequest(allocator, .{
        .creds = creds,
        .region = region,
        .service = "s3",
        .method = "PUT",
        .host = host,
        .path = path,
        .query = "",
        .payload = body,
        .extra_headers = &[_]Header{
            .{ .name = "content-type", .value = content_type },
        },
        .scheme = "https",
    });
}

/// PutItem on DynamoDB. `item_json` is the standard AWS-typed JSON
/// (e.g. `{"pk":{"S":"value"}, "n":{"N":"42"}}`).
pub fn dynamoDbPutItem(
    allocator: std.mem.Allocator,
    creds: Credentials,
    region: []const u8,
    table_name: []const u8,
    item_json: []const u8,
) !void {
    const host = try std.fmt.allocPrint(allocator, "dynamodb.{s}.amazonaws.com", .{region});
    defer allocator.free(host);

    const body = try std.fmt.allocPrint(
        allocator,
        \\{{"TableName":"{s}","Item":{s}}}
    ,
        .{ table_name, item_json },
    );
    defer allocator.free(body);

    try signedRequest(allocator, .{
        .creds = creds,
        .region = region,
        .service = "dynamodb",
        .method = "POST",
        .host = host,
        .path = "/",
        .query = "",
        .payload = body,
        .extra_headers = &[_]Header{
            .{ .name = "content-type", .value = "application/x-amz-json-1.0" },
            .{ .name = "x-amz-target", .value = "DynamoDB_20120810.PutItem" },
        },
        .scheme = "https",
    });
}

const Header = struct { name: []const u8, value: []const u8 };

const RequestParams = struct {
    creds: Credentials,
    region: []const u8,
    service: []const u8,
    method: []const u8,
    host: []const u8,
    path: []const u8,
    query: []const u8,
    payload: []const u8,
    extra_headers: []const Header,
    scheme: []const u8 = "https",
};

/// Build a SigV4-signed request, send it, and return only when S3/DynamoDB
/// returns a 2xx. Non-2xx → `error.HttpError`, with the response body
/// printed to stderr for diagnostics.
fn signedRequest(allocator: std.mem.Allocator, params: RequestParams) !void {
    // Timestamps. AWS expects `YYYYMMDDTHHMMSSZ` for `x-amz-date` and
    // `YYYYMMDD` (the date-only prefix) for the credential scope.
    var amz_date_buf: [16]u8 = undefined;
    var date_buf: [8]u8 = undefined;
    const ts = io_helper.clockGettime();
    const epoch_secs: std.time.epoch.EpochSeconds = .{ .secs = @intCast(ts.sec) };
    const epoch_day = epoch_secs.getEpochDay();
    const year_day = epoch_day.calculateYearDay();
    const month_day = year_day.calculateMonthDay();
    const day_secs = epoch_secs.getDaySeconds();
    const amz_date = try std.fmt.bufPrint(&amz_date_buf, "{d:0>4}{d:0>2}{d:0>2}T{d:0>2}{d:0>2}{d:0>2}Z", .{
        year_day.year,
        @intFromEnum(month_day.month),
        month_day.day_index + 1,
        day_secs.getHoursIntoDay(),
        day_secs.getMinutesIntoHour(),
        day_secs.getSecondsIntoMinute(),
    });
    const date_only = try std.fmt.bufPrint(&date_buf, "{d:0>4}{d:0>2}{d:0>2}", .{
        year_day.year,
        @intFromEnum(month_day.month),
        month_day.day_index + 1,
    });

    // SHA256 of the payload — required for both the `x-amz-content-sha256`
    // header and the canonical request's HashedPayload field.
    var payload_hash: [Sha256.digest_length]u8 = undefined;
    Sha256.hash(params.payload, &payload_hash, .{});
    var payload_hex: [Sha256.digest_length * 2]u8 = undefined;
    _ = std.fmt.bufPrint(&payload_hex, "{x}", .{std.fmt.fmtSliceHexLower(&payload_hash)}) catch unreachable;

    // Headers we need to sign. Order matters for the canonical request
    // (lexicographic on lowercase name).
    var headers_arena = std.heap.ArenaAllocator.init(allocator);
    defer headers_arena.deinit();
    const ha = headers_arena.allocator();

    var signing_headers = std.ArrayList(Header){};
    try signing_headers.append(ha, .{ .name = "host", .value = params.host });
    try signing_headers.append(ha, .{ .name = "x-amz-content-sha256", .value = &payload_hex });
    try signing_headers.append(ha, .{ .name = "x-amz-date", .value = amz_date });
    if (params.creds.session_token) |tok| {
        try signing_headers.append(ha, .{ .name = "x-amz-security-token", .value = tok });
    }
    for (params.extra_headers) |h| try signing_headers.append(ha, h);

    // Sort headers by lowercased name.
    std.sort.heap(Header, signing_headers.items, {}, headerLessThan);

    // Build canonical headers string ("name:value\n") and signed headers
    // list ("name1;name2;…").
    var canonical_headers = std.ArrayList(u8){};
    var signed_headers_list = std.ArrayList(u8){};
    for (signing_headers.items, 0..) |h, i| {
        try canonical_headers.appendSlice(ha, h.name);
        try canonical_headers.append(ha, ':');
        try canonical_headers.appendSlice(ha, std.mem.trim(u8, h.value, " \t"));
        try canonical_headers.append(ha, '\n');
        if (i > 0) try signed_headers_list.append(ha, ';');
        try signed_headers_list.appendSlice(ha, h.name);
    }

    // Canonical request — see SigV4 spec.
    var canonical_request = std.ArrayList(u8){};
    try canonical_request.appendSlice(ha, params.method);
    try canonical_request.append(ha, '\n');
    try canonical_request.appendSlice(ha, params.path);
    try canonical_request.append(ha, '\n');
    try canonical_request.appendSlice(ha, params.query);
    try canonical_request.append(ha, '\n');
    try canonical_request.appendSlice(ha, canonical_headers.items);
    try canonical_request.append(ha, '\n');
    try canonical_request.appendSlice(ha, signed_headers_list.items);
    try canonical_request.append(ha, '\n');
    try canonical_request.appendSlice(ha, &payload_hex);

    var canonical_hash: [Sha256.digest_length]u8 = undefined;
    Sha256.hash(canonical_request.items, &canonical_hash, .{});
    var canonical_hex: [Sha256.digest_length * 2]u8 = undefined;
    _ = std.fmt.bufPrint(&canonical_hex, "{x}", .{std.fmt.fmtSliceHexLower(&canonical_hash)}) catch unreachable;

    // Credential scope: "{date}/{region}/{service}/aws4_request".
    const credential_scope = try std.fmt.allocPrint(ha, "{s}/{s}/{s}/aws4_request", .{
        date_only, params.region, params.service,
    });

    // String to sign.
    const string_to_sign = try std.fmt.allocPrint(ha, "AWS4-HMAC-SHA256\n{s}\n{s}\n{s}", .{
        amz_date, credential_scope, canonical_hex,
    });

    // Derive the signing key by chained HMAC-SHA256.
    var k_secret_buf: [256]u8 = undefined;
    const k_secret = try std.fmt.bufPrint(&k_secret_buf, "AWS4{s}", .{params.creds.secret_access_key});
    const k_date = hmac(k_secret, date_only);
    const k_region = hmac(&k_date, params.region);
    const k_service = hmac(&k_region, params.service);
    const k_signing = hmac(&k_service, "aws4_request");
    const signature = hmac(&k_signing, string_to_sign);
    var signature_hex: [Sha256.digest_length * 2]u8 = undefined;
    _ = std.fmt.bufPrint(&signature_hex, "{x}", .{std.fmt.fmtSliceHexLower(&signature)}) catch unreachable;

    // Build the Authorization header value.
    const auth_value = try std.fmt.allocPrint(allocator, "AWS4-HMAC-SHA256 Credential={s}/{s}, SignedHeaders={s}, Signature={s}", .{
        params.creds.access_key_id,
        credential_scope,
        signed_headers_list.items,
        signature_hex,
    });
    defer allocator.free(auth_value);

    // Build the URL and send the request.
    const url = if (params.query.len > 0)
        try std.fmt.allocPrint(allocator, "{s}://{s}{s}?{s}", .{ params.scheme, params.host, params.path, params.query })
    else
        try std.fmt.allocPrint(allocator, "{s}://{s}{s}", .{ params.scheme, params.host, params.path });
    defer allocator.free(url);

    // Build the wire headers we need to send. `host` is added by
    // std.http.Client itself; everything else has to be passed through
    // `extra_headers`.
    var wire_headers = std.ArrayList(http.Header){};
    try wire_headers.append(ha, .{ .name = "x-amz-content-sha256", .value = &payload_hex });
    try wire_headers.append(ha, .{ .name = "x-amz-date", .value = amz_date });
    try wire_headers.append(ha, .{ .name = "authorization", .value = auth_value });
    if (params.creds.session_token) |tok| {
        try wire_headers.append(ha, .{ .name = "x-amz-security-token", .value = tok });
    }
    for (params.extra_headers) |h| {
        // content-type is a "standard" header and goes through `headers`
        // rather than `extra_headers`; everything else can be extra.
        if (std.ascii.eqlIgnoreCase(h.name, "content-type")) continue;
        try wire_headers.append(ha, .{ .name = h.name, .value = h.value });
    }

    const method = if (std.mem.eql(u8, params.method, "GET")) http.Method.GET //
    else if (std.mem.eql(u8, params.method, "POST")) http.Method.POST //
    else if (std.mem.eql(u8, params.method, "PUT")) http.Method.PUT //
    else if (std.mem.eql(u8, params.method, "DELETE")) http.Method.DELETE //
    else return error.UnsupportedMethod;

    var content_type_value: ?[]const u8 = null;
    for (params.extra_headers) |h| {
        if (std.ascii.eqlIgnoreCase(h.name, "content-type")) {
            content_type_value = h.value;
            break;
        }
    }

    var client: http.Client = .{ .allocator = allocator, .io = io_helper.io };
    defer client.deinit();

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    defer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;
    const result = try client.fetch(.{
        .location = .{ .url = url },
        .method = method,
        .payload = params.payload,
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .headers = .{
            .content_type = if (content_type_value) |ct| .{ .override = ct } else .default,
        },
        .extra_headers = wire_headers.items,
    });

    const status_int: u16 = @intFromEnum(result.status);
    if (status_int < 200 or status_int >= 300) {
        const body = alloc_writer.writer.buffer[0..alloc_writer.writer.end];
        std.debug.print("AWS {s} {s} → HTTP {d}\n{s}\n", .{ params.method, url, status_int, body });
        return error.HttpError;
    }
}

fn headerLessThan(_: void, a: Header, b: Header) bool {
    return std.mem.lessThan(u8, a.name, b.name);
}

fn hmac(key: []const u8, msg: []const u8) [HmacSha256.mac_length]u8 {
    var out: [HmacSha256.mac_length]u8 = undefined;
    var ctx = HmacSha256.init(key);
    ctx.update(msg);
    ctx.final(&out);
    return out;
}

/// URI-encode a path segment per AWS SigV4 rules: keep `A-Z a-z 0-9 - _ . ~ /`,
/// percent-encode everything else. Slashes are preserved because the caller
/// passes a multi-segment key.
fn uriEncodePath(allocator: std.mem.Allocator, path: []const u8) ![]u8 {
    var buf = std.ArrayList(u8){};
    for (path) |c| {
        const safe = (c >= 'A' and c <= 'Z') or
            (c >= 'a' and c <= 'z') or
            (c >= '0' and c <= '9') or
            c == '-' or c == '_' or c == '.' or c == '~' or c == '/';
        if (safe) {
            try buf.append(allocator, c);
        } else {
            try buf.writer(allocator).print("%{X:0>2}", .{c});
        }
    }
    return buf.toOwnedSlice(allocator);
}
