const std = @import("std");
const types = @import("types.zig");
const errors = @import("errors.zig");

const MergeError = std.mem.Allocator.Error || errors.ZonfigError;

/// Deep merge two JSON values
pub fn deepMerge(
    allocator: std.mem.Allocator,
    target: std.json.Value,
    source: std.json.Value,
    options: types.MergeOptions,
) MergeError!std.json.Value {
    var visited = std.AutoHashMap(usize, void).init(allocator);
    defer visited.deinit();

    return try deepMergeImpl(allocator, target, source, options, &visited);
}

fn deepMergeImpl(
    allocator: std.mem.Allocator,
    target: std.json.Value,
    source: std.json.Value,
    options: types.MergeOptions,
    visited: *std.AutoHashMap(usize, void),
) MergeError!std.json.Value {
    // If types differ, source wins
    const target_tag = std.meta.activeTag(target);
    const source_tag = std.meta.activeTag(source);

    if (target_tag != source_tag) {
        return try cloneValue(allocator, source);
    }

    switch (source) {
        .object => |source_obj| {
            const target_obj = target.object;

            // Circular reference check
            const addr = @intFromPtr(&target_obj);
            if (visited.get(addr)) |_| {
                return errors.ZonfigError.CircularReferenceDetected;
            }
            try visited.put(addr, {});
            defer _ = visited.remove(addr);

            // Merge objects
            var result = std.json.ObjectMap.init(allocator);

            // Add all target keys
            var target_iter = target_obj.iterator();
            while (target_iter.next()) |entry| {
                try result.put(
                    try allocator.dupe(u8, entry.key_ptr.*),
                    try cloneValue(allocator, entry.value_ptr.*),
                );
            }

            // Merge/add source keys
            var source_iter = source_obj.iterator();
            while (source_iter.next()) |entry| {
                if (result.get(entry.key_ptr.*)) |target_value| {
                    // Recursive merge
                    const merged = try deepMergeImpl(
                        allocator,
                        target_value,
                        entry.value_ptr.*,
                        options,
                        visited,
                    );
                    try result.put(try allocator.dupe(u8, entry.key_ptr.*), merged);
                } else {
                    // Add new key
                    try result.put(
                        try allocator.dupe(u8, entry.key_ptr.*),
                        try cloneValue(allocator, entry.value_ptr.*),
                    );
                }
            }

            return .{ .object = result };
        },

        .array => |source_arr| {
            const target_arr = target.array.items;
            const merged_items = try mergeArrays(
                allocator,
                target_arr,
                source_arr.items,
                options.strategy,
            );
            return .{ .array = std.json.Array.fromOwnedSlice(allocator, merged_items) };
        },

        else => {
            // Primitives: source wins
            return try cloneValue(allocator, source);
        },
    }
}

fn mergeArrays(
    allocator: std.mem.Allocator,
    target: []std.json.Value,
    source: []std.json.Value,
    strategy: types.MergeStrategy,
) ![]std.json.Value {
    return switch (strategy) {
        .replace => try cloneArray(allocator, source),
        .concat => try concatArrays(allocator, target, source),
        .smart => try smartMergeArrays(allocator, target, source),
    };
}

fn cloneArray(allocator: std.mem.Allocator, arr: []std.json.Value) ![]std.json.Value {
    var result = try std.ArrayList(std.json.Value).initCapacity(allocator, arr.len);
    for (arr) |item| {
        try result.append(allocator, try cloneValue(allocator, item));
    }
    return try result.toOwnedSlice(allocator);
}

fn concatArrays(
    allocator: std.mem.Allocator,
    target: []std.json.Value,
    source: []std.json.Value,
) ![]std.json.Value {
    var result = try std.ArrayList(std.json.Value).initCapacity(allocator, target.len + source.len);

    // Add all target items
    for (target) |item| {
        try result.append(allocator, try cloneValue(allocator, item));
    }

    // Add source items (deduplicate if same value)
    for (source) |item| {
        var found = false;
        for (result.items) |existing| {
            if (try valuesEqual(existing, item)) {
                found = true;
                break;
            }
        }
        if (!found) {
            try result.append(allocator, try cloneValue(allocator, item));
        }
    }

    return try result.toOwnedSlice(allocator);
}

fn smartMergeArrays(
    allocator: std.mem.Allocator,
    target: []std.json.Value,
    source: []std.json.Value,
) ![]std.json.Value {
    // Check if both are object arrays
    if (!isObjectArray(target) or !isObjectArray(source)) {
        return try concatArrays(allocator, target, source);
    }

    // Find merge key
    const merge_key = findMergeKey(target[0].object) orelse {
        return try concatArrays(allocator, target, source);
    };

    var result = try std.ArrayList(std.json.Value).initCapacity(allocator, target.len + source.len);
    var seen = std.StringHashMap(usize).init(allocator);
    defer seen.deinit();

    // Add all target items
    for (target, 0..) |item, i| {
        const key_value = item.object.get(merge_key).?.string;
        try seen.put(key_value, i);
        try result.append(allocator, try cloneValue(allocator, item));
    }

    // Merge or add source items
    for (source) |source_item| {
        const key_value = source_item.object.get(merge_key).?.string;

        if (seen.get(key_value)) |target_idx| {
            // Merge with existing
            var visited = std.AutoHashMap(usize, void).init(allocator);
            defer visited.deinit();

            const merged = try deepMergeImpl(
                allocator,
                result.items[target_idx],
                source_item,
                .{ .strategy = .smart },
                &visited,
            );
            result.items[target_idx] = merged;
        } else {
            // Add new item
            try seen.put(key_value, result.items.len);
            try result.append(allocator, try cloneValue(allocator, source_item));
        }
    }

    return try result.toOwnedSlice(allocator);
}

fn isObjectArray(arr: []std.json.Value) bool {
    if (arr.len == 0) return false;
    for (arr) |item| {
        if (item != .object) return false;
    }
    return true;
}

fn findMergeKey(obj: std.json.ObjectMap) ?[]const u8 {
    const merge_keys = [_][]const u8{ "id", "name", "key", "path", "type" };
    for (merge_keys) |key| {
        if (obj.get(key)) |value| {
            if (value == .string) {
                return key;
            }
        }
    }
    return null;
}

fn valuesEqual(a: std.json.Value, b: std.json.Value) !bool {
    const a_tag = std.meta.activeTag(a);
    const b_tag = std.meta.activeTag(b);

    if (a_tag != b_tag) return false;

    return switch (a) {
        .null => true,
        .bool => |val| val == b.bool,
        .integer => |val| val == b.integer,
        .float => |val| val == b.float,
        .number_string => |val| std.mem.eql(u8, val, b.number_string),
        .string => |val| std.mem.eql(u8, val, b.string),
        .array => false, // Arrays not compared for dedup
        .object => false, // Objects not compared for dedup
    };
}

pub fn cloneValue(allocator: std.mem.Allocator, value: std.json.Value) !std.json.Value {
    return switch (value) {
        .null, .bool, .integer, .float, .number_string => value,
        .string => |s| .{ .string = try allocator.dupe(u8, s) },
        .array => |arr| {
            const items = try allocator.alloc(std.json.Value, arr.items.len);
            for (arr.items, 0..) |item, i| {
                items[i] = try cloneValue(allocator, item);
            }
            return .{ .array = std.json.Array.fromOwnedSlice(allocator, items) };
        },
        .object => |obj| {
            var new_obj = std.json.ObjectMap.init(allocator);
            var iter = obj.iterator();
            while (iter.next()) |entry| {
                try new_obj.put(
                    try allocator.dupe(u8, entry.key_ptr.*),
                    try cloneValue(allocator, entry.value_ptr.*),
                );
            }
            return .{ .object = new_obj };
        },
    };
}

test "deepMerge merges simple objects" {
    const allocator = std.testing.allocator;

    var target_obj = std.json.ObjectMap.init(allocator);
    defer target_obj.deinit();
    try target_obj.put("a", .{ .integer = 1 });
    try target_obj.put("b", .{ .integer = 2 });

    var source_obj = std.json.ObjectMap.init(allocator);
    defer source_obj.deinit();
    try source_obj.put("b", .{ .integer = 3 });
    try source_obj.put("c", .{ .integer = 4 });

    const target = std.json.Value{ .object = target_obj };
    const source = std.json.Value{ .object = source_obj };

    const result = try deepMerge(allocator, target, source, .{});
    defer {
        // Properly free the merged result
        var iter = result.object.iterator();
        while (iter.next()) |entry| {
            allocator.free(entry.key_ptr.*);
        }
        var mutable_obj = result.object;
        mutable_obj.deinit();
    }

    try std.testing.expectEqual(@as(i64, 1), result.object.get("a").?.integer);
    try std.testing.expectEqual(@as(i64, 3), result.object.get("b").?.integer);
    try std.testing.expectEqual(@as(i64, 4), result.object.get("c").?.integer);
}

test "deepMerge replace strategy replaces arrays" {
    const allocator = std.testing.allocator;

    const target_items = try allocator.alloc(std.json.Value, 2);
    target_items[0] = .{ .integer = 1 };
    target_items[1] = .{ .integer = 2 };
    const target = std.json.Value{ .array = std.json.Array.fromOwnedSlice(allocator, target_items) };
    defer target.array.deinit();

    const source_items = try allocator.alloc(std.json.Value, 2);
    source_items[0] = .{ .integer = 3 };
    source_items[1] = .{ .integer = 4 };
    const source = std.json.Value{ .array = std.json.Array.fromOwnedSlice(allocator, source_items) };
    defer source.array.deinit();

    const result = try deepMerge(allocator, target, source, .{ .strategy = .replace });
    defer allocator.free(result.array.items);

    try std.testing.expectEqual(@as(usize, 2), result.array.items.len);
    try std.testing.expectEqual(@as(i64, 3), result.array.items[0].integer);
    try std.testing.expectEqual(@as(i64, 4), result.array.items[1].integer);
}
